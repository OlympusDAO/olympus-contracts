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
    event BondRedeemed( address indexed bonder, uint payout, uint remaining );



    /* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require( msg.sender == depository, "Only depository" );
        _;
    }



    /* ========== STRUCTS ========== */

    // Info for bond holder
    struct Bond {
        uint payout; // OHM remaining to be paid
        uint vesting; // Blocks left to vest
        uint lastBlock; // Last interaction
    }



    /* ========== STATE VARIABLES ========== */

    address depository; // contract where users deposit bonds
    address immutable staking; // contract to stake payout
    IERC20 immutable OHM; // payment token

    mapping( address => Bond ) public bonderInfo; // user data



    /* ========== CONSTRUCTOR ========== */

    constructor( address _depository, address _staking, address _OHM ) {
        require( _depository != address(0) );
        depository = _depository;
        require( _staking != address(0) );
        staking = _staking;
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
    }



    /* ========== MUTABLE FUNCTIONS ========== */

    /**
     *  @notice add new bond payout to user data
     *  @param _bonder address
     *  @param _payout uint
     *  @param _end uint
     */
    function newBond( address _bonder, uint _payout, uint _end ) external onlyDepository() {
        OHM.safeTransferFrom( depository, address(this), _payout );

        Bond memory info = bonderInfo[ _bonder ];

        uint newVesting = getNewVesting( info.vesting, _end, getPercentNew( info.payout, _payout ) );

        bonderInfo[ _bonder ] = Bond({ 
            payout: bonderInfo[ _bonder ].payout.add( _payout ),
            vesting: newVesting,
            lastBlock: block.number
        });

        // indexed events are emitted
        emit BondCreated( _bonder, _payout, newVesting );
    }

    /** 
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _stake bool
     *  @return uint
     */ 
    function redeem( address _bonder, bool _stake ) external returns ( uint ) {
        Bond memory info = bonderInfo[ _bonder ];
        uint percentVested = percentVestedFor( _bonder ); // (blocks since last interaction / vesting term remaining)

        if ( percentVested >= 10000 ) { // if fully vested
            delete bonderInfo[ _bonder ]; // delete user info
            emit BondRedeemed( _bonder, info.payout, 0 ); // emit bond data

            return pay( _bonder, info.payout, _stake );
        } else { // if unfinished
            // calculate payout vested
            uint payout = info.payout.mul( percentVested ).div( 10000 );

            // store updated deposit info
            bonderInfo[ _bonder ] = Bond({
                payout: info.payout.sub( payout ),
                vesting: info.vesting.sub( block.number.sub( info.lastBlock ) ),
                lastBlock: block.number
            });

            emit BondRedeemed( _bonder, payout, bonderInfo[ _bonder ].payout );
            return pay( _bonder, payout, _stake );
        }
    }



    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     *  @notice allow user to stake payout automatically
     *  @param _amount uint
     *  @param _stake bool
     *  @return uint
     */
    function pay( address _bonder, uint _amount, bool _stake ) internal returns ( uint ) {
        if ( !_stake ) { // if user does not want to stake
            OHM.transfer( _bonder, _amount ); // send payout
        } else { // if user wants to stake
            IERC20( OHM ).approve( staking, _amount );
            IStaking( staking ).stake( _amount, _bonder );
        }
        return _amount;
    }

    /**
     *  @notice get new bonds' percent of total payout 
     *  @param _initial uint
     *  @param _new uint
     *  @return percent_ uint
     */
    function getPercentNew( uint _initial, uint _new ) internal pure returns ( uint percent_ ) {
        percent_ = _new.mul( 1e9 ).div( _initial.add( _new ) );
    }

    /**
     *  @notice get new vesting end block
     *  @param _initial uint
     *  @param _new uint
     *  @param _percent uint
     *  @return vesting_ uint
     */
    function getNewVesting( uint _initial, uint _new, uint _percent ) internal pure returns ( uint vesting_ ) {
        uint difference = _new.sub( _initial );
        vesting_ = _initial.add( difference.mul( _percent ).div( 1e9 ) );
    }



    /* ========== VIEW FUNCTIONS ========== */

    // VESTING

    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint
     */
    function percentVestedFor( address _depositor ) public view returns ( uint percentVested_ ) {
        Bond memory bond = bonderInfo[ _depositor ];
        uint blocksSinceLast = block.number.sub( bond.lastBlock );

        if ( bond.vesting > 0 ) {
            percentVested_ = blocksSinceLast.mul( 10000 ).div( bond.vesting );
        } else {
            percentVested_ = 0;
        }
    }


    // PAYOUT
    
    /**
     *  @notice calculate amount of OHM available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint
     */
    function pendingPayoutFor( address _depositor ) external view returns ( uint pendingPayout_ ) {
        uint percentVested = percentVestedFor( _depositor );
        uint payout = bonderInfo[ _depositor ].payout;

        if ( percentVested >= 10000 ) {
            pendingPayout_ = payout;
        } else {
            pendingPayout_ = payout.mul( percentVested ).div( 10000 );
        }
    }
}