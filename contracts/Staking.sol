// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;


import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IsOHM.sol";
import "./interfaces/IgOHM.sol";
import "./interfaces/IDistributor.sol";

import "./types/Governable.sol";


contract OlympusStaking is Governable {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;
    using SafeERC20 for IgOHM;



    /* ========== EVENTS ========== */

    event DistributorSet( address distributor );
    event WarmupSet( uint warmup );

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



    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable OHM;
    IsOHM public immutable sOHM;
    IgOHM public immutable gOHM;

    Epoch public epoch;

    address public distributor;

    mapping( address => Claim ) public warmupInfo;
    uint public warmupPeriod;
    uint private gonsInWarmup;

    

    /* ========== CONSTRUCTOR ========== */
    
    constructor ( 
        address _ohm, 
        address _sOHM, 
        address _gOHM,
        uint _epochLength,
        uint _firstEpochNumber,
        uint _firstEpochBlock
    ) {
        require(_ohm != address(0), "Zero address: OHM");
        OHM = IERC20( _ohm );
        require(_sOHM != address(0), "Zero address: sOHM");
        sOHM = IsOHM( _sOHM );
        require(_gOHM != address(0), "Zero address: gOHM");
        gOHM = IgOHM( _gOHM );
        
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
     * @param _to address
     * @param _amount uint
     * @param _claim bool
     * @param _rebasing bool
     * @return uint
     */
    function stake( address _to, uint _amount, bool _rebasing, bool _claim ) external returns ( uint ) {
        rebase();

        OHM.safeTransferFrom( msg.sender, address(this), _amount );

        if ( _claim && warmupPeriod == 0 ) {
            return _send( _to, _amount, _rebasing );

        } else {
            Claim memory info = warmupInfo[ _to ];
            if ( !info.lock ) {
                require( _to == msg.sender, "External deposits for account are locked" );
            }

            warmupInfo[ _to ] = Claim ({
                deposit: info.deposit.add( _amount ),
                gons: info.gons.add( sOHM.gonsForBalance( _amount ) ),
                expiry: epoch.number.add( warmupPeriod ),
                lock: info.lock
            });

            gonsInWarmup = gonsInWarmup.add( sOHM.gonsForBalance( _amount ) );

            return _amount;
        }
    }

    /**
     * @notice retrieve stake from warmup
     * @param _to address
     * @param _rebasing bool
     * @return uint
     */
    function claim ( address _to, bool _rebasing ) public returns ( uint ) {
        Claim memory info = warmupInfo[ _to ];

        if ( !info.lock ) {
            require( _to == msg.sender, "External claims for account are locked" );
        }

        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _to ];

            gonsInWarmup = gonsInWarmup.sub( info.gons );

            return _send( _to, sOHM.balanceForGons( info.gons ), _rebasing );
        }
        return 0;
    }

    /**
     * @notice forfeit stake and retrieve OHM
     * @return uint
     */
    function forfeit() external returns ( uint ) {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        gonsInWarmup = gonsInWarmup.sub( info.gons );

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
     * @param _to address
     * @param _amount uint
     * @param _trigger bool
     * @param _rebasing bool
     * @return amount_ uint
     */
    function unstake( address _to, uint _amount, bool _trigger, bool _rebasing ) external returns ( uint amount_ ) {
        if ( _trigger ) {
            rebase();
        }

        amount_ = _amount;
        if ( _rebasing ) {
            sOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else {
            gOHM.burn( msg.sender, _amount ); // amount was given in gOHM terms
            amount_ = gOHM.balanceFrom( _amount ); // convert amount to OHM terms
        }
        
        OHM.safeTransfer( _to, amount_ );
    }

    /**
     * @notice convert _amount sOHM into gBalance_ gOHM
     * @param _to address
     * @param _amount uint
     * @return gBalance_ uint
     */
    function wrap( address _to, uint _amount ) external returns ( uint gBalance_ ) {
        sOHM.safeTransferFrom( msg.sender, address(this), _amount );

        gBalance_ = gOHM.balanceTo( _amount );
        gOHM.mint( _to, gBalance_ );
    }

    /**
     * @notice convert _amount gOHM into sBalance_ sOHM
     * @param _to address
     * @param _amount uint
     * @return sBalance_ uint
     */
    function unwrap( address _to, uint _amount ) external returns ( uint sBalance_ ) {
        gOHM.burn( msg.sender, _amount );

        sBalance_ = gOHM.balanceFrom( _amount );
        sOHM.safeTransfer( _to, sBalance_ );
    }

    /**
     * @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endBlock <= block.number ) {
            sOHM.rebase( epoch.distribute, epoch.number );

            epoch.endBlock = epoch.endBlock.add( epoch.length );
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            if( contractBalance() <= totalStaked() ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = contractBalance().sub( totalStaked() );
            }
        }
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @notice send staker their amount as sOHM or gOHM
     * @param _to address
     * @param _amount uint
     * @param _rebasing bool
     */
    function _send( address _to, uint _amount, bool _rebasing ) internal returns ( uint ) {
        if ( _rebasing ) {
            sOHM.safeTransfer( _to, _amount ); // send as sOHM (equal unit as OHM)
            return _amount;
        } else {
            gOHM.mint( _to, gOHM.balanceTo( _amount ) ); // send as gOHM (convert units from OHM)
            return gOHM.balanceTo( _amount );
        }
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice returns the sOHM index, which tracks rebase growth
     * @return uint
     */
    function index() public view returns ( uint ) {
        return sOHM.index();
    }

    /**
     * @notice returns contract OHM holdings, including bonuses provided
     * @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return OHM.balanceOf( address(this) );
    }

    /**
     * @notice total supply staked
     */
    function totalStaked() public view returns ( uint ) {
        return sOHM.circulatingSupply();
    }

    /**
     * @notice total supply in warmup
     */
    function supplyInWarmup() public view returns ( uint ) {
        return sOHM.balanceForGons( gonsInWarmup );
    }



    /* ========== MANAGERIAL FUNCTIONS ========== */

    /**
     * @notice sets the contract address for LP staking
     * @param _distributor address
     */
    function setDistributor( address _distributor ) external onlyGovernor() {
        distributor = _distributor;
        emit DistributorSet( _distributor );
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmupLength( uint _warmupPeriod ) external onlyGovernor() {
        warmupPeriod = _warmupPeriod;
        emit WarmupSet( _warmupPeriod );
    }
}