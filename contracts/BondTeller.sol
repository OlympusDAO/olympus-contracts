// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IgOHM.sol";
import "./interfaces/IStaking.sol";

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
    IStaking immutable staking; // contract to stake payout
    ITreasury immutable treasury; 
    IERC20 immutable OHM; 
    IERC20 immutable sOHM; // payment token
    IgOHM immutable gOHM;

    mapping( address => Bond[] ) public bonderInfo; // user data
    mapping( address => uint[] ) public bonds; // user bond indexes
    mapping( address => mapping( uint => address ) ) public approvals; // approval to transfer bond

    mapping( address => uint ) public FEO; // front end operator rewards
    uint public feReward;
    
    address public policy;



    /* ========== CONSTRUCTOR ========== */

    constructor( 
        address _depository, 
        address _staking, 
        address _treasury,
        address _OHM, 
        address _sOHM, 
        address _gOHM 
    ) {
        require( _depository != address(0) );
        depository = _depository;
        require( _staking != address(0) );
        staking = IStaking( _staking );
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _sOHM != address(0) );
        sOHM = IERC20( _sOHM );
        require( _gOHM != address(0) );
        gOHM = IgOHM( _gOHM );
        IERC20( OHM ).approve( _staking, 1e27 ); // saves gas
    }



    /* ========== DEPOSITORY FUNCTIONS ========== */

    /**
     * @notice add new bond payout to user data
     * @param _bonder address
     * @param _principal address
     * @param _principalPaid uint
     * @param _payout uint
     * @param _expires uint
     * @param _feo address
     * @return index_ uint
     */
    function newBond( 
        address _bonder, 
        address _principal,
        uint _principalPaid,
        uint _payout, 
        uint _expires,
        address _feo
    ) external onlyDepository() returns ( uint index_ ) {
        index_ = bonderInfo[ _bonder ].length;
        treasury.mint( address(this), _payout );

        // store bond & stake payout
        bonderInfo[ _bonder ].push( Bond({ 
            principal: _principal,
            principalPaid: _principalPaid,
            payout: staking.stake( _payout, address(this), false, true ),
            vested: _expires,
            created: block.timestamp,
            redeemed: 0
        } ) );

        FEO[ _feo ] = FEO[ _feo ].add( _payout.mul( feReward ).div( 10000 ) );
    }

    /* ========== INTERACTABLE FUNCTIONS ========== */

    /**
     *  @notice redeems all redeemable bonds
     *  @param _bonder address
     *  @return uint
     */
    function redeemAll( address _bonder ) external returns ( uint ) {
        updateBonds( _bonder );
        return redeem( _bonder, bonds[ _bonder ] );
    }

    /** 
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _bonds calldata uint[]
     *  @return due_ uint
     */ 
    function redeem( address _bonder, uint[] memory _bonds ) public returns ( uint due_ ) {
        for( uint i = 0; i < _bonds.length; i++ ) {
            Bond memory info = bonderInfo[ _bonder ][ _bonds[ i ] ];

            if ( pendingFor( _bonder, _bonds[ i ] ) != 0 ) {
                bonderInfo[ _bonder ][ _bonds[ i ] ].redeemed = block.timestamp; // mark as redeemed
                
                due_ = due_.add( info.payout );
            }
        }

        emit Redeemed( _bonder, due_ );
        gOHM.transfer( _bonder, due_ );
    }

    /**
     * @notice approve _to to transfer bond _index
     * @dev call with _to = address(0) to revoke
     * @param _bond uint
     * @param _to address
     */
    function approve( uint _bond, address _to ) external {
        approvals[ msg.sender ][ _bond ] = _to;
    }

    /**
     * @notice transfer ownership of bond _index from _from to _to
     * @dev returns index of bond for to_
     * @param _bond address
     * @param _from address
     * @param _to address
     * @return index_ uint 
     */
    function transfer( uint _bond, address _from, address _to ) external returns ( uint index_ ) {
        require( approvals[ _from ][ _bond ] == _to, "Not approved" );
        approvals[ _from ][ _bond ] = address(0);

        index_ = bonderInfo[ _to ].length;

        bonderInfo[ _to ].push( bonderInfo[ _from ][ _bond ] );
        delete bonderInfo[ _from ][ _bond ];
    }

    /**
     * @notice pay front end operator accrued rewards
     * @param _operator address
     * @return amount_ uint
     */
    function pay( address _operator ) external returns ( uint amount_ ) {
        amount_ = FEO[ _operator ];
        treasury.mint( _operator, amount_ );
        FEO[ _operator ] = 0;
    }



    /* ========== OWNABLE FUNCTIONS ========== */

    /**
     * @notice set percentage of payout paid to front end operators (1% = 100)
     * @param reward uint
     */
    function setFEReward( uint reward ) external {
        require( msg.sender == policy, "Only policy" );

        feReward = reward;
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
     *  @notice returns indexes of live bonds
     *  @param _bonder address
     */
    function updateBonds( address _bonder ) public {
        Bond[] memory info = bonderInfo[ _bonder ];
        delete bonds[ _bonder ];
        for( uint i = 0; i < info.length; i++ ) {
            if( info[ i ].redeemed == 0 ) {
                bonds[ _bonder ].push( i );
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
        Bond memory info = bonderInfo[ _bonder ][ _index ];
        if ( info.created != 0 && info.redeemed == 0 && info.vested <= block.number ) {
            return info.payout;
        }
        return 0;
    }
    
    /**
     * @notice calculate amount of OHM available for claim for array of bonds
     * @param _bonder address
     * @param _bonds uint[]
     * @return pending_ uint
     */
    function pendingForIndexes( 
        address _bonder, 
        uint[] memory _bonds 
    ) public view returns ( uint pending_ ) {
        for( uint i = 0; i < _bonds.length; i++ ) {
            pending_ = pending_.add( pendingFor( _bonder, i ) );
        }
        pending_ = gOHM.balanceFrom( pending_ );
    }

    /**
     *  @notice total pending on all bonds for bonder
     *  @param _bonder address
     *  @return pending_ uint
     */
    function totalPendingFor( address _bonder ) public view returns ( uint pending_ ) {
        Bond[] memory info = bonderInfo[ _bonder ];
        for( uint i = 0; i < info.length; i++ ) {
            pending_ = pending_.add( pendingFor( _bonder, i ) );
        }
        pending_ = gOHM.balanceFrom( pending_ );
    }

    // VESTING

    /**
     * @notice calculate how far into vesting a depositor is
     * @param _bonder address
     * @param _index uint
     * @return percentVested_ uint
     */
    function percentVestedFor( address _bonder, uint _index ) public view returns ( uint percentVested_ ) {
        Bond memory bond = bonderInfo[ _bonder ][ _index ];

        uint timeSince = block.timestamp.sub( bond.created );
        uint term = bond.vested.sub( bond.created );

        percentVested_ = timeSince.mul( 1e9 ).div( term );
    }
}