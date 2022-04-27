// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IUniswapV2Pair.sol";

import "./types/OlympusAccessControlled.sol";

/// @notice Updated distributor adds the ability to mint and sync
///         into Uniswap V2-style liquidity pools, removing the
///         opportunity-cost dilemma of providing liquidity for
///         OHM, as well as patches a small bug in the staking contract
///         that pulls forward an amount of the next epoch rewards. Note that
///         this implementation bases staking reward distributions on staked supply.
contract Distributor is OlympusAccessControlled {
    error No_Rebase_Occurred();
    error Only_Staking();
    error Not_Unlocked();
    error Sanity_Check();
    error Adjustment_Limit();
    error Adjustment_Underflow();
    error Not_Permissioned();

    struct Adjust {
        bool add; // whether to add or subtract from the reward rate
        uint256 rate; // the amount to add or subtract per epoch
        uint256 target; // the resulting reward rate
    }

    /* ====== VARIABLES ====== */

    /// The OHM Token
    IERC20 private immutable ohm;
    /// The Olympus Treasury
    ITreasury private immutable treasury;
    /// The OHM Staking Contract
    address private immutable staking;

    /// The % to increase balances per epoch
    uint256 public rewardRate;
    /// Liquidity pools to receive rewards
    address[] public pools;

    /// Information about adjusting reward rate
    Adjust public adjustment;
    /// A bounty for keepers to call the triggerRebase() function
    uint256 public bounty;

    uint256 private constant DENOMINATOR = 1_000_000;

    constructor(
        ITreasury _treasury,
        IERC20 _ohm,
        address _staking,
        IOlympusAuthority _authority,
        uint256 _initialRate
    ) OlympusAccessControlled(_authority) {
        treasury = _treasury;
        ohm = _ohm;
        staking = _staking;
        rewardRate = _initialRate;
    }

    /* ====== PUBLIC FUNCTIONS ====== */

    /// @notice Patch to trigger rebases via distributor. There is an error in Staking's
    ///         `stake` function which pulls forward part of the rebase for the next epoch.
    ///         This patch triggers a rebase by calling unstake (which does not have the issue).
    ///         The patch also restricts `distribute` to only be able to be called from a tx
    ///         originating this function.

    bool private unlockRebase; // restricts distribute() to only this call

    function triggerRebase() external {
        unlockRebase = true;
        IStaking(staking).unstake(msg.sender, 0, true, true); // Give the caller the bounty ohm.
        if(unlockRebase) revert No_Rebase_Occurred();
    }

    /* ====== GUARDED FUNCTIONS ====== */

    /// @notice send epoch reward to staking contract
    function distribute() external {
        if (msg.sender != staking) revert Only_Staking();
        if (!unlockRebase) revert Not_Unlocked();

        treasury.mint(staking, nextRewardFor(staking));

        // mint to pools and sync
        //
        // this removes opportunity cost for liquidity providers by
        // sending rebase rewards directly into the liquidity pool
        //
        // note that this does not add additional emissions (user could
        // be staked instead and get the same tokens)

        for (uint256 i = 0; i < pools.length; i++) {
            address pool = pools[i];
            if (pool != address(0)) {
                treasury.mint(pool, nextRewardFor(pool));
                IUniswapV2Pair(pool).sync();
            }
        }

        if (adjustment.rate != 0) {
            adjust();
        }

        unlockRebase = false;
    }

    function retrieveBounty() external returns (uint256) {
        if (msg.sender != staking) revert Only_Staking();
        // If the distributor bounty is > 0, mint it for the staking contract.
        if (bounty > 0) {
            treasury.mint(staking, bounty);
        }

        return bounty;
    }

    /* ====== INTERNAL FUNCTIONS ====== */

    /// @notice increment reward rate for collector
    function adjust() internal {
        if (adjustment.add) {
            // if rate should increase
            rewardRate += adjustment.rate; // raise rate
            if (rewardRate >= adjustment.target) {
                // if target met
                adjustment.rate = 0; // turn off adjustment
                rewardRate = adjustment.target; // set to target
            }
        } else {
            // if rate should decrease
            if (rewardRate > adjustment.rate) {
                // protect from underflow
                rewardRate -= adjustment.rate; // lower rate
            } else {
                rewardRate = 0;
            }

            if (rewardRate <= adjustment.target) {
                // if target met
                adjustment.rate = 0; // turn off adjustment
                rewardRate = adjustment.target; // set to target
            }
        }
    }

    /* ====== VIEW FUNCTIONS ====== */

    /// @notice view function for next reward for an address
    function nextRewardFor(address who) public view returns (uint256) {
        return (ohm.balanceOf(who) * rewardRate) / DENOMINATOR;
    }

    /* ====== POLICY FUNCTIONS ====== */

    /// @notice set bounty to incentivize keepers
    function setBounty(uint256 _bounty) external onlyGovernor {
        bounty = _bounty;
    }

    /// @notice sets the liquidity pools for mint and sync
    /// @dev    note that this overwrites the entire list (!!)
    function setPools(address[] calldata _pools) external onlyGovernor {
        pools = _pools;
    }

    /// @notice removes a pool from the list
    function removePool(uint256 index, address pool) external onlyGovernor {
        if (pools[index] != pool) revert Sanity_Check();
        pools[index] = address(0);
    }

    /// @notice adds a pool to the list
    /// @dev    note you should find an empty slot offchain before calling
    /// @dev    if there are no empty slots, pass in an occupied index to push
    function addPool(uint256 index, address pool) external onlyGovernor {
        // we want to overwrite slots where possible
        if (pools[index] == address(0)) {
            pools[index] = pool;
        } else {
            // if the passed in slot is not empty, push to the end
            pools.push(pool);
        }
    }

    /// @notice set adjustment info for a collector's reward rate
    function setAdjustment(
        bool _add,
        uint256 _rate,
        uint256 _target
    ) external {
        if (msg.sender != authority.governor() && msg.sender != authority.guardian()) revert Not_Permissioned();
        if (msg.sender == authority.guardian() && _rate > (rewardRate * 25) / 1000) revert Adjustment_Limit();
        if (!_add && _rate > rewardRate) revert Adjustment_Underflow();

        adjustment = Adjust({add: _add, rate: _rate, target: _target});
    }
}
