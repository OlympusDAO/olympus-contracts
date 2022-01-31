// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IsOHM} from "../interfaces/IsOHM.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";
import {IStaking} from "../interfaces/IStaking.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {IYieldDirector} from "../interfaces/IYieldDirector.sol";
import {OlympusAccessControlled, IOlympusAuthority} from "../types/OlympusAccessControlled.sol";


// Because of truncation in the ones place for both gohmDeposit and gohmDebt we lose
// 1e-18 units of precision. Potential solution is to round up redeemable amount by 1e-18
/**
    @title YieldDirector (codename Tyche) 
    @notice This contract allows donors to deposit their sOHM and donate their rebases
            to any address. Donors will be able to withdraw their principal
            sOHM at any time. Donation recipients can also redeem accrued rebases at any time.
 */
contract YieldDirector is IYieldDirector, OlympusAccessControlled {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT256 = type(uint256).max;

    // drop sOHM for mainnet launch
    address internal immutable sOHM;
    address internal immutable gOHM;
    IStaking internal immutable staking;

    uint256 private constant INDEX_DECIMALS = 1e9;

    bool public depositDisabled;
    bool public withdrawDisabled;
    bool public redeemDisabled;

    struct DonationInfo {
        address recipient;
        uint256 sohmDeposit; // Total sOHM equivalent amount deposited
        uint256 gohmDeposit; // gOHM amount deposited
        uint256 carry; // Amount of sOHM accumulated over on deposit/withdraw
        uint256 indexAtLastChange; // Index of last deposit/withdraw
    }

    struct RecipientInfo {
        uint256 sohmDebt; // sOHM equivalent debt
        uint256 totalCarry; // Total sOHM equivalent value donating to recipient
        uint256 gohmDebt; // Total gOHM value of carry + debt
        uint256 indexAtLastChange; // Index when gOHM value last changed
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    event Deposited(address indexed donor_, address indexed recipient_, uint256 amount_);
    event Withdrawn(address indexed donor_, address indexed recipient_, uint256 amount_);
    event AllWithdrawn(address indexed donor_, uint256 indexed amount_);
    event Donated(address indexed donor_, address indexed recipient_, uint256 amount_);
    event Redeemed(address indexed recipient_, uint256 amount_);
    event EmergencyShutdown(bool active_);

    constructor (
    	address sOhm_,
    	address gOhm_,
    	address staking_,
    	address authority_
    )
        OlympusAccessControlled(IOlympusAuthority(authority_))
    {
        require(sOhm_ != address(0), "Invalid address for sOHM");
        require(gOhm_ != address(0), "Invalid address for gOHM");
        require(staking_ != address(0), "Invalid address for staking");

        sOHM = sOhm_;
        gOHM = gOhm_;
        staking = IStaking(staking_);
    }

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Deposit gOHM, records sender address and assign rebases to recipient
        @param amount_ Amount of gOHM debt issued from donor to recipient
        @param recipient_ Address to direct staking yield and vault shares to
    */
    function deposit(uint256 amount_, address recipient_) external override {
        require(!depositDisabled, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(recipient_ != address(0), "Invalid recipient address");
            
        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), amount_);
        _deposit(msg.sender, amount_, recipient_);
    }

    /**
        @notice Deposit sOHM, wrap to gOHM, and records sender address and assign rebases to recipeint
        @param amount_ Amount of sOHM debt issued from donor to recipient
        @param recipient_ Address to direct staking yield and vault shares to
     */
    function depositSohm(uint256 amount_, address recipient_) external override {
        require(!depositDisabled, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(recipient_ != address(0), "Invalid recipient address");

        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), amount_);
    	uint256 gohmAmount = staking.wrap(address(this), amount_);
    	_deposit(msg.sender, gohmAmount, recipient_);
    }

    /**
        @notice Withdraw donor's gOHM from vault and subtracts debt from recipient
     */
    function withdraw(uint256 amount_, address recipient_) external override {
        require(!withdrawDisabled, "Withdraws currently disabled");
        require(amount_ > 0, "Invalid withdraw amount");

        _withdraw(msg.sender, amount_, recipient_);
        IERC20(gOHM).safeTransfer(msg.sender, amount_);
        emit Withdrawn(msg.sender, recipient_, amount_);
    }

    /**
        @notice Withdraw donor's gOHM from vault, and return it as sOHM 
     */
    function withdrawSohm(uint256 amount_, address recipient_) external override {
        require(!withdrawDisabled, "Withdraws currently disabled");
        require(amount_ > 0, "Invalid withdraw amount");

        _withdraw(msg.sender, amount_, recipient_);
        staking.unwrap(msg.sender, amount_);
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
        uint256 gohmTotal = 0;

        for (uint256 index = 0; index < donationsLength; index++) {
            DonationInfo storage donation = donations[index];

            gohmTotal += _toAgnostic(donation.sohmDeposit);

            RecipientInfo storage recipient = recipientInfo[donation.recipient];
            recipient.totalCarry += _getAccumulatedValue(recipient.gohmDebt, recipient.indexAtLastChange);
            recipient.sohmDebt -= donation.sohmDeposit;
            recipient.gohmDebt -= donation.gohmDeposit;
            recipient.indexAtLastChange = sOhmIndex;

            // Report amount donated
            uint256 accumulated = _toAgnostic(
                    donation.carry
                    + _getAccumulatedValue(donation.gohmDeposit, donation.indexAtLastChange));

            emit Donated(msg.sender, donation.recipient, accumulated);
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(gOHM).safeTransfer(msg.sender, gohmTotal);

        emit AllWithdrawn(msg.sender, gohmTotal);
    }

    /**
        @notice Get deposited gOHM amounts for specific recipient (updated to current index based on sOHM equivalent amount deposit)
     */
    function depositsTo(address donor_, address recipient_) external override view returns ( uint256 ) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        if (recipientIndex == MAX_UINT256) {
            return 0;
        }

        return _toAgnostic(donationInfo[donor_][recipientIndex].sohmDeposit);
    }

    /**
        @notice Return total amount of donor's gOHM deposited (updated to current index based on sOHM equivalent amount deposits)
     */
    function totalDeposits(address donor_) external override view returns ( uint256 ) {
        DonationInfo[] storage donations = donationInfo[donor_];
        if (donations.length == 0) {
            return 0;
        }

        uint256 gohmTotal = 0;
        for (uint256 index = 0; index < donations.length; index++) {
            gohmTotal += _toAgnostic(donations[index].sohmDeposit);
        }

        return gohmTotal;
    }
    
    /**
        @notice Return arrays of donor's recipients and deposit amounts (gOHM value based on sOHM equivalent deposit), matched by index
     */
    function getAllDeposits(address donor_) external override view returns ( address[] memory, uint256[] memory ) {
        DonationInfo[] storage donations = donationInfo[donor_];

        uint256 len = donations.length == 0 ? 1 : donations.length;

        address[] memory addresses = new address[](len);
        uint256[] memory gohmDeposits = new uint256[](len);

        if (donations.length == 0) {
        	addresses[0] = address(0);
        	gohmDeposits[0] = 0;
        } else {
	        for (uint256 index = 0; index < len; index++) {
	            addresses[index] = donations[index].recipient;
	            gohmDeposits[index] = _toAgnostic(donations[index].sohmDeposit);
	        }
        }

        return (addresses, gohmDeposits);
    }

    /**
        @notice Return total amount of gOHM donated to recipient since last full withdrawal
     */
    function donatedTo(address donor_, address recipient_) external override view returns (uint256) {
        uint256 recipientIndex = _getRecipientIndex(donor_, recipient_);
        if (recipientIndex == MAX_UINT256) {
            return 0;
        }

        DonationInfo storage donation = donationInfo[donor_][recipientIndex];
        uint256 gohmDonation = _toAgnostic(
            donation.carry
            + _getAccumulatedValue(donation.gohmDeposit, donation.indexAtLastChange));
        return gohmDonation;
    }

    /**
        @notice Return total amount of gOHM donated from donor since last full withdrawal
     */
    function totalDonated(address donor_) external override view returns (uint256) {
        DonationInfo[] storage donations = donationInfo[donor_];
        uint256 totalGohm = 0;

        for (uint256 index = 0; index < donations.length; index++) {
            DonationInfo memory donation = donations[index];

            totalGohm += _toAgnostic(
                donation.carry
                + _getAccumulatedValue(donation.gohmDeposit, donation.indexAtLastChange));
        }

        return totalGohm;
    }

    /************************
    * Recipient Functions
    ************************/

    /**
        @notice Get redeemable sOHM balance of a recipient address
     */
    function redeemableBalance(address recipient_) public override view returns ( uint256 ) {
        RecipientInfo storage recipient = recipientInfo[recipient_];
        uint gohmRedeemable = _toAgnostic(recipient.totalCarry
                + _getAccumulatedValue(recipient.gohmDebt, recipient.indexAtLastChange));

        return gohmRedeemable;
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
        recipient.gohmDebt = _toAgnostic(recipient.sohmDebt);
        recipient.totalCarry = 0;
        recipient.indexAtLastChange = IsOHM(sOHM).index();

        IERC20(gOHM).safeTransfer(msg.sender, redeemable);

        emit Redeemed(msg.sender, redeemable);
    }

    /************************
    * Utility Functions
    ************************/

    function _deposit(address depositer_, uint256 amount_, address recipient_) internal {
        uint256 index = IsOHM(sOHM).index(); // need to find chainlink oracle

        // Record donors's issued debt to recipient address
        DonationInfo[] storage donations = donationInfo[depositer_];
        uint256 recipientIndex = _getRecipientIndex(depositer_, recipient_);

        if(recipientIndex == MAX_UINT256) {
            donations.push(
                DonationInfo({
                    recipient: recipient_,
                    sohmDeposit: _fromAgnostic(amount_),
                    gohmDeposit: amount_,
                    carry: 0,
                    indexAtLastChange: index
                })
            );
        } else {
            DonationInfo storage donation = donations[recipientIndex];

            donation.carry += _getAccumulatedValue(donation.gohmDeposit, donation.indexAtLastChange);
            donation.gohmDeposit = _toAgnostic(donation.sohmDeposit) + amount_;
            donation.sohmDeposit += _fromAgnostic(amount_);
            donation.indexAtLastChange = index;
        }

        RecipientInfo storage recipient = recipientInfo[recipient_];

        // Calculate value carried over since last change
        recipient.totalCarry += _getAccumulatedValue(recipient.gohmDebt, recipient.indexAtLastChange);
        recipient.sohmDebt += _fromAgnostic(amount_);
        recipient.gohmDebt = _toAgnostic(recipient.sohmDebt + recipient.totalCarry);
        recipient.indexAtLastChange = index;

        emit Deposited(depositer_, recipient_, amount_);
    }

    function _withdraw(address depositer_, uint256 amount_, address recipient_) internal {
        uint256 index = IsOHM(sOHM).index();

        // Donor accounting
        uint256 recipientIndex = _getRecipientIndex(depositer_, recipient_);
        require(recipientIndex != MAX_UINT256, "No donations to recipient");

        // Check withdrawal size
        DonationInfo storage donation = donationInfo[depositer_][recipientIndex];

        if(amount_ > _toAgnostic(donation.sohmDeposit)) {
            // Report how much was donated then clear donation information
            uint256 accumulated = _toAgnostic(
                    donation.carry
                    + _getAccumulatedValue(donation.gohmDeposit, donation.indexAtLastChange));
            emit Donated(depositer_, recipient_, accumulated);

            delete donationInfo[depositer_][recipientIndex];

            // If element was in middle of array, bring last element to deleted index
            uint256 lastIndex = donationInfo[depositer_].length - 1;
            if(recipientIndex != lastIndex) {
                donationInfo[depositer_][recipientIndex] = donationInfo[depositer_][lastIndex];
                donationInfo[depositer_].pop();
            }
        } else {
            donation.carry += _getAccumulatedValue(donation.gohmDeposit, donation.indexAtLastChange);
            donation.gohmDeposit = _toAgnostic(donation.sohmDeposit) - amount_;
            donation.sohmDeposit -= _fromAgnostic(amount_);
            donation.indexAtLastChange = index;
        }

        // Recipient accounting
        RecipientInfo storage recipient = recipientInfo[recipient_];
        recipient.totalCarry += _getAccumulatedValue(recipient.gohmDebt, recipient.indexAtLastChange);
        recipient.sohmDebt -= _fromAgnostic(amount_);
        recipient.gohmDebt = _toAgnostic(recipient.sohmDebt + recipient.totalCarry);
        recipient.indexAtLastChange = index;
    }

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
             1e9 is because sOHM index has 9 decimals and this will preserve the
             right number of decimals.
     */
    function _toAgnostic(uint256 amount_) internal view returns ( uint256 ) {
        return amount_
            * INDEX_DECIMALS
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e18 is because gOHM has 18 decimals.
     */
    function _fromAgnostic(uint256 amount_) internal view returns ( uint256 ) {
        return amount_
            * (IsOHM(sOHM).index())
            / INDEX_DECIMALS;
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e18 is because gOHM has 18 decimals.
     */
    function _fromAgnosticAtIndex(uint256 amount_, uint256 index_) internal pure returns ( uint256 ) {
        return amount_
            * index_
            / INDEX_DECIMALS;
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