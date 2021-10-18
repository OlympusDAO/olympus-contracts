// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/IOHMERC20.sol";
import "./interfaces/IsOHM.sol";
import "./interfaces/IwsOHM.sol";
import "./interfaces/IgOHM.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IOwnable.sol";

import "./types/Ownable.sol";

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

interface IStakingV1 {
    function unstake( uint _amount, bool _trigger ) external;

    function index() external view returns ( uint );
}

contract Migrator is Ownable {

    using SafeMath for uint;
    using SafeERC20 for IERC20;
    using SafeERC20 for IOHMERC20;
    using SafeERC20 for IgOHM;
    using SafeERC20 for IsOHM;

    /* ========== MIGRATION ========== */

    event TimelockStarted( uint block, uint end );
    event Migrated( address newStaking, address newTreasury );
    event Defunded( uint amount );

    /* ========== STATE VARIABLES ========== */

    IOHMERC20 public immutable oldOHM;
    IsOHM public immutable oldsOHM;
    IwsOHM public immutable oldwsOHM;
    ITreasury public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IgOHM public immutable gOHM;
    address public newTreasury;
    IStaking public newStaking;
    IERC20 public newOHM;

    IERC20 public immutable DAI;

    bool public ohmMigrated;
    uint public immutable timelockLength;
    uint public timelockEnd;

    constructor(
        address _oldOHM,
        address _oldsOHM,
        address _oldTreasury,
        address _oldStaking,
        address _oldwsOHM,
        address _gOHM,
        address _DAI,
        uint _timelock
    ) {
        require( _oldOHM != address(0) );
        oldOHM = IOHMERC20( _oldOHM );
        require( _oldsOHM != address(0) );
        oldsOHM = IsOHM( _oldsOHM );
        require( _oldTreasury != address(0) );
        oldTreasury = ITreasury( _oldTreasury );
        require( _oldStaking != address(0) );
        oldStaking = IStakingV1( _oldStaking );
        require( _oldwsOHM != address(0) );
        oldwsOHM = IwsOHM( _oldwsOHM );
        require( _gOHM != address(0) );
        gOHM = IgOHM( _gOHM );
        require( _DAI != address(0) );
        DAI = IERC20( _DAI );
        timelockLength = _timelock;
    }

    /* ========== MIGRATION ========== */

    enum TYPE { UNSTAKED, STAKED, WRAPPED }

    // migrate OHM, sOHM, or wsOHM for gOHM
    function migrate( uint _amount, TYPE _from ) external {
        require( oldOHM.vault() == address( oldTreasury ), "Minter changed" );

        uint sAmount = _amount;
        uint wAmount = oldwsOHM.sOHMTowOHM( _amount );

        if ( _from == TYPE.UNSTAKED ) {
            oldOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else if ( _from == TYPE.STAKED ) {
            oldsOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else if ( _from == TYPE.WRAPPED ) {
            oldwsOHM.transferFrom( msg.sender, address(this), _amount );
            wAmount = _amount;
            sAmount = oldwsOHM.wOHMTosOHM( _amount );
        }

        if( ohmMigrated ) {
            gOHM.safeTransfer( msg.sender, wAmount );
        } else {
            gOHM.mint( msg.sender, wAmount );
        }
    }

    // bridge back to OHM, sOHM, or wsOHM
    function bridgeBack( uint _amount, TYPE _to ) external {
        gOHM.burn( msg.sender, _amount );

        uint amount = oldwsOHM.wOHMTosOHM( _amount );
        // error throws if contract does not have enough of type to send
        if ( _to == TYPE.UNSTAKED ) {
            oldOHM.safeTransfer( msg.sender, amount );
        } else if ( _to == TYPE.STAKED ) {
            oldsOHM.safeTransfer( msg.sender, amount );
        } else if ( _to == TYPE.WRAPPED ) {
            oldwsOHM.transfer( msg.sender, _amount );
        }
    }

    /* ========== OWNABLE ========== */

    // fund contract with gOHM 
    function fund( uint _amount ) external onlyOwner() {
        ITreasury( newTreasury ).mint( address(this), _amount );
        newOHM.approve( address( newStaking ), _amount );
        newStaking.stake( address(this), _amount, false, true );
    }

    // withdraw backing of migrated OHM
    function defund() external onlyOwner() {
        require( ohmMigrated && timelockEnd < block.number && timelockEnd != 0 );
        oldwsOHM.unwrap( oldwsOHM.balanceOf( address(this) ) );
        oldStaking.unstake( oldsOHM.balanceOf( address(this) ), false );

        uint balance = oldOHM.balanceOf( address(this) );
        oldTreasury.withdraw( balance.mul( 1e9 ), address(DAI) );
        DAI.safeTransfer( newTreasury, DAI.balanceOf( address(this) ) ); 

        emit Defunded( balance );
    }

    // ohm token and treasury have been migrated
    function ohmIsMigrated( address _newTreasury, address _newStaking, address _newOHM ) external onlyOwner() {
        ohmMigrated = true;
        require( _newTreasury != address(0) );
        newTreasury = _newTreasury;
        require( _newStaking != address(0) );
        newStaking = IStaking( _newStaking );
        require( _newOHM != address(0) );
        newOHM = IERC20( _newOHM );
        
        emit Migrated( _newStaking, _newTreasury );
    }

    // start timelock to send backing to new treasury
    function startTimelock() external onlyOwner() {
        timelockEnd = block.number.add( timelockLength );

        emit TimelockStarted( block.number, timelockEnd );
    }
}