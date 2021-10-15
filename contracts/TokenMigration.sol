// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/IwsOHM.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IOwnable.sol";

import "./types/Ownable.sol";

interface IStakingV1 {
    function unstake( uint _amount, bool _trigger ) external;

    function index() external view returns ( uint );
}

contract Migrator is Ownable {

    IERC20 public immutable oldOHM;
    IERC20 public immutable oldsOHM;
    IwsOHM public immutable oldwsOHM;
    ITreasury public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IERC20 public immutable newOHM;
    IERC20 public immutable newsOHM;
    IERC20 public immutable gOHM;
    ITreasury public immutable newTreasury;
    IStaking public immutable newStaking;

    IERC20 public immutable DAI;

    uint public maxIndex;
    bool public migrationStarted;

    constructor(
        address _oldOHM,
        address _oldsOHM,
        address _oldTreasury,
        address _oldStaking,
        address _oldwsOHM,
        address _newOHM,
        address _newsOHM,
        address _gOHM,
        address _newTreasury,
        address _newStaking,
        address _DAI
    ) {
        require( _oldOHM != address(0) );
        oldOHM = IERC20( _oldOHM );
        require( _oldsOHM != address(0) );
        oldsOHM = IERC20( _oldsOHM );
        require( _oldTreasury != address(0) );
        oldTreasury = _oldTreasury;
        require( _oldStaking != address(0) );
        oldStaking = IStakingV1( _oldStaking );
        require( _oldwsOHM != address(0) );
        oldwsOHM = IwsOHM( _oldwsOHM );
        require( _newOHM != address(0) );
        newOHM = IERC20( _newOHM );
        require( _newsOHM != address(0) );
        newsOHM = IERC20( _newsOHM );
        require( _gOHM != address(0) );
        gOHM = IERC20( _gOHM );
        require( _newTreasury != address(0) );
        newTreasury = _newTreasury;
        require( _newStaking != address(0) );
        newStaking = IStakingV2( _newStaking );
        require( _DAI != address(0) );
        DAI = IERC20( _DAI );
    }

    enum TYPE { UNSTAKED, STAKED, WRAPPED }

    // migrate OHM, sOHM, or wsOHM for OHM, sOHM, or gOHM
    function migrate( uint _amount, TYPE _from, TYPE _to ) external {
        require( migrationStarted, "Migration has not started" );

        uint amount = oldwsOHM.sOHMTowOHM( _amount );
        if ( from == TYPE.UNSTAKED ) {
            oldOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else if ( from == TYPE.STAKED ) {
            oldsOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else {
            oldwsOHM.safeTransferFrom( msg.sender, address(this), amount );
            amount = _amount;
        }

        amount = amountToGive( amount );

        if ( to == TYPE.WRAPPED ) {
            gOHM.safeTransfer( msg.sender, amount );
        } else if ( to == TYPE.STAKED ) {
            newsOHM.safeTransfer( msg.sender, newStaking.unwrap( amount ) );
        } else if ( to == TYPE.UNSTAKED ) {
            newOHM.safeTransfer( msg.sender, newStaking.unstake( amount, false, false ) );
        }
    }

    // rebases missed before migrating are honored until the final index
    function amountToGive( uint amount ) public view returns ( uint ) {
        if ( newStaking.index() > maxIndex ) {
            return amount.mul( maxIndex ).div( newStaking.index() );
        } else {
            return amount;
        }
    }

    // allows migration and sets reference and final indexes
    function startMigration() external {
        require( !migrationStarted );
        migrationStarted = true;
        maxIndex = oldStaking.index().mul( 2 );
    }

    // fund contract with gOHM to allow migration
    function fund( uint _amount ) external onlyOwner() {
        newTreasury.mint( address(this), _amount );
        newStaking.stake( _amount, address(this), false, true );
    }

    // unstake gOHM held by contract and burn OHM
    function defund() external onlyOwner() {
        require( newStaking.index() > maxIndex );
        newStaking.unstake( gOHM.balanceOf( address(this) ), false, false );
        newOHM.burn( newOHM.balanceOf( address(this) ) );
    }

    // withdraw backing of migrated OHM
    function clearOld() external onlyOwner() {
        oldwsOHM.unwrap( oldwsOHM.balanceOf( address(this) ) );
        oldStaking.unstake( oldsOHM.balanceOf( address(this) ), false );
        oldTreasury.withdraw( oldOHM.balanceOf( address(this) ).mul( 1e9 ), address(DAI) );
        DAI.safeTransfer( newTreasury, DAI.balanceOf( address(this) ) ); 
    }
}