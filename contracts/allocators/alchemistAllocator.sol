// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface ITokemakManager {
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
 *  Contract deploys Alchemix from treasury into the Tokemak tALCX pool,
 *  tALCX contract gives tALCX token in ratio 1:1 of Alchemix token deposited,
 *  Contract stake tALCX token on Alchemix staking pool and earn ALCX as reward,
 *  Contract claims reward and compound it,
 *  Contract withdraw funds from Alchemix staking pool and Tokemak tALCX pool,
 *  Sends back Alchemix token with accured reward to treasury.
 */

contract AlchemixAllocator is OlympusAccessControlled {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLES ======== */

    address immutable alchemix;
    address immutable tokemakManager = 0xA86e412109f77c45a3BC1c5870b880492Fb86A14;
    address olympusAuthority = 0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A;

    ITokemak_tALCX immutable tALCX; // Tokemak tALCX deposit contract
    IStakingPools immutable pool; // Alchemix staking contract
    ITreasury immutable treasury; // Olympus Treasury

    uint256 public totalAlchemixDeposited;

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _alchemix,
        address _tALCX,
        address _pool
    ) OlympusAccessControlled(IOlympusAuthority(olympusAuthority)) {
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);

        require(_tALCX != address(0));
        tALCX = ITokemak_tALCX(_tALCX);

        require(_pool != address(0));
        pool = IStakingPools(_pool);

        alchemix = _alchemix;
    }

    /* ======== POLICY FUNCTIONS ======== */

    function setNewOlympusAuthority(address _newOlympusAuthority) external onlyPolicy {
        olympusAuthority = _newOlympusAuthority;
    }

    /**
     *  @notice compound reward by claiming pending rewards and
     *      calling the deposit function
     *  @param _poolId pool id of tALCX on Alchemix staking pool
     */
    function compoundReward(uint256 _poolId) public onlyPolicy {
        pool.claim(_poolId);
        uint256 alchemixBalance = IERC20(alchemix).balanceOf(address(this));

        require(alchemixBalance > 0, "contract has no alchemix token");
        deposit(alchemixBalance, _poolId, true);
    }

    /**
     *  @notice withdraws asset from treasury, deposits asset into Tokemak tALCX,
     *      then deposits tALCX into Alchemix staking pool
     *  @param _amount amount to deposit
     *  @param _poolId pool id of tALCX on Alchemix staking pool
     *  @param _isCompounding used to indicate if the contract is compounding pending rewards
     */
    function deposit(
        uint256 _amount,
        uint256 _poolId,
        bool _isCompounding
    ) public onlyPolicy {
        if (!_isCompounding) {
            treasury.manage(alchemix, _amount); // retrieve amount of asset from treasury
        }

        IERC20(alchemix).approve(address(tALCX), _amount); // approve tALCX pool to spend tokens
        tALCX.deposit(_amount);

        totalAlchemixDeposited = totalAlchemixDeposited.add(_amount);
        uint256 tALCX_balance = IERC20(address(tALCX)).balanceOf(address(this));

        IERC20(address(tALCX)).approve(address(pool), tALCX_balance); // approve to deposit to Alchemix staking pool
        pool.deposit(_poolId, tALCX_balance); // deposit into Alchemix staking pool
    }

    /**
     *  @notice as structured by Tokemak before one withdraws you must first request withdrawal,
            unstake tALCX from Alchemix staking pool and make a request on Tokemak tALCX pool.
     *  @param _poolId pool id of tALCX on Alchemix staking pool
     *  @param _amount amount to withdraw if _isEntireFunds is false
     *  @param _isEntireFunds used to indicate if amount to with is the entire funds deposited
     */
    function requestWithdraw(
        uint256 _poolId,
        uint256 _amount,
        bool _isEntireFunds
    ) external onlyPolicy {
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
    function withdraw() external onlyPolicy {
        (uint256 minCycle, ) = tALCX.requestedWithdrawals(address(this));
        uint256 currentCycle = ITokemakManager(tokemakManager).currentCycleIndex();

        require(minCycle <= currentCycle, "requested withdraw cycle not reached yet");

        (, uint256 requestedAmountToWithdraw) = getRequestedWithdrawalInfo();
        tALCX.withdraw(requestedAmountToWithdraw);
        uint256 balance = IERC20(alchemix).balanceOf(address(this)); // balance of asset withdrawn

        // account for withdrawal
        uint256 value = treasury.tokenValue(alchemix, balance);
        totalAlchemixDeposited = totalAlchemixDeposited.sub(requestedAmountToWithdraw);

        IERC20(alchemix).approve(address(treasury), balance); // approve to deposit asset into treasury
        treasury.deposit(balance, alchemix, value); // deposit using value as profit so no OHM is minted
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice query all pending rewards
     *  @param _poolId pool id of tALCX on Alchemix staking pool
     *  @return uint
     */
    function alchemixToClaim(uint256 _poolId) external view returns (uint256) {
        return pool.getStakeTotalUnclaimed(address(this), _poolId);
    }

    /**
     *  @notice query all deposited tALCX in Alchemix staking pool
     *  @param _poolId pool id of tALCX on Alchemix staking pool
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
