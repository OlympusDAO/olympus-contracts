// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
import "../interfaces/ITreasury.sol";

import "../types/Ownable.sol";

interface ITokemak_Manager {
    function currentCycleIndex() external view returns (uint256);
}

interface ITokemak_tALCX {
    function deposit(uint256 amount) external;

    function requestedWithdrawals(address addr) external view returns (uint256, uint256);

    function withdraw(uint256 requestedAmount) external;

    function requestWithdrawal(uint256 amount) external;
}

interface IStakingPools {
    function claim(uint256 _poolId) external;

    function exit(uint256 _poolId) external;

    function getStakeTotalDeposited(address _account, uint256 _poolId) external view returns (uint256);

    function getStakeTotalUnclaimed(address _account, uint256 _poolId) external view returns (uint256);

    function deposit(uint256 _poolId, uint256 _depositAmount) external;

    function withdraw(uint256 _poolId, uint256 _withdrawAmount) external;
}

/**
 *  Contract deploys Alchemist from treasury into the Tokemak tALCX pool,
 *  tALCX contract gives tALCX token in ratio 1:1 of Alchemist token deposited,
 *  Contract stake tALCX token on Alchemist staking pool and earn ALCX as reward,
 *  Contract claims reward and compound it,
 *  Contract withdraw funds from Alchemist staking pool and Tokemak tALCX pool,
 *  Sends back Alchemist token with accured reward to treasury.
 */

contract AlchemistAllocator is Ownable {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLES ======== */

    address alchemist;
    address tokemak_manager = 0xA86e412109f77c45a3BC1c5870b880492Fb86A14;

    ITokemak_tALCX immutable tALCX; // Tokemak tALCX deposit contract
    IStakingPools immutable pool; // Alchemist staking contract
    ITreasury immutable treasury; // Olympus Treasury

    uint256 public totalAlchemistDeposited;

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _alchemist,
        address _tALCX,
        address _pool
    ) {
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);

        require(_tALCX != address(0));
        tALCX = ITokemak_tALCX(_tALCX);

        require(_pool != address(0));
        pool = IStakingPools(_pool);

        alchemist = _alchemist;
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice sets Alchemist address
     */
    function setAlchemistAddress(address _alchemist) external onlyOwner {
        alchemist = _alchemist;
    }

    /**
     *  @notice compound reward by claiming pending rewards and
     *      calling the deposit function
     *  @param _poolId pool id of tALCX on Alchemist staking pool
     */
    function compoundReward(uint256 _poolId) public onlyOwner {
        pool.claim(_poolId);
        uint256 alchemist_balance = IERC20(alchemist).balanceOf(address(this));

        require(alchemist_balance > 0, "contract has no alchemist token");
        deposit(alchemist_balance, _poolId, true);
    }

    /**
     *  @notice withdraws asset from treasury, deposits asset into Tokemak tALCX,
     *      then deposits tALCX into Alchemist staking pool
     *  @param amount amount to deposit
     *  @param _poolId pool id of tALCX on Alchemist staking pool
     *  @param isCompounding used to indicate if the contract is compounding pending rewards
     */
    function deposit(
        uint256 amount,
        uint256 _poolId,
        bool isCompounding
    ) public onlyOwner {
        if (isCompounding) {} else {
            treasury.manage(alchemist, amount); // retrieve amount of asset from treasury
        }

        IERC20(alchemist).approve(address(tALCX), amount); // approve tALCX pool to spend tokens
        tALCX.deposit(amount);

        totalAlchemistDeposited = totalAlchemistDeposited.add(amount);

        uint256 tALCX_balance = IERC20(address(tALCX)).balanceOf(address(this));
        require(tALCX_balance == amount, "received tALCX must be 1:1 ratio with deposited alchemist amount");

        IERC20(address(tALCX)).approve(address(pool), tALCX_balance); // approve to deposit to Alchemist staking pool
        pool.deposit(_poolId, tALCX_balance); // deposit into Alchemist staking pool
    }

    /**
     *  @notice as structured by Tokemak before one withdraws you must first request withdrawal,
            unstake tALCX from Alchemist staking pool and make a request on Tokemak tALCX pool.
     *  @param _poolId pool id of tALCX on Alchemist staking pool
     *  @param _amount amount to withdraw if _isEntireFunds is false
     *  @param _isEntireFunds used to indicate if amount to with is the entire funds deposited
     */
    function requestWithdraw(
        uint256 _poolId,
        uint256 _amount,
        bool _isEntireFunds
    ) external onlyOwner {
        if (_isEntireFunds) {
            pool.exit(_poolId);
        } else {
            pool.withdraw(_poolId, _amount);
        }

        uint256 balance = IERC20(address(tALCX)).balanceOf(address(this));

        tALCX.requestWithdrawal(balance);
    }

    /**
     *  @notice withdraws ALCX from Tokemak tALCX pool then deposits asset into treasury,
            ensures cycle for withdraw has been reached.
     */
    function withdraw() external onlyOwner {
        (uint256 minCycle, ) = tALCX.requestedWithdrawals(address(this));
        uint256 current_cycle = ITokemak_Manager(tokemak_manager).currentCycleIndex();

        require(minCycle <= current_cycle, "requested withdraw cycle not reached yet");

        (, uint256 requested_amount_to_withdraw) = getRequestedWithdrawalInfo();
        tALCX.withdraw(requested_amount_to_withdraw);
        uint256 balance = IERC20(alchemist).balanceOf(address(this)); // balance of asset withdrawn

        // account for withdrawal
        uint256 value = treasury.tokenValue(alchemist, balance);
        totalAlchemistDeposited = totalAlchemistDeposited.sub(requested_amount_to_withdraw);

        IERC20(alchemist).approve(address(treasury), balance); // approve to deposit asset into treasury
        treasury.deposit(balance, alchemist, value); // deposit using value as profit so no OHM is minted
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice query all pending rewards
     *  @param _poolId pool id of tALCX on Alchemist staking pool
     *  @return uint
     */
    function alchemistToClaim(uint256 _poolId) external view returns (uint256) {
        return pool.getStakeTotalUnclaimed(address(this), _poolId);
    }

    /**
     *  @notice query all deposited tALCX in Alchemist staking pool
     *  @param _poolId pool id of tALCX on Alchemist staking pool
     *  @return uint
     */
    function total_tAlcxDeposited(uint256 _poolId) external view returns (uint256) {
        return pool.getStakeTotalDeposited(address(this), _poolId);
    }

    /**
     *  @notice query requested withdrawal info
     *  @return cycle eligible for withdrawal and amount
     */
    function getRequestedWithdrawalInfo() public view returns (uint256 cycle, uint256 amount) {
        (cycle, amount) = tALCX.requestedWithdrawals(address(this));
    }
}
