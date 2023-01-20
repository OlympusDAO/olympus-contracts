// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

// Import types
import {BaseAllocator, AllocatorInitData} from "../types/BaseAllocator.sol";

// Import interfaces
import {IERC20} from "../interfaces/IERC20.sol";
import {IConvex, IConvexRewards, IConvexVirtualBalanceRewards} from "./interfaces/ConvexInterfaces.sol";

// Define Aura interfaces
interface IAuraRewards {
    function balanceOf(address user_) external view returns (uint256);

    function deposit(uint256 assets, address receiver) external returns (uint256);

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external returns (uint256);

    function withdrawAll(bool claim) external;

    function withdrawAndUnwrap(uint256 _amount, bool _claim) external returns (bool);

    function withdrawAllAndUnwrap(bool claim) external;

    function getReward() external;

    function getReward(address _account, bool _claimExtras) external;

    function earned(address _account) external view returns (uint256);

    function extraRewards(uint256 _id) external view returns (address);

    function extraRewardsLength() external view returns (uint256);
}

contract BalancerAuraAllocator is BaseAllocator {
    // ========= DATA STRUCTURES ========= //

    struct AuraPoolData {
        IAuraRewards pool;
        IERC20 lp;
        uint96 pid;
    }

    // ========= STATE VARIABLES ========= //

    address public immutable treasury;

    IERC20 internal immutable _aura = IERC20(0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF);

    // Reward tokens
    IERC20[] internal _rewardTokens;

    // Aura pools
    AuraPoolData[] internal _auraPools;

    // Aura Booster
    IConvex internal immutable _booster = IConvex(0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10);

    constructor(AllocatorInitData memory data, address treasury_) BaseAllocator(data) {
        treasury = treasury_;
    }

    // ========= BASE OVERRIDES ========= //

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 tokenIndex = tokenIds[id];

        // Cache Aura pool data for the desired token
        AuraPoolData memory auraPool = _auraPools[tokenIndex];

        // If there is undeposited BPT, deposit
        if (auraPool.lp.balanceOf(address(this)) > 0) _booster.depositAll(auraPool.pid, true);

        // Harvest rewards from Aura pool
        _claimRewards(auraPool.pool);

        // Profit/Loss math
        uint256 received = _amountAllocated(auraPool.pool);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        AuraPoolData memory auraPool;
        uint256 amountsLength = amounts.length;
        uint256 amount;

        // Loop through all tokens
        for (uint256 index; index < amountsLength; ) {
            auraPool = _auraPools[index];
            amount = amounts[index];

            auraPool.pool.withdraw(amount, address(this), address(this)); // does this need to be withdrawAndUnwrap

            unchecked {
                ++index;
            }
        }
    }

    function _deactivate(bool panic) internal override {
        AuraPoolData memory auraPool;
        uint256 numPools = _auraPools.length;

        // Loop through all Aura pools
        for (uint256 index; index < numPools; ) {
            auraPool = _auraPools[index];
            auraPool.pool.withdraw(auraPool.pool.balanceOf(address(this)), address(this), address(this)); // does this need to be withdrawAndUnwrap

            if (panic) auraPool.lp.transfer(treasury, auraPool.lp.balanceOf(address(this)));

            unchecked {
                ++index;
            }
        }

        // Loop through all reward tokens if panic
        if (panic) {
            IERC20 rewardToken;
            uint256 numRewardTokens = _rewardTokens.length;

            for (uint256 index; index < numRewardTokens; ) {
                rewardToken = _rewardTokens[index];
                rewardToken.transfer(treasury, rewardToken.balanceOf(address(this)));

                unchecked {
                    ++index;
                }
            }
        }
    }

    function _prepareMigration() internal override {
        AuraPoolData memory auraPool;
        uint256 numPools = _auraPools.length;

        for (uint256 index; index < numPools; ) {
            // Withdraw all Balancer pool tokens from Aura
            auraPool = _auraPools[index];
            auraPool.pool.withdraw(auraPool.pool.balanceOf(address(this)), address(this), address(this)); // does this need to be withdrawAndUnwrap

            // Claim any rewards from Aura
            _claimRewards(auraPool.pool);

            unchecked {
                ++index;
            }
        }
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 tokenIndex = tokenIds[id];
        AuraPoolData memory auraPool = _auraPools[tokenIndex];
        return _amountAllocated(auraPool.pool);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        return _rewardTokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        uint256 numPools = _auraPools.length;
        IERC20[] memory utilityTokens = new IERC20[](numPools);

        for (uint256 index; index < numPools; ) {
            utilityTokens[index] = _auraPools[index].lp;

            unchecked {
                ++index;
            }
        }

        return utilityTokens;
    }

    function name() external pure override returns (string memory) {
        return "BalancerAuraAllocator";
    }

    // ========= ALLOCATOR SPECIFIC FUNCTIONS ========= //

    function addDeposit(
        address balancerPool_,
        address auraRewardsPool_,
        uint96 pid_,
        IERC20[] calldata rewardTokens_
    ) external onlyGuardian {
        AuraPoolData memory auraPool = AuraPoolData({
            pool: IAuraRewards(auraRewardsPool_),
            lp: IERC20(balancerPool_),
            pid: pid_
        });

        _tokens.push(IERC20(balancerPool_));
        _auraPools.push(auraPool);

        // Add reward tokens
        _addRewardTokens(rewardTokens_);

        // Set approvals
        IERC20(balancerPool_).approve(address(extender), type(uint256).max);
        IERC20(balancerPool_).approve(address(_booster), type(uint256).max);
    }

    // ========= INTERNAL FUNCTIONS ========= //

    function _addRewardTokens(IERC20[] calldata rewardTokens_) internal {
        IERC20 rewardToken;
        uint256 numRewardTokens = rewardTokens_.length;

        for (uint256 index; index < numRewardTokens; ) {
            rewardToken = rewardTokens_[index];
            rewardToken.approve(address(extender), type(uint256).max);
            _rewardTokens.push(rewardToken);

            unchecked {
                ++index;
            }
        }
    }

    function _amountAllocated(IAuraRewards auraRewardsPool_) internal view returns (uint256) {
        return auraRewardsPool_.balanceOf(address(this));
    }

    function _claimRewards(IAuraRewards auraRewardsPool_) internal {
        if (auraRewardsPool_.earned(address(this)) > 0) {
            auraRewardsPool_.getReward();

            // Claim any extra rewards
            uint256 numExtraRewards = auraRewardsPool_.extraRewardsLength();
            for (uint256 index; index < numExtraRewards; ) {
                IConvexVirtualBalanceRewards extra = IConvexVirtualBalanceRewards(auraRewardsPool_.extraRewards(index));

                if (extra.earned(address(this)) > 0) extra.getReward();
            }
        }
    }
}
