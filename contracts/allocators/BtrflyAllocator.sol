// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
import "../interfaces/ITreasury.sol";

interface IBtrflyStaking {
    function stake(uint256 amount_, address recipient_) external returns (bool);

    function unstake(uint256 amount_, bool trigger_) external;
}

error BtrflyAllocator_InvalidAddress();
error BtrflyAllocator_DeallocateZero();

contract BtrflyAllocator is BaseAllocator {
    ITreasury public treasury;

    IERC20 internal xBtrfly;
    IBtrflyStaking internal staking;

    constructor(AllocatorInitData memory data, address treasury_, address xBtrfly_, address staking_) BaseAllocator(data) {
        if (treasury_ == address(0) || xBtrfly_ == address(0) || staking_ == address(0)) revert BtrflyAllocator_InvalidAddress();

        treasury = ITreasury(treasury_);
        xBtrfly = IERC20(xBtrfly);
        staking = IBtrflyStaking(staking_);

        IERC20(data.tokens[0]).approve(staking_, type(uint256).max);
        xBtrfly.approve(staking_, type(uint256).max);
    }

    /*************************************
     * Allocator Operational Functions
     *************************************/
    
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // Get BTRFLY balance
        uint256 balance = _tokens[0].balanceOf(address(this));

        if (balance > 0) {
            staking.stake(balance, address(this));
        }

        uint256 xBalance = xBtrfly.balanceOf(address(this));
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (xBalance >= last) gain = uint128(xBalance - last);
        else loss = uint128(last - xBalance);
    }

    // Should only ever have a single element in amounts
    function deallocate(uint256[] memory amounts) public override {
        _onlyGuardian();
        if (amounts[0] == 0) revert BtrflyAllocator_DeallocateZero();

        staking.unstake(amounts[0], false);
    }

    function _deactivate(bool panic) internal override {
        uint256 xBalance = xBtrfly.balanceOf(address(this));
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = xBalance;

        deallocate(amounts);

        if (panic) {
            _tokens[0].transfer(address(treasury), _tokens[0].balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {
        uint256 xBalance = xBtrfly.balanceOf(address(this));
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = xBalance;

        deallocate(amounts);
    }

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
}
