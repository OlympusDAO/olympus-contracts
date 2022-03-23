pragma solidity ^0.8.10;

import "../types/BaseAllocator.sol";

import "./interfaces/ILockedCvx.sol";
import "./interfaces/ICrvDepositor.sol";
import "./interfaces/IRewardStaking.sol";

struct OperationData {
    ILockedCvx cvxLocker;
    uint88 spendRatio;
    bool relock;
    ICrvDepositor crvDeposit;
    IRewardStaking ccStaking; // cvxcrv
}

contract CVXAllocatorV2 is BaseAllocator {
    OperationData public opData;

    constructor(OperationData memory opDataArg, AllocatorInitData memory aData) BaseAllocator(aData) {
        opData = opDataArg;
        aData.tokens[0].approve(address(opDataArg.cvxLocker), type(uint256).max);
        aData.tokens[1].approve(address(opDataArg.crvDeposit), type(uint256).max);
        aData.tokens[2].approve(address(opDataArg.ccStaking), type(uint256).max);
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 index = tokenIds[id];

        IERC20 cvx = _tokens[0];
        IERC20 crv = _tokens[1];
        IERC20 cc = _tokens[2];

        OperationData memory operation = opData;
        ILockedCvx locker = operation.cvxLocker;
        IRewardStaking ccStaking = operation.ccStaking;

        // interactions
        if (_unlockable() > 0) locker.processExpiredLocks(operation.relock);
        if (_checkClaimableRewards(locker)) locker.getReward(address(this), true);
        if (ccStaking.earned(address(this)) > 0) ccStaking.getReward(address(this), true);

        uint256 bal = cvx.balanceOf(address(this));

        if (bal > 0) {
            locker.lock(address(this), bal, operation.spendRatio);
        }

        bal = crv.balanceOf(address(this));

        if (bal > 0) {
            operation.crvDeposit.deposit(bal, true);
        }

        bal = cc.balanceOf(address(this));

        if (bal > 0) {
            ccStaking.stake(bal);
        }

        uint256 former = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;
        uint256 current = _amountAllocated(operation, index);

        if (current >= former) gain = uint128(current - former);
        else loss = uint128(former - current);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        uint256 length = amounts.length;
        OperationData memory operation = opData;

        if (amounts[0] > 0)
            operation.cvxLocker.processExpiredLocks(false); // can only do full
        else if (amounts[2] > 0)
            operation.ccStaking.withdrawAndUnwrap( // need to check what it goes into
                amounts[2] == type(uint256).max ? operation.ccStaking.balanceOf(address(this)) : amounts[2],
                true
            );
    }

    function _deactivate(bool panic) internal override {
        if (panic) {
            uint256[] memory amounts = new uint256[](3);
            OperationData memory operation = opData;
            ILockedCvx cvxLocker = operation.cvxLocker;
            IRewardStaking ccStaking = operation.ccStaking;

            if (_unlockable() > 0) amounts[0] = 1;
            if (ccStaking.balanceOf(address(this)) > 0) amounts[2] = type(uint256).max;

            deallocate(amounts);
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1;
        amounts[2] = type(uint256).max;
        deallocate(amounts);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory tokens = new IERC20[](2);
        tokens[0] = _tokens[1];
        tokens[1] = _tokens[2];
        return tokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory tokens = new IERC20[](2);
        tokens[0] = _tokens[1];
        tokens[1] = _tokens[2];
        return tokens;
    }

    function name() external pure override returns (string memory) {
        return "CVXAllocatorV2";
    }

    function setOperationData(OperationData calldata newData) external onlyGuardian {
        opData = newData;
    }

    function setSpendRatio(uint88 ratio) external onlyGuardian {
        opData.spendRatio = ratio;
    }

    function setRelock(bool relock) external onlyGuardian {
        opData.relock = relock;
    }

    /// @notice Returns amounts allocated. NOTE: returns 0 for crv because it's being swapped into cvxcrv.
    /// Thus, crv loss limit should be type(uint256).max;
    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 index = tokenIds[id];
        OperationData memory operation = opData;
        return _amountAllocated(operation, index);
    }

    function _checkClaimableRewards(ILockedCvx locker) internal returns (bool) {
        ILockedCvx.EarnedData[] memory rewards = locker.claimableRewards(address(this));
        for (uint256 i; i < rewards.length; i++) {
            if (rewards[i].amount > 0) {
                return true;
            }
        }
        return false;
    }

    function _amountAllocated(OperationData memory operation, uint256 index) internal view returns (uint256) {
        if (index == 2) return operation.ccStaking.balanceOf(address(this));
        else if (index == 1) return 0;
        return operation.cvxLocker.lockedBalanceOf(address(this));
    }

    function _unlockable() internal view returns (uint256) {
        (, uint256 unlockable, , ) = opData.cvxLocker.lockedBalances(address(this));
        return unlockable;
    }
}
