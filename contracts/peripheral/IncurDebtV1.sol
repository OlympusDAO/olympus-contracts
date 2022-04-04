// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IOHM.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";
import "./interfaces/ITreasury.sol";
import "../libraries/SafeERC20.sol";
import "../interfaces/IIncurDebtV1.sol";
import "../types/OlympusAccessControlledV2.sol";

error IncurDebtV1_NotBorrower(address _borrower);
error IncurDebtV1_InvaildNumber(uint256 _amount);
error IncurDebtV1_AlreadyBorrower(address _borrower);
error IncurDebtV1_AboveGlobalDebtLimit(uint256 _limit);
error IncurDebtV1_AboveBorrowersDebtLimit(uint256 _limit);
error IncurDebtV1_LimitBelowOutstandingDebt(uint256 _limit);
error IncurDebtV1_AmountAboveBorrowerBalance(uint256 _amount);
error IncurDebtV1_OHMAmountMoreThanAvailableLoan(uint256 _amount);
error IncurDebtV1_BorrowerHasNoOutstandingDebt(address _borrower);
error IncurDebtV1_BorrowerStillHasOutstandingDebt(address _borrower);

contract IncurDebtV1 is OlympusAccessControlledV2, IIncurDebtV1 {
    using SafeERC20 for IERC20;

    event GlobalLimitChanged(uint256 _limit);
    event BorrowerAllowed(address indexed _borrower);
    event BorrowerRevoked(address indexed _borrower);
    event BorrowerDebtLimitSet(address indexed _borrower, uint256 _limit);

    event BorrowerDeposit(
        address indexed _borrower,
        address indexed _tokenToDepositFundsWith,
        uint256 _amountToDeposit
    );
    event Borrowed(
        address indexed _borrower,
        uint256 _amountToBorrow,
        uint256 _borrowersDebt,
        uint256 _totalOutstandingGlobalDebt
    );

    event DebtPaidWithOHM(
        address indexed _borrower,
        uint256 _paidDebt,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt
    );

    event DebtPaidWithCollateral(
        address indexed _borrower,
        uint256 _paidDebt,
        uint256 _currentCollateral,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt
    );
    event DebtPaidWithCollateralAndBurnTheRest(
        address indexed _borrower,
        uint256 _paidDebt,
        uint256 _currentCollateral,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        uint256 _collateralLeftToBurn
    );
    event DebtPaidWithCollateralAndWithdrawTheRest(
        address indexed _borrower,
        uint256 _paidDebt,
        uint256 _currentCollateral,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        uint256 _collateralLeftForWithdraw
    );
    event ForceDebtPayWithCollateralAndWithdrawTheRest(
        address indexed _borrower,
        uint256 _paidDebt,
        uint256 _currentCollateral,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        uint256 _collateralLeftForWithdraw
    );

    event Withdrawal(
        address indexed _borrower,
        address _tokenToWithdrawFundsWith,
        address indexed _receiver,
        uint256 _amountToWithdraw,
        uint256 _currentCollateral
    );

    uint256 public globalDebtLimit;
    uint256 public totalOutstandingGlobalDebt;
    uint256 private TOTAL_GONS = type(uint256).max - ((type(uint256).max % 5_000_000) * 10**9);

    address public immutable OHM;
    address public immutable gOHM;
    address public immutable sOHM;
    address public immutable staking;
    address public immutable treasury;

    struct Borrower {
        uint128 debt;
        uint128 limit;
        uint128 collateralInSOHM;
        uint256 borrowerGonBalance;
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
    function setGlobalDebtLimit(uint256 _limit) external override onlyGovernor {
        if (_limit < totalOutstandingGlobalDebt) revert IncurDebtV1_LimitBelowOutstandingDebt(_limit);
        globalDebtLimit = _limit;
        emit GlobalLimitChanged(_limit);
    }

    /**
     * @notice lets a user become a borrower
     * - onlyOwner (or governance)
     * - user must not be borrower
     * @param _borrower the address that will interact with contract
     */
    function allowBorrower(address _borrower) external override onlyGovernor {
        if (borrowers[_borrower].isAllowed) revert IncurDebtV1_AlreadyBorrower(_borrower);
        borrowers[_borrower].isAllowed = true;
        emit BorrowerAllowed(_borrower);
    }

    /**
     * @notice sets the maximum debt limit for a borrower
     * - onlyOwner (or governance)
     * - limit must be greater than or equal to borrower's outstanding debt
     * - limit must be less than or equal to the global debt limit
     * @param _borrower the address that will interact with contract
     * @param _limit borrower's debt limit in OHM
     */
    function setBorrowerDebtLimit(address _borrower, uint256 _limit)
        external
        override
        onlyGovernor
        isBorrower(_borrower)
    {
        if (_limit < borrowers[_borrower].debt) revert IncurDebtV1_AboveBorrowersDebtLimit(_limit);
        if (_limit > globalDebtLimit) revert IncurDebtV1_AboveGlobalDebtLimit(_limit);

        borrowers[_borrower].limit = uint128(_limit);
        emit BorrowerDebtLimitSet(_borrower, _limit);
    }

    /**
     * @notice revoke user right to borrow
     * - onlyOwner (or governance)
     * - user must be borrower
     * - borrower must not have outstanding debt
     * @param _borrower the address that will interact with contract
     */
    function revokeBorrower(address _borrower) external override onlyGovernor isBorrower(_borrower) {
        if (borrowers[_borrower].debt != 0) revert IncurDebtV1_BorrowerStillHasOutstandingDebt(_borrower);
        borrowers[_borrower].isAllowed = false;
        emit BorrowerRevoked(_borrower);
    }

    /**
     * @notice deposits sOHM to use as collateral
     * - msg.sender must be a borrower
     * - this contract must have been approved _amount
     * @param _amount amount of sOHM
     */
    function deposit(uint256 _amount) external override isBorrower(msg.sender) {
        Borrower storage borrower = borrowers[msg.sender];
        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), _amount);

        borrower.collateralInSOHM += uint128(_amount);
        borrower.borrowerGonBalance += IsOHM(sOHM).gonsForBalance(_amount);

        emit BorrowerDeposit(msg.sender, sOHM, _amount);
    }

    /**
     * @notice allow borrowers to borrow OHM
     * - msg.sender must be a borrower
     * - _ohmAmount must be less than or equal to borrowers debt limit
     * - _ohmAmount must be less than or equal to borrowers available loan limit
     * @param _ohmAmount amount of OHM to borrow
     */
    function borrow(uint256 _ohmAmount) external override isBorrower(msg.sender) {
        Borrower storage borrower = borrowers[msg.sender];

        if (_ohmAmount > borrower.limit - borrower.debt) revert IncurDebtV1_AboveBorrowersDebtLimit(_ohmAmount);

        if (_ohmAmount > getAvailableToBorrow()) revert IncurDebtV1_OHMAmountMoreThanAvailableLoan(_ohmAmount);

        borrower.debt += uint128(_ohmAmount);
        totalOutstandingGlobalDebt += _ohmAmount;

        ITreasury(treasury).incurDebt(_ohmAmount, OHM);
        IERC20(OHM).safeTransfer(msg.sender, _ohmAmount);

        emit Borrowed(msg.sender, _ohmAmount, borrower.debt, totalOutstandingGlobalDebt);
    }

    /**
     * @notice withdraws sOHM  to _to address
     * - msg.sender must be a borrower
     * - _amount (in OHM) must be less than or equal to depositedOhm - debt
     * @param _amount amount of gOHM to withdraw
     * @param _to address to send _amount
     */
    function withdraw(uint256 _amount, address _to) external override isBorrower(msg.sender) {
        if (_amount == 0) revert IncurDebtV1_InvaildNumber(_amount);
        Borrower storage borrower = borrowers[msg.sender];

        updateCollateralInSOHM();
        if (_amount > getAvailableToBorrow()) revert IncurDebtV1_AmountAboveBorrowerBalance(_amount);

        borrower.collateralInSOHM -= uint128(_amount);
        borrower.borrowerGonBalance -= IsOHM(sOHM).gonsForBalance(_amount);
        IERC20(sOHM).transfer(msg.sender, _amount);

        emit Withdrawal(msg.sender, sOHM, _to, _amount, borrower.collateralInSOHM);
    }

    /**
     * @notice repay debt with collateral
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     */
    function repayDebtWithCollateral() external override {
        Borrower storage borrower = borrowers[msg.sender];
        (uint256 currentCollateral, uint256 paidDebt) = _repay(msg.sender);

        borrower.debt = 0;
        borrower.collateralInSOHM = uint128(currentCollateral);

        emit DebtPaidWithCollateral(msg.sender, paidDebt, currentCollateral, borrower.debt, totalOutstandingGlobalDebt);
    }

    /**
     * @notice repay debt with collateral and withdraw the accrued earnings to gOHM
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     */
    function repayDebtWithCollateralAndWithdrawTheRest() external override {
        (uint256 currentCollateral, uint256 paidDebt) = _repay(msg.sender);
        clearBorrower(msg.sender);

        if (currentCollateral > 0) IERC20(sOHM).transfer(msg.sender, currentCollateral);

        emit DebtPaidWithCollateralAndWithdrawTheRest(
            msg.sender,
            paidDebt,
            borrowers[msg.sender].collateralInSOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            currentCollateral
        );
    }

    /**
     * @notice deposits OHM to pay debt
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     * - borrower must have outstanding debt
     * @param _ohmAmount amount of OHM to borrow
     */
    function repayDebtWithOHM(uint256 _ohmAmount) external override isBorrower(msg.sender) {
        Borrower storage borrower = borrowers[msg.sender];

        if (borrower.debt == 0) revert IncurDebtV1_BorrowerHasNoOutstandingDebt(msg.sender);
        IERC20(OHM).safeTransferFrom(msg.sender, address(this), _ohmAmount);

        totalOutstandingGlobalDebt -= _ohmAmount;
        borrower.debt = uint128(borrower.debt - _ohmAmount);

        IERC20(OHM).approve(treasury, _ohmAmount);
        ITreasury(treasury).repayDebtWithOHM(_ohmAmount);

        emit DebtPaidWithOHM(msg.sender, _ohmAmount, borrower.debt, totalOutstandingGlobalDebt);
    }

    /**
     * @notice repays debt using collateral and returns remaining tokens to borrower
     * - onlyOwner (or governance)
     * - sends remaining tokens to owner in gOHM
     * @param _borrower the address that will interact with contract
     */
    function forceRepay(address _borrower) external override onlyGovernor {
        (uint256 currentCollateral, uint256 paidDebt) = _repay(_borrower);

        clearBorrower(_borrower);
        if (currentCollateral > 0) IERC20(sOHM).transfer(_borrower, currentCollateral);

        emit ForceDebtPayWithCollateralAndWithdrawTheRest(
            _borrower,
            paidDebt,
            borrowers[msg.sender].collateralInSOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            currentCollateral
        );
    }

    /**
     * @notice seize and burn _borrowers collateral and forgive debt
     * - will burn all collateral, including excess of debt
     * - onlyGovernance
     * @param _borrower the account to seize
     */
    function seize(address _borrower) external override onlyGovernor isBorrower(_borrower) {
        (uint256 seizedCollateral, uint256 paidDebt) = _repay(_borrower);

        clearBorrower(_borrower);

        IERC20(sOHM).approve(staking, seizedCollateral);
        IStaking(staking).unstake(address(this), seizedCollateral, false, true);
        IOHM(OHM).burn(seizedCollateral);

        emit DebtPaidWithCollateralAndBurnTheRest(
            _borrower,
            paidDebt,
            borrowers[msg.sender].collateralInSOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            seizedCollateral
        );
    }

    /**
     * @notice gets available OHM to borrow for account
     * @return amount OHM available to borrow
     */
    function getAvailableToBorrow() public view returns (uint256) {
        uint256 _gonsPerFragment = TOTAL_GONS / IsOHM(sOHM).totalSupply();
        uint256 sBalance = uint128(borrowers[msg.sender].borrowerGonBalance / _gonsPerFragment);
        return sBalance - borrowers[msg.sender].debt;
    }

    function _repay(address _borrower)
        internal
        isBorrower(_borrower)
        returns (uint256 currentCollateral, uint256 debt)
    {
        Borrower storage borrower = borrowers[_borrower];
        if (borrower.debt == 0) revert IncurDebtV1_BorrowerHasNoOutstandingDebt(_borrower);
        updateCollateralInSOHM();

        IERC20(sOHM).approve(staking, borrower.debt);
        IStaking(staking).unstake(address(this), borrower.debt, false, true);

        IERC20(OHM).approve(treasury, borrower.debt);
        ITreasury(treasury).repayDebtWithOHM(borrower.debt);

        totalOutstandingGlobalDebt -= borrower.debt;
        currentCollateral = borrower.collateralInSOHM - borrower.debt;

        debt = borrower.debt;
    }

    function clearBorrower(address _borrower) internal {
        Borrower storage borrower = borrowers[_borrower];
        borrower.debt = 0;
        borrower.collateralInSOHM = 0;
        borrower.borrowerGonBalance = 0;
    }

    function updateCollateralInSOHM() private {
        Borrower storage borrower = borrowers[msg.sender];
        uint256 _gonsPerFragment = TOTAL_GONS / IsOHM(sOHM).totalSupply();
        borrower.collateralInSOHM = uint128(borrower.borrowerGonBalance / _gonsPerFragment);
    }
}
