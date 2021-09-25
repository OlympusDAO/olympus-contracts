// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;


import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IsOHM.sol";
import "./interfaces/IWarmup.sol";
import "./interfaces/IDistributor.sol";

import "./types/Governable.sol";


contract OlympusStaking is Governable {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;



    /* ========== DATA STRUCTURES ========== */

    struct Epoch {
        uint length;
        uint number;
        uint endBlock;
        uint distribute;
    }

    struct Claim {
        uint deposit;
        uint gons;
        uint expiry;
        bool lock; // prevents malicious delays
    }

    enum CONTRACTS { DISTRIBUTOR, WARMUP, LOCKER }



    /* ========== STATE VARIABLES ========== */

    IERC20 immutable OHM;
    IsOHM immutable sOHM;

    Epoch public epoch;

    address public distributor;
    address public locker;
    address public warmupContract;

    uint public totalBonus;
    uint public warmupPeriod;

    mapping( address => Claim ) public warmupInfo;

    uint public rebate;



    /* ========== CONSTRUCTOR ========== */
    
    constructor ( 
        address _OHM, 
        address _sOHM, 
        uint _epochLength,
        uint _firstEpochNumber,
        uint _firstEpochBlock
    ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _sOHM != address(0) );
        sOHM = IsOHM( _sOHM );
        
        epoch = Epoch({
            length: _epochLength,
            number: _firstEpochNumber,
            endBlock: _firstEpochBlock,
            distribute: 0
        });
    }

    

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
        @notice stake OHM to enter warmup
        @param _amount uint
        @param _claim bool
     */
    function stake( uint _amount, address _recipient, bool _claim ) external {
        rebase();
        
        OHM.safeTransferFrom( msg.sender, address(this), _amount );

        if ( _claim && warmupPeriod == 0 ) {
            sOHM.safeTransfer( _recipient, _amount );
        } else {
            Claim memory info = warmupInfo[ _recipient ];
            require( !info.lock, "Deposits for account are locked" );

            warmupInfo[ _recipient ] = Claim ({
                deposit: info.deposit.add( _amount ),
                gons: info.gons.add( sOHM.gonsForBalance( _amount ) ),
                expiry: epoch.number.add( warmupPeriod ),
                lock: false
            });
            
            sOHM.safeTransfer( warmupContract, _amount );
        }
    }

    /**
        @notice retrieve sOHM from warmup
        @param _recipient address
     */
    function claim ( address _recipient ) public {
        Claim memory info = warmupInfo[ _recipient ];
        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];
            IWarmup( warmupContract ).retrieve( _recipient, sOHM.balanceForGons( info.gons ) );
        }
    }

    /**
        @notice forfeit sOHM in warmup and retrieve OHM
     */
    function forfeit() external {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        IWarmup( warmupContract ).retrieve( address(this), sOHM.balanceForGons( info.gons ) );
        OHM.safeTransfer( msg.sender, info.deposit );
    }

    /**
        @notice prevent new deposits to address (protection from malicious activity)
     */
    function toggleDepositLock() external {
        warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
    }

    /**
        @notice redeem sOHM for OHM
        @param _amount uint
        @param _trigger bool
     */
    function unstake( uint _amount, bool _trigger ) external {
        if ( _trigger ) {
            rebase();
        }
        sOHM.safeTransferFrom( msg.sender, address(this), _amount );
        OHM.safeTransfer( msg.sender, _amount );
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endBlock <= block.number ) {
            sOHM.safeTransfer( msg.sender, rebate );

            sOHM.rebase( epoch.distribute, epoch.number );

            epoch.endBlock = epoch.endBlock.add( epoch.length );
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            uint balance = contractBalance();
            uint staked = IsOHM( sOHM ).circulatingSupply();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance.sub( staked );
            }
        }
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
        @notice returns the sOHM index, which tracks rebase growth
        @return uint
     */
    function index() public view returns ( uint ) {
        return sOHM.index();
    }

    /**
        @notice returns contract OHM holdings, including bonuses provided
        @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return OHM.balanceOf( address(this) ).add( totalBonus );
    }



    /* ========== LOCKED STAKING FUNCTIONS ========== */

    /**
        @notice provide bonus to locked staking contract
        @param _amount uint
     */
    function giveLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.add( _amount );
        sOHM.safeTransfer( locker, _amount );
    }

    /**
        @notice reclaim bonus from locked staking contract
        @param _amount uint
     */
    function returnLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.sub( _amount );
        sOHM.safeTransferFrom( locker, address(this), _amount );
    }



    /* ========== MANAGERIAL FUNCTIONS ========== */

    /**
        @notice sets the contract address for LP staking
        @param _contract address
     */
    function setContract( CONTRACTS _contract, address _address ) external onlyGovernor() {
        if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
            distributor = _address;
        } else if ( _contract == CONTRACTS.WARMUP ) { // 1
            require( warmupContract == address( 0 ), "Warmup cannot be set more than once" );
            warmupContract = _address;
        } else if ( _contract == CONTRACTS.LOCKER ) { // 2
            require( locker == address(0), "Locker cannot be set more than once" );
            locker = _address;
        }
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmup( uint _warmupPeriod ) external onlyGovernor() {
        warmupPeriod = _warmupPeriod;
    }

    /**
     *  @notice set rebate to send to address that triggers rebase. compensation for gas.
     *  @param _amount uint
     */
    function setRebate( uint _amount ) external onlyGovernor() {
        rebate = _amount;
    }
}