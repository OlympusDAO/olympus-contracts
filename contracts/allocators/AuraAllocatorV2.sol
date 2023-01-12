// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

// Import types
import {BaseAllocator} from "../types/BaseAllocator.sol";

// Import interfaces
import {IERC20} from "../interfaces/IERC20.sol";


// Define Aura interfaces
interface IAuraLocker {
    function delegate(address _delegatee) external;

    function lock(address _account, uint256 _amount) external;

    function getReward(address _account) external;

    function processExpiredLocks(bool _relock) external;
}

interface IAuraBalStaking {
    function earned(address _account) external view returns (uint256);

    function getReward(address _account, bool _claimExtras) external;

    function stake(uint256 _amount) external;

    function withdraw(uint256 _amount, bool _claim) external;
}

contract AuraAllocatorV2 is BaseAllocator {
    address public immutable treasury;

    IERC20[] internal _rewardTokens;

    IERC20 internal immutable _aura = IERC20(0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF);

    IERC20 internal immutable _auraBal = IERC20(0x616e8BfA43F920657B3497DBf40D6b1A02D4608d);

    IAuraLocker internal immutable _locker = IAuraLocker(0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC);

    IAuraBalStaking internal immutable _abStaking = IAuraBalStaking(0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2);

    bool internal _shouldLock;

    constructor(AllocatorInitData memory data, address treasury_) BaseAllocator(data) {
        treasury = treasury_;
        _aura.approve(address(_locker), type(uint256).max);
    }

    // ========= BASE OVERRIDES ========= //

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 tokenIndex = tokenIds[id];

        if (_unlockable() > 0) _locker.processExpiredLocks(_shouldLock);
        if (_checkClaimableRewards(_locker)) _locker.getReward(address(this), true);
        if (_abStaking.earned(address(this)) > 0) _abStaking.getReward(address(this), true);

        uint256 _auraBalance = _aura.balanceOf(address(this));
        if (_auraBalance > 0 && _shouldLock) _locker.lock(address(this), _auraBalance);

        uint256 _auraBalBalance = _auraBal.balanceOf(address(this));
        if (_auraBalBalance > 0) _abStaking.stake(_auraBalBalance);

        uint256 received = _amountAllocated(id);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id);

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }
}