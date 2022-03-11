// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
interface IBtrflyStaking {
    function claim(address recipient_) external;

    function unstake(uint256 amount_, bool trigger_) external;

    // just for testing
    function rebase() external;
}

interface IBtrflyStakingHelper {
    function stake(uint256 amount_) external;
}

error BtrflyAllocator_InvalidAddress();

contract BtrflyAllocator is BaseAllocator {
    using SafeERC20 for IERC20;

    address public treasury;

    IERC20 public xBtrfly;
    IBtrflyStaking public staking;
    IBtrflyStakingHelper public stakingHelper;

    constructor(
        AllocatorInitData memory data,
        address treasury_,
        address xBtrfly_,
        address staking_,
        address stakingHelper_
    ) BaseAllocator(data) {
        if (treasury_ == address(0) || xBtrfly_ == address(0) || staking_ == address(0) || stakingHelper_ == address(0))
            revert BtrflyAllocator_InvalidAddress();

        treasury = treasury_;
        xBtrfly = IERC20(xBtrfly_);
        staking = IBtrflyStaking(staking_);
        stakingHelper = IBtrflyStakingHelper(stakingHelper_);

        IERC20(data.tokens[0]).safeApprove(stakingHelper_, type(uint256).max);
        xBtrfly.safeApprove(staking_, type(uint256).max);
    }

    /*************************************
     * Allocator Operational Functions
     *************************************/

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // Get BTRFLY balance
        uint256 balance = _tokens[0].balanceOf(address(this));

        if (balance > 0) {
            stakingHelper.stake(balance);
        }

        uint256 xBalance = xBtrfly.balanceOf(address(this));
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (xBalance >= last) gain = uint128(xBalance - last);
        else loss = uint128(last - xBalance);
    }

    // Should only ever have a single element in amounts
    function deallocate(uint256[] memory amounts) public override {
        _onlyGuardian();

        if (amounts[0] > 0) {
            staking.unstake(amounts[0], false);
        }
    }

    function _deactivate(bool panic) internal override {
        uint256 xBalance = xBtrfly.balanceOf(address(this));
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = xBalance;

        deallocate(amounts);

        if (panic) {
            _tokens[0].transfer(treasury, _tokens[0].balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {}

    /************************
     * View Functions
     ************************/

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 xBalance = xBtrfly.balanceOf(address(this));
        uint256 balance = _tokens[0].balanceOf(address(this));

        return xBalance + balance;
    }

    function rewardTokens() public pure override returns (IERC20[] memory) {
        IERC20[] memory empty = new IERC20[](0);
        return empty;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](1);
        utility[0] = xBtrfly;

        return utility;
    }

    function name() external pure override returns (string memory) {
        return "BtrflyAllocator";
    }

    // helper
    function callRebase() public {
        staking.rebase();
    }
}
