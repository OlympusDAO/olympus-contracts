// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface ITreasury {
    function manage( address token, uint amount ) external;
}