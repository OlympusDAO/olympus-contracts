// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IOHM.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";
import "./interfaces/ITreasury.sol";
import "../libraries/SafeERC20.sol";
import "../types/OlympusAccessControlledV2.sol";

error IncurDebtV1_NotBorrower(address _borrower);
error IncurDebtV1_InvaildNumber(uint256 _amount);
error IncurDebtV1_WrongTokenAddress(address _token);
error IncurDebtV1_AlreadyBorrower(address _borrower);
error IncurDebtV1_AboveGlobalDebtLimit(uint256 _limit);
error IncurDebtV1_AboveBorrowersDebtLimit(uint256 _limit);
error IncurDebtV1_LimitBelowOutstandingDebt(uint256 _limit);
error IncurDebtV1_AmountAboveBorrowerBalance(uint256 _amount);
error IncurDebtV1_AmountMoreThanBorrowersLimit(uint256 _borrower);
error IncurDebtV1_OHMAmountMoreThanAvailableLoan(uint256 _amount);
error IncurDebtV1_BorrowerHasNoOutstandingDebet(address _borrower);
error IncurDebtV1_BorrowerStillHasOutstandingDebet(address _borrower);

contract IncurDebtV1 is OlympusAccessControlledV2 {
    using SafeERC20 for IERC20;

    uint256 public globalDebtLimit;
    uint256 public totalOutstandingDebt;

    address public immutable OHM;
    address public immutable gOHM;
    address public immutable sOHM;
    address public immutable staking;
    address public immutable treasury;

    struct Borrower {
        uint128 debt;
        uint128 limit;
        uint128 collateralInSOHM;
        uint128 collateralInGOHM;
        bool isAllowed;
    }

    mapping(address => Borrower) public borrowers;

    constructor(
        address _OHM,
        address _gOHM,
        address _sOHM,
        address _staking,
        address _treasury,
        address _olympusAuthority
    ) OlympusAccessControlledV2(IOlympusAuthority(_olympusAuthority)) {
        OHM = _OHM;
        gOHM = _gOHM;
        sOHM = _sOHM;
        staking = _staking;
        treasury = _treasury;
    }

    modifier isBorrower(address _borrower) {
        if (!borrowers[_borrower].isAllowed) revert IncurDebtV1_NotBorrower(_borrower);
        _;
    }

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - must be greater than or equal to existing debt
     * @param _limit in OHM
     */
    function setGlobalDebtLimit(uint256 _limit) external onlyGovernor {
        if (_limit < totalOutstandingDebt) revert IncurDebtV1_LimitBelowOutstandingDebt(_limit);
        globalDebtLimit = _limit;
    }

    /**
     * @notice lets a user become a borrower
     * - onlyOwner (or governance)
     * - user must not be borrower
     * @param _borrower the address that will interact with contract
     */
    function allowBorrower(address _borrower) external onlyGovernor {
        if (borrowers[_borrower].isAllowed) revert IncurDebtV1_AlreadyBorrower(_borrower);
        borrowers[_borrower].isAllowed = true;
    }

    /**
     * @notice sets the maximum debt limit for a borrower
     * - onlyOwner (or governance)
     * - limit must be greater than or equal to borrower's outstanding debt
     * - limit must be less than or equal to the global debt limit
     * @param _borrower the address that will interact with contract
     * @param _limit borrower's debt limit in OHM
     */
    function setBorrowerDebtLimit(address _borrower, uint256 _limit) external onlyGovernor isBorrower(_borrower) {
        if (_limit < borrowers[_borrower].debt) revert IncurDebtV1_AboveBorrowersDebtLimit(_limit);
        if (_limit > globalDebtLimit) revert IncurDebtV1_AboveGlobalDebtLimit(_limit);

        borrowers[_borrower].limit = uint128(_limit);
    }

    /**
     * @notice revoke user right to borrow
     * - onlyOwner (or governance)
     * - user must be borrower
     * - borrower must not have outstanding debt
     * @param _borrower the address that will interact with contract
     */
    function revokeBorrower(address _borrower) external onlyGovernor isBorrower(_borrower) {
        if (borrowers[_borrower].debt != 0) revert IncurDebtV1_BorrowerStillHasOutstandingDebet(_borrower);
        borrowers[_borrower].isAllowed = false;
    }

    /**
     * @notice deposits gOHM/sOHM to use as collateral
     * - msg.sender must be a borrower
     * - this contract must have been approved _amount
     * @dev will unwrap and hold as sOHM in this contract
     * @param _amount amount of gOHM/sOHM
     * @param _token token(gOHM/sOHM) to deposit with
     */
    function deposit(uint256 _amount, address _token) external isBorrower(msg.sender) {
        if (_token != gOHM && _token != sOHM) revert IncurDebtV1_WrongTokenAddress(_token);

        Borrower storage borrower = borrowers[msg.sender];
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        if (_token == gOHM) {
            uint256 sbalance = IStaking(staking).unwrap(address(this), _amount);

            borrower.collateralInSOHM += uint128(sbalance);
            borrower.collateralInGOHM += uint128(_amount);
        } else if (_token == sOHM) {
            uint256 gbalance = IgOHM(gOHM).balanceTo(_amount);

            borrower.collateralInSOHM += uint128(_amount);
            borrower.collateralInGOHM += uint128(gbalance);
        }
    }

    /**
     * @notice allow borrowers to borrow OHM
     * - msg.sender must be a borrower
     * - _ohmAmount must be less than or equal to borrowers debt limit
     * - _ohmAmount must be less than or equal to borrowers available loan limit
     * @param _ohmAmount amount of OHM to borrow
     */
    function borrow(uint256 _ohmAmount) external isBorrower(msg.sender) {
        if (_ohmAmount > borrowers[msg.sender].limit - borrowers[msg.sender].debt)
            revert IncurDebtV1_AmountMoreThanBorrowersLimit(_ohmAmount);

        if (_ohmAmount > getAvailableToBorrow()) revert IncurDebtV1_OHMAmountMoreThanAvailableLoan(_ohmAmount);

        borrowers[msg.sender].debt += uint128(_ohmAmount);
        totalOutstandingDebt += _ohmAmount;

        ITreasury(treasury).incurDebt(_ohmAmount, OHM);
        IERC20(OHM).safeTransfer(msg.sender, _ohmAmount);
    }

    /**
     * @notice withdraws gOHM/sOHM  to _to address
     * - msg.sender must be a borrower
     * - _amount (in OHM) must be less than or equal to depositedOhm - debt
     * @param _amount amount of gOHM/sOHM to withdraw
     * @param _to address to send _amount
     * @param _token token to send _amount
     */
    function withdraw(
        uint256 _amount,
        address _to,
        address _token
    ) external isBorrower(msg.sender) {
        if (_amount == 0) revert IncurDebtV1_InvaildNumber(_amount);
        Borrower storage borrower = borrowers[msg.sender];

        updateCollateralInSOHM(msg.sender);

        if (_token == gOHM) {
            uint256 _sAmount = IgOHM(gOHM).balanceFrom(_amount);

            if (_sAmount > getAvailableToBorrow()) revert IncurDebtV1_AmountAboveBorrowerBalance(_sAmount);

            borrower.collateralInSOHM -= uint128(_sAmount);
            borrower.collateralInGOHM -= uint128(_amount);

            IERC20(sOHM).approve(staking, _sAmount);
            IStaking(staking).wrap(_to, _sAmount);
        } else if (_token == sOHM) {
            if (_amount > getAvailableToBorrow()) revert IncurDebtV1_AmountAboveBorrowerBalance(_amount);

            borrower.collateralInSOHM -= uint128(_amount);
            borrower.collateralInGOHM -= uint128(IgOHM(gOHM).balanceTo(_amount));

            IERC20(sOHM).safeTransfer(_to, _amount);
        }
    }

    /**
     * @notice repay debt with collateral
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     */
    function repayDebtWithCollateral() external {
        Borrower storage borrower = borrowers[msg.sender];
        uint256 depositedCollateralAfterRepay = _repay(msg.sender);

        borrower.debt = 0;
        borrower.collateralInSOHM = uint128(depositedCollateralAfterRepay);
        borrower.collateralInGOHM = uint128(IgOHM(gOHM).balanceTo(depositedCollateralAfterRepay));
    }

    /**
     * @notice repay debt with collateral and withdraw the accrued earnings to sOHM/gOHM
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     * @param _tokenToReceiveExcess amount of OHM to borrow
     */
    function repayDebtWithCollateralAndWithdrawTheRest(address _tokenToReceiveExcess) external {
        uint256 depositedCollateralAfterRepay = _repay(msg.sender);
        assignBorrowerInfoToZero(msg.sender);

        if (depositedCollateralAfterRepay > 0) {
            if (_tokenToReceiveExcess == sOHM) {
                IERC20(sOHM).safeTransfer(msg.sender, depositedCollateralAfterRepay);
            } else if (_tokenToReceiveExcess == gOHM) {
                IERC20(sOHM).approve(staking, depositedCollateralAfterRepay);
                IStaking(staking).wrap(msg.sender, depositedCollateralAfterRepay);
            }
        }
    }

    /**
     * @notice deposits OHM to pay debt
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     * - borrower must have outstanding debt
     * @param _ohmAmount amount of OHM to borrow
     */
    function repayDebtWithOHM(uint256 _ohmAmount) external isBorrower(msg.sender) {
        if (borrowers[msg.sender].debt == 0) revert IncurDebtV1_BorrowerHasNoOutstandingDebet(msg.sender);
        IERC20(OHM).safeTransferFrom(msg.sender, address(this), _ohmAmount);

        totalOutstandingDebt -= _ohmAmount;
        borrowers[msg.sender].debt = uint128(borrowers[msg.sender].debt - _ohmAmount);

        IERC20(OHM).approve(treasury, _ohmAmount);
        ITreasury(treasury).repayDebtWithOHM(_ohmAmount);
    }

    /**
     * @notice repays debt using collateral and returns remaining tokens to borrower
     * - onlyOwner (or governance)
     * - sends remaining tokens to owner in sOHM
     * @param _borrower the address that will interact with contract
     * @param _to where to send remaining sOHM
     */
    function forceRepay(address _borrower, address _to) external onlyGovernor {
        uint256 collateralAfterDebtPayment = _repay(_borrower);

        assignBorrowerInfoToZero(_borrower);
        if (collateralAfterDebtPayment > 0) IERC20(sOHM).safeTransfer(_to, collateralAfterDebtPayment);
    }

    /**
     * @notice seize and burn _borrowers collateral and forgive debt
     * - will burn all collateral, including excess of debt
     * - onlyGovernance
     * @param _borrower the account to seize
     */
    function seize(address _borrower) external onlyGovernor isBorrower(_borrower) {
        _repayDebtWithCollateralByGovernor(_borrower);
        uint256 seizedCollateral = borrowers[_borrower].collateralInSOHM;

        assignBorrowerInfoToZero(_borrower);
        IERC20(sOHM).approve(staking, seizedCollateral);

        IStaking(staking).unstake(address(this), seizedCollateral, false, true);
        IOHM(OHM).burn(seizedCollateral);
    }

    /**
     * @notice updates borrowers sOHM collateral to current index
     * @param _borrower borrowers address
     */
    function updateCollateralInSOHM(address _borrower) public {
        uint256 sBalance = IgOHM(gOHM).balanceFrom(borrowers[_borrower].collateralInGOHM);
        borrowers[_borrower].collateralInSOHM = uint128(sBalance);
    }

    /**
     * @notice gets available OHM to borrow for account
     * @return amount OHM available to borrow
     */
    function getAvailableToBorrow() public view returns (uint256) {
        uint256 sBalance = IgOHM(gOHM).balanceFrom(borrowers[msg.sender].collateralInGOHM);
        return sBalance - borrowers[msg.sender].debt;
    }

    function _repay(address _borrower) internal isBorrower(_borrower) returns (uint256) {
        Borrower storage borrower = borrowers[_borrower];
        if (borrower.debt == 0) revert IncurDebtV1_BorrowerHasNoOutstandingDebet(_borrower);

        updateCollateralInSOHM(_borrower);
        IERC20(sOHM).approve(staking, borrower.debt);

        IStaking(staking).unstake(address(this), borrower.debt, false, true);
        IERC20(OHM).approve(treasury, borrower.debt);

        ITreasury(treasury).repayDebtWithOHM(borrower.debt);
        totalOutstandingDebt -= borrower.debt;

        return borrower.collateralInSOHM - borrower.debt;
    }

    function _repayDebtWithCollateralByGovernor(address _borrower) private {
        Borrower storage borrower = borrowers[_borrower];
        uint256 depositedCollateralAfterRepay = _repay(_borrower);

        borrower.debt = 0;
        borrower.collateralInSOHM = uint128(depositedCollateralAfterRepay);
        borrower.collateralInGOHM = uint128(IgOHM(gOHM).balanceTo(depositedCollateralAfterRepay));
    }

    function assignBorrowerInfoToZero(address _borrower) internal {
        Borrower storage borrower = borrowers[_borrower];
        borrower.debt = 0;

        borrower.collateralInSOHM = 0;
        borrower.collateralInGOHM = 0;
    }
}
