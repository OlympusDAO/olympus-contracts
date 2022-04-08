// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IOHM.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStrategy.sol";
import "../libraries/SafeERC20.sol";
import "../types/OlympusAccessControlledV2.sol";

error IncurDebtV2_NotBorrower(address _borrower);
error IncurDebtV2_StrategyUnauthorized(address _strategy);
error IncurDebtV2_InvaildNumber(uint256 _amount);
error IncurDebtV2_WrongTokenAddress(address _token);
error IncurDebtV2_AlreadyBorrower(address _borrower);
error IncurDebtV2_AboveGlobalDebtLimit(uint256 _limit);
error IncurDebtV2_AboveBorrowersDebtLimit(uint256 _limit);
error IncurDebtV2_LimitBelowOutstandingDebt(uint256 _limit);
error IncurDebtV2_AmountAboveBorrowerBalance(uint256 _amount);
error IncurDebtV2_AmountMoreThanBorrowersLimit(uint256 _borrower);
error IncurDebtV2_OHMAmountMoreThanAvailableLoan(uint256 _amount);
error IncurDebtV2_BorrowerHasNoOutstandingDebt(address _borrower);
error IncurDebtV2_BorrowerStillHasOutstandingDebt(address _borrower);

contract IncurDebtV2 is OlympusAccessControlledV2 {
    using SafeERC20 for IERC20;

    event GlobalLimit(uint256 indexed _limit);
    event BorrowerAllowed(address indexed _borrower);
    event BorrowerRevoked(address indexed _borrower);
    event BorrowerDebtLimitSet(address indexed _borrower, uint256 indexed _limit);
    event CollateralInSOHMIncreased(address indexed _borrower, uint256 indexed _currentCollateralInSOHM);
    event BorrowerDeposit(
        address indexed _borrower,
        uint256 indexed _amountToDeposit,
        address indexed _tokenToDepositFundsWith
    );
    event Borrowed(
        address indexed _borrower,
        uint256 _amountToBorrow,
        uint256 indexed _borrowersDebt,
        uint256 indexed _totalOutstandingGlobalDebt
    );
    event DebtPaidWithOHM(
        address indexed _borrower,
        uint256 _paidDebt,
        uint256 indexed _currentDebt,
        uint256 indexed _totalOutstandingGlobalDebt
    );
    event Withdrawal(
        address indexed _borrower,
        uint256 _amountToWithdraw,
        address _tokenToWithdrawFundsWith,
        address indexed _receiver,
        uint256 indexed _collateralInSOHMLeft
    );
    event DebtPaidWithCollateral(
        address indexed _borrower,
        uint256 indexed _paidDebt,
        uint256 _currentCollateralInSOHM,
        uint256 indexed _currentDebt,
        uint256 _totalOutstandingGlobalDebt
    );
    event DebtPaidWithCollateralAndBurnTheRest(
        address indexed _borrower,
        uint256 indexed _paidDebt,
        uint256 _currentCollateralInSOHM,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        uint256 indexed _collateralLeftToBurn
    );
    event DebtPaidWithCollateralAndWithdrawTheRest(
        address indexed _borrower,
        uint256 indexed _paidDebt,
        uint256 _currentCollateralInSOHM,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        uint256 indexed _collateralLeftForWithdraw
    );
    event ForceDebtPayWithCollateralAndWithdrawTheRest(
        address indexed _borrower,
        uint256 indexed _paidDebt,
        uint256 _currentCollateralInSOHM,
        uint256 _currentDebt,
        uint256 _totalOutstandingGlobalDebt,
        uint256 indexed _collateralLeftForWithdraw
    );

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
        uint128 collateralInSOHM;
        uint128 collateralInGOHM;
        bool isAllowed;
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
    }

    modifier isBorrower(address _borrower) {
        if (!borrowers[_borrower].isAllowed) revert IncurDebtV2_NotBorrower(_borrower);
        _;
    }

    modifier isStrategyApproved(address _strategy) {
        if (!strategies[_strategy]) revert IncurDebtV2_StrategyUnauthorized(_strategy);
        _;
    }

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - must be greater than or equal to existing debt
     * @param _limit in OHM
     */
    function setGlobalDebtLimit(uint256 _limit) external onlyGovernor {
        if (_limit < totalOutstandingGlobalDebt) revert IncurDebtV2_LimitBelowOutstandingDebt(_limit);
        globalDebtLimit = _limit;
        emit GlobalLimit(_limit);
    }

    /**
     * @notice lets a user become a borrower
     * - onlyOwner (or governance)
     * - user must not be borrower
     * @param _borrower the address that will interact with contract
     */
    function allowBorrower(address _borrower) external onlyGovernor {
        if (borrowers[_borrower].isAllowed) revert IncurDebtV2_AlreadyBorrower(_borrower);
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
    function setBorrowerDebtLimit(address _borrower, uint256 _limit) external onlyGovernor isBorrower(_borrower) {
        if (_limit < borrowers[_borrower].debt) revert IncurDebtV2_AboveBorrowersDebtLimit(_limit);
        if (_limit > globalDebtLimit) revert IncurDebtV2_AboveGlobalDebtLimit(_limit);

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
    function revokeBorrower(address _borrower) external onlyGovernor isBorrower(_borrower) {
        if (borrowers[_borrower].debt != 0) revert IncurDebtV2_BorrowerStillHasOutstandingDebt(_borrower);
        borrowers[_borrower].isAllowed = false;
        emit BorrowerRevoked(_borrower);
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
        if (_token != gOHM && _token != sOHM) revert IncurDebtV2_WrongTokenAddress(_token);

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

        emit BorrowerDeposit(msg.sender, _amount, _token);
    }

    /**
     * @notice creates an LP position by borrowing OHM
     * - msg.sender must be whitelisted
     * - the strategy must be whitelisted
     * - the strategy contract must have been approved _pairAmount of _pairToken
     * - _ohmAmount must be less than or equal to available debt
     * @param _ohmAmount the desired amount of OHM to borrow
     * @param _strategy the address of the AMM strategy to use
     * @param _strategyParams strategy-specific params
     * @param _pairDesiredAmount the address of the AMM strategy to use
     * @return number of LP tokens created
     */
    function createLP(
        uint256 _ohmAmount,
        uint256 _pairDesiredAmount,
        address _strategy,
        bytes calldata _strategyParams
    ) external isBorrower(msg.sender) isStrategyApproved(msg.sender) returns (uint256) {
        Borrower storage borrower = borrowers[msg.sender];

        if (_ohmAmount > borrower.limit - borrower.debt) revert IncurDebtV2_AmountMoreThanBorrowersLimit(_ohmAmount);
        if (_ohmAmount > getAvailableToBorrow()) revert IncurDebtV2_OHMAmountMoreThanAvailableLoan(_ohmAmount);

        ITreasury(treasury).incurDebt(_ohmAmount, OHM);
        IERC20(OHM).approve(_strategy, _ohmAmount);

        (uint256 liquidity, uint256 ohmUnused, address lpTokenAddress) = IStrategy(_strategy).addLiquidity(
            _strategyParams,
            _ohmAmount,
            _pairDesiredAmount,
            msg.sender
        );

        // Mapping edit user owns x liquidity
        lpTokenOwnership[lpTokenAddress][msg.sender] += liquidity;

        borrower.debt += uint128(_ohmAmount - ohmUnused);
        totalOutstandingGlobalDebt += (_ohmAmount - ohmUnused);

        if (ohmUnused > 0) {
            ITreasury(treasury).repayDebtWithOHM(ohmUnused);
        }

        return liquidity;
    }

    /**
     * @notice unwinds an LP position and pays off OHM debt. Excess ohm is sent back to caller.
     @ @param _liquidity the amount of LP tokens to remove.
     * @param _strategy the address of the AMM strategy to use
     * @param _lpToken address of lp token to remove liquidity from
     * @param _strategyParams strategy-specific params
     * @return ohmRecieved of _pair token send to _to and OHM to pay
     */
    function removeLP(
        uint256 _liquidity,
        address _strategy,
        address _lpToken,
        bytes calldata _strategyParams
    ) external isBorrower(msg.sender) isStrategyApproved(msg.sender) returns (uint256 ohmRecieved) {
        Borrower storage borrower = borrowers[msg.sender];
        if (borrower.debt == 0) revert IncurDebtV2_BorrowerHasNoOutstandingDebt(msg.sender);

        if (_liquidity > lpTokenOwnership[_lpToken][msg.sender])
            revert IncurDebtV2_AmountAboveBorrowerBalance(_liquidity);
        lpTokenOwnership[_lpToken][msg.sender] -= _liquidity;

        ohmRecieved = IStrategy(_strategy).removeLiquidity(_strategyParams, _liquidity, _lpToken, msg.sender);

        uint256 ohmToRepay;

        if (borrower.debt < ohmRecieved) {
            ohmToRepay = ohmRecieved - borrower.debt;
            totalOutstandingGlobalDebt -= borrower.debt;
            borrower.debt = 0;
            IERC20(OHM).safeTransfer(msg.sender, ohmRecieved - ohmToRepay);
        } else {
            ohmToRepay = ohmRecieved;
            totalOutstandingGlobalDebt -= ohmRecieved;
            borrower.debt = uint128(borrower.debt - ohmRecieved);
        }

        ITreasury(treasury).repayDebtWithOHM(ohmToRepay);
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
        if (_amount == 0) revert IncurDebtV2_InvaildNumber(_amount);
        Borrower storage borrower = borrowers[msg.sender];

        updateCollateralInSOHM(msg.sender);

        if (_token == gOHM) {
            uint256 _sAmount = IgOHM(gOHM).balanceFrom(_amount);

            if (_sAmount > getAvailableToBorrow()) revert IncurDebtV2_AmountAboveBorrowerBalance(_sAmount);

            borrower.collateralInSOHM -= uint128(_sAmount);
            borrower.collateralInGOHM -= uint128(_amount);

            IERC20(sOHM).approve(staking, _sAmount);
            IStaking(staking).wrap(_to, _sAmount);
        } else if (_token == sOHM) {
            if (_amount > getAvailableToBorrow()) revert IncurDebtV2_AmountAboveBorrowerBalance(_amount);

            borrower.collateralInSOHM -= uint128(_amount);
            borrower.collateralInGOHM -= uint128(IgOHM(gOHM).balanceTo(_amount));

            IERC20(sOHM).safeTransfer(_to, _amount);
        }

        emit Withdrawal(msg.sender, _amount, _token, _to, borrower.collateralInSOHM);
    }

    /**
     * @notice repay debt with collateral
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     */
    function repayDebtWithCollateral() external {
        Borrower storage borrower = borrowers[msg.sender];
        (uint256 depositedCollateralAfterRepay, uint256 paidDebt) = _repay(msg.sender);

        borrower.debt = 0;
        borrower.collateralInSOHM = uint128(depositedCollateralAfterRepay);

        borrower.collateralInGOHM = uint128(IgOHM(gOHM).balanceTo(depositedCollateralAfterRepay));
        emit DebtPaidWithCollateral(
            msg.sender,
            paidDebt,
            depositedCollateralAfterRepay,
            borrower.debt,
            totalOutstandingGlobalDebt
        );
    }

    /**
     * @notice repay debt with collateral and withdraw the accrued earnings to sOHM/gOHM
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     * @param _tokenToReceiveExcess amount of OHM to borrow
     */
    function repayDebtWithCollateralAndWithdrawTheRest(address _tokenToReceiveExcess) external {
        (uint256 depositedCollateralAfterRepay, uint256 paidDebt) = _repay(msg.sender);
        assignBorrowerInfoToZero(msg.sender);

        if (depositedCollateralAfterRepay > 0) {
            if (_tokenToReceiveExcess == sOHM) {
                IERC20(sOHM).safeTransfer(msg.sender, depositedCollateralAfterRepay);
            } else if (_tokenToReceiveExcess == gOHM) {
                IERC20(sOHM).approve(staking, depositedCollateralAfterRepay);
                IStaking(staking).wrap(msg.sender, depositedCollateralAfterRepay);
            }
        }

        emit DebtPaidWithCollateralAndWithdrawTheRest(
            msg.sender,
            paidDebt,
            borrowers[msg.sender].collateralInSOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            depositedCollateralAfterRepay
        );
    }

    /**
     * @notice deposits OHM to pay debt
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     * - borrower must have outstanding debt
     * @param _ohmAmount amount of OHM to borrow
     */
    function repayDebtWithOHM(uint256 _ohmAmount) external isBorrower(msg.sender) {
        Borrower storage borrower = borrowers[msg.sender];

        if (borrower.debt == 0) revert IncurDebtV2_BorrowerHasNoOutstandingDebt(msg.sender);
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
     * - sends remaining tokens to owner in sOHM
     * @param _borrower the address that will interact with contract
     * @param _to where to send remaining sOHM
     */
    function forceRepay(address _borrower, address _to) external onlyGovernor {
        (uint256 collateralAfterDebtPayment, uint256 paidDebt) = _repay(_borrower);

        assignBorrowerInfoToZero(_borrower);
        if (collateralAfterDebtPayment > 0) IERC20(sOHM).safeTransfer(_to, collateralAfterDebtPayment);

        emit ForceDebtPayWithCollateralAndWithdrawTheRest(
            _borrower,
            paidDebt,
            borrowers[msg.sender].collateralInSOHM,
            borrowers[msg.sender].debt,
            totalOutstandingGlobalDebt,
            collateralAfterDebtPayment
        );
    }

    /**
     * @notice seize and burn _borrowers collateral and forgive debt
     * - will burn all collateral, including excess of debt
     * - onlyGovernance
     * @param _borrower the account to seize
     */
    function seize(address _borrower) external onlyGovernor isBorrower(_borrower) {
        uint256 paidDebt = _repayDebtWithCollateralByGovernor(_borrower);
        uint256 seizedCollateral = borrowers[_borrower].collateralInSOHM;

        assignBorrowerInfoToZero(_borrower);
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
     * @notice updates borrowers sOHM collateral to current index
     * @param _borrower borrowers address
     */
    function updateCollateralInSOHM(address _borrower) public {
        uint256 sBalance = IgOHM(gOHM).balanceFrom(borrowers[_borrower].collateralInGOHM);
        borrowers[_borrower].collateralInSOHM = uint128(sBalance);
        emit CollateralInSOHMIncreased(_borrower, borrowers[_borrower].collateralInSOHM);
    }

    /**
     * @notice gets available OHM to borrow for account
     * @return amount OHM available to borrow
     */
    function getAvailableToBorrow() public view returns (uint256) {
        uint256 sBalance = IgOHM(gOHM).balanceFrom(borrowers[msg.sender].collateralInGOHM);
        return sBalance - borrowers[msg.sender].debt;
    }

    function _repay(address _borrower)
        internal
        isBorrower(_borrower)
        returns (uint256 currentcollateralInSOHM, uint256 debt)
    {
        Borrower storage borrower = borrowers[_borrower];
        if (borrower.debt == 0) revert IncurDebtV2_BorrowerHasNoOutstandingDebt(_borrower);

        updateCollateralInSOHM(_borrower);
        IERC20(sOHM).approve(staking, borrower.debt);

        IStaking(staking).unstake(address(this), borrower.debt, false, true);
        IERC20(OHM).approve(treasury, borrower.debt);

        ITreasury(treasury).repayDebtWithOHM(borrower.debt);
        totalOutstandingGlobalDebt -= borrower.debt;

        currentcollateralInSOHM = borrower.collateralInSOHM - borrower.debt;
        debt = borrower.debt;
    }

    function _repayDebtWithCollateralByGovernor(address _borrower) private returns (uint256 paidDebt) {
        Borrower storage borrower = borrowers[_borrower];
        uint256 depositedCollateralAfterRepay;
        (depositedCollateralAfterRepay, paidDebt) = _repay(_borrower);

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
