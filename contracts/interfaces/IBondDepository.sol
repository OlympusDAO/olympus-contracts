// SPDX-License-Identifier: WTFPL
pragma solidity 0.7.5;

interface IBondDepository {

    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor,
        uint256 _BID,
        address _feo
    ) external returns (uint256, uint256);

    function bondTypeInfo( uint256 _BID ) external view returns (
        address principal_,
        address calculator_,
        bool isLiquidityBond_,
        uint256 totalDebt_,
        uint256 lastBondCreatedAt_
    );
}
