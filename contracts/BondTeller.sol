// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";

// TODO(zx): These staking Interfaces are not consistent
interface IStaking {
    function stake( uint _amount, address _recipient ) external returns ( bool );
}

interface IwsOHM {
    function getAgnosticAmount( uint _amount ) external view returns ( uint );
    function fromAgnosticAmount( uint _amount ) external view returns ( uint );
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
        address principal; // token used to pay for bond
        uint principalPaid; // amount of principal token paid for bond
        uint payout; // sOHM remaining to be paid. agnostic balance
        uint vested; // Block when vested
        uint created; // time bond was created
        uint redeemed; // time bond was redeemed
    }



    /* ========== STATE VARIABLES ========== */

    address depository; // contract where users deposit bonds
    address immutable staking; // contract to stake payout
    IERC20 immutable OHM; 
    IERC20 immutable sOHM; // payment token
    ITreasury immutable treasury; 
    IwsOHM immutable wsOHM;

    mapping( address => Bond[] ) public bonderInfo; // user data

    mapping( uint => address ) public FIDs; // front end operator ID and address

    uint public feReward;



    /* ========== CONSTRUCTOR ========== */

    constructor( 
        address _depository, 
        address _staking, 
        address _treasury,
        address _OHM, 
        address _sOHM, 
        address _wsOHM 
    ) {
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
        require( _wsOHM != address(0) );
        wsOHM = IwsOHM( _wsOHM );
    }



    /* ========== DEPOSITORY FUNCTIONS ========== */

    /**
     * @notice add new bond payout to user data
     * @param _bonder address
     * @param _principal address
     * @param _principalPaid uint
     * @param _payout uint
     * @param _vesting uint
     * @return uint
     */
    function newBond( 
        address _bonder, 
        address _principal,
        uint _principalPaid,
        uint _payout, 
        uint _vesting,
        uint _fid
    ) external onlyDepository() returns ( uint ) {
        treasury.mintRewards( address(this), _payout.add( feReward ) );

        OHM.approve( staking, _payout.add( feReward ) ); // approve staking payout

        uint staked = IStaking( staking ).stake( _payout.add( feReward ), address(this), true );

        sOHM.safeTransfer( FIDs[ _fid ], feReward );

        // store bond & stake payout
        bonderInfo[ _bonder ].push( Bond({ 
            principal: _principal,
            principalPaid: _principalPaid,
            payout: wsOHM.toAgnosticAmount( staked ),
            vested: block.number.add( _vesting ),
            created: block.timestamp,
            redeemed: 0
        } ) );

        // indexed events are emitted
        emit BondCreated( _bonder, _payout, newVesting );

        // return the index number relevent to the bond
        return bonderInfo[ _bonder ].length.sub( 1 );
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
            Bond memory info = bonderInfo[ _bonder ][ _indexes[ i ] ];

            if ( pendingFor( _bonder, _indexes[ i ] ) != 0 ) {
                bonderInfo[ _bonder ][ _indexes[ i ] ].redeemed = block.timestamp; // mark as redeemed
                
                dues = dues.add( info.payout );
            }
        }

        dues = wsOHM.fromAgnosticAmount( dues );

        emit Redeemed( _bonder, dues );
        pay( _bonder, dues );
        return dues;
    }

    // create ID as front end operator
    function addFID( uint _fid, address _address ) external {
        require( FIDs[ _fid ] == address(0), "FID already mapped" );
        FIDs[ _fid ] = _address;
    }



    /* ========== OWNABLE FUNCTIONS ========== */

    function setFEReward( uint reward ) external {
        require( msg.sender == policy, "Only policy" );

        feReward = reward;
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
            if( info[ i ].redeemed == 0 ) {
                indexes_.push( i );
            }
        }
    }

    // PAYOUT

    /**
     * @notice calculate amount of OHM available for claim for single bond
     * @param _bonder address
     * @param _index uint
     * @return uint
     */
    function pendingFor( address _bonder, uint _index ) public view returns ( uint ) {
        if ( bonderInfo[ _bonder ][ _index ].redeemed == 0 && percentVestedFor( _bonder, _index ) >= 1e9 ) {
            return bonderInfo[ _bonder ][ _index ].payout;
        }
        return 0;
    }
    
    /**
     * @notice calculate amount of OHM available for claim for array of bonds
     * @param _bonder address
     * @param _indexes uint[] calldata
     * @return pendingPayout_ uint
     */
    function pendingForIndexes( 
        address _bonder, 
        uint[] calldata _indexes 
    ) external view returns ( uint pendingPayout_ ) {
        for( uint i = 0; i < _indexes.length; i++ ) {
            pendingPayout_ = pendingPayout_.add( pendingFor( _bonder, i ) );
        }
        pendingPayout_ = wsOHM.fromAgnosticAmount( pendingPayout_ );
    }

    /**
     *  @notice total pending on all bonds for bonder
     *  @param _bonder address
     *  @return uint
     */
    function totalPendingFor( address _bonder ) external view returns ( uint ) {
        return pendingForIndexes( _bonder, indexesFor( _bonder ) );
    }

    /**
     * @notice amount of each bond claimable as array
     * @param _bonder address
     * @return pending_ uint[]
     */
    function allPendingFor( address _bonder ) external view returns ( uint[] pending_ ) {
        for( uint i = 0; i < _indexes.length; i++ ) {
            pending_.push( wsOHM.fromAgnosticAmount( pendingFor( _bonder, i ) ) );
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

        uint timeSince = block.timestamp.sub( bond.created );
        uint term = bond.vested.sub( bond.created );

        percentVested_ = timeSince.mul( 1e9 ).div( term );
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
