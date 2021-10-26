// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;


interface ITreasury {

    function deposit( uint _amount, address _token, uint _profit ) external returns ( uint );
    
    function withdraw( uint _amount, address _token ) external;

    function tokenValue( address _token, uint _amount ) external view returns ( uint value_ );
  
    function mint( address _recipient, uint _amount ) external;

    function incurDebt( uint amount_, address token_ ) external;
    
    function repayDebtWithReserve( uint amount_, address token_ ) external;
}