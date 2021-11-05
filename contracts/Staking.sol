// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.9;

import {IsOHM, IgOHM, IDistributor, IStaking} from "./interfaces/OlympusInterfaces.sol";

import "./libraries/SafeERC20.sol";

import "./types/Governable.sol";

contract OlympusStaking is Governable, IStaking {

    /* ========== DEPENDENCIES ========== */

    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;
    using SafeERC20 for IgOHM;

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable OHM;
    IsOHM public immutable sOHM;
    IgOHM public gOHM;

    Epoch public epoch;

    address public distributor;

    mapping( address => Claim ) public warmupInfo;
    uint public warmupPeriod;
    uint public gonsInWarmup;

    

    /* ========== CONSTRUCTOR ========== */
    
    constructor (
        address _OHM, 
        address _sOHM, 
        uint _epochLength,
        uint _firstEpochNumber,
        uint _firstEpochBlock
    ) {
        require( _OHM != address(0) );
        require( _sOHM != address(0) );

        OHM = IERC20( _OHM );
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
     * @notice stake OHM to enter warmup
     * @param _amount uint
     * @param _recipient address
     * @param _claim bool
     * @param _rebasing bool
     */
    function stake( uint _amount, address _recipient, bool _rebasing, bool _claim ) external returns ( uint ) {
        rebase();

        OHM.safeTransferFrom( msg.sender, address(this), _amount );

        if ( _claim && warmupPeriod == 0 ) {
            return _send( _recipient, _amount, _rebasing );

        } else {
            Claim memory info = warmupInfo[ _recipient ];

            if ( !info.lock ) {
                require( _recipient == msg.sender, "External deposits for account are locked" );
            }

            warmupInfo[ _recipient ] = Claim ({
                deposit: info.deposit + _amount,
                gons: info.gons + sOHM.gonsForBalance( _amount ),
                expiry: epoch.number + warmupPeriod,
                lock: info.lock
            });

            gonsInWarmup = gonsInWarmup + sOHM.gonsForBalance( _amount );

            return _amount;
        }
    }

    /**
     * @notice retrieve stake from warmup
     * @param _recipient address
     * @param _rebasing bool
     */
    function claim ( address _recipient, bool _rebasing ) public returns ( uint ) {
        Claim memory info = warmupInfo[ _recipient ];

        if ( !info.lock ) {
            require( _recipient == msg.sender, "External claims for account are locked" );
        }

        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];

            gonsInWarmup -= info.gons;

            return _send( _recipient, sOHM.balanceForGons( info.gons ), _rebasing );
        }
        return 0;
    }

    /**
     * @notice forfeit stake and retrieve OHM
     */
    function forfeit() external returns ( uint ) {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        gonsInWarmup -= info.gons;

        OHM.safeTransfer( msg.sender, info.deposit );

        return info.deposit;
    }

    /**
     * @notice prevent new deposits or claims from ext. address (protection from malicious activity)
     */
    function toggleLock() external {
        warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
    }

    /**
     * @notice redeem sOHM for OHM
     * @param _amount uint
     * @param _trigger bool
     * @param _rebasing bool
     */
    function unstake( uint _amount, bool _trigger, bool _rebasing ) external returns ( uint ) {
        if ( _trigger ) {
            rebase();
        }

        uint amount = _amount;
        if ( _rebasing ) {
            IERC20(address(sOHM)).safeTransferFrom( msg.sender, address(this), _amount );
        } else {
            gOHM.burn( msg.sender, _amount ); // amount was given in gOHM terms
            amount = gOHM.balanceFrom( _amount ); // convert amount to OHM terms
        }
        
        OHM.safeTransfer( msg.sender, amount );

        return amount;
    }

    /**
     * @notice convert _amount sOHM into gBalance_ gOHM
     * @param _amount uint
     * @return gBalance_ uint
     */
    function wrap( uint _amount ) external returns ( uint gBalance_ ) {
        IERC20(address(sOHM)).safeTransferFrom( msg.sender, address(this), _amount );

        gBalance_ = gOHM.balanceTo( _amount );
        gOHM.mint( msg.sender, gBalance_ );
    }

    /**
     * @notice convert _amount gOHM into sBalance_ sOHM
     * @param _amount uint
     * @return sBalance_ uint
     */
    function unwrap( uint _amount ) external returns ( uint sBalance_ ) {
        gOHM.burn( msg.sender, _amount );

        sBalance_ = gOHM.balanceFrom( _amount );
        IERC20(address(sOHM)).safeTransfer( msg.sender, sBalance_ );
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endBlock <= block.number ) {
            sOHM.rebase( epoch.distribute, epoch.number );

            epoch.endBlock += epoch.length;
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            uint256 balance = contractBalance();
            uint256 staked = totalStaked();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance - staked;
            }
        }
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @notice send staker their amount as sOHM or gOHM
     * @param _recipient address
     * @param _amount uint
     * @param _rebasing bool
     */
    function _send( address _recipient, uint _amount, bool _rebasing ) internal returns ( uint ) {
        if ( _rebasing ) {
            IERC20(address(sOHM)).safeTransfer( _recipient, _amount ); // send as sOHM (equal unit as OHM)
            return _amount;
        } else {
            gOHM.mint( _recipient, gOHM.balanceTo( _amount ) ); // send as gOHM (convert units from OHM)
            return gOHM.balanceTo( _amount );
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
        return OHM.balanceOf( address(this) );
    }

    function totalStaked() public view returns ( uint ) {
        return sOHM.circulatingSupply();
    }

    function supplyInWarmup() public view returns ( uint ) {
        return sOHM.balanceForGons( gonsInWarmup );
    }



    /* ========== MANAGERIAL FUNCTIONS ========== */

    /**
        @notice sets the contract address for LP staking
        @param _contract address
     */
    function setContract( CONTRACTS _contract, address _address ) external onlyGovernor() {
        if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
            distributor = _address;
            emit DistributorSet( _address );
        } else if ( _contract == CONTRACTS.gOHM ) { // 1
            require( address( gOHM ) == address( 0 ) ); // only set once
            gOHM = IgOHM( _address );
            emit gOHMSet( _address );
        }
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmup( uint _warmupPeriod ) external onlyGovernor() {
        warmupPeriod = _warmupPeriod;
        emit WarmupSet( _warmupPeriod );
    }
}