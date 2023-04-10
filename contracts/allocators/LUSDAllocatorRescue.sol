pragma solidity ^0.8.10;

import "../interfaces/IAllocator.sol";
import "./interfaces/IWETH.sol";
import "../types/BaseAllocator.sol";

error LUSDAllocator_InputTooLarge();
error LUSDAllocator_TreasuryAddressZero();

/**
 *  Contract deploys LUSD from treasury into the liquity stabilty pool. Each update, rewards are harvested.
 *  The allocator stakes the LQTY rewards and sells part of the ETH rewards to stack more LUSD.
 *  This contract inherits BaseAllocator is and meant to be used with Treasury extender.
 */
contract LUSDAllocatorV2R is BaseAllocator {
    using SafeERC20 for IERC20;

    /* ======== STATE VARIABLES ======== */
    address public immutable wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public immutable lqtyTokenAddress = 0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D;

    /**
     * @notice tokens in AllocatorInitData should be [LUSD Address]
     * LUSD Address (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0)
     */
    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    // Send ETH to an address
    function sendETH(address to_) external {
        _onlyGuardian();

        payable(to_).transfer(address(this).balance);
    }

    // Send token to an address
    function sendToken(address token_, address to_) external {
        _onlyGuardian();

        IERC20(token_).safeTransfer(to_, IERC20(token_).balanceOf(address(this)));
    }

    /**
     *  @notice Need this because StabilityPool::withdrawFromSP() and LQTYStaking::stake() will send ETH here
     */
    receive() external payable {}

    /* ======== INTERNAL FUNCTIONS TO MATCH ALLOCATOR INTERFACE ======== */

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {}

    function deallocate(uint256[] memory amounts) public override {}

    function _deactivate(bool panic) internal override {}

    function _prepareMigration() internal override {
        // If for some reason there's an ETH balance, deposit to WETH
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) IWETH(wethAddress).deposit{value: ethBalance}();
    }

    /* ======== VIEW FUNCTIONS ======== */

    function amountAllocated(uint256 id) public view override returns (uint256) {}

    function rewardTokens() public view override returns (IERC20[] memory) {}

    // Keeping this in case something goes wrong and we need to migrate again
    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](2);
        utility[0] = IERC20(lqtyTokenAddress);
        utility[1] = IERC20(wethAddress);
        return utility;
    }

    function name() external view override returns (string memory) {
        return "LUSD Allocator Rescue";
    }
}
