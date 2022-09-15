// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

/// Import base contract
import "../types/BaseAllocator.sol";

/// Import interfaces
import "../interfaces/IERC20.sol";
import "./interfaces/ConvexInterfaces.sol";

import "hardhat/console.sol";

/// Define Aura Interface
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

    function getReward(address _account, bool _claimExtras) external returns (bool);

    function earned(address _account) external view returns (uint256);
}

interface IAuraLocker {
    function lock(address _account, uint256 _amount) external;

    function getReward(address _account) external;
}

contract AuraAllocator is BaseAllocator {
    /// Define data types
    struct AuraPoolData {
        IAuraRewards pool;
        IERC20 lp;
        uint96 pid;
    }

    /* ========== STATE VARIABLES ========== */

    address public immutable treasury;

    IERC20 internal _aura = IERC20(0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF);

    /// Reward tokens
    IERC20[] internal _rewardTokens;

    /// Rewards pool data
    AuraPoolData[] internal _pools;

    /// Booster
    IConvex internal immutable _booster = IConvex(0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10);

    /// Locker
    IAuraLocker internal immutable _locker = IAuraLocker(0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC);

    /// Whether to lock Aura
    bool internal _shouldLock;

    constructor(AllocatorInitData memory data, address treasury_) BaseAllocator(data) {
        treasury = treasury_;
        _aura.approve(address(_locker), type(uint256).max);
    }

    /* ========== BASE OVERRIDES ========== */

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 tokenIndex = tokenIds[id];

        AuraPoolData memory poolData = _pools[tokenIndex];

        /// Deposit BPT balance to gauge
        if (poolData.lp.balanceOf(address(this)) > 0) _booster.depositAll(poolData.pid, true);

        /// Harvest rewards
        _claimRewards(poolData.pool);
        _locker.getReward(address(this));

        /// Get Aura balance
        uint256 auraBalance = _aura.balanceOf(address(this));
        if (_shouldLock) _locker.lock(address(this), auraBalance);

        uint256 received = _amountAllocated(poolData.pool);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        uint256 amount;
        uint256 amountsLength = amounts.length;

        for (uint256 index; index < amountsLength; ) {
            amount = amounts[index];

            AuraPoolData memory poolData = _pools[index];

            poolData.pool.withdraw(amount, address(this), address(this));

            unchecked {
                ++index;
            }
        }
    }

    function _deactivate(bool panic) internal override {
        uint256 numPools = _pools.length;
        AuraPoolData memory poolData;
        uint256 lpBalance;

        for (uint256 index; index < numPools; ) {
            poolData = _pools[index];
            poolData.pool.withdraw(poolData.pool.balanceOf(address(this)), address(this), address(this));

            if (panic) {
                lpBalance = poolData.lp.balanceOf(address(this));
                poolData.lp.transfer(treasury, lpBalance);
            }

            unchecked {
                ++index;
            }
        }

        if (panic) {
            uint256 numRewardTokens = _rewardTokens.length;
            IERC20 rewardToken;
            uint256 rewardTokenBalance;

            for (uint256 index; index < numRewardTokens; ) {
                rewardToken = _rewardTokens[index];
                rewardTokenBalance = rewardToken.balanceOf(address(this));
                rewardToken.transfer(treasury, rewardTokenBalance);

                unchecked {
                    ++index;
                }
            }
        }
    }

    function _prepareMigration() internal override {
        uint256 numPools = _pools.length;
        AuraPoolData memory poolData;

        for (uint256 index; index < numPools; ) {
            poolData = _pools[index];
            poolData.pool.withdraw(poolData.pool.balanceOf(address(this)), address(this), address(this));
            _claimRewards(poolData.pool);

            unchecked {
                ++index;
            }
        }
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 index = tokenIds[id];
        AuraPoolData memory poolData = _pools[index];
        return _amountAllocated(poolData.pool);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        return _rewardTokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        uint256 length = _pools.length;

        IERC20[] memory utilTokens = new IERC20[](length);

        for (uint256 index; index < length; ) {
            utilTokens[index] = _pools[index].lp;
        }

        return utilTokens;
    }

    function name() external pure override returns (string memory) {
        return "AuraAllocator";
    }

    /* ========== ALLOCATOR SPECIFIC FUNCTIONS ========== */

    function addBPT(
        address balancerPool_,
        address auraPool_,
        uint96 pid_,
        IERC20[] calldata rewardTokens_
    ) external onlyGuardian {
        IERC20(balancerPool_).approve(address(extender), type(uint256).max);
        IERC20(balancerPool_).approve(address(_booster), type(uint256).max);

        AuraPoolData memory poolData = AuraPoolData({
            pool: IAuraRewards(auraPool_),
            lp: IERC20(balancerPool_),
            pid: pid_
        });

        _tokens.push(IERC20(balancerPool_));
        _pools.push(poolData);

        _addRewardTokens(rewardTokens_);
    }

    function toggleShouldLock() external onlyGuardian {
        _shouldLock = !_shouldLock;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    function _addRewardTokens(IERC20[] calldata rewardTokens_) internal {
        uint256 numRewardTokens = rewardTokens_.length;
        IERC20 currentRewardToken;

        for (uint256 index; index < numRewardTokens; ) {
            currentRewardToken = rewardTokens_[index];
            currentRewardToken.approve(address(extender), type(uint256).max);
            _rewardTokens.push(currentRewardToken);

            unchecked {
                ++index;
            }
        }
    }

    function _amountAllocated(IAuraRewards auraPool_) internal view returns (uint256) {
        return auraPool_.balanceOf(address(this));
    }

    function _claimRewards(IAuraRewards rewards) internal {
        if (rewards.earned(address(this)) > 0) {
            rewards.getReward(address(this), true);
        }
    }
}
