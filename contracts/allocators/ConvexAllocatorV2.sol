pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
// curve
interface ICurveAddressProvider {
    function get_registry() external view returns (address);

    function get_address(uint256 id) external view returns (address);
}

interface ICurveRegistry {
    function get_pool_from_lp_token(address lp_token) external view returns (address);
}

interface ICurveDepositZap {
    function add_liquidity(
        address _pool,
        uint256[4] memory _deposit_amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);

    function remove_liquidity(
        address _pool,
        uint256 _burn_amount,
        uint256[4] memory _min_amounts
    ) external returns (uint256[] memory);

    function remove_liquidity_one_coin(
        address _pool,
        uint256 _burn_amount,
        int128 i,
        uint256 _min_amount,
        address receiver
    ) external returns (uint256);
}

// convex
interface IConvex {
    function deposit(
        uint256 _pid,
        uint256 _amount,
        bool _stake
    ) external returns (bool);

    function depositAll(uint256 _pid, bool _stake) external returns (bool);
}

interface IConvexRewards {
    function withdrawAndUnwrap(uint256 _amount, bool _claim) external returns (bool);

    function getReward() external returns (bool);

    function earned(address _account) external view returns (uint256);
}

struct AllocatorConvexData {
    IConvexRewards pool;
    uint96 index;
}

struct NewDepositData {
    IERC20[] underlyingTokens;
    IERC20[] rewardTokens;
    IConvexRewards pool;
    IERC20 lpToken;
}

contract CurveConvexAllocator is BaseAllocator {
    // curve
    ICurveAddressProvider internal constant _curveAddressProvider =
        ICurveAddressProvider(0x0000000022D53366457F9d5E68Ec105046FC4383);
    ICurveDepositZap internal constant _zap3 = ICurveDepositZap(0xA79828DF1850E8a3A3064576f380D90aECDD3359);
    ICurveRegistry public registry;

    // convex
    IConvex internal immutable _booster = IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    AllocatorConvexData[] internal _convexData;

    // other
    IERC20[] internal _lpTokens;
    IERC20[] internal _rewardTokens;

    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    // base overrides
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {}

    function deallocate(uint256[] memory amounts) public override {}

    function _deactivate(bool panic) internal override {}

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {}

    function rewardTokens() public view override returns (IERC20[] memory) {}

    function utilityTokens() public view override returns (IERC20[] memory) {}

    function name() external view override returns (string memory) {}

    function _activate() internal override {
        setRegistry();
    }

    // specific
    function addDeposit(NewDepositData calldata data) external {
        _onlyGuardian();

        uint256 length = data.underlyingTokens.length;

        if (length > 0) {
            for (uint256 i; i < length; i++) {
                _tokens.push(data.underlyingTokens[i]);
            }
        }

        length = data.rewardTokens.length;

        if (length > 0) {
            for (uint256 i; i < length; i++) {
                _rewardTokens.push(data.rewardTokens[i]);
            }
        }
    }

    function setRegistry() public {
        _onlyGuardian();
        registry = ICurveRegistry(_curveAddressProvider.get_registry());
    }
}
