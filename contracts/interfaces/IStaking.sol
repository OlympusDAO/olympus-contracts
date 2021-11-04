// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface IStaking {

    function stake( address _to, uint _amount, bool _rebasing, bool _claim ) external returns ( uint );

    function claim ( address _recipient, bool _rebasing ) external returns ( uint );

    function forfeit() external returns ( uint );

    function toggleLock() external;

    function unstake( address _to, uint _amount, bool _trigger, bool _rebasing ) external returns ( uint );

    function wrap( address _to, uint _amount ) external returns ( uint gBalance_ );

    function unwrap( address _to, uint _amount ) external returns ( uint sBalance_ );

    function rebase() external;

    function index() external view returns ( uint );

    function contractBalance() external view returns ( uint );

    function totalStaked() external view returns ( uint );

    function supplyInWarmup() external view returns ( uint );
}