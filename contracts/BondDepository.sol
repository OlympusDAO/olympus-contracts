// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/FixedPoint.sol";
import "./libraries/Address.sol";

import "./types/Governable.sol";
import "./types/Guardable.sol";

import "./interfaces/ITreasury.sol";
import "./interfaces/IBondingCalculator.sol";
import "./interfaces/ITeller.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IERC20Metadata.sol";

contract OlympusBondDepository is Governable, Guardable {

    using FixedPoint for *;
    using SafeERC20 for IERC20;
    using SafeMath for uint;



    /* ======== EVENTS ======== */

    event USDPriceChanged( uint before, uint current );
    event InternalPriceChanged( uint before, uint current );
    event DebtRatioChanged( uint before, uint current, uint stdBefore, uint stdCurrent );
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

    IERC20 immutable OHM; // token given as payment for bond
    ITreasury immutable treasury; // mints OHM when receives principal
    address public immutable DAO; // receives profit share from bond

    mapping( address => BondType ) bonds;

    address[] public principals;

    ITeller teller;



    /* ======== CONSTRUCTOR ======== */

    constructor ( 
        address _OHM,
        address _treasury, 
        address _DAO
    ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
        require( _DAO != address(0) );
        DAO = _DAO;
    }


    
    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice initializes bond parameters
     *  @param _principal address
     *  @param _calculator address
     *  @param _controlVariable uint
     *  @param _vestingTerm uint
     *  @param _minimumPrice uint
     *  @param _maxPayout uint
     *  @param _fee uint
     *  @param _maxDebt uint
     *  @param _initialDebt uint
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

        bonds[ _principal ] = BondType({
            principal: IERC20( _principal ),
            calculator: IBondingCalculator( _calculator ),
            isLiquidityBond: ( _calculator != address(0) ),
            isRiskAsset: _isRisk,
            terms: terms,
            adjustment: Adjust(false, 0, 0, 0),
            totalDebt: _initialDebt,
            lastDecay: block.number
        });

        principals.push( _principal );
    }

    enum PARAMETER { VESTING, PAYOUT, FEE, DEBT }
    /**
     *  @notice set parameters for new bonds
     *  @param _parameter PARAMETER
     *  @param _input uint
     */
    function setBondTerms ( address _principal, PARAMETER _parameter, uint _input ) external onlyGovernor() {
        if ( _parameter == PARAMETER.VESTING ) { // 0
            bonds[ _principal ].terms.vestingTerm = _input;
        } else if ( _parameter == PARAMETER.PAYOUT ) { // 1
            bonds[ _principal ].terms.maxPayout = _input;
        } else if ( _parameter == PARAMETER.FEE ) { // 2
            bonds[ _principal ].terms.fee = _input;
        } else if ( _parameter == PARAMETER.DEBT ) { // 3
            bonds[ _principal ].terms.maxDebt = _input;
        }
    }

    /**
     *  @notice set control variable adjustment
     *  @param _addition bool
     *  @param _delta uint
     *  @param _blocks uint
     */
    function setAdjustment ( 
        address _principal,
        bool _addition,
        uint _delta,
        uint _blocks
    ) external {
        require( msg.sender == governor() || msg.sender == guardian(), "Not governor or guardian" );
        
        require( _blocks <= 3300, "Adjustment: Change too fast" ); // must take at least 4 hours

        bonds[ _principal ].adjustment = Adjust({
            add: _addition,
            delta: _delta,
            blocksToTarget: _blocks,
            lastBlock: block.number
        });
    }


    

    /* ======== MUTABLE FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint
     *  @param _maxPrice uint
     *  @param _depositor address
     *  @param _principal address
     *  @return uint
     */
    function deposit( 
        uint _amount, 
        uint _maxPrice,
        address _depositor,
        address _principal
    ) external returns ( uint ) {
        require( _depositor != address(0), "Invalid address" );
        
        uint initialUSDPrice = bondPriceInUSD( _principal ); // Stored in bond info
        uint initialInternalPrice = bondPrice( _principal );
        uint initialDebtRatio = debtRatio( _principal );
        uint initialStdDebtRatio = standardizedDebtRatio( _principal );

        BondType memory info = bonds[ _principal ];

        decayDebt( _principal );
        require( info.totalDebt <= info.terms.maxDebt, "Max capacity reached" );
        
        

        require( _maxPrice >= _bondPrice( _principal ), "Slippage limit: more than max price" ); // slippage protection

        uint value = treasury.valueOf( _principal, _amount );
        uint payout = payoutFor( value, _principal ); // payout to bonder is computed

        require( payout >= 10000000, "Bond too small" ); // must be > 0.01 OHM ( underflow protection )
        require( payout <= maxPayout( _principal ), "Bond too large"); // size protection because there is no slippage

        if ( !info.isRiskAsset ) {
            // deposit principal from sender address to treasury
            treasury.deposit( msg.sender, _amount, _principal, value.sub( payout ) );
        } else {
            treasury.mintRewards( address(this), payout );
        }
        
        // total debt is increased
        bonds[ _principal ].totalDebt = info.totalDebt.add( value ); 

        // price change event emitted        
        emit InternalPriceChanged( initialInternalPrice, bondPrice( _principal ) );
        emit USDPriceChanged( initialUSDPrice, bondPriceInUSD( _principal ) );
        emit DebtRatioChanged( initialDebtRatio, debtRatio( _principal ), initialStdDebtRatio, standardizedDebtRatio( _principal ) );
        
        // user info stored with teller
        teller.newBond( _depositor, payout, info.terms.vestingTerm );

        return payout; 
    }



    
    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     *  @notice make adjustment to control variable
     */
    function adjust( address _principal ) internal {
        Adjust memory adjustment = bonds[ _principal ].adjustment;

        if( adjustment.delta != 0 ) {
            uint initial = bonds[ _principal ].terms.controlVariable;
            uint blocksSinceLast = block.number.sub( adjustment.lastBlock );
            uint change = changeBy( _principal );

            bonds[ _principal ].adjustment.delta = adjustment.delta.sub( change );
            bonds[ _principal ].adjustment.blocksToTarget = adjustment.blocksToTarget.sub( blocksSinceLast );

            if ( adjustment.add ) {
                bonds[ _principal ].terms.controlVariable = bonds[ _principal ].terms.controlVariable.add( change );
            } else {
                bonds[ _principal ].terms.controlVariable = bonds[ _principal ].terms.controlVariable.sub( change );
            }

            bonds[ _principal ].adjustment.lastBlock = block.number;

            emit ControlVariableAdjustment( 
                initial, 
                bonds[ _principal ].terms.controlVariable, 
                change, 
                adjustment.add 
            );
        }
    }

    /**
     *  @notice reduce total debt
     */
    function decayDebt( address _principal ) internal {
        bonds[ _principal ].totalDebt = bonds[ _principal ].totalDebt.sub( debtDecay( _principal ) );
        bonds[ _principal ].lastDecay = block.number;
    }




    /* ======== VIEW FUNCTIONS ======== */

    // BOND TYPE INFO

    /**
     *  @notice returns data about a bond type
     *  @param _principal address
     *  @return calculator_ address
     *  @return isLiquidityBond_ bool
     *  @return totalDebt_ uint
     *  @return lastBondCreatedAt_ uint
     */
    function bondTypeInfo( address _principal ) external view returns (
        address calculator_,
        bool isLiquidityBond_,
        uint totalDebt_,
        uint lastBondCreatedAt_
    ) {
        calculator_ = address( bonds[ _principal ].calculator );
        isLiquidityBond_ = bonds[ _principal ].isLiquidityBond;
        totalDebt_ = bonds[ _principal ].totalDebt;
        lastBondCreatedAt_ = bonds[ _principal ].lastDecay;
    }
    
    /**
     *  @notice returns terms for a bond type
     *  @param _principal address
     *  @return controlVariable_ uint
     *  @return vestingTerm_ uint
     *  @return minimumPrice_ uint
     *  @return maxPayout_ uint
     *  @return fee_ uint
     *  @return maxDebt_ uint
     */
    function bondTerms( address _principal ) external view returns (
        uint controlVariable_,
        uint vestingTerm_,
        uint minimumPrice_,
        uint maxPayout_,
        uint fee_,
        uint maxDebt_
    ) {
        Terms memory terms = bonds[ _principal ].terms;
        controlVariable_ = terms.controlVariable;
        vestingTerm_ = terms.vestingTerm;
        minimumPrice_ = terms.minimumPrice;
        maxPayout_ = terms.maxPayout;
        fee_ = terms.fee;
        maxDebt_ = terms.maxDebt;
    }
    
    /**
     *  @notice returns pending BCV adjustment for a bond type
     *  @param _principal address
     *  @return controlVariable_ uint
     *  @return add_ bool
     *  @return delta_ uint
     *  @return blocksToTarget_ uint
     *  @return lastBlock_ uint
     */
    function bondAdjustments( address _principal ) external view returns (
        uint controlVariable_,
        bool add_,
        uint delta_,
        uint blocksToTarget_,
        uint lastBlock_
    ) {
        controlVariable_ = bonds[ _principal ].terms.controlVariable;
        Adjust memory adjustment = bonds[ _principal ].adjustment;
        add_ = adjustment.add;
        delta_ = adjustment.delta;
        blocksToTarget_ = adjustment.blocksToTarget;
        lastBlock_ = adjustment.lastBlock;
    }


    // PAYOUT

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout( address _principal ) public view returns ( uint ) {
        return OHM.totalSupply().mul( bonds[ _principal ].terms.maxPayout ).div( 100000 );
    }

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function payoutFor( uint _value, address _principal ) public view returns ( uint ) {
        return FixedPoint.fraction( _value, bondPrice( _principal ) ).decode112with18().div( 1e16 );
    }


    // BOND CONTROL VARIABLE

    function BCV( address _principal ) public view returns ( uint BCV_ ) {
        Adjust memory adjustment = bonds[ _principal ].adjustment;

        uint change = changeBy( _principal );

        if ( adjustment.add ) {
            BCV_ = bonds[ _principal ].terms.controlVariable.add( change );
        } else {
            BCV_ = bonds[ _principal ].terms.controlVariable.sub( change );
        }
    }

    /**
     *  @notice amount to change BCV by
     *  @param _principal address
     *  @return changeBy_ uint
     */
    function changeBy( address _principal ) internal view returns ( uint changeBy_ ) {
        Adjust memory adjustment = bonds[ _principal ].adjustment;

        uint blocksSinceLast = block.number.sub( adjustment.lastBlock );

        changeBy_ = adjustment.delta.mul( blocksSinceLast ).div( adjustment.blocksToTarget );

        if ( changeBy_ > adjustment.delta ) {
            changeBy_ = adjustment.delta;
        }
    }


    // BOND PRICE

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint
     */
    function bondPrice( address _principal ) public view returns ( uint price_ ) { 
        price_ = BCV( _principal ).mul( debtRatio( _principal ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < bonds[ _principal ].terms.minimumPrice ) {
            price_ = bonds[ _principal ].terms.minimumPrice;
        }
    }

    /**
     *  @notice calculate current bond price and remove floor if above
     *  @return price_ uint
     */
    function _bondPrice( address _principal ) internal returns ( uint price_ ) {
        adjust( _principal );
        price_ = bonds[ _principal ].terms.controlVariable.mul( debtRatio( _principal ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < bonds[ _principal ].terms.minimumPrice ) {
            price_ = bonds[ _principal ].terms.minimumPrice;        
        } else if ( bonds[ _principal ].terms.minimumPrice != 0 ) {
            bonds[ _principal ].terms.minimumPrice = 0;
        }
    }

    /**
     *  @notice converts bond price to DAI value
     *  @return price_ uint
     */
    function bondPriceInUSD( address _principal ) public view returns ( uint price_ ) {
        BondType memory bond = bonds[ _principal ];
        if( bond.isLiquidityBond ) {
            price_ = bondPrice( _principal ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 100 );
        } else {
            price_ = bondPrice( _principal ).mul( 10 ** IERC20Metadata(bond.principal).decimals() ).div( 100 );
        }
    }


    // DEBT

    /**
     *  @notice calculate current ratio of debt to OHM supply
     *  @return debtRatio_ uint
     */
    function debtRatio( address _principal ) public view returns ( uint debtRatio_ ) {   
        debtRatio_ = FixedPoint.fraction( 
            currentDebt( _principal ).mul( 1e9 ), 
            OHM.totalSupply()
        ).decode112with18().div( 1e18 );
    }

    /**
     *  @notice debt ratio in same terms for reserve or liquidity bonds
     *  @return uint
     */
    function standardizedDebtRatio( address _principal ) public view returns ( uint ) {
        BondType memory bond = bonds[ _principal ];
        if ( bond.isLiquidityBond ) {
            return debtRatio( _principal ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 1e9 );
        } else {
            return debtRatio( _principal );
        }
    }

    /**
     *  @notice calculate debt factoring in decay
     *  @return uint
     */
    function currentDebt( address _principal ) public view returns ( uint ) {
        return bonds[ _principal ].totalDebt.sub( debtDecay( _principal ) );
    }

    /**
     *  @notice amount to decay total debt by
     *  @return decay_ uint
     */
    function debtDecay( address _principal ) public view returns ( uint decay_ ) {
        BondType memory bond = bonds[ _principal ];
        uint blocksSinceLast = block.number.sub( bond.lastDecay );
        decay_ = bond.totalDebt.mul( blocksSinceLast ).div( bond.terms.vestingTerm );
        if ( decay_ > bond.totalDebt ) {
            decay_ = bond.totalDebt;
        }
    }



    /* ======= AUXILLIARY ======= */

    /**
     *  @notice allow anyone to send lost tokens (except OHM) to the DAO
     */
    function recoverLostToken( address _token ) external {
        require( _token != address( OHM ) );
        IERC20( _token ).safeTransfer( DAO, IERC20( _token ).balanceOf( address(this) ) );
    }
}