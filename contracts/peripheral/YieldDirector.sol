// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IsOHM} from "../interfaces/IsOHM.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {IYieldDirector} from "../interfaces/IYieldDirector.sol";
import {OlympusAccessControlled, IOlympusAuthority} from "../types/OlympusAccessControlled.sol";

/**
    @title YieldDirector (codename Tyche) 
    @notice This contract allows donors to deposit their sOHM and donate their rebases
            to any address. Donors will be able to withdraw their principal
            sOHM at any time. Donation recipients can also redeem accrued rebases at any time.
 */
contract YieldDirector is IYieldDirector, OlympusAccessControlled {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT256 = type(uint256).max;

    address public immutable sOHM;

    bool public depositDisabled;
    bool public withdrawDisabled;
    bool public redeemDisabled;

    struct DonationInfo {
        address recipient;
        uint256 deposit; // Total non-agnostic amount deposited
        uint256 agnosticDeposit; // Total agnostic amount deposited
        uint256 carry; // Amount of sOHM accumulated over on deposit/withdraw
        uint256 indexAtLastChange; // Index of last deposit/withdraw
    }

    struct RecipientInfo {
        uint256 totalDebt; // Non-agnostic debt
        uint256 carry; // Total non-agnostic value donating to recipient
        uint256 agnosticDebt; // Total agnostic value of carry + debt
        uint256 indexAtLastChange; // Index when agnostic value changed
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    event Deposited(address indexed donor_, address indexed recipient_, uint256 amount_);
    event Withdrawn(address indexed donor_, address indexed recipient_, uint256 amount_);
    event AllWithdrawn(address indexed donor_, uint256 indexed amount_);
    event Donated(address indexed donor_, address indexed recipient_, uint256 amount_);
    event Redeemed(address indexed recipient_, uint256 amount_);
    event EmergencyShutdown(bool active_);

    constructor(address sOhm_, address authority_) OlympusAccessControlled(IOlympusAuthority(authority_)) {
        require(sOhm_ != address(0), "Invalid address for sOHM");

        sOHM = sOhm_;
    }

    /************************
     * Donor Functions
     ************************/

    /**
        @notice Deposit sOHM, records sender address and assign rebases to recipient
        @param amount_ Amount of sOHM debt issued from donor to recipient
        @param recipient_ Address to direct staking yield and vault shares to
    */
    function deposit(uint256 amount_, address recipient_) external override {
        require(!depositDisabled, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(recipient_ != address(0), "Invalid recipient address");

        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), amount_);

        uint256 index = IsOHM(sOHM).index();

        // Record donors's issued debt to recipient address
        DonationInfo[] storage donations = donationInfo[msg.sender];
        uint256 recipientIndex = _getRecipientIndex(msg.sender, recipient_);

        if (recipientIndex == MAX_UINT256) {
            donations.push(
                DonationInfo({
                    recipient: recipient_,
                    deposit: amount_,
                    agnosticDeposit: _toAgnostic(amount_),
                    carry: 0,
                    indexAtLastChange: index
                })
            );
        } else {
            DonationInfo storage donation = donations[recipientIndex];

            donation.carry += _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
            donation.deposit += amount_;
            donation.agnosticDeposit = _toAgnostic(donation.deposit);
            donation.indexAtLastChange = index;
        }

        RecipientInfo storage recipient = recipientInfo[recipient_];

        // Calculate value carried over since last change
        recipient.carry += _getAccumulatedValue(recipient.agnosticDebt, recipient.indexAtLastChange);
        recipient.totalDebt += amount_;
        recipient.agnosticDebt = _toAgnostic(recipient.totalDebt + recipient.carry);
        recipient.indexAtLastChange = index;

        emit Deposited(msg.sender, recipient_, amount_);
    }

    /**
        @notice Withdraw donor's sOHM from vault and subtracts debt from recipient
     */
    function withdraw(uint256 amount_, address recipient_) external override {
        require(!withdrawDisabled, "Withdraws currently disabled");
        require(amount_ > 0, "Invalid withdraw amount");

        uint256 index = IsOHM(sOHM).index();

        // Donor accounting
        uint256 recipientIndex = _getRecipientIndex(msg.sender, recipient_);
        require(recipientIndex != MAX_UINT256, "No donations to recipient");

        DonationInfo storage donation = donationInfo[msg.sender][recipientIndex];

        if (amount_ >= donation.deposit) {
            // Report how much was donated then clear donation information
            uint256 accumulated = donation.carry +
                _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
            emit Donated(msg.sender, recipient_, accumulated);

            delete donationInfo[msg.sender][recipientIndex];

            // If element was in middle of array, bring last element to deleted index
            uint256 lastIndex = donationInfo[msg.sender].length - 1;
            if (recipientIndex != lastIndex) {
                donationInfo[msg.sender][recipientIndex] = donationInfo[msg.sender][lastIndex];
                donationInfo[msg.sender].pop();
            }
        } else {
            donation.carry += _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
            donation.deposit -= amount_;
            donation.agnosticDeposit = _toAgnostic(donation.deposit);
            donation.indexAtLastChange = index;
        }

        // Recipient accounting
        RecipientInfo storage recipient = recipientInfo[recipient_];
        recipient.carry += _getAccumulatedValue(recipient.agnosticDebt, recipient.indexAtLastChange);
        recipient.totalDebt -= amount_;
        recipient.agnosticDebt = _toAgnostic(recipient.totalDebt + recipient.carry);
        recipient.indexAtLastChange = index;

        IERC20(sOHM).safeTransfer(msg.sender, amount_);

        emit Withdrawn(msg.sender, recipient_, amount_);
    }

    /**
        @notice Withdraw from all donor positions
     */
    function withdrawAll() external override {
        require(!withdrawDisabled, "Withdraws currently disabled");

        DonationInfo[] storage donations = donationInfo[msg.sender];

        uint256 donationsLength = donations.length;
        require(donationsLength != 0, "User not donating to anything");

        uint256 sOhmIndex = IsOHM(sOHM).index();
        uint256 total = 0;

        for (uint256 index = 0; index < donationsLength; index++) {
            DonationInfo storage donation = donations[index];

            total += donation.deposit;

            RecipientInfo storage recipient = recipientInfo[donation.recipient];
            recipient.carry += _getAccumulatedValue(recipient.agnosticDebt, recipient.indexAtLastChange);
            recipient.totalDebt -= donation.deposit;
            recipient.agnosticDebt = _toAgnostic(recipient.totalDebt + recipient.carry);
            recipient.indexAtLastChange = sOhmIndex;

            // Report amount donated
            uint256 accumulated = donation.carry +
                _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
            emit Donated(msg.sender, donation.recipient, accumulated);
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(sOHM).safeTransfer(msg.sender, total);

        emit AllWithdrawn(msg.sender, total);
    }

    /**
        @notice Get deposited sOHM amount for specific recipient
     */
    function depositsTo(address donor_, address recipient_) external view override returns (uint256) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        require(recipientIndex != MAX_UINT256, "No deposits");

        return donationInfo[donor_][recipientIndex].deposit;
    }

    /**
        @notice Return total amount of donor's sOHM deposited
     */
    function totalDeposits(address donor_) external view override returns (uint256) {
        DonationInfo[] storage donations = donationInfo[donor_];
        require(donations.length != 0, "User is not donating");

        uint256 total = 0;
        for (uint256 index = 0; index < donations.length; index++) {
            total += donations[index].deposit;
        }

        return total;
    }

    /**
        @notice Return arrays of donor's recipients and deposit amounts, matched by index
     */
    function getAllDeposits(address donor_) external view override returns (address[] memory, uint256[] memory) {
        DonationInfo[] storage donations = donationInfo[donor_];
        require(donations.length != 0, "User is not donating");

        uint256 len = donations.length;

        address[] memory addresses = new address[](len);
        uint256[] memory deposits = new uint256[](len);

        for (uint256 index = 0; index < len; index++) {
            addresses[index] = donations[index].recipient;
            deposits[index] = donations[index].deposit;
        }

        return (addresses, deposits);
    }

    /**
        @notice Return total amount of sOHM donated to recipient since last full withdrawal
     */
    function donatedTo(address donor_, address recipient_) external view override returns (uint256) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        require(recipientIndex != MAX_UINT256, "No donations to recipient");

        DonationInfo storage donation = donationInfo[donor_][recipientIndex];
        return donation.carry + _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
    }

    /**
        @notice Return total amount of sOHM donated from donor since last full withdrawal
     */
    function totalDonated(address donor_) external view override returns (uint256) {
        DonationInfo[] storage donations = donationInfo[donor_];
        uint256 total = 0;

        for (uint256 index = 0; index < donations.length; index++) {
            DonationInfo storage donation = donations[index];
            total += donation.carry + _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
        }

        return total;
    }

    /************************
     * Recipient Functions
     ************************/

    /**
        @notice Get redeemable sOHM balance of a recipient address
     */
    function redeemableBalance(address recipient_) public view override returns (uint256) {
        RecipientInfo storage recipient = recipientInfo[recipient_];
        return recipient.carry + _getAccumulatedValue(recipient.agnosticDebt, recipient.indexAtLastChange);
    }

    /**
        @notice Redeem recipient's full donated amount of sOHM at current index
        @dev Note that a recipient redeeming their vault shares effectively pays back all
             sOHM debt to donors at the time of redeem. Any future incurred debt will
             be accounted for with a subsequent redeem or a withdrawal by the specific donor.
     */
    function redeem() external override {
        require(!redeemDisabled, "Redeems currently disabled");

        uint256 redeemable = redeemableBalance(msg.sender);
        require(redeemable > 0, "No redeemable balance");

        RecipientInfo storage recipient = recipientInfo[msg.sender];
        recipient.agnosticDebt = _toAgnostic(recipient.totalDebt);
        recipient.carry = 0;
        recipient.indexAtLastChange = IsOHM(sOHM).index();

        IERC20(sOHM).safeTransfer(msg.sender, redeemable);

        emit Redeemed(msg.sender, redeemable);
    }

    /************************
     * Utility Functions
     ************************/

    /**
        @notice Get accumulated sOHM since last time agnostic value changed.
     */
    function _getAccumulatedValue(uint256 gAmount_, uint256 indexAtLastChange_) internal view returns (uint256) {
        return _fromAgnostic(gAmount_) - _fromAgnosticAtIndex(gAmount_, indexAtLastChange_);
    }

    /**
        @notice Get array index of a particular recipient in a donor's donationInfo array.
        @return Array index of recipient address. If recipient not present, returns max uint256 value.
     */
    function _getRecipientIndex(address donor_, address recipient_) internal view returns (uint256) {
        DonationInfo[] storage info = donationInfo[donor_];

        uint256 existingIndex = MAX_UINT256;
        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].recipient == recipient_) {
                existingIndex = i;
                break;
            }
        }
        return existingIndex;
    }

    /**
        @notice Convert flat sOHM value to agnostic value at current index
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e9 is because sOHM has 9 decimals.
     */
    function _toAgnostic(uint256 amount_) internal view returns (uint256) {
        return (amount_ * 1e9) / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e9 is because sOHM has 9 decimals.
     */
    function _fromAgnostic(uint256 amount_) internal view returns (uint256) {
        return (amount_ * (IsOHM(sOHM).index())) / 1e9;
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e9 is because sOHM has 9 decimals.
     */
    function _fromAgnosticAtIndex(uint256 amount_, uint256 index_) internal pure returns (uint256) {
        return (amount_ * index_) / 1e9;
    }

    /************************
     * Emergency Functions
     ************************/

    function emergencyShutdown(bool active_) external onlyGovernor {
        depositDisabled = active_;
        withdrawDisabled = active_;
        redeemDisabled = active_;
        emit EmergencyShutdown(active_);
    }

    function disableDeposits(bool active_) external onlyGovernor {
        depositDisabled = active_;
    }

    function disableWithdrawals(bool active_) external onlyGovernor {
        withdrawDisabled = active_;
    }

    function disableRedeems(bool active_) external onlyGovernor {
        redeemDisabled = active_;
    }
}
