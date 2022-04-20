// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/IERC20.sol";
import "../libraries/SafeERC20.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStrategy.sol";
import "../interfaces/IIncurDebt.sol";
import "../types/OlympusAccessControlledV2.sol";

error IncurDebt_BothParamsCannotBeTrue();
error IncurDebt_NotBorrower(address _borrower);
error IncurDebt_InvaildNumber(uint256 _amount);
error IncurDebt_WrongTokenAddress(address _token);
error IncurDebt_AlreadyBorrower(address _borrower);
error IncurDebt_AboveGlobalDebtLimit(uint256 _limit);
error IncurDebt_AboveBorrowersDebtLimit(uint256 _limit);
error IncurDebt_StrategyUnauthorized(address _strategy);
error IncurDebt_LimitBelowOutstandingDebt(uint256 _limit);
error IncurDebt_AmountAboveBorrowerBalance(uint256 _amount);
error IncurDebt_OHMAmountMoreThanAvailableLoan(uint256 _amount);
error IncurDebt_BorrowerHasNoOutstandingDebt(address _borrower);
error IncurDebt_BorrowerStillHasOutstandingDebt(address _borrower);

contract IncurDebt is OlympusAccessControlledV2, IIncurDebt {
    using SafeERC20 for IERC20;

    event GlobalLimitChanged(uint256 _limit);
    event BorrowerAllowed(address indexed _borrower, bool _lpBorrower, bool _nonLpBorrower);
    event BorrowerRevoked(address indexed _borrower, bool _lpBorrower, bool _nonLpBorrower);
    event BorrowerDebtLimitSet(address indexed _borrower, uint256 _limit);

    event BorrowerDeposit(address indexed _borrower, uint256 _amountToDeposit);
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
    event LpInteraction(
        uint256 _ohmBorrowed,
        uint256 _liquidityCreated,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        address indexed _borrower
    );

    event LpWithdrawn(uint256 _liquidity, address _lpToken, address indexed _borrower);

    event Withdrawal(address indexed _borrower, uint256 _amountToWithdraw, uint256 _currentCollateral);

    uint256 public globalDebtLimit;
    uint256 public totalOutstandingGlobalDebt;

    address public immutable OHM;
    address public immutable gOHM;
    address public immutable sOHM;
    address public immutable staking;
    address public immutable treasury;

    struct Borrower {
        uint128 debt;
        uint128 limit;
        uint128 collateralInGOHM; // Total amount of collateral priced in gOHM. This includes gOHM and sOHM entitled to the user.
        uint128 unwrappedGOHM; // Amount of gOHM that is converted to sOHM to be used for incurdebt. To be converted back before withdrawal.
        bool isNonLpBorrower;
        bool isLpBorrower;
    }

    mapping(address => Borrower) public borrowers;
    mapping(address => bool) public strategies;
    mapping(address => mapping(address => uint256)) public lpTokenOwnership; // lp token -> user -> amount

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
        IERC20(OHM).safeApprove(treasury, type(uint256).max);
        IERC20(gOHM).safeApprove(staking, type(uint256).max);
        IERC20(sOHM).safeApprove(staking, type(uint256).max);
    }

    modifier isBorrower(address _borrower) {
        if (!borrowers[_borrower].isNonLpBorrower && !borrowers[_borrower].isLpBorrower)
            revert IncurDebt_NotBorrower(_borrower);
        _;
    }

    modifier isStrategyApproved(address _strategy) {
        if (!strategies[_strategy]) revert IncurDebt_StrategyUnauthorized(_strategy);
        _;
    }

    /************************
     * Governor Functions
     ************************/

    /// @notice sets the maximum debt limit for the system
    /// - onlyOwner (or governance)
    /// - must be greater than or equal to existing debt
    /// @param _limit in OHM
    function setGlobalDebtLimit(uint256 _limit) external override onlyGovernor {
        if (_limit < totalOutstandingGlobalDebt) revert IncurDebt_LimitBelowOutstandingDebt(_limit);
        globalDebtLimit = _limit;
        emit GlobalLimitChanged(_limit);
    }

    function whitelistStrategy(address _strategyAddress) external onlyGovernor {
        strategies[_strategyAddress] = true;
        IERC20(OHM).approve(_strategyAddress, type(uint256).max);
    }

    /// @notice lets a user become a borrower
    /// - onlyOwner (or governance)
    /// - user must not be borrower
    /// @param _borrower the address that will interact with contract
    /// @param _lpBorrower indicate if the address to approve is an lp borrower
    /// @param _nonLpBorrower indicate if the address to approve is an lp borrower
    function allowBorrower(
        address _borrower,
        bool _lpBorrower,
        bool _nonLpBorrower
    ) external override onlyGovernor {
        if (_lpBorrower == true && _nonLpBorrower == true) revert IncurDebt_BothParamsCannotBeTrue();
        if (borrowers[_borrower].isNonLpBorrower || borrowers[_borrower].isLpBorrower)
            revert IncurDebt_AlreadyBorrower(_borrower);

        if (_nonLpBorrower == true) borrowers[_borrower].isNonLpBorrower = true;
        else if (_lpBorrower == true) borrowers[_borrower].isLpBorrower = true;

        emit BorrowerAllowed(_borrower, _lpBorrower, _nonLpBorrower);
    }

    /// @notice sets the maximum debt limit for a borrower
    /// - onlyOwner (or governance)
    /// - limit must be greater than or equal to borrower's outstanding debt
    /// - limit must be less than or equal to the global debt limit
    /// @param _borrower the address that will interact with contract
    /// @param _limit borrower's debt limit in OHM
    function setBorrowerDebtLimit(address _borrower, uint256 _limit)
        external
        override
        onlyGovernor
        isBorrower(_borrower)
    {
        if (_limit < borrowers[_borrower].debt) revert IncurDebt_AboveBorrowersDebtLimit(_limit);
        if (_limit > globalDebtLimit) revert IncurDebt_AboveGlobalDebtLimit(_limit);

        borrowers[_borrower].limit = uint128(_limit);
        emit BorrowerDebtLimitSet(_borrower, _limit);
    }

    /// @notice revoke user right to borrow
    /// - onlyOwner (or governance)
    /// - user must be borrower
    /// - borrower must not have outstanding debt
    /// @param _borrower the address that will interact with contract
    /// @param _lpBorrower indicate if the address to approve is an lp borrower
    /// @param _nonLpBorrower indicate if the address to approve is an lp borrower
    function revokeBorrower(
        address _borrower,
        bool _lpBorrower,
        bool _nonLpBorrower
    ) external override onlyGovernor isBorrower(_borrower) {
        if (_lpBorrower == true && _nonLpBorrower == true) revert IncurDebt_BothParamsCannotBeTrue();
        if (borrowers[_borrower].debt != 0) revert IncurDebt_BorrowerStillHasOutstandingDebt(_borrower);

        if (_nonLpBorrower == true) borrowers[_borrower].isNonLpBorrower = false;
        else if (_lpBorrower == true) borrowers[_borrower].isLpBorrower = false;

        emit BorrowerRevoked(_borrower, _lpBorrower, _nonLpBorrower);
    }

    /// @notice Governor repays borrower debt using collateral and sends remaining tokens to borrower
    /// - onlyOwner (or governance)
    /// - sends remaining tokens to owner in sOHM
    /// @param _borrower the address that will interact with contract
    function forceRepay(address _borrower) external override onlyGovernor {
        (uint256 collateralRemaining, uint256 paidDebt) = _repay(_borrower);
        borrowers[_borrower].collateralInGOHM = 0;

        IERC20(gOHM).transfer(_borrower, collateralRemaining);

        emit ForceDebtPayWithCollateralAndWithdrawTheRest(
            _borrower,
            paidDebt,
            borrowers[msg.sender].collateralInGOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            collateralRemaining
        );
    }

    /// @notice Governor seize and burn _borrowers collateral and forgive debt
    /// - will burn all collateral, including excess of debt
    /// - onlyGovernance
    /// @param _borrower the account to seize collateral
    function seize(address _borrower) external override onlyGovernor isBorrower(_borrower) {
        (uint256 seizedCollateral, uint256 paidDebt) = _repay(_borrower);
        borrowers[_borrower].collateralInGOHM = 0;

        uint256 amountToBurn = IStaking(staking).unstake(address(this), seizedCollateral, false, false); // unstakes gOHM to OHM and burn
        IOHM(OHM).burn(amountToBurn);

        emit DebtPaidWithCollateralAndBurnTheRest(
            _borrower,
            paidDebt,
            borrowers[msg.sender].collateralInGOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            seizedCollateral
        );
    }

    /************************
     * Borrower Functions
     ************************/

    /// @notice deposits gOHM to use as collateral
    /// - msg.sender must be a borrower
    /// - this contract must have been approved _amount
    /// @param _amount amount of gOHM
    function deposit(uint256 _amount) external override isBorrower(msg.sender) {
        borrowers[msg.sender].collateralInGOHM += uint128(_amount);

        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), _amount);

        emit BorrowerDeposit(msg.sender, _amount);
    }

    /// @notice allow borrowers to borrow OHM
    /// - msg.sender must be a borrower
    /// - _ohmAmount must be less than or equal to borrowers debt limit
    /// - _ohmAmount must be less than or equal to borrowers available loan limit
    /// @param _ohmAmount amount of OHM to borrow
    function borrow(uint256 _ohmAmount) external override {
        Borrower storage borrower = borrowers[msg.sender];
        if (!borrower.isNonLpBorrower) revert IncurDebt_NotBorrower(msg.sender);

        _borrow(_ohmAmount);
        IERC20(OHM).safeTransfer(msg.sender, _ohmAmount);

        emit Borrowed(msg.sender, _ohmAmount, borrower.debt, totalOutstandingGlobalDebt);
    }

    ///@notice creates an LP position by borrowing OHM
    ///- msg.sender must be whitelisted
    ///- the strategy must be whitelisted
    ///- the strategy contract must have been approved _pairAmount of _pairToken
    ///- _ohmAmount must be less than or equal to available debt
    ///@param _ohmAmount the desired amount of OHM to borrow
    ///@param _strategy the address of the AMM strategy to use
    ///@param _strategyParams strategy-specific params
    ///@return number of LP tokens created
    function createLP(
        uint256 _ohmAmount,
        address _strategy,
        bytes calldata _strategyParams
    ) external isStrategyApproved(_strategy) returns (uint256) {
        Borrower storage borrower = borrowers[msg.sender];

        if (!borrower.isLpBorrower) revert IncurDebt_NotBorrower(msg.sender);

        _borrow(_ohmAmount);

        (uint256 liquidity, uint256 ohmUnused, address lpTokenAddress) = IStrategy(_strategy).addLiquidity(
            _strategyParams,
            _ohmAmount,
            msg.sender
        );

        // Mapping edit user owns x liquidity
        lpTokenOwnership[lpTokenAddress][msg.sender] += liquidity;

        borrower.debt -= uint128(ohmUnused);
        totalOutstandingGlobalDebt -= (ohmUnused);

        if (ohmUnused > 0) {
            ITreasury(treasury).repayDebtWithOHM(ohmUnused);
        }

        emit LpInteraction(_ohmAmount - ohmUnused, liquidity, borrower.debt, totalOutstandingGlobalDebt, msg.sender);
        return liquidity;
    }

    ///@notice unwinds an LP position and pays off OHM debt. Excess ohm is sent back to caller.
    ///@param _liquidity the amount of LP tokens to remove.
    ///@param _strategy the address of the AMM strategy to use
    ///@param _lpToken address of lp token to remove liquidity from
    ///@param _strategyParams strategy-specific params
    ///@return ohmRecieved of _pair token send to _to and OHM to pay
    function removeLP(
        uint256 _liquidity,
        address _strategy,
        address _lpToken,
        bytes calldata _strategyParams
    ) external isStrategyApproved(_strategy) returns (uint256 ohmRecieved) {
        Borrower storage borrower = borrowers[msg.sender];
        if (!borrower.isLpBorrower) revert IncurDebt_NotBorrower(msg.sender);

        if (borrower.debt == 0) revert IncurDebt_BorrowerHasNoOutstandingDebt(msg.sender);

        if (_liquidity > lpTokenOwnership[_lpToken][msg.sender])
            revert IncurDebt_AmountAboveBorrowerBalance(_liquidity);

        lpTokenOwnership[_lpToken][msg.sender] -= _liquidity;

        IERC20(_lpToken).safeTransfer(_strategy, _liquidity);

        ohmRecieved = IStrategy(_strategy).removeLiquidity(_strategyParams, _liquidity, _lpToken, msg.sender);

        uint256 ohmToRepay;

        if (borrower.debt < ohmRecieved) {
            ohmToRepay = borrower.debt;
            totalOutstandingGlobalDebt -= borrower.debt;

            borrower.debt = 0;
            IERC20(OHM).safeTransfer(msg.sender, ohmRecieved - ohmToRepay);
        } else {
            ohmToRepay = ohmRecieved;
            totalOutstandingGlobalDebt -= ohmRecieved;
            borrower.debt = uint128(borrower.debt - ohmRecieved);
        }

        ITreasury(treasury).repayDebtWithOHM(ohmToRepay);

        emit LpInteraction(ohmToRepay, _liquidity, borrower.debt, totalOutstandingGlobalDebt, msg.sender);
    }

    function withdrawLP(uint256 _liquidity, address _lpToken) external {
        if (!borrowers[msg.sender].isLpBorrower) revert IncurDebt_NotBorrower(msg.sender);

        if (_liquidity > lpTokenOwnership[_lpToken][msg.sender])
            revert IncurDebt_AmountAboveBorrowerBalance(_liquidity);

        // borrower can decide to call repayDebtWithOHM() and clear debt
        if (borrowers[msg.sender].debt != 0) repayDebtWithCollateral();

        lpTokenOwnership[_lpToken][msg.sender] -= _liquidity;

        IERC20(_lpToken).safeTransfer(msg.sender, _liquidity);
        emit LpWithdrawn(_liquidity, _lpToken, msg.sender);
    }

    /// @notice withdraws gOHM
    /// - msg.sender must be a borrower
    /// - _amount (in OHM) must be less than or equal to depositedOhm - debt
    /// @param _amount amount of gOHM to withdraw
    function withdraw(uint256 _amount) external override isBorrower(msg.sender) {
        if (_amount == 0) revert IncurDebt_InvaildNumber(_amount);
        Borrower storage borrower = borrowers[msg.sender];

        if (IgOHM(gOHM).balanceFrom(_amount) > getAvailableToBorrow())
            revert IncurDebt_AmountAboveBorrowerBalance(_amount);

        if (_amount > borrower.collateralInGOHM - borrower.unwrappedGOHM) {
            // Does uint256 > uint128 cause problem?
            uint256 amountGOHMToWrap = borrower.unwrappedGOHM + _amount - borrower.collateralInGOHM;
            borrower.unwrappedGOHM -= uint128(amountGOHMToWrap);
            uint256 amountOHMNeededToWrap = IgOHM(gOHM).balanceFrom(amountGOHMToWrap);
            IStaking(staking).wrap(address(this), amountOHMNeededToWrap);
        }

        borrower.collateralInGOHM -= uint128(_amount);
        IERC20(gOHM).transfer(msg.sender, _amount);

        emit Withdrawal(msg.sender, _amount, borrower.collateralInGOHM);
    }

    /// @notice repay debt with collateral
    /// - msg.sender must be a borrower
    /// - borrower must have outstanding debt
    function repayDebtWithCollateral() public override {
        Borrower storage borrower = borrowers[msg.sender];
        (uint256 currentCollateral, uint256 paidDebt) = _repay(msg.sender);

        borrower.collateralInGOHM = uint128(currentCollateral);

        emit DebtPaidWithCollateral(msg.sender, paidDebt, currentCollateral, borrower.debt, totalOutstandingGlobalDebt);
    }

    /// @notice repay debt with collateral and withdraw the accrued earnings in sOHM
    /// - msg.sender must be a borrower
    /// - borrower must have outstanding debt
    function repayDebtWithCollateralAndWithdrawTheRest() external override {
        (uint256 collateralRemaining, uint256 paidDebt) = _repay(msg.sender);
        borrowers[msg.sender].collateralInGOHM = 0;

        IERC20(gOHM).transfer(msg.sender, collateralRemaining);

        emit DebtPaidWithCollateralAndWithdrawTheRest( //Change event
            msg.sender,
            paidDebt,
            borrowers[msg.sender].collateralInGOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            collateralRemaining
        );
    }

    /// @notice deposits OHM to pay debt
    /// - msg.sender must be a borrower
    /// - msg.sender's OHM allowance must be >= _ohmAmount
    /// - borrower must have outstanding debt
    /// @param _ohmAmount amount of OHM to borrow
    function repayDebtWithOHM(uint256 _ohmAmount) external override isBorrower(msg.sender) {
        Borrower storage borrower = borrowers[msg.sender];

        if (borrower.debt == 0) revert IncurDebt_BorrowerHasNoOutstandingDebt(msg.sender);

        totalOutstandingGlobalDebt -= _ohmAmount;
        borrower.debt -= uint128(_ohmAmount);

        IERC20(OHM).safeTransferFrom(msg.sender, address(this), _ohmAmount);
        ITreasury(treasury).repayDebtWithOHM(_ohmAmount);

        emit DebtPaidWithOHM(msg.sender, _ohmAmount, borrower.debt, totalOutstandingGlobalDebt);
    }

    /// @notice gets available OHM to borrow for account
    /// @return amount OHM available to borrow
    function getAvailableToBorrow() public view returns (uint256) {
        uint256 ohmBalance = IgOHM(gOHM).balanceFrom(borrowers[msg.sender].collateralInGOHM);
        return ohmBalance - borrowers[msg.sender].debt;
    }

    function _borrow(uint256 _ohmAmount) internal {
        Borrower storage borrower = borrowers[msg.sender];

        if (_ohmAmount > borrower.limit - borrower.debt) revert IncurDebt_AboveBorrowersDebtLimit(_ohmAmount);
        if (_ohmAmount > getAvailableToBorrow()) revert IncurDebt_OHMAmountMoreThanAvailableLoan(_ohmAmount);

        borrower.debt += uint128(_ohmAmount);
        totalOutstandingGlobalDebt += _ohmAmount;

        uint256 totalDebtInGOHM = IgOHM(gOHM).balanceTo(borrower.debt);

        if (totalDebtInGOHM > borrower.unwrappedGOHM) {
            //is there issue comparing uint256 to uint128
            uint128 amountToUnwrap = borrower.collateralInGOHM - borrower.unwrappedGOHM;
            borrower.unwrappedGOHM += amountToUnwrap;
            IStaking(staking).unwrap(address(this), amountToUnwrap); // Due to rounding error should have tiny less sOhm in wallet than amount they borrowed. Keep small sOhm amount in wallet to make sure no errors.
        }

        ITreasury(treasury).incurDebt(_ohmAmount, OHM);
    }

    /// @notice pays borrower debit and return left collateral and paid debt
    /// @param _borrower the account debit needs to be paid
    /// @return collateralRemaining left collateral after paying debit
    /// @return paidDebt debt paid
    function _repay(address _borrower)
        internal
        isBorrower(_borrower)
        returns (uint256 collateralRemaining, uint256 paidDebt)
    {
        Borrower storage borrower = borrowers[_borrower];
        if (borrower.debt == 0) revert IncurDebt_BorrowerHasNoOutstandingDebt(_borrower);

        uint256 debt = borrower.debt;
        totalOutstandingGlobalDebt -= debt;
        borrower.debt = 0;
        uint256 sOHMToWrap = IgOHM(gOHM).balanceFrom(borrower.unwrappedGOHM) - debt;
        borrower.unwrappedGOHM = 0;

        IStaking(staking).unstake(address(this), debt, false, true); // unstakes sOHM portion of collateral
        ITreasury(treasury).repayDebtWithOHM(debt);

        IStaking(staking).wrap(address(this), sOHMToWrap); // wrap up remaining sOHM into gOHM

        collateralRemaining = borrower.collateralInGOHM - IgOHM(gOHM).balanceTo(debt);
        paidDebt = debt;
    }
}
