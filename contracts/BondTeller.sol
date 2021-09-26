// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";

// TODO(zx): These staking Interfaces are not consistent
interface IStaking {
    function stake( uint _amount, address _recipient ) external returns ( bool );
}

contract BondTeller {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint;
    using SafeERC20 for IERC20;



    /* ========== EVENTS ========== */

    event BondCreated( address indexed bonder, uint payout, uint expires );
    event Redeemed( address indexed bonder, uint payout );



    /* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require( msg.sender == depository, "Only depository" );
        _;
    }



    /* ========== STRUCTS ========== */

    // Info for bond holder
    struct Bond {
        uint payout; // sOHM remaining to be paid. agnostic balance
        uint vested; // Block when vested
        bool redeemed;
    }



    /* ========== STATE VARIABLES ========== */

    address depository; // contract where users deposit bonds
    address immutable staking; // contract to stake payout
    IERC20 immutable OHM; 
    IERC20 immutable sOHM; // payment token
    ITreasury immutable treasury; 

    mapping( address => Bond[] ) public bonderInfo; // user data



    /* ========== CONSTRUCTOR ========== */

    constructor( address _depository, address _staking, address _OHM ) {
        require( _depository != address(0) );
        depository = _depository;
        require( _staking != address(0) );
        staking = _staking;
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _sOHM != address(0) );
        sOHM = _sOHM;
    }



    /* ========== DEPOSITORY FUNCTIONS ========== */

    /**
     *  @notice add new bond payout to user data
     *  @param _bonder address
     *  @param _payout uint
     *  @param _end uint
     */
    function newBond( address _bonder, uint _payout, uint _vesting ) external onlyDepository() {
        treasury.mintRewards( address(this), _payout );

        OHM.approve( staking, _payout ); // approve staking payout

        // store bond & stake payout
        bonderInfo[ _bonder ].push( Bond({ 
            payout: IStaking( staking ).stake( _payout, address(this), true ),
            vested: block.number.add( _vesting ),
            redeemed: false
        } ) );

        // indexed events are emitted
        emit BondCreated( _bonder, _payout, newVesting );
    }

    /* ========== INTERACTABLE FUNCTIONS ========== */

    /**
     *  @notice redeems all redeemable bonds
     *  @param _bonder address
     *  @return uint
     */
    function redeemAll( address _bonder ) external returns ( uint ) {
        return redeem( _bonder, indexesFor( _bonder ) );
    }

    /** 
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _indexes uint[]
     *  @return uint
     */ 
    function redeem( address _bonder, uint[] calldata indexes ) public returns ( uint ) {
        uint dues;
        for( uint i = 0; i < _indexes.length; i++ ) {
            uint index = _indexes[ i ];
            Bond memory info = bonderInfo[ _bonder ][ index ];

            if ( !info.redeemed && percentVestedFor( _bonder, index ) >= 10000 ) {
                bonderInfo[ _bonder ][ index ].redeemed = true; // mark as redeemed
                dues = dues.add( info.payout );
            }
        }

        dues = IStaking( staking ).fromAgnosticAmount( dues );

        emit Redeemed( _bonder, dues );
        pay( _bonder, dues );
        return dues;
    }



    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     *  @notice send payout
     *  @param _amount uint
     *  @return uint
     */
    function pay( address _bonder, uint _amount ) internal {
        sOHM.transfer( _bonder, _amount );
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
     *  @notice returns indexes of live bonds
     *  @param _bonder address
     *  @return indexes_ uint
     */
    function indexesFor( address _bonder ) public view returns ( uint[] indexes_ ) {
        Bond[] memory info = bonderInfo[ _bonder ];
        for( uint i = 0; i < info.length; i++ ) {
            if( !info[ i ].redeemed ) {
                indexes_.push( i );
            }
        }
    }

    // PAYOUT
    
    /**
     *  @notice calculate amount of OHM available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint
     */
    function pendingFor( address _bonder, uint[] calldata _indexes ) external view returns ( uint pendingPayout_ ) {
        for( uint i = 0; i < _indexes.length; i++ ) {
            uint index = _indexes[ i ];
            uint payout = bonderInfo[ _bonder ][ index ].payout;

            if ( percentVestedFor( _bonder, index ) >= 10000 ) {
                pendingPayout_ = pendingPayout_.add( payout );
            }
        }
        
        pendingPayout_ = IStaking( staking ).fromAgnosticAmount( pendingPayout_ );
    }

    /**
     *  @notice pending on all bonds
     *  @param _bonder address
     *  @return uint
     */
    function totalPendingFor( address _bonder ) external view returns ( uint ) {
        return pendingPayoutFor( _bonder, indexesFor( _bonder ) );
    }

    /**
     *  @notice pending payout for each outstanding bond
     *  @param _bonder address
     *  @return pending_ uint[]
     */
    function allPendingFor( address _bonder ) external view returns ( uint[] pending_ ) {
        uint[] memory indexes = indexesFor( _bonder );

        for( uint i = 0; i < indexes.length; i++ ) {
            pending_.push( pendingFor( _bonder, indexes[i] ) );
        }
    }

    // VESTING

    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint
     */
    function percentVestedFor( address _bonder, uint _index ) public view returns ( uint percentVested_ ) {
        Bond memory bond = bonderInfo[ _bonder ][ _index ];

        uint blocksRemaining = bond.vested.sub( bond.lastInteraction );
        uint blocksSince = block.number.sub( bond.lastInteraction );

        percentVested_ = blocksSince.mul( 10000 ).div( blocksRemaining );
    }

    /**
     *  @notice vested percent for each outstanding bond
     *  @param _bonder address
     *  @return percents_ uint[]
     */
    function allPercentVestedFor( address _bonder ) external view returns ( uint[] percents_ ) {
        uint[] memory indexes = indexesFor( _bonder );

        for( uint i = 0; i < indexes.length; i++ ) {
            percents_.push( percentVestedFor( _bonder, indexes[i] ) );
        }
    }
}