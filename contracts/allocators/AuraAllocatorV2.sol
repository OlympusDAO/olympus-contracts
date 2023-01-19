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

    function lockedBalances(address _account) external view returns (uint256, uint256, uint256, LockedBalance[] memory);

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

    IERC20 internal immutable _aura = IERC20(0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF);

    IERC20 internal immutable _auraBal = IERC20(0x616e8BfA43F920657B3497DBf40D6b1A02D4608d);

    IAuraLocker internal immutable _locker = IAuraLocker(0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC);

    IAuraBalStaking internal immutable _abStaking = IAuraBalStaking(0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2);

    bool public shouldLock;

    constructor(AllocatorInitData memory data, address treasury_) BaseAllocator(data) {
        treasury = treasury_;
        _aura.approve(address(_locker), type(uint256).max);
        _auraBal.approve(address(_abStaking), type(uint256).max);
    }

    // ========= BASE OVERRIDES ========= //

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 tokenIndex = tokenIds[id];

        if (_unlockable() > 0) _locker.processExpiredLocks(shouldLock);
        if (_checkClaimableRewards()) _locker.getReward(address(this), false);
        if (_abStaking.earned(address(this)) > 0) _abStaking.getReward(address(this), true);

        uint256 _auraBalance = _aura.balanceOf(address(this));
        if (_auraBalance > 0 && shouldLock) _locker.lock(address(this), _auraBalance);

        uint256 _auraBalBalance = _auraBal.balanceOf(address(this));
        if (_auraBalBalance > 0) _abStaking.stake(_auraBalBalance);

        uint256 received = _amountAllocated(tokenIndex);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        if (amounts[0] > 0) _locker.processExpiredLocks(false);
        if (amounts[1] > 0) _abStaking.withdraw(amounts[1], true); // does this need to be withdrawAndUnwrap?
    }

    function _deactivate(bool panic) internal override {
        uint256[] memory amounts = new uint256[](2);

        if (_unlockable() > 0) amounts[0] = 1;
        if (_abStaking.balanceOf(address(this)) > 0) amounts[1] = _abStaking.balanceOf(address(this));

        deallocate(amounts);

        if (panic) {
            _aura.transfer(treasury, _aura.balanceOf(address(this)));
            _auraBal.transfer(treasury, _auraBal.balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1;
        amounts[1] = _abStaking.balanceOf(address(this));
        deallocate(amounts);
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 tokenIndex = tokenIds[id];
        return _amountAllocated(tokenIndex);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory tokens = new IERC20[](1);
        tokens[0] = _auraBal;
        return tokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory tokens = new IERC20[](1);
        tokens[0] = _auraBal;
        return tokens;
    }

    function name() external pure override returns (string memory) {
        return "AuraAllocatorV2";
    }

    // ========= ALLOCATOR SPECIFIC FUNCTIONS ========= //

    function delegate(address delegatee_) external onlyGuardian {
        _locker.delegate(delegatee_);
    }

    function setShouldLock(bool shouldLock_) external onlyGuardian {
        shouldLock = shouldLock_;
    }

    // ========= INTERNAL FUNCTIONS ========= //

    function _unlockable() internal view returns (uint256) {
        (, uint256 unlockable, , ) = _locker.lockedBalances(address(this));
        return unlockable;
    }

    function _checkClaimableRewards() internal view returns (bool) {
        IAuraLocker.EarnedData[] memory rewards = _locker.claimableRewards(address(this));
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
            (uint256 total, , , ) = _locker.lockedBalances(address(this));
            return total;
        } else {
            return _abStaking.balanceOf(address(this));
        }
    }
}