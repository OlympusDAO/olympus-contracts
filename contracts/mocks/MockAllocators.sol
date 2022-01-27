pragma solidity ^0.8.10;

// interfaces
import "../interfaces/IAllocator.sol";

// types
import "../types/BaseAllocator.sol";

contract SimplestMockAllocator is BaseAllocator {
    uint128 public gains;
    uint128 public losses;

    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    function setGL(uint128 gain, uint128 loss) public {
        gain = gains;
        loss = losses;
    }

    function _update() internal override returns (uint128 gain, uint128 loss) {
        gain = gains;
        loss = losses;
    }

    function deallocate(uint256 amount) public override {}

    function _deactivate(bool panic) internal override {}

    function _prepareMigration() internal override {}

    function estimateTotalRewards() public view override returns (uint256[] memory) {
        return new uint256[](1);
    }

    function estimateTotalAllocated() public view override returns (uint256) {
        return 0;
    }

    function rewardTokens() public view override returns (address[] memory) {
        return new address[](1);
    }

    function utilityTokens() public view override returns (address[] memory) {
        return new address[](1);
    }

    function name() external view override returns (string memory) {
        return "";
    }
}
