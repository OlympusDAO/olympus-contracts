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
    address public constant treasury = 0x9A315BdF513367C0377FB36545857d12e85813Ef;
    uint256 public slippage;

    // curve
    ICurveAddressProvider internal constant _curveAddressProvider =
        ICurveAddressProvider(0x0000000022D53366457F9d5E68Ec105046FC4383);
    ICurveDepositZap internal constant _zap3 = ICurveDepositZap(0xA79828DF1850E8a3A3064576f380D90aECDD3359);
    ICurveRegistry internal _registry;

    // convex
    IConvex internal immutable _booster = IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);

    // other
    IERC20[] internal _rewardTokens;

    AllocatorTargetData[] internal _targets;

    constructor(AllocatorInitData memory data) BaseAllocator(data) {
        slippage = 6e17;
    }

    // base overrides
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256[4] memory fixedInputArray;
        uint256 depositAmount;
        uint256 index = tokenIds[id];

        AllocatorTargetData memory target = _targets[index];

        IERC20 lpCurve = target.curve.lp;
        IERC20 underlying = _tokens[index];

        address pool = _registry.get_pool_from_lp_token(address(lpCurve));

        // checks
        _onlyGuardian();

        // interactions
        // rewards
        IConvexRewards rewards = target.convex.pool;
        rewards.getReward();

        for (uint256 i; i < rewards.extraRewardsLength(); i++) {
	    IConvexVirtualBalanceRewards extras = IConvexVirtualBalanceRewards(rewards.extraRewards(i));
	    if(extras.earned(address(this)) > 0) {
                extras.getReward();
	    }
        }

        // redeposit (reads here just in case rewards contain underlying)
        depositAmount = underlying.balanceOf(address(this));
        fixedInputArray[target.curve.cid] = depositAmount;

        underlying.approve(address(_zap3), depositAmount);
        depositAmount = _zapIntoCurve(pool, fixedInputArray);

        lpCurve.approve(address(_booster), depositAmount);
        _booster.depositAll(target.convex.pid, true);

        // effects
        uint256 received = _amountAllocated(ICurvePool(pool), _booster, target.convex.pid, target.curve.cid);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (received >= last) gain = uint128(received - last);
        else loss = uint128(last - received);
    }

    function deallocate(uint256[] memory amounts) public override {
        // reads
        uint256[4] memory fixedInputArray;
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
                address curvePool = _registry.get_pool_from_lp_token(address(lpCurve));

                if (amount < type(uint256).max) {
                    fixedInputArray[target.curve.cid] = amount;
                    lpCurveChange = _zap3.calc_token_amount(curvePool, fixedInputArray, false);
                } else {
                    lpCurveChange = target.convex.pool.balanceOf(address(this));
                }

                // interactions
                // check if approve necessary
                target.convex.pool.withdrawAndUnwrap(lpCurveChange, false);

                lpCurve.approve(address(_zap3), lpCurveChange);
                _zap3.remove_liquidity_one_coin(
                    curvePool,
                    lpCurveChange,
                    int128(int96(target.curve.cid)),
                    (amount * slippage) / 1e18
                );
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
        return
            _amountAllocated(
                ICurvePool(_registry.get_pool_from_lp_token(address(target.curve.lp))),
                _booster,
                target.convex.pid,
                target.curve.cid
            );
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
        uint256[4] memory fixedInputArray;

        inputArray[index] = amountAllocated(id);

        // checks
        _onlyGuardian();

        // effects + interactions
        deallocate(inputArray);

        fixedInputArray[target.curve.cid] = _tokens[index].balanceOf(address(this));

        _zapIntoCurve(_registry.get_pool_from_lp_token(address(newLpToken)), fixedInputArray);

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

    function _zapIntoCurve(address pool, uint256[4] memory amounts) internal returns (uint256) {
        return _zap3.add_liquidity(pool, amounts, (_zap3.calc_token_amount(pool, amounts, true) * slippage) / 1e18);
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

    function _amountAllocated(
        ICurvePool pool,
        IConvex booster,
        uint256 pidConvex,
        uint256 cidCurve
    ) internal view returns (uint256) {
        return
            pool.calc_withdraw_one_coin(
                _getConvexRewardPool(booster, pidConvex).balanceOf(address(this)),
                int128(int256(cidCurve))
            );
    }

    function _getConvexRewardPool(IConvex booster, uint256 pid) internal view returns (IConvexRewards) {
        (, , , address rewards, , ) = booster.poolInfo(pid);
        return IConvexRewards(rewards);
    }
}
