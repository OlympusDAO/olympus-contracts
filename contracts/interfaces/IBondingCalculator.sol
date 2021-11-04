// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

interface IBondingCalculator {
    function getKValue( address _pair ) external view returns ( uint k_ );
    function getTotalValue( address _pair ) external view returns ( uint _value );
    function valuation( address _pair, uint amount_ ) external view returns ( uint _value );
    function markdown( address _pair ) external view returns ( uint );
}