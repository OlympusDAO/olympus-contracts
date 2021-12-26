// SPDX-License-Identifier: AGPL-3.0-or-later\
pragma solidity 0.7.5;

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

interface ITreasury {
    function deposit( uint _amount, address _token, uint _profit ) external returns ( uint );
}

interface IgOHM {
    function balanceTo( uint amount ) external view returns ( uint );
    function balanceFrom( uint amount ) external view returns ( uint );
}

interface IStaking {
    function stake( address _to, uint _amount, bool _rebasing, bool _claim ) external returns ( uint256 );
}

/**
 *  This contract allows Olympus seed investors and advisors to claim tokens.
 *  It has been revised to consider claims as staked immediately for accounting purposes.
 *  This ensures that network ownership does not exceed disclosed levels.
 *  Claimants remain protected from network dilution that may arise, but claim and stake
 *  does not allow them to grow ownership beyond predefined levels. This change also penalizes
 *  sellers, since the tokens sold are still considered staked within this contract. This  
 *  step was taken to ensure fair distribution of exposure in the network.  
 */
contract InvestorClaimV2 {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint;
    using SafeERC20 for IERC20;



    /* ========== STRUCTS ========== */

    struct Term {
        uint percent; // 4 decimals ( 5000 = 0.5% )
        uint gClaimed; // rebase-agnostic number
        uint max; // maximum nominal OHM amount can claim
    }



    /* ========== STATE VARIABLES ========== */
    
    address owner; // can set terms
    address newOwner; // push/pull model for changing ownership
    
    IERC20 immutable OHM; // claim token
    IERC20 immutable DAI; // payment token

    ITreasury immutable treasury; // mints claim token
    IStaking immutable staking; // stake OHM for sOHM

    address immutable DAO; // holds non-circulating supply
    IgOHM immutable gOHM; // tracks rebase-agnostic balance
    
    mapping( address => Term ) public terms; // tracks address info
    
    mapping( address => address ) public walletChange; // facilitates address change

    uint public totalAllocated; // as percent of supply (4 decimals: 10000 = 1%)
    uint public maximumAllocated; // maximum portion of supply can allocate



    /* ========== CONSTRUCTOR ========== */
    
    constructor( 
        address _ohm, 
        address _dai, 
        address _treasury, 
        address _DAO, 
        address _gOHM, 
        address _staking,
        uint _maximumAllocated
    ) {
        owner = msg.sender;

        require( _ohm != address(0) );
        OHM = IERC20( _ohm );

        require( _dai != address(0) );
        DAI = IERC20( _dai );

        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );

        require( _DAO != address(0) );
        DAO = _DAO;

        require( _gOHM != address(0) );
        gOHM = IgOHM( _gOHM );
        
        require( _staking != address(0) );
        staking = IStaking( _staking );

        maximumAllocated = _maximumAllocated;
    }



    /* ========== USER FUNCTIONS ========== */
    
    /**
     *  @notice allows wallet to claim OHM
     *  @param _to address
     *  @param _amount uint
     */
    function claim( address _to, uint _amount ) external {
        OHM.safeTransfer( _to, _claim( _amount ) );
    }

    /**
     *  @notice allows wallet to claim OHM and stake. set _claim = true if warmup is 0.
     *  @param _to address
     *  @param _amount uint
     *  @param _rebasing bool
     *  @param _claimFromStaking bool
     */
    function stake( address _to, uint _amount, bool _rebasing, bool _claimFromStaking ) external {
        uint toStake = _claim( _amount );

        OHM.approve( address( staking ), toStake );
        staking.stake( _to, toStake, _rebasing, _claimFromStaking );
    }

    /**
     *  @notice logic for claiming OHM
     *  @param _amount uint
     *  @return toSend_ uint
     */
    function _claim( uint _amount ) internal returns ( uint toSend_ ) {
        DAI.safeTransferFrom( msg.sender, address( this ), _amount ); // transfer DAI payment in
        
        DAI.approve( address( treasury ), _amount ); // approve and
        toSend_ = treasury.deposit( _amount, address( DAI ), 0 ); // deposit into treasury, receive OHM

        // ensure claim is within bounds
        require( claimableFor( msg.sender ).div( 1e9 ) >= toSend_, 'Not enough vested' );
        require( terms[ msg.sender ].max.sub( claimed( msg.sender ) ) >= toSend_, 'Claimed over max' );

        // add amount to tracked balance
        terms[ msg.sender ].gClaimed = terms[ msg.sender ].gClaimed.add( gOHM.balanceTo( toSend_ ) );
    }

    /**
     *  @notice allows address to push terms to new address
     *  @param _newAddress address
     */
    function pushWalletChange( address _newAddress ) external {
        require( terms[ msg.sender ].percent != 0 );
        walletChange[ msg.sender ] = _newAddress;
    }
    
    /**
     *  @notice allows new address to pull terms
     *  @param _oldAddress address
     */
    function pullWalletChange( address _oldAddress ) external {
        require( walletChange[ _oldAddress ] == msg.sender, "wallet did not push" );
        
        walletChange[ _oldAddress ] = address(0);
        terms[ msg.sender ] = terms[ _oldAddress ];
        delete terms[ _oldAddress ];
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
     *  @notice view OHM claimable for address. DAI decimals (18).
     *  @param _address address
     *  @return uint
     */
    function claimableFor( address _address ) public view returns (uint) {
        Term memory info = terms[ _address ];

        uint max = circulatingSupply().mul( info.percent ).mul( 1e3 );
        if ( max > info.max ) {
            max = info.max;
        }

        return max.sub( claimed( _address ).mul( 1e9 ) );
    }

    /**
     *  @notice view OHM claimed by address. OHM decimals (9).
     *  @param _address address
     *  @return uint
     */
    function claimed( address _address ) public view returns ( uint ) {
        return gOHM.balanceFrom( terms[ _address ].gClaimed );
    }

    /**
     *  @notice view circulating supply of OHM
     *  @notice calculated as total supply minus DAO holdings
     *  @return uint
     */
    function circulatingSupply() public view returns ( uint ) {
        return OHM.totalSupply().sub( OHM.balanceOf( DAO ) );
    }



    /* ========== OWNER FUNCTIONS ========== */

    /**
     *  @notice set terms for new address
     *  @notice cannot lower for address or exceed maximum total allocation
     *  @param _address address
     *  @param _max uint
     *  @param _rate uint
     *  @param _gHasClaimed uint
     */
    function setTerms(address _address, uint _max, uint _rate, uint _gHasClaimed ) external {
        require( msg.sender == owner, "Sender is not owner" );
        require( _max >= terms[ _address ].max, "cannot lower amount claimable" );
        require( _rate >= terms[ _address ].percent, "cannot lower vesting rate" );
        require( totalAllocated.add( _rate ) <= maximumAllocated, "Cannot allocate more" );

        if( terms[ _address ].max == 0 ) {
            terms[ _address ].gClaimed = _gHasClaimed;
        } 

        terms[ _address ].max = _max;
        terms[ _address ].percent = _rate;

        totalAllocated = totalAllocated.add( _rate );
    }

    /**
     *  @notice push ownership of contract
     *  @param _newOwner address
     */
    function pushOwnership( address _newOwner ) external {
        require( msg.sender == owner, "Sender is not owner" );
        require( _newOwner != address(0) );
        newOwner = _newOwner;
    }
    
    /**
     *  @notice pull ownership of contract
     */
    function pullOwnership() external {
        require( msg.sender == newOwner );
        owner = newOwner;
        newOwner = address(0);
    }

    /**
     *  @notice renounce ownership of contract (no owner)
     */
     function renounceOwnership() external {
         require( msg.sender == owner, "Sender is not owner" );
         owner = address(0);
         newOwner = address(0);
     }
}