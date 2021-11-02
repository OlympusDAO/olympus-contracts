// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

interface IDistributor {
    function distribute() external returns ( bool );
}