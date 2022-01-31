pragma solidity ^0.8.10;

// interfaces
import "../interfaces/IAllocator.sol";

// types
import "../types/BaseAllocator.sol";

contract SimplestMockAllocator is BaseAllocator {
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    uint128 public gains;
    uint128 public losses;

    event PanicTriggered();

    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    function setGL(uint128 gain, uint128 loss) public {
        gains = gain;
        losses = loss;
    }

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
