// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeERC20.sol";

interface IwsOHM {
    function unwrap( uint _amount ) external returns ( uint );
    function wrap( uint _amount ) external returns ( uint );
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

contract wsOHMStakingHelper {

    /* ====== DEPENDENCIES ====== */

    using SafeERC20 for IERC20;

    /* ====== STATE VARIABLES ====== */

    address public constant wsOHM = 0xCa76543Cf381ebBB277bE79574059e32108e3E65;
    address public constant sOHM = 0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F;
    address public constant OHM = 0x383518188C0C6d7730D91b2c03a03C837814a899;
    address public constant staking = 0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a;

    /* ====== USER FUNCTIONS ====== */

    /**
     *  @notice stake OHM directly to wsOHM
     *  @param _amount uint
     *  @param _recipient address
     *  @return uint
     */
    function stake(uint _amount, address _recipient) external returns(uint) {
        IERC20( OHM ).safeTransferFrom( msg.sender, address(this), _amount );
        IERC20( OHM ).approve( staking, _amount );
        IStaking( staking ).stake( _amount, address(this) );
        IStaking( staking ).claim( address(this) );

        IERC20( sOHM ).approve( wsOHM, _amount );
        uint _wsOHMAmount = IwsOHM(wsOHM).wrap(_amount);

        IERC20( wsOHM ).transfer(_recipient, _wsOHMAmount);

        return _wsOHMAmount;
    }

    /**
     *  @notice unstake wsOHM directly to OHM
     *  @param _amount uint
     *  @param _recipient address
     *  @return uint
     */
    function unwrapAndUnstake(uint _amount, address _recipient) external returns(uint) {
        IERC20( wsOHM ).safeTransferFrom( msg.sender, address(this), _amount );

        IERC20( wsOHM ).approve( wsOHM, _amount );
        uint _amountsOHM = IwsOHM( wsOHM ).unwrap( _amount );

        IStaking( staking ).unstake( _amountsOHM, true );

        IERC20( OHM ).transfer(_recipient, _amountsOHM);

        return _amountsOHM;
    }
}