pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
import "./interfaces/CurveInterfaces.sol";
import "./interfaces/ConvexInterfaces.sol";

struct AllocatorTargetData {
    IConvexRewards pool;
    uint96 index;
}

struct NewDepositData {
    AllocatorTargetData targets;
    IERC20 token;
    IERC20 lpToken;
    IERC20[] rewardTokens;
}

contract CurveConvexAllocator is BaseAllocator {
    // constants
    uint256 public constant slippage = 9e17;

    // curve
    ICurveAddressProvider internal constant _curveAddressProvider =
        ICurveAddressProvider(0x0000000022D53366457F9d5E68Ec105046FC4383);
    ICurveDepositZap internal constant _zap3 = ICurveDepositZap(0xA79828DF1850E8a3A3064576f380D90aECDD3359);
    ICurveRegistry internal _registry;

    // convex
    IConvex internal immutable _booster = IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);

    // other
    IERC20[] internal _lpTokens;
    IERC20[] internal _rewardTokens;

    AllocatorTargetData[] internal _targets;

    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    // base overrides
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 index = tokenIds[id];
        uint256[4] memory fixedInputArray;
        fixedInputArray[_targets[index].index] = _tokens[index].balanceOf(address(this));

        // checks
        _onlyGuardian();

        // interactions
        _zapIntoCurve(_registry.get_pool_from_lp_token(address(_lpTokens[index])), fixedInputArray);
    }

    function deallocate(uint256[] memory amounts) public override {}

    function _deactivate(bool panic) internal override {}

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {}

    function rewardTokens() public view override returns (IERC20[] memory) {
        return _rewardTokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        return _lpTokens;
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
        uint256 length = data.rewardTokens.length;

        // checks
        _onlyGuardian();

        // interactions
        data.token.approve(address(extender), type(uint256).max);
        data.lpToken.approve(address(extender), type(uint256).max);

        // effects
        _targets.push(data.targets);

        _tokens.push(data.token);
        _lpTokens.push(data.lpToken);

        if (length > 0) {
            for (uint256 i; i < length; i++) {
                // read
                IERC20 rewardToken = data.rewardTokens[i];

                // interaction
                rewardToken.approve(address(extender), type(uint256).max);

                // effect
                _rewardTokens.push(rewardToken);
            }
        }
    }

    function switchConvexPool(
        uint256 id,
        IERC20 newLpToken,
        AllocatorTargetData calldata target
    ) external {
        // reads
        uint256[] memory inputArray = new uint256[](id + 1);
        uint256[4] memory fixedInputArray;
        uint256 index = tokenIds[id];

        inputArray[index] = amountAllocated(id);

        // checks
        _onlyGuardian();

        // effects + interactions
        deallocate(inputArray);

        fixedInputArray[target.index] = _tokens[index].balanceOf(address(this));

        _zapIntoCurve(_registry.get_pool_from_lp_token(address(newLpToken)), fixedInputArray);

        _targets[index] = target;
    }

    function setRegistry() public {
        _onlyGuardian();
        _registry = ICurveRegistry(_curveAddressProvider.get_registry());
    }

    function _zapIntoCurve(address pool, uint256[4] memory amounts) internal returns (uint256) {
        return _zap3.add_liquidity(pool, amounts, (_zap3.calc_token_amount(pool, amounts, true) * slippage) / 1e18);
    }
}
