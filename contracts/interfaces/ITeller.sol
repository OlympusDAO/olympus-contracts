// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface ITeller {
    function newBond( 
        address _bonder, 
        uint256 _bid,
        uint256 _payout, 
        uint256 _expires,
        address _feo
    ) external returns ( uint index_ );
    function redeemAll(address _bonder) external returns (uint256);
    function redeem(address _bonder, uint256[] memory _indexes) external returns (uint256);
    function getReward() external;
    function setReward(bool _fe, uint256 _reward) external;
    function vested(address _bonder, uint256 _index) external view returns (bool);
    function pendingForIndexes(address _bonder, uint256[] memory _indexes) external view returns (uint256 pending_);
    function totalPendingFor(address _bonder) external view returns (uint256 pending_);
    function indexesFor(address _bonder) external view returns (uint256[] memory indexes_);
}