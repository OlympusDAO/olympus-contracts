// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface ITeller {
    function newBond( 
        address _bonder, 
        address _principal,
        uint _principalPaid,
        uint _payout, 
        uint _vesting,
        uint _fid 
    ) external returns ( uint );

    function redeem( 
        address _bonder, 
        address _recipient, 
        uint[] calldata indexes 
    ) public returns ( uint );

    function pendingFor( 
        address _bonder,
        uint _index
    ) public view returns ( uint );
}
