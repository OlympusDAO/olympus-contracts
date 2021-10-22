// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface fToken {
    function liquidateBorrow(address borrower, uint amount, address collateral) returns (uint);
}