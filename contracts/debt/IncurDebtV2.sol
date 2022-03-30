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
error IncurDebtV1_BorrowerHasNoOutstandingDebt(address _borrower);
error IncurDebtV1_BorrowerStillHasOutstandingDebt(address _borrower);

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
    }

    modifier isBorrower(address _borrower) {
        if (!borrowers[_borrower].isAllowed) revert IncurDebtV1_NotBorrower(_borrower);
        _;
    }

    modifier isStrategy(address _borrower) {
        if (!strategies[_borrower]) revert IncurDebtV1_NotBorrower(_borrower); //change error msg
        _;
    }

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - must be greater than or equal to existing debt
     * @param _limit in OHM
     */
    function setGlobalDebtLimit(uint256 _limit) external onlyGovernor {
        if (_limit < totalOutstandingGlobalDebt) revert IncurDebtV1_LimitBelowOutstandingDebt(_limit);
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
    function setBorrowerDebtLimit(address _borrower, uint256 _limit) external onlyGovernor isBorrower(_borrower) {
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
    function revokeBorrower(address _borrower) external onlyGovernor isBorrower(_borrower) {
        if (borrowers[_borrower].debt != 0) revert IncurDebtV1_BorrowerStillHasOutstandingDebt(_borrower);
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
     * @return liquidity of LP tokens created
     */
    function createLP(
        uint256 _ohmAmount,
        uint256 _pairDesiredAmount,
        // address _pairAddress,
        address _strategy,
        bytes calldata _strategyParams
    ) external isBorrower(msg.sender) isStrategy(msg.sender) returns (uint256) {
        Borrower storage borrower = borrowers[msg.sender];

        if (_ohmAmount > borrower.limit - borrower.debt) revert IncurDebtV1_AmountMoreThanBorrowersLimit(_ohmAmount);
        if (_ohmAmount > getAvailableToBorrow()) revert IncurDebtV1_OHMAmountMoreThanAvailableLoan(_ohmAmount);

        IERC20(OHM).approve(_strategy, _ohmAmount);

        (uint256 liquidity, uint256 ohmUnused, address lpTokenAddress) = IStrategy(_strategy).addLiquidity(_strategyParams, _ohmAmount, _pairDesiredAmount);

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
     * @notice unwinds an LP position and pays off OHM debt
     * @param _strategy the address of the AMM strategy to use
     * @param _pairAddress the contract address of the pair token
     * @param _strategyParams strategy-specific params
     * @return amountA of _pair token send to _to and OHM to pay
     */
    function removeLP(
        address _strategy,
        address _pairAddress,
        bytes calldata _strategyParams
    ) external isBorrower(msg.sender) isStrategy(msg.sender) returns (uint256 amountA, uint256 amountB) {
        Borrower storage borrower = borrowers[msg.sender];
        if (borrower.debt == 0) revert IncurDebtV1_BorrowerHasNoOutstandingDebt(msg.sender);

        (amountA, amountB) = IStrategy(_strategy).removeLiquidity(_strategyParams);
        IERC20(_pairAddress).transfer(msg.sender, amountB);

        totalOutstandingGlobalDebt -= amountA;
        borrower.debt = uint128(borrower.debt - amountA);

        IERC20(OHM).approve(treasury, amountA);
        ITreasury(treasury).repayDebtWithOHM(amountA);
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
        if (borrower.debt == 0) revert IncurDebtV1_BorrowerHasNoOutstandingDebt(_borrower);

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
