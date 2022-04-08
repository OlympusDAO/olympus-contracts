pragma solidity 0.7.5;

import "./FraxSharesAllocator.sol";
import "../interfaces/FxsInterfaces.sol";

contract FraxSharesAllocatorVoting is FraxSharesAllocator {
    GaugeController public gaugeController;

    function setGaugeController(address _gaugeController) external onlyOwner {
        gaugeController = GaugeController(_gaugeController);
    }

    function vote(address gauge, uint256 votingPowerToUse) external onlyOwner {
        gaugeController.vote_for_gauge_weights(gauge, votingPowerToUse);
    }
}
