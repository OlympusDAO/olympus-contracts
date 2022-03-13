// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
interface ILobiStaking {
    function unstake(uint256 amount_, bool trigger_) external;

    // just for testing
    function rebase() external;
}

interface ILobiStakingHelper {
    function stake(uint256 amount_, address recipient_) external;
}

error LobiAllocator_InvalidAddress();

contract LobiAllocator is BaseAllocator {
    using SafeERC20 for IERC20;

    address public treasury;

    IERC20 public sLobi;
    ILobiStaking public staking;
    ILobiStakingHelper public stakingHelper;

    constructor(
        AllocatorInitData memory data,
        address treasury_,
        address sLobi_,
        address staking_,
        address stakingHelper_
    ) BaseAllocator(data) {
        if (treasury_ == address(0) || sLobi_ == address(0) || staking_ == address(0) || stakingHelper_ == address(0))
            revert LobiAllocator_InvalidAddress();

        treasury = treasury_;
        sLobi = IERC20(sLobi_);
        staking = ILobiStaking(staking_);
        stakingHelper = ILobiStakingHelper(stakingHelper_);

        IERC20(data.tokens[0]).safeApprove(stakingHelper_, type(uint256).max);
        sLobi.safeApprove(staking_, type(uint256).max);
    }

    /*************************************
     * Allocator Operational Functions
     *************************************/

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // Get LOBI balance
        uint256 balance = _tokens[0].balanceOf(address(this));

        if (balance > 0) {
            stakingHelper.stake(balance, address(this));
        }

        uint256 sBalance = sLobi.balanceOf(address(this));
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (sBalance >= last) gain = uint128(sBalance - last);
        else loss = uint128(last - sBalance);
    }

    // Should only ever have a single element in amounts
    function deallocate(uint256[] memory amounts) public override {
        _onlyGuardian();

        if (amounts[0] > 0) {
            staking.unstake(amounts[0], false);
        }
    }

    function _deactivate(bool panic) internal override {
        uint256 sBalance = sLobi.balanceOf(address(this));
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = sBalance;

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
        uint256 sBalance = sLobi.balanceOf(address(this));
        uint256 balance = _tokens[0].balanceOf(address(this));

        return sBalance + balance;
    }

    function rewardTokens() public pure override returns (IERC20[] memory) {
        IERC20[] memory empty = new IERC20[](0);
        return empty;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](1);
        utility[0] = sLobi;

        return utility;
    }

    function name() external pure override returns (string memory) {
        return "LobiAllocator";
    }

    // helper
    function callRebase() public {
        staking.rebase();
    }
}
