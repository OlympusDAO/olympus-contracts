// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeERC20.sol";

interface IwsOHMv2 {
    function unwrap( uint _amount, address _recipient ) external returns ( uint );
    function wrap( uint _amount, address _recipient ) external returns ( uint );
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IsOHM {
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IStaking {
    function stake( uint _amount, address _recipient ) external returns ( bool );
    function unstake( uint _amount, bool _trigger ) external;
    function claim( address _recipient ) external;
}

contract StakeWrappedsOHMHelperV2 {
    using SafeERC20 for IERC20;

    address public immutable wsOHMv2;
    address public immutable sOHM;
    address public immutable OHM;
    address public immutable staking;

    constructor(address _wsOHMv2, address _OHM, address _sOHM, address _staking) {
        require( _wsOHMv2 != address(0) );
        wsOHMv2 = _wsOHMv2;
        require( _OHM != address(0) );
        OHM = _OHM;
        require( _sOHM != address(0) );
        sOHM = _sOHM;
        require( _staking != address(0) );
        staking = _staking;
    }

    function stake(uint _amount, address _recipient) external returns (uint amount) {
        IERC20( OHM ).safeTransferFrom( msg.sender, address(this), _amount );
        IERC20( OHM ).approve( staking, _amount );
        IStaking( staking ).stake( _amount, address(this) );
        IStaking( staking ).claim( address(this) );

        IERC20( sOHM ).approve( wsOHMv2, _amount );
        return IwsOHMv2(wsOHMv2).wrap(_amount, _recipient);
    }

    function unwrapAndUnstake(uint _amount, address _recipient) external returns (uint amount) {
        IERC20( wsOHMv2 ).safeTransferFrom( msg.sender, address(this), _amount );

        IERC20( wsOHMv2 ).approve( wsOHMv2, _amount );
        uint _amountsOHM = IwsOHMv2( wsOHMv2 ).unwrap( _amount, address(this) );

        IStaking( staking ).unstake( _amountsOHM, true );

        IERC20( OHM ).transfer(_recipient, _amountsOHM);

        return _amountsOHM;
    }
}