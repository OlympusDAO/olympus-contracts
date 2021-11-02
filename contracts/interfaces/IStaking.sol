// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

interface IStaking {

    function stake( uint _amount, address _recipient, bool _rebasing, bool _claim ) external returns ( uint );

    function claim ( address _recipient, bool _rebasing ) external returns ( uint );

    function forfeit() external returns ( uint );

    function toggleLock() external;

    function unstake( uint _amount, bool _trigger, bool _rebasing ) external returns ( uint );

    function wrap( uint _amount ) external returns ( uint gBalance_ );

    function unwrap( uint _amount ) external returns ( uint sBalance_ );

    function rebase() external;

    function index() external view returns ( uint );

    function contractBalance() external view returns ( uint );

    function totalStaked() external view returns ( uint );

    function supplyInWarmup() external view returns ( uint );
}