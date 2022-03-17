// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.4;

import "../interfaces/IOHM.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";
import "./interfaces/ITreasury.sol";
import "../libraries/SafeERC20.sol";
import "../interfaces/IIncurDebt.sol";
import "../types/OlympusAccessControlledV2.sol";

contract TokemakIncurDebt is OlympusAccessControlledV2 {
    using SafeERC20 for IERC20;
    uint256 public globalDebtLimit;

    address public immutable OHM;
    address public immutable gOHM;
    address public immutable sOHM;
    address public immutable staking;
    address public immutable treasury;

    struct Borrower {
        uint256 debt;
        uint256 limit;
        uint256 collateralInSOHM;
        uint256 collateralInGOHM;
        bool isBorrower;
    }

    mapping(address => bool) isStrategy;
    mapping(address => Borrower) borrower;

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

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - must be greater than or equal to existing debt
     * @param _limit in OHM
     */
    function setGlobalDebtLimit(uint256 _limit) external onlyGovernor {
        require(_limit >= globalDebtLimit);
        globalDebtLimit = _limit;
    }

    /**
     * @notice sets the maximum debt limit for a borrower
     * - onlyOwner (or governance)
     * - borrower must not already be allowed
     * @param _account the address that will interact with contract
     */
    function allowBorrower(address _account) external onlyGovernor {
        require(!borrower[_account].isBorrower, "already borrower");
        borrower[_account].isBorrower = true;
    }

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - limit must be greater than or equal to borrower's outstanding debt
     * @param _account the address that will interact with contract
     * @param _limit borrower's debt limit in OHM
     */
    function setBorrowerDebtLimit(address _account, uint256 _limit) external onlyGovernor {
        require(borrower[_account].isBorrower, "not a borrower");
        require(_limit >= borrower[_account].debt);
        require(_limit < globalDebtLimit, "_limit above global debt limit");

        borrower[_account].limit = _limit;
    }

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - borrower must not have outstanding debt
     * @param _account the address that will interact with contract
     */
    function revokeBorrower(address _account) external onlyGovernor {
        require(borrower[_account].debt == 0, "_account still has outstanding debt");
        borrower[_account].isBorrower = false;
    }

    /**
     * @notice deposits gOHM/sOHM to use as collateral
     * - msg.sender must be a borrower
     * - this contract must have been approved _amount
     * @dev will unwrap and hold as sOHM in this contract
     * @param _amount amount of gOHM
     */
    function deposit(uint256 _amount, address _token) external {
        require(borrower[msg.sender].isBorrower, "not a borrower");
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        if (_token == gOHM) {
            uint256 sbalance = IStaking(staking).unwrap(address(this), _amount);

            borrower[msg.sender].collateralInSOHM += sbalance;
            borrower[msg.sender].collateralInGOHM += _amount;
        } else if (_token == sOHM) {
            uint256 gbalance = IgOHM(gOHM).balanceTo(_amount);

            borrower[msg.sender].collateralInSOHM += _amount;
            borrower[msg.sender].collateralInGOHM += gbalance;
        }
    }

    /**
     * @notice allow borrowers to borrow OHM
     * - msg.sender must be a borrower
     * - _ohmAmount must be <= availableDebt
     * @param _ohmAmount amount of OHM to borrow
     */
    function borrow(uint256 _ohmAmount) external {
        require(borrower[msg.sender].isBorrower, "not a borrower");
        require(
            _ohmAmount <= borrower[msg.sender].limit - borrower[msg.sender].debt,
            "_ohmAmount more than borrower limit"
        );
        require(_ohmAmount <= getAvailableToBorrow(), "_ohmAmount more than available loan");

        ITreasury(treasury).incurDebt(_ohmAmount, OHM);
        IERC20(OHM).safeTransfer(msg.sender, _ohmAmount);

        borrower[msg.sender].debt += _ohmAmount;
    }

    /**
     * @notice withdraws gOHM/sOHM  to _to address
     * - msg.sender must be a borrower
     * - _amount (in OHM) must be less than or equal to depositedOhm - debt
     * @dev should approve the staking contract to spend users sOHM
     * @param _amount amount of gOHM/sOHM to withdraw
     * @param _to address to send gOHM/sOHM
     * @param _token token to send _amount
     */
    function withdraw(
        uint256 _amount,
        address _to,
        address _token
    ) external {
        require(_amount > 0, "invalid number");
        require(borrower[msg.sender].isBorrower, "not a borrower");

        updateCollateralInSOHM(msg.sender);

        if (_token == gOHM) {
            uint256 _sAmount = IgOHM(gOHM).balanceFrom(_amount);

            require(
                _sAmount <= borrower[msg.sender].collateralInSOHM - borrower[msg.sender].debt,
                "_amount above available gOHM"
            );
            IStaking(staking).wrap(_to, _sAmount);

            borrower[msg.sender].collateralInSOHM -= _sAmount;
            borrower[msg.sender].collateralInGOHM -= _amount;
        } else if (_token == sOHM) {
            require(
                _amount <= borrower[msg.sender].collateralInSOHM - borrower[msg.sender].debt,
                "_amount above available sOHM"
            );

            IERC20(sOHM).safeTransfer(_to, _amount);

            borrower[msg.sender].collateralInSOHM -= _amount;
            borrower[msg.sender].collateralInGOHM -= IgOHM(gOHM).balanceTo(_amount);
        }
    }

    /**
     * @notice repay debt with collateral
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     */
    function repayDebtWithCollateral() external {
        _repay();

        uint256 depositedCollateralAfterRepay = borrower[msg.sender].collateralInSOHM - borrower[msg.sender].debt;
        borrower[msg.sender].debt = 0;

        borrower[msg.sender].collateralInSOHM = depositedCollateralAfterRepay;
        borrower[msg.sender].collateralInGOHM = IgOHM(gOHM).balanceTo(depositedCollateralAfterRepay);
    }

    /**
     * @notice repay debt with collateral and withdraw the leftover
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     */
    function repayDebtWithCollateralAndWithdrawTheRest(address _tokenToReceiveExcess) external {
        _repay();
        uint256 depositedCollateralAfterRepay = borrower[msg.sender].collateralInSOHM - borrower[msg.sender].debt;

        if (depositedCollateralAfterRepay > 0) {
            if (_tokenToReceiveExcess == sOHM) {
                IERC20(sOHM).safeTransfer(msg.sender, depositedCollateralAfterRepay);
            } else if (_tokenToReceiveExcess == gOHM) {
                IStaking(staking).wrap(msg.sender, depositedCollateralAfterRepay);
            }
        }

        borrower[msg.sender].debt = 0;
        borrower[msg.sender].collateralInSOHM = 0;
        borrower[msg.sender].collateralInGOHM = 0;
    }

    /**
     * @notice deposits OHM to pay debt
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     * @param _ohmAmount amount of OHM to borrow
     */
    function repayDebtWithOHM(uint256 _ohmAmount) external {
        require(borrower[msg.sender].debt > 0, "does not have outstanding debt");
        require(borrower[msg.sender].isBorrower, "not a borrower");

        IERC20(OHM).safeTransferFrom(msg.sender, address(this), _ohmAmount);
        ITreasury(treasury).repayDebtWithOHM(_ohmAmount);

        borrower[msg.sender].debt = borrower[msg.sender].debt - _ohmAmount;
    }

    /**
     * @notice repays debt using collateral and returns remaining tokens to owner
     * - onlyOwner (or governance)
     * - sends remaining tokens to owner in sOHM
     * @param _account the address that will interact with contract
     * @param _to where to send remaining gOHM
     */
    function forceRepay(address _account, address _to) external onlyGovernor {
        require(borrower[_account].debt > 0, "does not have outstanding debt");
        updateCollateralInSOHM(_account);

        IStaking(staking).unstake(address(this), borrower[_account].debt, false, true);
        ITreasury(treasury).repayDebtWithOHM(borrower[_account].debt);

        uint256 collateralAfterDebtPayment = borrower[_account].collateralInSOHM - borrower[_account].debt;
        if (collateralAfterDebtPayment > 0) IERC20(sOHM).safeTransfer(_to, collateralAfterDebtPayment);

        borrower[_account].debt = 0;
        borrower[_account].collateralInSOHM = 0;
        borrower[_account].collateralInGOHM = 0;
    }

    /**
     * @notice seize and burn _accounts collateral and forgive debt
     * - will burn all collateral, including excess of debt
     * - onlyGovernance
     * @param _account the account to seize
     */
    function seize(address _account) external onlyGovernor {
        updateCollateralInSOHM(_account);
        uint256 seizedCollateral = borrower[_account].collateralInSOHM;

        IStaking(staking).unstake(address(this), seizedCollateral, false, true);
        IOHM(OHM).burn(seizedCollateral);

        borrower[_account].debt = 0;
        borrower[_account].collateralInSOHM = 0;
        borrower[_account].collateralInGOHM = 0;
    }

    /**
     * @notice updates borrowers sOHM collateral to current index
     * @param _account borrowers address
     */
    function updateCollateralInSOHM(address _account) public {
        uint256 sBalance = IgOHM(gOHM).balanceFrom(borrower[_account].collateralInGOHM);
        borrower[_account].collateralInSOHM = sBalance;
    }

    /**
     * @notice gets available OHM to borrow for account
     * @return amount OHM available to borrow
     */
    function getAvailableToBorrow() internal view returns (uint256) {
        uint256 sBalance = IgOHM(gOHM).balanceFrom(borrower[msg.sender].collateralInGOHM);
        return sBalance - borrower[msg.sender].debt;
    }

    function _repay() internal {
        require(borrower[msg.sender].isBorrower, "not a borrower");
        require(borrower[msg.sender].debt > 0, "does not have outstanding debt");

        updateCollateralInSOHM(msg.sender);

        IStaking(staking).unstake(address(this), borrower[msg.sender].debt, false, true);
        ITreasury(treasury).repayDebtWithOHM(borrower[msg.sender].debt);
    }
}
