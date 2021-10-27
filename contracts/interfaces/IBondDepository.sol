// SPDX-License-Identifier: WTFPL
pragma solidity 0.7.5;

interface IBondDepository {

    function deposit( 
        uint _amount, 
        uint _maxPrice,
        address _depositor,
        uint _BID,
        uint _FID
    ) external returns ( uint, uint );

    function bondTypeInfo( uint _BID ) external view returns (
        address principal_,
        address calculator_,
        bool isLiquidityBond_,
        uint totalDebt_,
        uint lastBondCreatedAt_
    );
}
