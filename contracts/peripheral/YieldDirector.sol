// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IsOHM} from "../interfaces/IsOHM.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";
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
    address public immutable gOHM;

    bool public depositDisabled;
    bool public withdrawDisabled;
    bool public redeemDisabled;

    struct DonationInfo {
        address recipient;
        uint256 sohmDeposit; // Total non-agnostic amount of sOHM deposited
        uint256 gohmDeposit; // Total non-agnostic amount of gOHM deposited
        uint256 sohmAgnosticDeposit; // Total agnostic amount deposited
        uint256 gohmAgnosticDeposit; // Raw gOHM amount deposited
        uint256 sohmCarry; // Amount of sOHM accumulated over on deposit/withdraw
        uint256 gohmCarry;
        uint256 indexAtLastChange; // Index of last deposit/withdraw
    }

    struct RecipientInfo {
        uint256 sohmDebt; // Non-agnostic sOHM debt
        uint256 gohmDebt; // Non-agnostic gOHM debt
        uint256 sohmCarry; // Total non-agnostic value donating to recipient
        uint256 gohmCarry;
        uint256 sohmAgnosticDebt; // Total agnostic value of carry + debt
        uint256 gohmAgnosticDebt;
        uint256 indexAtLastChange; // Index when agnostic value changed
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    event Deposited(address indexed donor_, address indexed recipient_, uint256 amount_, bool sOhm_);
    event Withdrawn(address indexed donor_, address indexed recipient_, uint256 amount_, bool sOhm_);
    event AllWithdrawn(address indexed donor_, uint256 indexed sohmAmount_, uint256 indexed gohmAmount_);
    event Donated(address indexed donor_, address indexed recipient_, uint256 amount_);
    event Redeemed(address indexed recipient_, uint256 sohmAmount_, uint256 gohmAmount_);
    event EmergencyShutdown(bool active_);

    constructor (address sOhm_, address gOhm_, address authority_)
        OlympusAccessControlled(IOlympusAuthority(authority_))
    {
        require(sOhm_ != address(0), "Invalid address for sOHM");
        require(gOhm_ != address(0), "Invalid address for gOHM");

        sOHM = sOhm_;
        gOHM = gOhm_;
    }

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Deposit sOHM or gOHM, records sender address and assign rebases to recipient
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

        if(recipientIndex == MAX_UINT256) {
            donations.push(
                DonationInfo({
                    recipient: recipient_,
                    sohmDeposit: amount_,
                    gohmDeposit: 0,
                    sohmAgnosticDeposit: _toAgnostic(amount_),
                    gohmAgnosticDeposit: 0,
                    sohmCarry: 0,
                    gohmCarry: 0,
                    indexAtLastChange: index
                })
            );
        } else {
            DonationInfo storage donation = donations[recipientIndex];

            donation.sohmCarry += _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange);
            donation.gohmCarry += _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange);
            donation.sohmDeposit += amount_;
            donation.sohmAgnosticDeposit = _toAgnostic(donation.sohmDeposit);
            donation.indexAtLastChange = index;
        }

        RecipientInfo storage recipient = recipientInfo[recipient_];

        // Calculate value carried over since last change
        recipient.sohmCarry += _getAccumulatedValue(recipient.sohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.gohmCarry += _getAccumulatedValue(recipient.gohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.sohmDebt += amount_;
        recipient.sohmAgnosticDebt = _toAgnostic(recipient.sohmDebt + recipient.sohmCarry);
        recipient.gohmAgnosticDebt = _toAgnostic(recipient.gohmDebt + recipient.gohmCarry);
        recipient.indexAtLastChange = index;

        emit Deposited(msg.sender, recipient_, amount_, true);
    }

    function depositGohm(uint256 amount_, address recipient_) external override {
        require(!depositDisabled, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(recipient_ != address(0), "Invalid recipient address");
            
        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), amount_);

        uint256 index = IsOHM(sOHM).index();

        // Record donors's issued debt to recipient address
        DonationInfo[] storage donations = donationInfo[msg.sender];
        uint256 recipientIndex = _getRecipientIndex(msg.sender, recipient_);

        if(recipientIndex == MAX_UINT256) {
            donations.push(
                DonationInfo({
                    recipient: recipient_,
                    sohmDeposit: 0,
                    gohmDeposit: _fromAgnostic(amount_),
                    sohmAgnosticDeposit: 0,
                    gohmAgnosticDeposit: amount_,
                    sohmCarry: 0,
                    gohmCarry: 0,
                    indexAtLastChange: index
                })
            );
        } else {
            DonationInfo storage donation = donations[recipientIndex];

            donation.sohmCarry += _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange);
            donation.gohmCarry += _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange);
            donation.gohmDeposit += _fromAgnostic(amount_);
            donation.gohmAgnosticDeposit = _toAgnostic(donation.gohmDeposit);
            donation.indexAtLastChange = index;
        }

        RecipientInfo storage recipient = recipientInfo[recipient_];

        // Calculate value carried over since last change
        recipient.sohmCarry += _getAccumulatedValue(recipient.sohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.gohmCarry += _getAccumulatedValue(recipient.gohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.gohmDebt += _fromAgnostic(amount_);
        recipient.sohmAgnosticDebt = _toAgnostic(recipient.sohmDebt + recipient.sohmCarry);
        recipient.gohmAgnosticDebt = _toAgnostic(recipient.gohmDebt + recipient.gohmCarry);
        recipient.indexAtLastChange = index;

        emit Deposited(msg.sender, recipient_, amount_, false);
    }

    /**
        @notice Withdraw donor's sOHM or gOHM from vault and subtracts debt from recipient
     */
    function withdraw(uint256 amount_, address recipient_) external override {
        require(!withdrawDisabled, "Withdraws currently disabled");
        require(amount_ > 0, "Invalid withdraw amount");

        uint256 index = IsOHM(sOHM).index();

        // Donor accounting
        uint256 recipientIndex = _getRecipientIndex(msg.sender, recipient_);
        require(recipientIndex != MAX_UINT256, "No donations to recipient");

        DonationInfo storage donation = donationInfo[msg.sender][recipientIndex];

        if(amount_ >= donation.sohmDeposit && donation.gohmDeposit == 0) {
            // Report how much was donated then clear donation information
            uint256 accumulated = donation.sohmCarry
                + _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange)
                + IgOHM(gOHM).balanceFrom(
                    donation.gohmCarry
                    + _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange)
                );
            emit Donated(msg.sender, recipient_, accumulated);

            delete donationInfo[msg.sender][recipientIndex];

            // If element was in middle of array, bring last element to deleted index
            uint256 lastIndex = donationInfo[msg.sender].length - 1;
            if(recipientIndex != lastIndex) {
                donationInfo[msg.sender][recipientIndex] = donationInfo[msg.sender][lastIndex];
                donationInfo[msg.sender].pop();
            }
        } else {
            donation.sohmCarry += _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange);
            donation.gohmCarry += _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange);
            donation.sohmDeposit -= amount_;
            donation.sohmAgnosticDeposit = _toAgnostic(donation.sohmDeposit);
            donation.indexAtLastChange = index;
        }

        // Recipient accounting
        RecipientInfo storage recipient = recipientInfo[recipient_];
        recipient.sohmCarry += _getAccumulatedValue(recipient.sohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.gohmCarry += _getAccumulatedValue(recipient.gohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.sohmDebt -= amount_;
        recipient.sohmAgnosticDebt = _toAgnostic(recipient.sohmDebt + recipient.sohmCarry);
        recipient.gohmAgnosticDebt = _toAgnostic(recipient.gohmDebt + recipient.gohmCarry);
        recipient.indexAtLastChange = index;

        IERC20(sOHM).safeTransfer(msg.sender, amount_);

        emit Withdrawn(msg.sender, recipient_, amount_, true);
    }

    function withdrawGohm(uint256 amount_, address recipient_) external override {
        require(!withdrawDisabled, "Withdraws currently disabled");
        require(amount_ > 0, "Invalid withdraw amount");

        uint256 index = IsOHM(sOHM).index();

        // Donor accounting
        uint256 recipientIndex = _getRecipientIndex(msg.sender, recipient_);
        require(recipientIndex != MAX_UINT256, "No donations to recipient");

        DonationInfo storage donation = donationInfo[msg.sender][recipientIndex];

        if(amount_ >= _toAgnostic(donation.gohmDeposit) && donation.sohmDeposit == 0) {
            // Report how much was donated then clear donation information
            uint256 accumulated = donation.sohmCarry
                + _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange)
                + IgOHM(gOHM).balanceFrom(
                    donation.gohmCarry
                    + _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange)
                );
            emit Donated(msg.sender, recipient_, accumulated);

            delete donationInfo[msg.sender][recipientIndex];

            // If element was in middle of array, bring last element to deleted index
            uint256 lastIndex = donationInfo[msg.sender].length - 1;
            if(recipientIndex != lastIndex) {
                donationInfo[msg.sender][recipientIndex] = donationInfo[msg.sender][lastIndex];
                donationInfo[msg.sender].pop();
            }
        } else {
            donation.sohmCarry += _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange);
            donation.gohmCarry += _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange);
            donation.gohmDeposit = _toAgnostic(donation.gohmDeposit) - amount_;
            donation.sohmAgnosticDeposit = _toAgnostic(donation.sohmDeposit);
            donation.gohmAgnosticDeposit = _toAgnostic(donation.gohmDeposit);
            donation.indexAtLastChange = index;
        }

        // Recipient accounting
        RecipientInfo storage recipient = recipientInfo[recipient_];
        recipient.sohmCarry += _getAccumulatedValue(recipient.sohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.gohmCarry += _getAccumulatedValue(recipient.gohmAgnosticDebt, recipient.indexAtLastChange);
        recipient.gohmDebt = _toAgnostic(recipient.gohmDebt) - amount_;
        recipient.sohmAgnosticDebt = _toAgnostic(recipient.sohmDebt + recipient.sohmCarry);
        recipient.gohmAgnosticDebt = _toAgnostic(recipient.gohmDebt + recipient.gohmCarry);
        recipient.indexAtLastChange = index;

        IERC20(gOHM).safeTransfer(msg.sender, amount_);

        emit Withdrawn(msg.sender, recipient_, amount_, false);
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
        uint256 sohmTotal = 0;
        uint256 gohmTotal = 0;

        for (uint256 index = 0; index < donationsLength; index++) {
            DonationInfo storage donation = donations[index];

            sohmTotal += donation.sohmDeposit;
            gohmTotal += IgOHM(gOHM).balanceTo(donation.gohmDeposit);

            RecipientInfo storage recipient = recipientInfo[donation.recipient];
            recipient.sohmCarry += _getAccumulatedValue(recipient.sohmAgnosticDebt, recipient.indexAtLastChange);
            recipient.gohmCarry += _getAccumulatedValue(recipient.gohmAgnosticDebt, recipient.indexAtLastChange);
            recipient.sohmDebt -= donation.sohmDeposit;
            recipient.gohmDebt -= donation.gohmDeposit;
            recipient.sohmAgnosticDebt = _toAgnostic(recipient.sohmDebt + recipient.sohmCarry);
            recipient.gohmAgnosticDebt -= donation.gohmAgnosticDeposit;
            recipient.indexAtLastChange = sOhmIndex;

            // Report amount donated
            uint256 accumulated = donation.sohmCarry
                + _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange)
                + IgOHM(gOHM).balanceFrom(
                    donation.gohmCarry
                    + _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange)
                );
            emit Donated(msg.sender, donation.recipient, accumulated);
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(sOHM).safeTransfer(msg.sender, sohmTotal);
        IERC20(gOHM).safeTransfer(msg.sender, gohmTotal);

        emit AllWithdrawn(msg.sender, sohmTotal, gohmTotal);
    }

    function withdrawableGohm(address donor_, address recipient_) external override view returns ( uint256 ) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        require(recipientIndex != MAX_UINT256, "No deposits");

        return _toAgnostic(donationInfo[donor_][recipientIndex].gohmDeposit);
    }

    /**
        @notice Get deposited sOHM and gOHM amounts for specific recipient
     */
    function depositsTo(address donor_, address recipient_) external override view returns ( uint256, uint256 ) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        require(recipientIndex != MAX_UINT256, "No deposits");

        return (donationInfo[donor_][recipientIndex].sohmDeposit, donationInfo[donor_][recipientIndex].gohmAgnosticDeposit);
    }

    /**
        @notice Return total amount of donor's sOHM and gOHM deposited
     */
    function totalDeposits(address donor_) external override view returns ( uint256, uint256 ) {
        DonationInfo[] storage donations = donationInfo[donor_];
        require(donations.length != 0, "User is not donating");

        uint256 sohmTotal = 0;
        uint256 gohmTotal = 0;
        for (uint256 index = 0; index < donations.length; index++) {
            sohmTotal += donations[index].sohmDeposit;
            gohmTotal += donations[index].gohmAgnosticDeposit;
        }

        return (sohmTotal, gohmTotal);
    }
    
    /**
        @notice Return arrays of donor's recipients and deposit amounts, matched by index
     */
    function getAllDeposits(address donor_) external override view returns ( address[] memory, uint256[] memory, uint256[] memory ) {
        DonationInfo[] storage donations = donationInfo[donor_];
        require(donations.length != 0, "User is not donating");

        uint256 len = donations.length;

        address[] memory addresses = new address[](len);
        uint256[] memory sohmDeposits = new uint256[](len);
        uint256[] memory gohmDeposits = new uint256[](len);

        for (uint256 index = 0; index < len; index++) {
            addresses[index] = donations[index].recipient;
            sohmDeposits[index] = donations[index].sohmDeposit;
            gohmDeposits[index] = donations[index].gohmAgnosticDeposit;
        }

        return (addresses, sohmDeposits, gohmDeposits);
    }

    /**
        @notice Return total amount of sOHM donated to recipient since last full withdrawal
     */
    function donatedTo(address donor_, address recipient_) external override view returns (uint256, uint256) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        require(recipientIndex != MAX_UINT256, "No donations to recipient");

        DonationInfo storage donation = donationInfo[donor_][recipientIndex];
        uint256 sohmDonation = donation.sohmCarry
            + _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange);
        uint256 gohmDonation = IgOHM(gOHM).balanceTo(donation.gohmCarry)
            + _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange);
        return (sohmDonation, gohmDonation);
    }

    /**
        @notice Return total amount of sOHM donated from donor since last full withdrawal
     */
    function totalDonated(address donor_) external override view returns (uint256, uint256) {
        DonationInfo[] storage donations = donationInfo[donor_];
        uint256 totalSohm = 0;
        uint256 totalGohm = 0;

        for (uint256 index = 0; index < donations.length; index++) {
            DonationInfo storage donation = donations[index];
            totalSohm += donation.sohmCarry
                + _getAccumulatedValue(donation.sohmAgnosticDeposit, donation.indexAtLastChange);

            totalGohm += donation.gohmCarry
                + _getAccumulatedValue(donation.gohmAgnosticDeposit, donation.indexAtLastChange);
        }

        return (totalSohm, IgOHM(gOHM).balanceTo(totalGohm));
    }

    /************************
    * Recipient Functions
    ************************/

    /**
        @notice Get redeemable sOHM balance of a recipient address
     */
    function redeemableBalance(address recipient_) public override view returns ( uint256, uint256 ) {
        RecipientInfo storage recipient = recipientInfo[recipient_];
        uint256 sohmRedeemable = recipient.sohmCarry
            + _getAccumulatedValue(recipient.sohmAgnosticDebt, recipient.indexAtLastChange);
        uint gohmRedeemable = _toAgnostic(
            recipient.gohmCarry
            + _getAccumulatedValue(recipient.gohmAgnosticDebt, recipient.indexAtLastChange)
        );

        return (sohmRedeemable, gohmRedeemable);
    }

    /**
        @notice Redeem recipient's full donated amount of sOHM at current index
        @dev Note that a recipient redeeming their vault shares effectively pays back all
             sOHM debt to donors at the time of redeem. Any future incurred debt will
             be accounted for with a subsequent redeem or a withdrawal by the specific donor.
     */
    function redeem() external override {
        require(!redeemDisabled, "Redeems currently disabled");

        (uint256 sohmRedeemable, uint256 gohmRedeemable) = redeemableBalance(msg.sender);
        require(sohmRedeemable > 0 || gohmRedeemable > 0, "No redeemable balance");

        RecipientInfo storage recipient = recipientInfo[msg.sender];
        recipient.sohmAgnosticDebt = _toAgnostic(recipient.sohmDebt);
        recipient.gohmAgnosticDebt = _toAgnostic(recipient.gohmDebt);
        recipient.sohmCarry = 0;
        recipient.gohmCarry = 0;
        recipient.indexAtLastChange = IsOHM(sOHM).index();

        if (sohmRedeemable > 0) {
            IERC20(sOHM).safeTransfer(msg.sender, sohmRedeemable);
        }

        if (gohmRedeemable > 0) {
            IERC20(gOHM).safeTransfer(msg.sender, gohmRedeemable);
        }

        emit Redeemed(msg.sender, sohmRedeemable, gohmRedeemable);
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
            if(info[i].recipient == recipient_) {
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
    function _toAgnostic(uint256 amount_) internal view returns ( uint256 ) {
        return amount_
            * 1e9
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e9 is because sOHM has 9 decimals.
     */
    function _fromAgnostic(uint256 amount_) internal view returns ( uint256 ) {
        return amount_
            * (IsOHM(sOHM).index())
            / 1e9;
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e9 is because sOHM has 9 decimals.
     */
    function _fromAgnosticAtIndex(uint256 amount_, uint256 index_) internal pure returns ( uint256 ) {
        return amount_
            * index_
            / 1e9;
    }

    function _fromGohmAtIndex(uint256 amount_, uint256 index_) internal pure returns ( uint256 ) {
        return amount_
            * index_
            / 1e18;
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