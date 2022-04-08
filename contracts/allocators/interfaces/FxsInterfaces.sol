pragma solidity 0.7.5;

interface GaugeController {
    function vote_for_gauge_weights(address _gauge_addr, uint256 _user_weight) external;
}
