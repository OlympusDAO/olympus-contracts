// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IsOHM} from "../interfaces/IsOHM.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";
import {IStaking} from "../interfaces/IStaking.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {YieldSplitter} from "../types/YieldSplitter.sol";
import {OlympusAccessControlled, IOlympusAuthority} from "../types/OlympusAccessControlled.sol";

/**
    @title YieldDirector (codename Tyche) 
    @notice This contract allows donors to deposit their sOHM and donate their rebases
            to any address. Donors will be able to withdraw their principal
            sOHM at any time. Donation recipients can also redeem accrued rebases at any time.
 */
contract YieldDirectorGohm is YieldSplitter, OlympusAccessControlled {
    using SafeERC20 for IERC20;

    // drop sOHM for mainnet launch
    address public immutable sOHM;
    IStaking public immutable staking;

    bool public depositDisabled;
    bool public withdrawDisabled;
    bool public redeemDisabled;

    event Deposited(address indexed donor_, address indexed recipient_, uint256 amount_);
    event DepositUpdated(address indexed donor_, uint256 indexed id_, uint256 amount_);
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
        YieldSplitter(gOhm_)
    {
        require(sOhm_ != address(0), "Invalid address for sOHM");
        require(gOhm_ != address(0), "Invalid address for gOHM");
        require(staking_ != address(0), "Invalid address for staking");

        sOHM = sOhm_;
        staking = IStaking(staking_);
    }

    /************************
    * Modifiers
    ************************/
    modifier isValidDeposit(uint256 amount_, address recipient_) {
        require(!depositDisabled, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(recipient_ != address(0), "Invalid recipient address");
        _;
    }

    modifier isValidUpdate(uint256 id_, uint256 amount_) {
        require(!depositDisabled, "Deposits currently disabled");
        require(amount_ > 0, "Invalid deposit amount");
        require(depositInfo[id_].depositor != address(0), "Invalid deposit ID");
        _;
    }

    modifier isValidWithdrawal(uint256 amount_) {
        require(!withdrawDisabled, "Withdraws currently disabled");
        require(amount_ > 0, "Invalid withdraw amount");
        _;
    }

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Deposit gOHM, records sender address and assign rebases to recipient
        @param amount_ Amount of gOHM debt issued from donor to recipient
        @param recipient_ Address to direct staking yield and vault shares to
    */
    function deposit(uint256 amount_, address recipient_) external isValidDeposit(amount_, recipient_) returns(uint256 depositId) {
        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), amount_);
        depositId = _deposit(msg.sender, recipient_, amount_);
        emit Deposited(msg.sender, recipient_, amount_);
    }

    /**
        @notice Deposit additional gOHM, and update deposit record
        @param id_ Deposit ID to direct additional gOHM to
        @param amount_ Amount of new gOHM debt issued from donor to recipient
     */
    function addToDeposit(uint256 id_, uint256 amount_) external isValidUpdate(id_, amount_) {
        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), amount_);
        _addToDeposit(id_, amount_);
        emit DepositUpdated(msg.sender, id_, amount_);
    }

    /**
        @notice Deposit sOHM, wrap to gOHM, and records sender address and assign rebases to recipeint
        @param amount_ Amount of sOHM debt issued from donor to recipient
        @param recipient_ Address to direct staking yield and vault shares to
     */
    function depositSohm(uint256 amount_, address recipient_) external isValidDeposit(amount_, recipient_) returns(uint256 depositId) {
        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), amount_);
    	uint256 gohmAmount = staking.wrap(address(this), amount_);
    	depositId = _deposit(msg.sender, recipient_, gohmAmount);
        emit Deposited(msg.sender, recipient_, amount_);
    }

    /**
        @notice Deposit additional sOHM, wrap to gOHM, and update deposit record
        @param id_ Deposit ID to direct additional gOHM to
        @param amount_ Amount of new sOHM debt issued from donor to recipient
     */
    function addToSohmDeposit(uint256 id_, uint256 amount_) external isValidUpdate(id_, amount_) {
        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), amount_);
        uint256 gohmAmount = staking.wrap(address(this), amount_);
        _addToDeposit(id_, gohmAmount);
        emit DepositUpdated(msg.sender, id_, amount_);
    }

    /**
        @notice Withdraw donor's gOHM from vault and subtracts debt from recipient
        @param id_ Deposit ID to remove gOHM debt from
        @param amount_ Amount of gOHM debt to remove and return to donor
     */
    function withdrawPrincipal(uint256 id_, uint256 amount_) external isValidWithdrawal(amount_) {
        DepositInfo storage currDeposit = depositInfo[id_];
        _withdrawPrincipal(id_, amount_);
        if (amount_ >= IgOHM(gOHM).balanceTo(currDeposit.principalAmount)) {
            currDeposit.principalAmount = 0;
            emit Donated(msg.sender, currDeposit.recipient, _getOutstandingYield(currDeposit.principalAmount, currDeposit.agnosticAmount));
        }
        IERC20(gOHM).safeTransfer(msg.sender, amount_);
        emit Withdrawn(msg.sender, currDeposit.recipient, amount_);
    }

    /**
        @notice Withdraw donor's gOHM from vault, and return it as sOHM
        @param id_ Deposit ID to remove gOHM debt from
        @param amount_ Amount of gOHM debt to remove and return to donor as sOHM
     */
    function withdrawPrincipalAsSohm(uint256 id_, uint256 amount_) external isValidWithdrawal(amount_) {
        DepositInfo storage currDeposit = depositInfo[id_];
        _withdrawPrincipal(id_, amount_);
        if (amount_ >= IgOHM(gOHM).balanceTo(currDeposit.principalAmount)) {
            currDeposit.principalAmount = 0;
            emit Donated(msg.sender, currDeposit.recipient, _getOutstandingYield(currDeposit.principalAmount, currDeposit.agnosticAmount));
        }
        staking.unwrap(msg.sender, amount_);
        emit Withdrawn(msg.sender, currDeposit.recipient, amount_);
    }

    /**
        @notice Withdraw from all donor positions
     */
    function withdrawAll() external {
        require(!withdrawDisabled, "Withdraws currently disabled");

        uint256[] storage depositIds = depositorIds[msg.sender];

        uint256 depositsLength = depositIds.length;
        require(depositsLength != 0, "User not donating to anything");

        uint256 principalTotal = 0;

        for (uint256 index = 0; index < depositsLength; index++) {
            DepositInfo storage currDeposit = depositInfo[depositIds[index]];
            principalTotal += currDeposit.principalAmount;
            currDeposit.principalAmount = 0;
            emit Donated(msg.sender, currDeposit.recipient, _getOutstandingYield(currDeposit.principalAmount, currDeposit.agnosticAmount));
        }

        IERC20(gOHM).safeTransfer(msg.sender, IgOHM(gOHM).balanceTo(principalTotal));

        emit AllWithdrawn(msg.sender, IgOHM(gOHM).balanceTo(principalTotal));
    }

    /**
        @notice Get deposited gOHM amounts for specific recipient (updated to current index based on sOHM equivalent amount deposit)
        @param donor_ Address of user donating yield
        @param recipient_ Address of user receiving donated yield
     */
    function depositsTo(address donor_, address recipient_) external view returns ( uint256 ) {
        uint256[] storage depositIds = depositorIds[donor_];
        if (depositIds.length == 0) {
            return 0;
        }

        for (uint256 index = 0; index < depositIds.length; index++) {
            DepositInfo storage currDeposit = depositInfo[depositIds[index]];
            if (currDeposit.recipient == recipient_) {
                return IgOHM(gOHM).balanceTo(currDeposit.principalAmount);
            }
        }

        return 0;
    }

    /**
        @notice Return total amount of donor's gOHM deposited (updated to current index based on sOHM equivalent amount deposits)
        @param donor_ Address of user donating yield
     */
    function totalDeposits(address donor_) external view returns ( uint256 ) {
        uint256[] storage depositIds = depositorIds[donor_];
        uint256 principalTotal = 0;

        for (uint256 index = 0; index < depositIds.length; index++) {
            DepositInfo storage currDeposit = depositInfo[depositIds[index]];
            principalTotal += currDeposit.principalAmount;
        }

        return IgOHM(gOHM).balanceTo(principalTotal);
    }
    
    /**
        @notice Return arrays of donor's recipients and deposit amounts (gOHM value based on sOHM equivalent deposit), matched by index
        @param donor_ Address of user donating yield
     */
    function getAllDeposits(address donor_) external view returns ( address[] memory, uint256[] memory ) {
        uint256[] storage depositIds = depositorIds[donor_];

        uint256 len = depositIds.length == 0 ? 1 : depositIds.length;

        address[] memory addresses = new address[](len);
        uint256[] memory agnosticDeposits = new uint256[](len);

        if (depositIds.length == 0) {
        	addresses[0] = address(0);
        	agnosticDeposits[0] = 0;
        } else {
	        for (uint256 index = 0; index < len; index++) {
                DepositInfo storage currDeposit = depositInfo[depositIds[index]];
	            addresses[index] = currDeposit.recipient;
	            agnosticDeposits[index] = IgOHM(gOHM).balanceTo(currDeposit.principalAmount);
	        }
        }

        return (addresses, agnosticDeposits);
    }

    /**
        @notice Return total amount of gOHM donated to recipient since last full withdrawal or redemption
        @param donor_ Address of user donating yield
        @param recipient_ Address of user recieiving donated yield
     */
    function donatedTo(address donor_, address recipient_) external view returns (uint256) {
        uint256[] storage depositIds = depositorIds[donor_];

        for (uint256 index = 0; index < depositIds.length; index++) {
            DepositInfo storage currDeposit = depositInfo[depositIds[index]];
            if (currDeposit.recipient == recipient_) {
                return _getOutstandingYield(currDeposit.principalAmount, currDeposit.agnosticAmount);
            }
        }

        return 0;
    }

    /**
        @notice Return total amount of gOHM donated from donor since last full withdrawal or redemption
        @param donor_ Address of user donating yield
     */
    function totalDonated(address donor_) external view returns (uint256) {
        uint256[] storage depositIds = depositorIds[donor_];
        uint256 principalTotal = 0;
        uint256 agnosticTotal = 0;

        for (uint256 index = 0; index < depositIds.length; index++) {
            DepositInfo storage currDeposit = depositInfo[depositIds[index]];

            principalTotal += currDeposit.principalAmount;
            agnosticTotal += currDeposit.agnosticAmount;
        }

        return _getOutstandingYield(principalTotal, agnosticTotal);
    }

    /************************
    * Recipient Functions
    ************************/

    function redeemableBalance(uint256 id_) public view returns (uint256) {
        DepositInfo storage currDeposit = depositInfo[id_];
        return _getOutstandingYield(currDeposit.principalAmount, currDeposit.agnosticAmount);     
    }

    /**
        @notice Get redeemable sOHM balance of a recipient address
        @param recipient_ Address of user receiving donated yield
     */
    function totalRedeemableBalance(address recipient_) public view returns ( uint256 ) {
        uint256[] storage receiptIds = recipientIds[recipient_];
        uint agnosticRedeemable = 0;

        for (uint256 index = 0; index < receiptIds.length; index++) {
            DepositInfo storage currDeposit = depositInfo[receiptIds[index]];
            agnosticRedeemable += _getOutstandingYield(currDeposit.principalAmount, currDeposit.agnosticAmount);
        }

        return agnosticRedeemable;
    }

    /**
        @notice Redeem recipient's donated amount of sOHM at current index from one donor
        @param id_ Deposit id for this donation
     */
    function redeemYield(uint256 id_) external returns (uint256) {
        require(!redeemDisabled, "Redeems currently disabled");
        uint256 amountRedeemed = _redeemYield(id_);
        require(amountRedeemed > 0, "No redeemable balance");

        IERC20(gOHM).safeTransfer(msg.sender, amountRedeemed);

        emit Redeemed(msg.sender, amountRedeemed);

    }

    /**
        @notice Redeem recipient's full donated amount of sOHM at current index
     */
    function redeemAllYield() external returns (uint256) {
        require(!redeemDisabled, "Redeems currently disabled");

        uint256 amountRedeemed = _redeemAllYield(msg.sender);
        require(amountRedeemed > 0, "No redeemable balance");

        IERC20(gOHM).safeTransfer(msg.sender, amountRedeemed);

        emit Redeemed(msg.sender, amountRedeemed);
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