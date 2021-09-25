// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface ITeller {
    function newBond( address _bonder, uint _payout, uint _end ) external;
}