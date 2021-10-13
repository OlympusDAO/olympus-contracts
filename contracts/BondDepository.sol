// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

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
    event afterBond( uint index, uint price, uint internalPrice, uint debtRatio );
    event ControlVariableAdjustment( uint initialBCV, uint newBCV, uint adjustment, bool addition );




    /* ======== STRUCTS ======== */

    // Info about each type of bond
    struct BondType {
        IERC20 principal; // token to accept as payment
        IBondingCalculator calculator; // contract to value principal
        bool isLiquidityBond; // is principal a liquidity token
        bool isRiskAsset; // mint instead of deposit (no RFV)
        Terms terms; // terms of bond
        Adjust adjustment; // adjustment to terms of bond
        uint totalDebt; // total debt from bond 
        uint lastDecay; // last block when debt was decayed
    }

    // Info for creating new bonds
    struct Terms {
        uint controlVariable; // scaling variable for price
        uint vestingTerm; // in blocks
        uint minimumPrice; // vs principal value
        uint maxPayout; // in thousandths of a %. i.e. 500 = 0.5%
        uint fee; // as % of bond payout, in hundreths. ( 500 = 5% = 0.05 for every 1 paid)
        uint maxDebt; // 9 decimal debt ratio, max % total supply created as debt
    }

    

    // Info for incremental adjustments to control variable 
    struct Adjust {
        bool add; // addition or subtraction
        uint delta; // BCV when adjustment finished
        uint blocksToTarget; // blocks until target reached
        uint lastBlock; // block when last adjustment made
    }



    /* ======== STATE VARIABLES ======== */

    mapping( uint => BondType ) public bonds;
    address[] public BIDs; // bond IDs

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
     * @notice initializes bond parameters
     * @param _principal address
     * @param _calculator address
     * @param _controlVariable uint
     * @param _vestingTerm uint
     * @param _minimumPrice uint
     * @param _maxPayout uint
     * @param _fee uint
     * @param _maxDebt uint
     * @param _initialDebt uint
     */
    function addBondType( 
        address _principal,
        address _calculator,
        bool _isRisk,
        uint _controlVariable, 
        uint _vestingTerm,
        uint _minimumPrice,
        uint _maxPayout,
        uint _fee,
        uint _maxDebt,
        uint _initialDebt
    ) external onlyGuardian() {
        // TODO: need a reverse lookup table to determine if the bond already exists. 
        // You can have multiple bonds with the same principle!
        require( bonds[ _principal ].terms.controlVariable == 0, "Bonds must be initialized from 0" );
        require( address( bonds[ _principal ].principal ) == address(0), "Cannot replace existing bond" );

        Terms memory terms = Terms ({
            controlVariable: _controlVariable,
            vestingTerm: _vestingTerm,
            minimumPrice: _minimumPrice,
            maxPayout: _maxPayout,
            fee: _fee,
            maxDebt: _maxDebt
        });

        bonds[ BIDs.length ] = BondType({
            principal: IERC20( _principal ),
            calculator: IBondingCalculator( _calculator ),
            isLiquidityBond: ( _calculator != address(0) ),
            isRiskAsset: _isRisk,
            terms: terms,
            adjustment: Adjust(false, 0, 0, 0),
            totalDebt: _initialDebt,
            lastDecay: block.number
        });

        BIDs.push( _principal ); 
    }

    enum PARAMETER { VESTING, PAYOUT, FEE, DEBT }
    /**
     * @notice set parameters for new bonds
     * @param _BID uint
     * @param _parameter PARAMETER
     * @param _input uint
     */
    function setBondTerms ( uint _BID, PARAMETER _parameter, uint _input ) external onlyGovernor() {
        if ( _parameter == PARAMETER.VESTING ) { // 0
            bonds[ _BID ].terms.vestingTerm = _input;
        } else if ( _parameter == PARAMETER.PAYOUT ) { // 1
            bonds[ _BID ].terms.maxPayout = _input;
        } else if ( _parameter == PARAMETER.FEE ) { // 2
            bonds[ _BID ].terms.fee = _input;
        } else if ( _parameter == PARAMETER.DEBT ) { // 3
            bonds[ _BID ].terms.maxDebt = _input;
        }
    }

    /**
     * @notice set control variable adjustment
     * @param _BID uint
     * @param _addition bool
     * @param _delta uint
     * @param _blocks uint
     */
    function setAdjustment ( 
        uint _BID,
        bool _addition,
        uint _delta,
        uint _blocks
    ) external {
        require( msg.sender == governor() || msg.sender == guardian(), "Not governor or guardian" );
        
        require( _blocks <= 3300, "Adjustment: Change too fast" ); // must take at least 4 hours

        bonds[ _BID ].adjustment = Adjust({
            add: _addition,
            delta: _delta,
            blocksToTarget: _blocks,
            lastBlock: block.number
        });
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
     * @return uint
     */
    function deposit( 
        uint _amount, 
        uint _maxPrice,
        address _depositor,
        uint _BID,
        uint _FID
    ) external returns ( uint ) {
        require( _depositor != address(0), "Invalid address" );

        BondType memory info = bonds[ _BID ];
        address principal = address( info.principal );

        emit beforeBond( _BID, bondPriceInUSD( principal ), bondPrice( principal ), debtRatio( principal ) ); 
        
        decayDebt( principal );

        require( info.totalDebt <= info.terms.maxDebt, "Max debt exceeded" );
        
        require( _maxPrice >= _bondPrice( principal ), "Slippage limit: more than max price" ); // slippage protection

        uint value = treasury.valueOf( principal, _amount );
        uint payout = payoutFor( value, principal ); // payout to bonder is computed

        require( payout >= 10000000, "Bond too small" ); // must be > 0.01 OHM ( underflow protection )
        require( payout <= maxPayout( principal ), "Bond too large"); // size protection because there is no slippage

        if ( !info.isRiskAsset ) { // deposit principal
            info.principal.approve( address( treasury ), _amount );
            treasury.deposit( msg.sender, _amount, principal, value );
        } else { // send principal and mint payout (principal not minted against)
            info.principal.safeTransfer( address( treasury ), _amount );
        }
        
        // total debt is increased
        bonds[ _BID ].totalDebt = info.totalDebt.add( value ); 

        // price change event emitted        
        emit afterBond( _BID, bondPriceInUSD( principal ), bondPrice( principal ), debtRatio( principal ) );
        
        // user info stored with teller
        teller.newBond( _depositor, payout, info.terms.vestingTerm, _FID );

        return payout; 
    }


    
    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     * @notice make adjustment to control variable
     * @param _BID uint
     */
    function adjust( uint _BID ) internal {
        Adjust memory adjustment = bonds[ _BID ].adjustment;

        if( adjustment.delta != 0 ) {
            uint initial = bonds[ _BID ].terms.controlVariable;
            uint blocksSinceLast = block.number.sub( adjustment.lastBlock );
            uint change = changeBy( _BID );

            bonds[ _BID ].adjustment.delta = adjustment.delta.sub( change );
            bonds[ _BID ].adjustment.blocksToTarget = adjustment.blocksToTarget.sub( blocksSinceLast );

            if ( adjustment.add ) {
                bonds[ _BID ].terms.controlVariable = bonds[ _BID ].terms.controlVariable.add( change );
            } else {
                bonds[ _BID ].terms.controlVariable = bonds[ _BID ].terms.controlVariable.sub( change );
            }

            bonds[ _BID ].adjustment.lastBlock = block.number;

            emit ControlVariableAdjustment( 
                initial, 
                bonds[ _BID ].terms.controlVariable, 
                change, 
                adjustment.add 
            );
        }
    }

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
    function bondTypeInfo( uint _BID ) external view returns (
        address principal_,
        address calculator_,
        bool isLiquidityBond_,
        uint totalDebt_,
        uint lastBondCreatedAt_
    ) {
        BondType memory info = bonds[ _BID ];
        principal_ = address( info.principal );
        calculator_ = address( info.calculator );
        isLiquidityBond_ = info.isLiquidityBond;
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
        fee_ = terms.fee;
        maxDebt_ = terms.maxDebt;
    }
    
    /**
     * @notice returns pending BCV adjustment for a bond type
     * @param _BID uint
     * @return controlVariable_ uint
     * @return add_ bool
     * @return delta_ uint
     * @return blocksToTarget_ uint
     * @return lastBlock_ uint
     */
    function bondAdjustment( uint _BID ) external view returns (
        uint controlVariable_,
        bool add_,
        uint delta_,
        uint blocksToTarget_,
        uint lastBlock_
    ) {
        BondType memory info = bonds[ _BID ];
        Adjust memory adjustment = info.adjustment;

        controlVariable_ = info.terms.controlVariable;
        add_ = adjustment.add;
        delta_ = adjustment.delta;
        blocksToTarget_ = adjustment.blocksToTarget;
        lastBlock_ = adjustment.lastBlock;
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
        return payoutFor( ITreasury.valueOf( principal, _amount), principal );
    }


    // BOND CONTROL VARIABLE

    /**
     * @notice returns current BCV for principal including adjustment
     * @param _BID uint
     * @return BCV_ uint
     */
    function BCV( uint _BID ) public view returns ( uint BCV_ ) {
        Adjust memory info = bonds[ _BID ];

        uint change = changeBy( _BID );

        if ( info.adjustment.add ) {
            BCV_ = info.terms.controlVariable.add( change );
        } else {
            BCV_ = info.terms.controlVariable.sub( change );
        }
    }

    /**
     *  @notice amount to change BCV by
     *  @param _BID uint
     *  @return changeBy_ uint
     */
    function changeBy( uint _BID ) internal view returns ( uint changeBy_ ) {
        Adjust memory adjustment = bonds[ _BID ].adjustment;

        uint blocksSinceLast = block.number.sub( adjustment.lastBlock );

        changeBy_ = adjustment.delta.mul( blocksSinceLast ).div( adjustment.blocksToTarget );

        if ( changeBy_ > adjustment.delta ) {
            changeBy_ = adjustment.delta;
        }
    }


    // BOND PRICE

    /**
     * @notice calculate current bond premium
     * @param _BID uint
     * @return price_ uint
     */
    function bondPrice( address _BID ) public view returns ( uint price_ ) { 
        price_ = BCV( _BID ).mul( debtRatio( _BID ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < bonds[ _BID ].terms.minimumPrice ) {
            price_ = bonds[ _BID ].terms.minimumPrice;
        }
    }

    /**
     * @notice calculate current bond price and remove floor if above
     * @return price_ uint
     */
    function _bondPrice( address _BID ) internal returns ( uint price_ ) {
        BondType memory info = bonds[ _BID ];
        adjust( _BID );
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
        BondType memory bond = bonds[ _BID ];
        if( bond.isLiquidityBond ) {
            price_ = bondPrice( _BID ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 100 );
        } else {
            price_ = bondPrice( _BID ).mul( 10 ** IERC20Metadata(address(bond.principal)).decimals() ).div( 100 );
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
        BondType memory bond = bonds[ _BID ];
        if ( bond.isLiquidityBond ) {
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
        BondType memory bond = bonds[ _BID ];
        uint blocksSinceLast = block.number.sub( bond.lastDecay );
        decay_ = bond.totalDebt.mul( blocksSinceLast ).div( bond.terms.vestingTerm );
        if ( decay_ > bond.totalDebt ) {
            decay_ = bond.totalDebt;
        }
    }
}