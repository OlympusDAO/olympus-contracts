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

    function _update() internal override returns (uint128 gain, uint128 loss) {
        gain = gains;
        loss = losses;
    }

    function deallocate(uint256 amount) public override {}

    function _deactivate(bool panic) internal override {
        if (panic) emit PanicTriggered();
    }

    function _prepareMigration() internal override {}

    function estimateTotalRewards() public view override returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](1);
        balances[0] = IERC20(DAI).balanceOf(address(this));
        return balances;
    }

    function estimateTotalAllocated() public view override returns (uint256) {
        return token.balanceOf(address(this));
    }

    function rewardTokens() public view override returns (address[] memory) {
        address[] memory coin = new address[](1);
        coin[0] = DAI;
        return coin;
    }

    function utilityTokens() public view override returns (address[] memory) {
        address[] memory coin = new address[](1);
        coin[0] = DAI;
        return coin;
    }

    function name() external view override returns (string memory) {
        return "SimpleFraxAllocator";
    }
}
