// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

import "./libraries/Address.sol";

import "./types/ERC20Permit.sol";

import "./interfaces/IgOHM.sol";
import "./interfaces/IStaking.sol";

contract sOlympus is ERC20Permit {

    /* ========== EVENTS ========== */

    event LogSupply(uint256 indexed epoch, uint256 timestamp, uint256 totalSupply );
    event LogRebase( uint256 indexed epoch, uint256 rebase, uint256 index );
    event LogStakingContractUpdated( address stakingContract );

    /* ========== MODIFIERS ========== */

    modifier onlyStakingContract() {
        require( msg.sender == stakingContract, "Caller is not staking contract");
        _;
    }

    /* ========== DATA STRUCTURES ========== */

    struct Rebase {
        uint epoch;
        uint rebase; // 18 decimals
        uint totalStakedBefore;
        uint totalStakedAfter;
        uint amountRebased;
        uint index;
        uint blockNumberOccured;
    }

    /* ========== STATE VARIABLES ========== */

    address public initializer;

    uint public INDEX; // Index Gons - tracks rebase growth

    address public stakingContract; // balance used to calc rebase
    IgOHM public gOHM; // additional staked supply (governance token)

    Rebase[] public rebases; // past rebase data    

    uint256 private constant MAX_UINT256 = ~uint256(0);
    uint256 private constant INITIAL_FRAGMENTS_SUPPLY = 5000000 * 10**9;

    // TOTAL_GONS is a multiple of INITIAL_FRAGMENTS_SUPPLY so that _gonsPerFragment is an integer.
    // Use the highest value that fits in a uint256 for max granularity.
    uint256 private constant TOTAL_GONS = MAX_UINT256 - (MAX_UINT256 % INITIAL_FRAGMENTS_SUPPLY);

    // MAX_SUPPLY = maximum integer < (sqrt(4*TOTAL_GONS + 1) - 1) / 2
    uint256 private constant MAX_SUPPLY = ~uint128(0);  // (2^128) - 1

    uint256 private _gonsPerFragment;
    mapping(address => uint256) private _gonBalances;

    mapping ( address => mapping ( address => uint256 ) ) private _allowedValue;

    /* ========== CONSTRUCTOR ========== */

    constructor() ERC20("Staked OHM", "sOHM", 9) ERC20Permit() {
        initializer = msg.sender;
        _totalSupply = INITIAL_FRAGMENTS_SUPPLY;
        _gonsPerFragment = TOTAL_GONS / _totalSupply;
    }

    /* ========== INITIALIZATION ========== */

    function setIndex( uint _INDEX ) external {
        require( msg.sender == initializer, "Caller must be initializer");
        require( INDEX == 0, "Index cannot be 0");
        INDEX = gonsForBalance( _INDEX );
    }

    function setgOHM( address _gOHM ) external {
        require( msg.sender == initializer );
        require( address( gOHM ) == address(0) );
        require( _gOHM != address(0) );
        gOHM = IgOHM( _gOHM );
    }
    
    // do this last
    function initialize( address stakingContract_ ) external {
        require( msg.sender == initializer );

        require( stakingContract_ != address(0) );
        stakingContract = stakingContract_;
        _gonBalances[ stakingContract ] = TOTAL_GONS;

        emit Transfer( address(0x0), stakingContract, _totalSupply );
        emit LogStakingContractUpdated( stakingContract_ );
        
        initializer = address(0);
    }

    /* ========== REBASE ========== */

    /**
        @notice increases rOHM supply to increase staking balances relative to profit_
        @param profit_ uint256
        @return uint256
     */
    function rebase( uint256 profit_, uint epoch_ ) public onlyStakingContract() returns ( uint256 ) {
        uint256 rebaseAmount;
        uint256 circulatingSupply_ = circulatingSupply();

        if ( profit_ == 0 ) {
            emit LogSupply( epoch_, block.timestamp, _totalSupply );
            emit LogRebase( epoch_, 0, index() );
            return _totalSupply;
        } else if ( circulatingSupply_ > 0 ){
            rebaseAmount = profit_ * _totalSupply / circulatingSupply_;
        } else {
            rebaseAmount = profit_;
        }

        _totalSupply = _totalSupply + rebaseAmount;

        if ( _totalSupply > MAX_SUPPLY ) {
            _totalSupply = MAX_SUPPLY;
        }

        _gonsPerFragment = TOTAL_GONS / _totalSupply;

        _storeRebase( circulatingSupply_, profit_, epoch_ );

        return _totalSupply;
    }

    /**
        @notice emits event with data about rebase
        @param previousCirculating_ uint
        @param profit_ uint
        @param epoch_ uint
     */
    function _storeRebase( uint previousCirculating_, uint profit_, uint epoch_ ) internal {
        uint rebasePercent = profit_ * 1e18 /  previousCirculating_;

        rebases.push( Rebase ( {
            epoch: epoch_,
            rebase: rebasePercent, // 18 decimals
            totalStakedBefore: previousCirculating_,
            totalStakedAfter: circulatingSupply(),
            amountRebased: profit_,
            index: index(),
            blockNumberOccured: block.number
        }));
        
        emit LogSupply( epoch_, block.timestamp, _totalSupply );
        emit LogRebase( epoch_, rebasePercent, index() );
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function transfer( address to, uint256 value ) public override returns (bool) {
        uint256 gonValue = value * _gonsPerFragment;
        _gonBalances[ msg.sender ] -= gonValue;
        _gonBalances[ to ] += gonValue;
        emit Transfer( msg.sender, to, value );
        return true;
    }

    function transferFrom( address from, address to, uint256 value ) public override returns (bool) {
       _allowedValue[ from ][ msg.sender ] -= value;
       emit Approval( from, msg.sender,  _allowedValue[ from ][ msg.sender ] );

       uint256 gonValue = gonsForBalance( value );
       _gonBalances[ from ] -= gonValue;
       _gonBalances[ to ] += gonValue;
       emit Transfer( from, to, value );

       return true;
    }

    function approve( address spender, uint256 value ) public override returns (bool) {
         _allowedValue[ msg.sender ][ spender ] = value;
         emit Approval( msg.sender, spender, value );
         return true;
    }

    function increaseAllowance( address spender, uint256 addedValue ) public override returns (bool) {
        _allowedValue[ msg.sender ][ spender ] += addedValue;
        emit Approval( msg.sender, spender, _allowedValue[ msg.sender ][ spender ] );
        return true;
    }

    function decreaseAllowance( address spender, uint256 subtractedValue ) public override returns (bool) {
        uint256 oldValue = _allowedValue[ msg.sender ][ spender ];
        if (subtractedValue >= oldValue) {
            _allowedValue[ msg.sender ][ spender ] = 0;
        } else {
            _allowedValue[ msg.sender ][ spender ] = oldValue - subtractedValue;
        }
        emit Approval( msg.sender, spender, _allowedValue[ msg.sender ][ spender ] );
        return true;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    // called in a permit
    function _approve( address owner, address spender, uint256 value ) internal override virtual {
        _allowedValue[owner][spender] = value;
        emit Approval( owner, spender, value );
    }

    /* ========== VIEW FUNCTIONS ========== */

    function balanceOf( address who ) public view override returns ( uint256 ) {
        return _gonBalances[ who ] / ( _gonsPerFragment );
    }

    function gonsForBalance( uint amount ) public view returns ( uint ) {
        return amount * ( _gonsPerFragment );
    }

    function balanceForGons( uint gons ) public view returns ( uint ) {
        return gons / _gonsPerFragment;
    }

    // Staking contract holds excess rOHM
    function circulatingSupply() public view returns ( uint ) {
        return _totalSupply
                    - balanceOf( stakingContract )
                    + gOHM.balanceFrom( IERC20( address(gOHM) ).totalSupply() )
                    + IStaking( stakingContract ).supplyInWarmup();
    }

    function index() public view returns ( uint ) {
        return balanceForGons( INDEX );
    }

    function allowance( address owner_, address spender ) public view override returns ( uint256 ) {
        return _allowedValue[ owner_ ][ spender ];
    }
}