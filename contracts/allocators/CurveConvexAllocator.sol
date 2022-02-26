// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
import "./interfaces/CurveInterfaces.sol";
import "./interfaces/ConvexInterfaces.sol";

struct ConvexTargetData {
    IConvexRewards pool;
    IERC20 lp;
    uint96 pid;
}

struct CurveTargetData {
    IERC20 lp;
    // coin id
    uint96 cid;
}

struct AllocatorTargetData {
    ConvexTargetData convex;
    CurveTargetData curve;
}

struct NewDepositData {
    AllocatorTargetData targets;
    // 0 is underlying and rest are reward tokens
    IERC20[] tokens;
}

contract CurveConvexAllocator is BaseAllocator {
    // constants and globals
    uint128 public constant LOSS_BELOW_THRESHOLD = 1;
    address public constant treasury = 0x9A315BdF513367C0377FB36545857d12e85813Ef;

    uint256 public slippage;
    uint256 public lossThreshold;

    // curve
    ICurveAddressProvider internal constant _curveAddressProvider =
        ICurveAddressProvider(0x0000000022D53366457F9d5E68Ec105046FC4383);
    ICurveDepositZap internal constant _zap3 = ICurveDepositZap(0xA79828DF1850E8a3A3064576f380D90aECDD3359);
    ICurveRegistry internal _registry;
    ICurveFactory internal _factory;

    // convex
    IConvex internal immutable _booster = IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);

    // other
    IERC20[] internal _rewardTokens;

    AllocatorTargetData[] internal _targets;

    constructor(AllocatorInitData memory data) BaseAllocator(data) {
        slippage = 9e17;
        lossThreshold = 1e19;
    }

    // base overrides
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 depositAmount;
        uint256 index = tokenIds[id];

        AllocatorTargetData memory target = _targets[index];

        IERC20 lpCurve = target.curve.lp;
        IERC20 underlying = _tokens[index];

        (address pool, uint256 poolTypeId) = _getCurvePoolData(address(lpCurve));

        // interactions
        // rewards
        _claimConvexRewards(target.convex.pool);

        // redeposit (reads here just in case rewards contain underlying)
        depositAmount = underlying.balanceOf(address(this));

        if (poolTypeId != 4) underlying.approve(address(pool), depositAmount);
        else underlying.approve(address(_zap3), depositAmount);

        depositAmount = _addCurveLiquidity(pool, target.curve.cid, depositAmount, poolTypeId);

        lpCurve.approve(address(_booster), depositAmount);
        _booster.depositAll(target.convex.pid, true);

        // effects
        uint256 received = _amountAllocated(pool, _booster, target.convex.pid, target.curve.cid, poolTypeId);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else {
            loss = uint128(last - received);
            // event will be fired that loss has happened but effect is negligible
            if (loss < lossThreshold) loss = LOSS_BELOW_THRESHOLD;
        }
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        // reads
        uint256 amount;
        uint256 lpCurveChange;

        // effects
        for (uint256 index; index < amounts.length; index++) {
            amount = amounts[index];

            if (amount > 0) {
                // only now do we really start
                // reads
                AllocatorTargetData memory target = _targets[index];
                IERC20 lpCurve = target.curve.lp;
                (address curvePool, uint256 poolTypeId) = _getCurvePoolData(address(lpCurve));

                if (amount < type(uint256).max)
                    lpCurveChange = _calcTokenAmount(curvePool, target.curve.cid, amount, false, poolTypeId);
                else lpCurveChange = target.convex.pool.balanceOf(address(this));

                // interactions
                target.convex.pool.withdrawAndUnwrap(lpCurveChange, false);

                if (poolTypeId != 4) lpCurve.approve(curvePool, lpCurveChange);
                else lpCurve.approve(address(_zap3), lpCurveChange);

                _removeCurveLiquidity(curvePool, target.curve.cid, amount, poolTypeId);
            }
        }
    }

    function _deactivate(bool panic) internal override {
        if (panic) {
            for (uint256 i; i < _targets.length; i++) {
                ConvexTargetData memory data = _targets[i].convex;
                data.pool.withdrawAllAndUnwrap(true);
                data.lp.transfer(address(treasury), data.lp.balanceOf(address(this)));
            }

            for (uint256 i; i < _rewardTokens.length; i++) {
                IERC20 rewardToken = _rewardTokens[i];
                rewardToken.transfer(address(treasury), rewardToken.balanceOf(address(this)));
            }
        }
    }

    function _prepareMigration() internal override {
        uint256 length = _targets.length;
        for (uint256 i; i < length; i++) {
            _targets[i].convex.pool.withdrawAllAndUnwrap(false);
            _claimConvexRewards(i);
        }
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 index = tokenIds[id];
        AllocatorTargetData memory target = _targets[index];
        (address pool, uint256 poolTypeId) = _getCurvePoolData(address(target.curve.lp));
        return _amountAllocated(pool, _booster, target.convex.pid, target.curve.cid, poolTypeId);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        return _rewardTokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        uint256 length = _targets.length;

        IERC20[] memory tokensUtility = new IERC20[](length);

        for (uint256 i; i < length; i++) {
            tokensUtility[i] = _targets[i].convex.lp;
        }

        return tokensUtility;
    }

    function name() external pure override returns (string memory) {
        return "CurveConvexAllocator";
    }

    function _activate() internal override {
        setRegistry();
        setFactory();
    }

    // specific

    function addDeposit(NewDepositData calldata data) external onlyGuardian {
        // reads
        uint256 length = data.tokens.length;

        // interactions
        data.tokens[0].approve(address(extender), type(uint256).max);
        data.targets.curve.lp.approve(address(extender), type(uint256).max);
        data.targets.convex.lp.approve(address(extender), type(uint256).max);

        // effects
        _targets.push(data.targets);
        _tokens.push(data.tokens[0]);

        _addRewardTokens(data.tokens, length);
    }

    function switchConvexPool(
        uint256 id,
        AllocatorTargetData calldata target,
        IERC20[] calldata newRewardTokens
    ) external onlyGuardian {
        // reads
        uint256 index = tokenIds[id];
        uint256[] memory inputArray = new uint256[](index + 1);
        (address pool, uint256 poolTypeId) = _getCurvePoolData(address(target.curve.lp));

        inputArray[index] = amountAllocated(id);

        // effects + interactions
        deallocate(inputArray);

        _addCurveLiquidity(pool, target.curve.cid, _tokens[index].balanceOf(address(this)), poolTypeId);

        _targets[index] = target;

        _addRewardTokens(newRewardTokens, newRewardTokens.length);
    }

    function setSlippage(uint256 slippageNew) external onlyGuardian {
        slippage = slippageNew;
    }

    function setLossThreshold(uint256 newLossThreshold) external onlyGuardian {
        lossThreshold = newLossThreshold;
    }

    function setRegistry() public onlyGuardian {
        _registry = ICurveRegistry(_curveAddressProvider.get_registry());
    }

    function setFactory() public onlyGuardian {
        _factory = ICurveFactory(_curveAddressProvider.get_address(3));
    }

    function _claimConvexRewards(uint256 index) internal {
        IConvexRewards rewards = _targets[index].convex.pool;
        _claimConvexRewards(rewards);
    }

    function _claimConvexRewards(IConvexRewards rewards) internal {
        if (rewards.earned(address(this)) > 0) {
            rewards.getReward();

            for (uint256 i; i < rewards.extraRewardsLength(); i++) {
                IConvexVirtualBalanceRewards extra = IConvexVirtualBalanceRewards(rewards.extraRewards(i));

                if (extra.earned(address(this)) > 0) {
                    extra.getReward();
                }
            }
        }
    }

    function _addRewardTokens(IERC20[] calldata newRewardTokens, uint256 length) internal {
        if (length > 0) {
            for (uint256 i = 1; i < length; i++) {
                // read
                IERC20 rewardToken = newRewardTokens[i];

                // checks
                if (rewardToken.allowance(address(this), address(extender)) == 0) {
                    // interaction
                    rewardToken.approve(address(extender), type(uint256).max);

                    // effect
                    _rewardTokens.push(rewardToken);
                }
            }
        }
    }

    function _addCurveLiquidity(
        address pool,
        uint256 cid,
        uint256 amount,
        uint256 poolTypeId
    ) internal returns (uint256) {
        ICurveStableSwapPool stableSwap = ICurveStableSwapPool(pool);

        if (poolTypeId == 2) {
            uint256[2] memory amounts;
            amounts[cid] = amount;
            return stableSwap.add_liquidity(amounts, (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18);
        } else if (poolTypeId == 3) {
            uint256[3] memory amounts;
            amounts[cid] = amount;
            return stableSwap.add_liquidity(amounts, (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18);
        } else {
            uint256[4] memory amounts;
            amounts[cid] = amount;
            if (poolTypeId == 5)
                return
                    stableSwap.add_liquidity(amounts, (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18);
            else
                return
                    _zap3.add_liquidity(
                        pool,
                        amounts,
                        (_zap3.calc_token_amount(pool, amounts, true) * slippage) / 1e18
                    );
        }
    }

    function _removeCurveLiquidity(
        address pool,
        uint128 cid,
        uint256 amount,
        uint256 poolTypeId
    ) internal returns (uint256) {
        ICurveStableSwapPool stableSwap = ICurveStableSwapPool(pool);

        if (poolTypeId == 2) {
            uint256[2] memory amounts;
            amounts[cid] = amount;
            return
                stableSwap.remove_liquidity_one_coin(
                    amount,
                    int128(cid),
                    (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18
                );
        } else if (poolTypeId == 3) {
            uint256[3] memory amounts;
            amounts[cid] = amount;
            return
                stableSwap.remove_liquidity_one_coin(
                    amount,
                    int128(cid),
                    (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18
                );
        } else {
            uint256[4] memory amounts;
            amounts[cid] = amount;
            if (poolTypeId == 5)
                return
                    stableSwap.remove_liquidity_one_coin(
                        amount,
                        int128(cid),
                        (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18
                    );
            else
                return
                    _zap3.remove_liquidity_one_coin(
                        pool,
                        amount,
                        int128(cid),
                        (_zap3.calc_token_amount(pool, amounts, true) * slippage) / 1e18
                    );
        }
    }

    function _amountAllocated(
        address pool,
        IConvex booster,
        uint256 pidConvex,
        uint128 cidCurve,
        uint256 poolTypeId
    ) internal view returns (uint256) {
        if (poolTypeId == 4)
            return
                ICurveMetapool(pool).calc_withdraw_one_coin(
                    _getConvexRewardPool(booster, pidConvex).balanceOf(address(this)),
                    0
                );
        else
            return
                ICurveStableSwapPool(pool).calc_withdraw_one_coin(
                    _getConvexRewardPool(booster, pidConvex).balanceOf(address(this)),
                    int128(cidCurve)
                );
    }

    function _getConvexRewardPool(IConvex booster, uint256 pid) internal view returns (IConvexRewards) {
        (, , , address rewards, , ) = booster.poolInfo(pid);
        return IConvexRewards(rewards);
    }

    function _calcTokenAmount(
        address pool,
        uint256 cidCurve,
        uint256 amount,
        bool deposit,
        uint256 poolTypeId
    ) internal view returns (uint256) {
        if (poolTypeId == 2) {
            uint256[2] memory amounts;
            amounts[cidCurve] = amount;
            return ICurveStableSwapPool(pool).calc_token_amount(amounts, deposit);
        } else if (poolTypeId == 3) {
            uint256[3] memory amounts;
            amounts[cidCurve] = amount;
            return ICurveStableSwapPool(pool).calc_token_amount(amounts, deposit);
        } else {
            uint256[4] memory amounts;
            amounts[cidCurve] = amount;
            if (poolTypeId == 5) return ICurveStableSwapPool(pool).calc_token_amount(amounts, deposit);
            else return _zap3.calc_token_amount(pool, amounts, deposit);
        }
    }

    function _getCurvePoolData(address lpCurve) internal view returns (address pool, uint256 poolTypeId) {
        // ok, try to find the pool in usual registry
        pool = _registry.get_pool_from_lp_token(address(lpCurve));

        if (pool == address(0)) {
            // no? then lp == pool
            pool = lpCurve;

            // ok try to read out if the pool is meta
            (, poolTypeId) = _factory.get_meta_n_coins(pool);

            // no? then get number of coins, but from this fn
            if (poolTypeId < 4) poolTypeId = _factory.get_n_coins(pool);

            // this is a 4 coin StableSwap pool, but not meta
            if (poolTypeId == 4) poolTypeId = 5;
        } else {
            // found it? ok, then get the number of usual coins
            poolTypeId = _registry.get_n_coins(pool)[1];

            // is it meta? if so don't change to 5 if 4
            if (!_registry.is_meta(pool)) {
                if (poolTypeId == 4) {
                    poolTypeId = 5;
                }
            }
        }
    }
}
