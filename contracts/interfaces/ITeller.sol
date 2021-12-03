// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface ITeller {
    function newBond(
        uint256 _payout,
        uint16 _bid,
        uint48 _expires,
        address _bonder,
        address _feo
    ) external returns (uint16 index_);
    function redeemAll(address _bonder) external returns (uint256);
    function redeem(address _bonder, uint16[] memory _indexes) external returns (uint256);
    function getReward() external;
    function setReward(bool _fe, uint64 _reward) external;
    function vested(address _bonder, uint16 _index) external view returns (bool);
    function pendingForIndexes(address _bonder, uint16[] memory _indexes) external view returns (uint256 pending_);
    function totalPendingFor(address _bonder) external view returns (uint256 pending_);
    function indexesFor(address _bonder) external view returns (uint16[] memory indexes_);
}