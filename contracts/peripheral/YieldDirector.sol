// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IsOHM} from "../interfaces/IsOHM.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {IYieldDirector} from "../interfaces/IYieldDirector.sol";
import {Ownable} from "../types/Ownable.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";

//import {ERC20} from "../types/ERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
    @title YieldDirector (codename Tyche) 
    @notice This contract allows donors to deposit their sOHM and donate their rebases
            to any address. Donors will be able to withdraw their principal
            sOHM at any time. Donation recipients can also redeem accrued rebases at any time.
 */
contract YieldDirector is Ownable, IYieldDirector {
    using SafeERC20 for IERC20;

    address public immutable sOHM;
    uint256 public immutable DECIMALS; // Decimals of OHM and sOHM

    bool public disableDeposits;
    bool public disableWithdaws;
    bool public disableRedeems;

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

    event Deposited(address donor_, address recipient_, uint256 amount_);
    event Withdrawn(address donor_, address recipient_, uint256 amount_);
    event AllWithdrawn(address donor_, uint256 amount_);
    event Redeemed(address recipient_, uint256 amount_);
    event EmergencyShutdown(bool active_);

    constructor (address sOhm_) {
        require(sOhm_ != address(0), "Invalid address for sOHM");

        sOHM = sOhm_;
        DECIMALS = ERC20(sOhm_).decimals();

        disableDeposits = false;
        disableWithdaws = false;
        disableRedeems = false;
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
        require(disableDeposits == false, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(recipient_ != address(0), "Invalid recipient address");
        require(IERC20(sOHM).balanceOf(msg.sender) >= amount_, "Not enough sOHM");

        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), amount_);

        uint256 index = IsOHM(sOHM).index();

        // Record donors's issued debt to recipient address
        DonationInfo[] storage donations = donationInfo[msg.sender];
        int256 recipientIndex = _getRecipientIndex(msg.sender, recipient_);

        if(recipientIndex == -1) {
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
            DonationInfo storage donation = donations[uint256(recipientIndex)];

            // Only update carry if there was a previous deposit
            if(donation.deposit != 0) {
                donation.carry += _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
            }

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
        require(disableWithdaws == false, "Withdraws currently disabled");

        int256 recipientIndexSigned = _getRecipientIndex(msg.sender, recipient_);
        require(recipientIndexSigned >= 0, "No donations to recipient");

        uint256 index = IsOHM(sOHM).index();

        // Donor accounting
        DonationInfo storage donation = donationInfo[msg.sender][uint256(recipientIndexSigned)];

        require(donation.deposit >= amount_, "Not enough sOHM to withdraw");

        donation.carry += _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
        donation.deposit -= amount_;
        donation.agnosticDeposit = _toAgnostic(donation.deposit);
        donation.indexAtLastChange = index;

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
        require(disableWithdaws == false, "Withdraws currently disabled");

        DonationInfo[] storage donations = donationInfo[msg.sender];
        require(donations.length != 0, "User not donating to anything");

        uint256 sOhmIndex = IsOHM(sOHM).index();
        uint256 total = 0;

        for (uint256 index = 0; index < donations.length; index++) {
            DonationInfo storage donation = donations[index];

            total += donation.deposit;

            RecipientInfo storage recipient = recipientInfo[donation.recipient];
            recipient.carry += _getAccumulatedValue(recipient.agnosticDebt, recipient.indexAtLastChange);
            recipient.totalDebt -= donation.deposit;
            recipient.agnosticDebt = _toAgnostic(recipient.totalDebt + recipient.carry);
            recipient.indexAtLastChange = sOhmIndex;

            // Clear out donation
            donation.carry += _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);
            donation.deposit = 0;
            donation.agnosticDeposit = 0;
            donation.indexAtLastChange = index;
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(sOHM).safeTransfer(msg.sender, total);

        emit AllWithdrawn(msg.sender, total);
    }

    /**
        @notice Get deposited sOHM amount for specific recipient
     */
    function depositsTo(address donor_, address recipient_) external override view returns ( uint256 ) {
        int256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        require(recipientIndex >= 0, "No donations to recipient");

        return donationInfo[donor_][uint256(recipientIndex)].deposit;
    }

    /**
        @notice Return total amount of donor's sOHM deposited
     */
    function totalDeposits(address donor_) external override view returns ( uint256 ) {
        DonationInfo[] memory donations = donationInfo[donor_];
        require(donations.length != 0, "User is not donating");

        uint256 total = 0;
        for (uint256 index = 0; index < donations.length; index++) {
            total += donations[index].deposit;
        }
        return total;
    }

    /**
        @notice Return total amount of sOHM donated to recipient
     */
    function donatedTo(address donor_, address recipient_) external override view returns (uint256) {
        DonationInfo[] memory donations = donationInfo[donor_];
        int256 recipientIndexSigned = _getRecipientIndex(donor_, recipient_);
        require(recipientIndexSigned >= 0, "No donations to recipient");

        DonationInfo memory donation = donations[uint256(recipientIndexSigned)];
        //return donations[uint256(recipientIndexSigned)].deposit + donations[uint256(recipientIndexSigned)].carry;
        return donation.carry
            + _getAccumulatedValue(donation.agnosticDeposit, donation.indexAtLastChange);

    }

    /**
        @notice Return total amount of sOHM donated from donor
     */
    function totalDonated(address donor_) external override view returns (uint256) {
        DonationInfo[] memory donations = donationInfo[donor_];
        uint256 total = 0;

        for (uint256 index = 0; index < donations.length; index++) {
            DonationInfo memory donation = donations[index];
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
    function redeemableBalance(address recipient_) public override view returns (uint256) {
        RecipientInfo memory recipient = recipientInfo[recipient_];
        return recipient.carry
            + _getAccumulatedValue(recipient.agnosticDebt, recipient.indexAtLastChange);
    }

    /**
        @notice Redeem recipient's full donated amount of sOHM at current index
        @dev Note that a recipient redeeming their vault shares effectively pays back all
             sOHM debt to donors at the time of redeem. Any future incurred debt will
             be accounted for with a subsequent redeem or a withdrawal by the specific donor.
     */
    function redeem() external override {
        require(disableRedeems == false, "Redeems currently disabled");

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
        @return Array index of recipient address. If not present, return -1.
     */
    function _getRecipientIndex(address donor_, address recipient_) internal view returns (int256) {
        DonationInfo[] storage info = donationInfo[donor_];

        int256 existingIndex = -1;
        for (uint256 i = 0; i < info.length; i++) {
            if(info[i].recipient == recipient_) {
                existingIndex = int256(i);
                break;
            }
        }
        return existingIndex;
    }

    // TODO These can be replaced with wsOHM contract functions
    /**
        @notice Convert flat sOHM value to agnostic value at current index
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _toAgnostic(uint256 amount_) internal view returns ( uint256 ) {
        return amount_
            * (10 ** DECIMALS)
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnostic(uint256 amount_) internal view returns ( uint256 ) {
        return amount_
            * (IsOHM(sOHM).index())
            / (10 ** DECIMALS);
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnosticAtIndex(uint256 amount_, uint256 index_) internal view returns ( uint256 ) {
        return amount_
            * index_
            / (10 ** DECIMALS);
    }

    /************************
    * Emergency Functions
    ************************/

    function emergencyShutdown(bool active_) external onlyOwner {
        disableDeposits = active_;
        disableWithdaws = active_;
        disableRedeems = active_;
        emit EmergencyShutdown(active_);
    }

    function shutdownDeposits(bool active_) external onlyOwner {
        disableDeposits = active_;
    }

    function shutdownWithdrawals(bool active_) external onlyOwner {
        disableWithdaws = active_;
    }

    function shutdownRedeems(bool active_) external onlyOwner {
        disableRedeems = active_;
    }
}