// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/IERC20.sol";

interface IgOHM is IERC20 {
    function mint( address _to, uint _amount ) external;
    function burn( address _from, uint _amount ) external;

    function balanceFrom( uint _amount ) external view returns ( uint );
    function balanceTo( uint _amount ) external view returns ( uint );
}