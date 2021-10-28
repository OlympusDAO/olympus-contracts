// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface ITeller {
    function newBond(
        address _bonder,
        address _principal,
        uint256 _principalPaid,
        uint256 _payout,
        uint256 _expires,
        address _feo
    ) external onlyDepository returns (uint256 index_);

    function redeem( 
        address _bonder,
        uint256[] calldata indexes 
    ) public returns ( uint256 );

    function pendingFor( 
        address _bonder,
        uint256 _index
    ) public view returns ( uint256 );
}
