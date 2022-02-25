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

import "hardhat/console.sol";

contract CurveConvexAllocator is BaseAllocator {
    // constants and globals
    address public constant treasury = 0x9A315BdF513367C0377FB36545857d12e85813Ef;
    uint256 public slippage;

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
    }

    // base overrides
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 depositAmount;
        uint256 index = tokenIds[id];

        AllocatorTargetData memory target = _targets[index];

        IERC20 lpCurve = target.curve.lp;
        IERC20 underlying = _tokens[index];

        (address pool, uint256 nCoins) = _getCurvePoolData(address(lpCurve));

        // checks
        _onlyGuardian();

        // interactions
        // rewards
        IConvexRewards rewards = target.convex.pool;
        rewards.getReward();

        for (uint256 i; i < rewards.extraRewardsLength(); i++) {
            IConvexVirtualBalanceRewards extras = IConvexVirtualBalanceRewards(rewards.extraRewards(i));
            if (extras.earned(address(this)) > 0) {
                extras.getReward();
            }
        }

        // redeposit (reads here just in case rewards contain underlying)
        depositAmount = underlying.balanceOf(address(this));

        if (nCoins < 4) underlying.approve(address(pool), depositAmount);
        else underlying.approve(address(_zap3), depositAmount);

        depositAmount = _addCurveLiquidity(pool, target.curve.cid, depositAmount, nCoins);

        lpCurve.approve(address(_booster), depositAmount);
        _booster.depositAll(target.convex.pid, true);

        // effects
        uint256 received = _amountAllocated(pool, _booster, target.convex.pid, target.curve.cid, nCoins);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }

    function deallocate(uint256[] memory amounts) public override {
        // reads
        uint256 amount;
        uint256 lpCurveChange;

        // checks
        _onlyGuardian();

        for (uint256 index; index < amounts.length; index++) {
            amount = amounts[index];

            if (amount > 0) {
                // only now do we really start
                // reads
                AllocatorTargetData memory target = _targets[index];
                IERC20 lpCurve = target.curve.lp;
                (address curvePool, uint256 nCoins) = _getCurvePoolData(address(lpCurve));

                if (amount < type(uint256).max) {
                    lpCurveChange = _calcTokenAmounts(curvePool, target.curve.cid, amount, false, nCoins);
                } else {
                    lpCurveChange = target.convex.pool.balanceOf(address(this));
                }

                // interactions
                // check if approve necessary
                target.convex.pool.withdrawAndUnwrap(lpCurveChange, false);

                lpCurve.approve(address(_zap3), lpCurveChange);

                _removeCurveLiquidity(curvePool, target.curve.cid, amount, nCoins);
            }
        }
    }

    function _deactivate(bool panic) internal override {
        uint256 length = _targets.length;

        if (status == AllocatorStatus.ACTIVATED) {
            uint256[] memory inputArray = new uint256[](length);

            for (uint256 i; i < length; i++) {
                inputArray[i] = type(uint256).max;
            }

            deallocate(inputArray);
        }

        if (panic) {
            for (uint256 i; i < length; i++) {
                IERC20 token = _tokens[i];
                token.transfer(address(treasury), token.balanceOf(address(this)));
            }

            for (uint256 i; i < _rewardTokens.length; i++) {
                IERC20 rewardToken = _rewardTokens[i];
                rewardToken.transfer(address(treasury), rewardToken.balanceOf(address(this)));
            }
        }
    }

    function _prepareMigration() internal override {
        for (uint256 i; i < _targets.length; i++) {
            _targets[i].convex.pool.withdrawAllAndUnwrap(true);
        }
        _claimAllRewards();
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 index = tokenIds[id];
        AllocatorTargetData memory target = _targets[index];
        (address pool, uint256 nCoins) = _getCurvePoolData(address(target.curve.lp));
        return _amountAllocated(pool, _booster, target.convex.pid, target.curve.cid, nCoins);
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
    function addDeposit(NewDepositData calldata data) external {
        // reads
        uint256 length = data.tokens.length;

        // checks
        _onlyGuardian();

        // interactions
        data.tokens[0].approve(address(extender), type(uint256).max);
        data.targets.curve.lp.approve(address(extender), type(uint256).max);
        data.targets.convex.lp.approve(address(extender), type(uint256).max);

        // effects
        _targets.push(data.targets);
        _tokens.push(data.tokens[0]);

        if (length > 0) {
            for (uint256 i = 1; i < length; i++) {
                // read
                IERC20 rewardToken = data.tokens[i];

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

    function switchConvexPool(
        uint256 id,
        IERC20 newLpToken,
        AllocatorTargetData calldata target
    ) external {
        // reads
        uint256 index = tokenIds[id];
        uint256[] memory inputArray = new uint256[](index + 1);
        (address pool, uint256 nCoins) = _getCurvePoolData(address(newLpToken));

        inputArray[index] = amountAllocated(id);

        // checks
        _onlyGuardian();

        // effects + interactions
        deallocate(inputArray);

        _addCurveLiquidity(pool, target.curve.cid, _tokens[index].balanceOf(address(this)), nCoins);

        _targets[index] = target;
    }

    function setSlippage(uint256 slippageNew) external {
        _onlyGuardian();
        slippage = slippageNew;
    }

    function setRegistry() public {
        _onlyGuardian();
        _registry = ICurveRegistry(_curveAddressProvider.get_registry());
    }

    function setFactory() public {
        _onlyGuardian();
        _factory = ICurveFactory(_curveAddressProvider.get_address(3));
    }

    function _claimAllRewards() internal {
        for (uint256 i; i < _targets.length; i++) {
            AllocatorTargetData memory target = _targets[i];
            IConvexRewards rewards = target.convex.pool;

            // two tokens can have the same reward pool
            if (rewards.earned(address(this)) > 0) {
                rewards.getReward();

                for (uint256 j; j < rewards.extraRewardsLength(); i++) {
                    IConvexVirtualBalanceRewards(rewards.extraRewards(j)).getReward();
                }
            }
        }
    }

    function _getConvexRewardPool(IConvex booster, uint256 pid) internal view returns (IConvexRewards) {
        (, , , address rewards, , ) = booster.poolInfo(pid);
        return IConvexRewards(rewards);
    }

    function _amountAllocated(
        address pool,
        IConvex booster,
        uint256 pidConvex,
        uint256 cidCurve,
        uint256 nCoins
    ) internal view returns (uint256) {
        if (nCoins == 4)
            return
                ICurveMetapool(pool).calc_withdraw_one_coin(
                    _getConvexRewardPool(booster, pidConvex).balanceOf(address(this)),
                    0
                );
        else
            return
                ICurveStableSwapPool(pool).calc_withdraw_one_coin(
                    _getConvexRewardPool(booster, pidConvex).balanceOf(address(this)),
                    int128(int256(cidCurve))
                );
    }

    function _addCurveLiquidity(
        address pool,
        uint256 cid,
        uint256 amount,
        uint256 nCoins
    ) internal returns (uint256) {
        if (nCoins == 2) {
            uint256[2] memory amounts;
            amounts[cid] = amount;
            return _addCurveLiquidity(pool, amounts);
        } else if (nCoins == 3) {
            uint256[3] memory amounts;
            amounts[cid] = amount;
            return _addCurveLiquidity(pool, amounts);
        } else {
            uint256[4] memory amounts;
            amounts[cid] = amount;
            return _addCurveLiquidity(pool, amounts);
        }
    }

    function _addCurveLiquidity(address pool, uint256[2] memory amounts) internal returns (uint256) {
        ICurveStableSwapPool stableSwap = ICurveStableSwapPool(pool);
        return stableSwap.add_liquidity(amounts, (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18);
    }

    function _addCurveLiquidity(address pool, uint256[3] memory amounts) internal returns (uint256) {
        ICurveStableSwapPool stableSwap = ICurveStableSwapPool(pool);
        return stableSwap.add_liquidity(amounts, (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18);
    }

    function _addCurveLiquidity(address pool, uint256[4] memory amounts) internal returns (uint256) {
        return _zap3.add_liquidity(pool, amounts, (_zap3.calc_token_amount(pool, amounts, true) * slippage) / 1e18);
    }

    function _removeCurveLiquidity(
        address pool,
        uint256 cid,
        uint256 amount,
        uint256 nCoins
    ) internal returns (uint256) {
        if (nCoins == 2) {
            ICurveStableSwapPool stableSwap = ICurveStableSwapPool(pool);
            uint256[2] memory amounts;
            amounts[cid] = amount;
            return
                stableSwap.remove_liquidity_one_coin(
                    amount,
                    int128(int256(cid)),
                    (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18
                );
        } else if (nCoins == 3) {
            ICurveStableSwapPool stableSwap = ICurveStableSwapPool(pool);
            uint256[3] memory amounts;
            amounts[cid] = amount;
            return
                stableSwap.remove_liquidity_one_coin(
                    amount,
                    int128(int256(cid)),
                    (stableSwap.calc_token_amount(amounts, true) * slippage) / 1e18
                );
        } else {
            uint256[4] memory amounts;
            amounts[cid] = amount;
            return
                _zap3.remove_liquidity_one_coin(
                    pool,
                    amount,
                    int128(int256(cid)),
                    (_zap3.calc_token_amount(pool, amounts, true) * slippage) / 1e18
                );
        }
    }

    function _calcTokenAmounts(
        address pool,
        uint256 cidCurve,
        uint256 amount,
        bool deposit,
        uint256 nCoins
    ) internal view returns (uint256) {
        if (nCoins == 2) {
            uint256[2] memory amounts;
            amounts[cidCurve] = amount;
            return ICurveStableSwapPool(pool).calc_token_amount(amounts, deposit);
        } else if (nCoins == 3) {
            uint256[3] memory amounts;
            amounts[cidCurve] = amount;
            return ICurveStableSwapPool(pool).calc_token_amount(amounts, deposit);
        } else {
            uint256[4] memory amounts;
            amounts[cidCurve] = amount;
            return _zap3.calc_token_amount(pool, amounts, deposit);
        }
    }

    function _getCurvePoolData(address lpCurve) internal view returns (address pool, uint256 nCoins) {
        pool = _registry.get_pool_from_lp_token(address(lpCurve));

        if (pool == address(0)) {
            pool = lpCurve;

            (, nCoins) = _factory.get_meta_n_coins(pool);

            if (nCoins < 4) nCoins = _factory.get_n_coins(pool);
        } else {
            nCoins = _registry.get_n_coins(pool)[1];
        }
    }
}
