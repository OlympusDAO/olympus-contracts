// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

// Import types
import {BaseAllocator, AllocatorInitData} from "../types/BaseAllocator.sol";

// Import interfaces
import {IERC20} from "../interfaces/IERC20.sol";

import "hardhat/console.sol";

// Define Aura interfaces
interface IAuraLocker {
    struct EarnedData {
        address token;
        uint256 amount;
    }

    struct LockedBalance {
        uint112 amount;
        uint32 unlockTime;
    }

    function balanceOf(address _account) external view returns (uint256);

    function delegate(address _delegatee) external;

    function claimableRewards(address _account) external view returns (EarnedData[] memory);

    function lock(address _account, uint256 _amount) external;

    function lockedBalances(address _account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            LockedBalance[] memory
        );

    function getReward(address _account, bool _stake) external;

    function processExpiredLocks(bool _relock) external;
}

interface IAuraBalStaking {
    function balanceOf(address _account) external view returns (uint256);

    function earned(address _account) external view returns (uint256);

    function getReward(address _account, bool _claimExtras) external;

    function stake(uint256 _amount) external;

    function withdraw(uint256 _amount, bool _claim) external;
}

contract AuraAllocatorV2 is BaseAllocator {
    address public immutable treasury;

    IERC20 public immutable aura;

    IERC20 public immutable auraBal;

    IERC20[] internal _rewardTokens;

    IAuraLocker public locker;

    IAuraBalStaking public abStaking;

    bool public shouldLock;

    constructor(
        AllocatorInitData memory data,
        address treasury_,
        address aura_,
        address auraBal_,
        address locker_,
        address abStaking_
    ) BaseAllocator(data) {
        treasury = treasury_;
        aura = IERC20(aura_);
        auraBal = IERC20(auraBal_);
        locker = IAuraLocker(locker_);
        abStaking = IAuraBalStaking(abStaking_);

        aura.approve(address(locker), type(uint256).max);
        auraBal.approve(address(abStaking), type(uint256).max);
        auraBal.approve(address(extender), type(uint256).max);

        _rewardTokens.push(auraBal);
    }

    // ========= BASE OVERRIDES ========= //

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 tokenIndex = tokenIds[id];

        if (_unlockable() > 0) locker.processExpiredLocks(shouldLock);
        if (_checkClaimableRewards()) locker.getReward(address(this), false);
        if (abStaking.earned(address(this)) > 0) abStaking.getReward(address(this), true);

        uint256 auraBalance = aura.balanceOf(address(this));
        if (auraBalance > 0 && shouldLock) locker.lock(address(this), auraBalance);

        uint256 auraBalBalance = auraBal.balanceOf(address(this));
        if (auraBalBalance > 0) abStaking.stake(auraBalBalance);

        uint256 received = _amountAllocated(tokenIndex);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        if (amounts[0] > 0) locker.processExpiredLocks(false);
        if (amounts[1] > 0) abStaking.withdraw(amounts[1], true); // does this need to be withdrawAndUnwrap?
    }

    function _deactivate(bool panic) internal override {
        uint256[] memory amounts = new uint256[](2);

        if (_unlockable() > 0) amounts[0] = 1;
        if (abStaking.balanceOf(address(this)) > 0) amounts[1] = abStaking.balanceOf(address(this));

        deallocate(amounts);

        if (panic) {
            aura.transfer(treasury, aura.balanceOf(address(this)));

            // auraBal should be included in the reward tokens
            uint256 numRewardTokens = _rewardTokens.length;
            for (uint256 i; i < numRewardTokens; ) {
                IERC20 token = _rewardTokens[i];
                uint256 tokenBalance = token.balanceOf(address(this));
                if (tokenBalance > 0) token.transfer(treasury, tokenBalance);

                unchecked {
                    ++i;
                }
            }
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1;
        amounts[1] = abStaking.balanceOf(address(this));
        deallocate(amounts);
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 tokenIndex = tokenIds[id];
        return _amountAllocated(tokenIndex);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory tokens = new IERC20[](1);
        tokens[0] = auraBal;
        return tokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory tokens = new IERC20[](1);
        tokens[0] = auraBal;
        return tokens;
    }

    function name() external pure override returns (string memory) {
        return "AuraAllocatorV2";
    }

    // ========= ALLOCATOR SPECIFIC FUNCTIONS ========= //

    function addRewardToken(address token_) external onlyGuardian {
        IERC20 token = IERC20(token_);
        token.approve(address(extender), type(uint256).max);

        _rewardTokens.push(token);
    }

    function delegate(address delegatee_) external onlyGuardian {
        locker.delegate(delegatee_);
    }

    function setShouldLock(bool shouldLock_) external onlyGuardian {
        shouldLock = shouldLock_;
    }

    function setLocker(address locker_) external onlyGuardian {
        aura.approve(address(locker), 0);
        aura.approve(address(locker_), type(uint256).max);

        locker = IAuraLocker(locker_);
    }

    function setAbStaking(address abStaking_) external onlyGuardian {
        auraBal.approve(address(abStaking), 0);
        auraBal.approve(address(abStaking_), type(uint256).max);

        abStaking = IAuraBalStaking(abStaking_);
    }

    // ========= INTERNAL FUNCTIONS ========= //

    function _unlockable() internal view returns (uint256) {
        (, uint256 unlockable, , ) = locker.lockedBalances(address(this));
        return unlockable;
    }

    function _checkClaimableRewards() internal view returns (bool) {
        IAuraLocker.EarnedData[] memory rewards = locker.claimableRewards(address(this));
        uint256 numRewards = rewards.length;

        for (uint256 i; i < numRewards; ) {
            if (rewards[i].amount > 0) return true;

            unchecked {
                ++i;
            }
        }

        return false;
    }

    function _amountAllocated(uint256 id) internal view returns (uint256) {
        if (id == 0) {
            (uint256 total, , , ) = locker.lockedBalances(address(this));
            return total;
        } else {
            return abStaking.balanceOf(address(this));
        }
    }
}
