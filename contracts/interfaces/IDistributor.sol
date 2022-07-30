// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface IDistributor {
    function triggerRebase() external;

    function distribute() external;

    function retrieveBounty() external returns (uint256);

    function nextRewardFor(address who) external view returns (uint256);

    function setBounty(uint256 _bounty) external;

    function setPools(address[] calldata _pools) external;

    function removePool(uint256 index, address pool) external;

    function addPool(uint256 index, address pool) external;

    function setAdjustment(
        bool _add,
        uint256 _rate,
        uint256 _target
    ) external;
}
