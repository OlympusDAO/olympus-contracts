// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma abicoder v2;

import "./libraries/SafeMath.sol";
import "./libraries/FixedPoint.sol";
import "./libraries/Address.sol";
import "./libraries/SafeERC20.sol";

import "./types/Governable.sol";
import "./types/Guardable.sol";

import "./interfaces/ITreasury.sol";
import "./interfaces/IBondingCalculator.sol";
import "./interfaces/ITeller.sol";
import "./interfaces/IERC20Metadata.sol";

// TODO(zx): this doesn't compile
contract OlympusBondDepository is Governable, Guardable {

    using FixedPoint for *;
    using SafeERC20 for IERC20;
    using SafeMath for uint;



    /* ======== EVENTS ======== */

    event beforeBond( uint index, uint price, uint internalPrice, uint debtRatio );
    event CreateBond( uint index, uint amount, uint payout, uint expires );
    event afterBond( uint index, uint price, uint internalPrice, uint debtRatio );
    event ControlVariableAdjustment( uint initialBCV, uint newBCV, uint adjustment, bool addition );




    /* ======== STRUCTS ======== */

    // Info about each type of bond
    struct Bond {
        IERC20 principal; // token to accept as payment
        IBondingCalculator calculator; // contract to value principal

        Terms terms; // terms of bond
        uint capacity; // capacity remaining
        bool capacityIsPayout; // capacity limit is for payout vs principal

        uint totalDebt; // total debt from bond 
        uint lastDecay; // last block when debt was decayed
    }

    // Info for creating new bonds
    struct Terms {
        uint controlVariable; // scaling variable for price

        bool fixedTerm; // fixed term or fixed expiration
        uint vestingTerm; // term in blocks (fixed-term)
        uint expiration; // block number bond matures (fixed-expiration)
        uint conclusion; // block number bond no longer offered
        
        uint minimumPrice; // vs principal value
        uint maxPayout; // in thousandths of a %. i.e. 500 = 0.5%
        uint maxDebt; // 9 decimal debt ratio, max % total supply created as debt
    }



    /* ======== STATE VARIABLES ======== */

    mapping( uint => Bond ) public bonds;
    address[] public IDs; // bond IDs

    ITeller public teller; // handles payment

    ITreasury immutable treasury;
    IERC20 immutable OHM;



    /* ======== CONSTRUCTOR ======== */

    constructor ( 
        address _OHM,
        address _treasury
    ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
    }


    
    /* ======== POLICY FUNCTIONS ======== */

    /**
     * @notice creates a new bond type
     * @param _principal address
     * @param _calculator address
     * @param _controlVariable uint
     * @param _fixedTerm bool
     * @param _vestingTerm uint
     * @param _expiration uint
     * @param _conclusion uint
     * @param _maxPayout uint
     * @param _maxDebt uint
     * @param _initialDebt uint
     * @param _capacity uint
     * @param _capacityIsPayout bool
     */
    function addBond( 
        address _principal,
        address _calculator,
        uint _controlVariable, 
        bool _fixedTerm,
        uint _vestingTerm,
        uint _expiration,
        uint _conclusion,
        uint _maxPayout,
        uint _maxDebt,
        uint _initialDebt,
        uint _capacity,
        bool _capacityIsPayout
    ) external onlyGuardian() returns ( uint id_ ) {
        Terms memory terms = Terms ({
            controlVariable: _controlVariable,
            fixedTerm: _fixedTerm,
            vestingTerm: _vestingTerm,
            expiration: _expiration,
            conclusion: _conclusion,
            minimumPrice: 1e27,
            maxPayout: _maxPayout,
            maxDebt: _maxDebt
        });

        bonds[ IDs.length ] = Bond({
            principal: IERC20( _principal ),
            calculator: IBondingCalculator( _calculator ),
            terms: terms,
            totalDebt: _initialDebt,
            lastDecay: block.number,
            capacity: _capacity,
            capacityIsPayout: _capacityIsPayout
        });

        id_ = IDs.length;
        IDs.push( _principal );
    }

    /**
     * @notice set teller contract
     * @param _teller address
     */
    function setTeller( address _teller ) external onlyGovernor() {
        require( address( teller ) == address(0) );
        require( _teller != address(0) );
        teller = ITeller( _teller );
    }

    /**
     * @notice set minimum price for new bond
     * @param _id uint
     * @param _price uint
     */
    function initializeBond( uint _id, uint _price ) external onlyGuardian() {
        require( bonds[ _id ].terms.minimumPrice == 1e27, "Already initialized" );
        require( _price != 1e27 );
        bonds[ _id ].terms.minimumPrice = _price;
    }

    /**
     * @notice disable existing bond
     * @param _id uint
     */
    function deprecateBond( uint _id ) external onlyGuardian() {
        bonds[ _id ].capacity = 0;
    }

    /**
     * @notice set teller contract
     * @param _teller address
     */
    function setTeller( address _teller ) external onlyGovernor() {
        require( address( teller ) == address(0) );
        require( _teller != address(0) );
        teller = ITeller( _teller );
    }


    

    /* ======== MUTABLE FUNCTIONS ======== */

    /**
     * @notice deposit bond
     * @param _amount uint
     * @param _maxPrice uint
     * @param _depositor address
     * @param _BID uint
     * @param _feo address
     * @return uint
     */
    function deposit( 
        uint _amount, 
        uint _maxPrice,
        address _depositor,
        uint _BID,
        address _feo
    ) external returns ( uint, uint ) {
        require( _depositor != address(0), "Invalid address" );

        Bond memory info = bonds[ _BID ];

        require( bonds[ _BID ].terms.minimumPrice != 1e27, "Not initialized" );
        require( block.number < info.terms.conclusion, "Bond concluded" );

        emit beforeBond( _BID, bondPriceInUSD( _BID ), bondPrice( _BID ), debtRatio( _BID ) ); 
        
        decayDebt( _BID );

        require( info.totalDebt <= info.terms.maxDebt, "Max debt exceeded" );
        require( _maxPrice >= _bondPrice( _BID ), "Slippage limit: more than max price" ); // slippage protection

        uint value = treasury.valueOf( address( info.principal ), _amount );
        uint payout = payoutFor( value, _BID ); // payout to bonder is computed

        // ensure there is remaining capacity for bond
        if( info.capacityIsPayout ) { // capacity in payout terms
            require( info.capacity >= payout, "Bond concluded" );
            info.capacity = info.capacity.sub( payout );
        } else { // capacity in principal terms
            require( info.capacity >= _amount, "Bond concluded" );
            info.capacity = info.capacity.sub( _amount );
        }
        
        require( payout >= 10000000, "Bond too small" ); // must be > 0.01 OHM ( underflow protection )
        require( payout <= maxPayout( _BID ), "Bond too large"); // size protection because there is no slippage

        info.principal.safeTransfer( address( treasury ), _amount ); // send payout to treasury
        
        bonds[ _BID ].totalDebt = info.totalDebt.add( value ); // increase total debt

        uint expiration = info.terms.vestingTerm.add( block.number );
        if ( !info.terms.fixedTerm ) {
            expiration = info.terms.expiration;
        }
        
        // user info stored with teller
        uint index = teller.newBond( 
            _depositor, 
            address(info.principal),
            _amount,
            payout, 
            expiration, 
            _feo 
        );

        emit CreateBond( _BID, _amount, payout, expiration );

        return ( payout, index ); 
    }


    
    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     * @notice reduce total debt
     * @param _BID uint
     */
    function decayDebt( uint _BID ) internal {
        bonds[ _BID ].totalDebt = bonds[ _BID ].totalDebt.sub( debtDecay( _BID ) );
        bonds[ _BID ].lastDecay = block.number;
    }




    /* ======== VIEW FUNCTIONS ======== */

    // BOND TYPE INFO

    /**
     * @notice returns data about a bond type
     * @param _BID uint
     * @return principal_ address
     * @return calculator_ address
     * @return isLiquidityBond_ bool
     * @return totalDebt_ uint
     * @return lastBondCreatedAt_ uint
     */
    function bondInfo( uint _BID ) external view returns (
        address principal_,
        address calculator_,
        bool isLiquidityBond_,
        uint totalDebt_,
        uint lastBondCreatedAt_
    ) {
        Bond memory info = bonds[ _BID ];
        principal_ = address( info.principal );
        calculator_ = address( info.calculator );
        totalDebt_ = info.totalDebt;
        lastBondCreatedAt_ = info.lastDecay;
    }
    
    /**
     * @notice returns terms for a bond type
     * @param _BID uint
     * @return controlVariable_ uint
     * @return vestingTerm_ uint
     * @return minimumPrice_ uint
     * @return maxPayout_ uint
     * @return fee_ uint
     * @return maxDebt_ uint
     */
    function bondTerms( uint _BID ) external view returns (
        uint controlVariable_,
        uint vestingTerm_,
        uint minimumPrice_,
        uint maxPayout_,
        uint fee_,
        uint maxDebt_
    ) {
        Terms memory terms = bonds[ _BID ].terms;
        controlVariable_ = terms.controlVariable;
        vestingTerm_ = terms.vestingTerm;
        minimumPrice_ = terms.minimumPrice;
        maxPayout_ = terms.maxPayout;
        maxDebt_ = terms.maxDebt;
    }

    // PAYOUT

    /**
     * @notice determine maximum bond size
     * @param _BID uint
     * @return uint
     */
    function maxPayout( uint _BID ) public view returns ( uint ) {
        return OHM.totalSupply().mul( bonds[ _BID ].terms.maxPayout ).div( 100000 );
    }

    /**
     * @notice payout due for amount of treasury value
     * @param _value uint
     * @param _BID uint
     * @return uint
     */
    function payoutFor( uint _value, uint _BID ) public view returns ( uint ) {
        return FixedPoint.fraction( _value, bondPrice( _BID ) ).decode112with18().div( 1e16 );
    }

    /**
     * @notice payout due for amount of token
     * @param _amount uint
     * @param _BID uint
     */
    function payoutForAmount( uint _amount, uint _BID ) public view returns ( uint ) {
        address principal = address( bonds[ _BID ].principal );
        return payoutFor( treasury.valueOf( principal, _amount), _BID );
    }

    // BOND PRICE

    /**
     * @notice calculate current bond premium
     * @param _BID uint
     * @return price_ uint
     */
    function bondPrice( uint _BID ) public view returns ( uint price_ ) { 
        price_ = bonds[ _BID ].terms.controlVariable.mul( debtRatio( _BID ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < bonds[ _BID ].terms.minimumPrice ) {
            price_ = bonds[ _BID ].terms.minimumPrice;
        }
    }

    /**
     * @notice calculate current bond price and remove floor if above
     * @param _BID uint
     * @return price_ uint
     */
    function _bondPrice( uint _BID ) internal returns ( uint price_ ) {
        Bond memory info = bonds[ _BID ];
        price_ = info.terms.controlVariable.mul( debtRatio( _BID ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < info.terms.minimumPrice ) {
            price_ = info.terms.minimumPrice;        
        } else if ( info.terms.minimumPrice != 0 ) {
            bonds[ _BID ].terms.minimumPrice = 0;
        }
    }

    /**
     * @notice converts bond price to DAI value
     * @param _BID uint
     * @return price_ uint
     */
    function bondPriceInUSD( uint _BID ) public view returns ( uint price_ ) {
        Bond memory bond = bonds[ _BID ];
        if( address(bond.calculator) != address(0) ) {
            price_ = bondPrice( _BID ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 100 );
        } else {
            price_ = bondPrice( _BID ).mul( 10 ** IERC20Metadata( address(bond.principal) ).decimals() ).div( 100 );
        }
    }

    // DEBT

    /**
     * @notice calculate current ratio of debt to OHM supply
     * @param _BID uint
     * @return debtRatio_ uint
     */
    function debtRatio( uint _BID ) public view returns ( uint debtRatio_ ) {   
        debtRatio_ = FixedPoint.fraction( 
            currentDebt( _BID ).mul( 1e9 ), 
            OHM.totalSupply()
        ).decode112with18().div( 1e18 );
    }

    /**
     * @notice debt ratio in same terms for reserve or liquidity bonds
     * @return uint
     */
    function standardizedDebtRatio( uint _BID ) public view returns ( uint ) {
        Bond memory bond = bonds[ _BID ];
        if ( address(bond.calculator) != address(0) ) {
            return debtRatio( _BID ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 1e9 );
        } else {
            return debtRatio( _BID );
        }
    }

    /**
     * @notice calculate debt factoring in decay
     * @param _BID uint
     * @return uint
     */
    function currentDebt( uint _BID ) public view returns ( uint ) {
        return bonds[ _BID ].totalDebt.sub( debtDecay( _BID ) );
    }

    /**
     * @notice amount to decay total debt by
     * @param _BID uint
     * @return decay_ uint
     */
    function debtDecay( uint _BID ) public view returns ( uint decay_ ) {
        Bond memory bond = bonds[ _BID ];
        uint blocksSinceLast = block.number.sub( bond.lastDecay );
        decay_ = bond.totalDebt.mul( blocksSinceLast ).div( bond.terms.vestingTerm );
        if ( decay_ > bond.totalDebt ) {
            decay_ = bond.totalDebt;
        }
    }
}