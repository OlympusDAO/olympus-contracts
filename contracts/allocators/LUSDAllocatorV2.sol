pragma solidity ^0.8.10;

import "../interfaces/IAllocator.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/LiquityInterfaces.sol";
import "../types/BaseAllocator.sol";

contract LUSDAllocatorV2 is BaseAllocator {
    address public constant LUSD = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    uint128 public gains;
    uint128 public losses;

    event PanicTriggered();
    event Deposit(address indexed dst, uint256 amount);

    /* ======== STATE VARIABLES ======== */
    IStabilityPool immutable lusdStabilityPool;
    ILQTYStaking immutable lqtyStaking;
    IWETH immutable weth;
    ISwapRouter immutable swapRouter;
    ITreasury public treasury;

    uint256 public constant FEE_PRECISION = 1e6;
    uint256 public constant POOL_FEE_MAX = 10000;
    /**
     * @notice The target percent of eth to swap to LUSD at uniswap.  divide by 1e6 to get actual value.
     * Examples:
     * 500000 => 500000 / 1e6 = 0.50 = 50%
     * 330000 => 330000 / 1e6 = 0.33 = 33%
     */
    uint256 public ethToLUSDRatio = 330000; // 33% of ETH to LUSD
    /**
     * @notice poolFee parameter for uniswap swaprouter, divide by 1e6 to get the actual value.  See https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps#calling-the-function-1
     * Maximum allowed value is 10000 (1%)
     * Examples:
     * poolFee =  3000 =>  3000 / 1e6 = 0.003 = 0.3%
     * poolFee = 10000 => 10000 / 1e6 =  0.01 = 1.0%
     */
    uint256 public poolFee = 3000; // Init the uniswap pool fee to 0.3%

    address public hopTokenAddress; //Initially DAI, could potentially be USDC

    // TODO(zx): I don't think we care about front-end because we're our own frontend.
    address public frontEndAddress; // frontEndAddress for potential liquity rewards
    address public lusdTokenAddress; // LUSD Address (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0)
    address public lqtyTokenAddress; // LQTY Address (0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D)  from https://github.com/liquity/dev/blob/a12f8b737d765bfee6e1bfcf8bf7ef155c814e1e/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L61

    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    /* ======== CONFIGURE FUNCTIONS for Guardian only ======== */
    function setEthToLUSDRatio(uint256 _ethToLUSDRatio) external {
        _onlyGuardian();
        require(_ethToLUSDRatio <= FEE_PRECISION, "Value must be between 0 and 1e6");
        ethToLUSDRatio = _ethToLUSDRatio;
    }

    function setPoolFee(uint256 _poolFee) external {
        _onlyGuardian();
        require(_poolFee <= POOL_FEE_MAX, "Value must be between 0 and 10000");
        poolFee = _poolFee;
    }

    function setHopTokenAddress(address _hopTokenAddress) external {
        _onlyGuardian();
        hopTokenAddress = _hopTokenAddress;
    }

    /**
     *  @notice setsFrontEndAddress for Stability pool rewards
     *  @param _frontEndAddress address
     */
    function setFrontEndAddress(address _frontEndAddress) external {
        _onlyGuardian();
        frontEndAddress = _frontEndAddress;
    }

    function updateTreasury() public {
        _onlyGuardian();
        require(authority.vault() != address(0), "Zero address: Vault");
        require(address(authority.vault()) != address(treasury), "No change");
        treasury = ITreasury(authority.vault());
    }



    function setGL(uint128 gain, uint128 loss) public {
        gains = gain;
        losses = loss;
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        gain = gains;
        loss = losses;
    }

    function deallocate(uint256[] memory amounts) public override {}

    function _deactivate(bool panic) internal override {
        if (panic) emit PanicTriggered();
    }

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {
        return _tokens[id].balanceOf(address(this));
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory coin = new IERC20[](1);
        coin[0] = IERC20(DAI);
        return coin;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory coin = new IERC20[](1);
        coin[0] = IERC20(DAI);
        return coin;
    }

    function name() external view override returns (string memory) {
        return "SimpleFraxAllocator";
    }
}