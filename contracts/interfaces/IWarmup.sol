// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface IWarmup {
    function retrieve( address staker_, uint amount_ ) external;
}
