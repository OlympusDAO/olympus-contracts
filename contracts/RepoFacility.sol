// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/ICauldron.sol";
import "../interfaces/IfToken.sol";
import "../interfaces/IOwnable.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IwsOHM.sol";
import "../interfaces/IERC20.sol";

import "../types/Ownable.sol";
import "../types/SafeERC20.sol";
import "../types/SafeMath.sol";
import "../types/Address.sol";



contract RepoFacility is Ownable {

    using SafeMath for uint;
    using SafeERC20 for IERC20;



    /* ========== STRUCTS ========== */

    struct Debt {
        uint current; // current debt
        uint max; // maximum repayment in period
        uint decayInBlocks; // speed to decay debt
        uint lastBlock; // last decay
    }

    struct Info {
        address OHM; // token to burn
        address sOHM; // Fuse collateral
        IwsOHM wsOHM; // Abra collateral

        ICauldron cauldron; // Abra debt facility
        address MIM; // Abra debt token

        address repayment; // token to withdraw from treasury

        IStaking staking; // Olympus staking
        ITreasury treasury; // Olympus treasury

        uint bounty; // function executor bounty
        uint minLiquidation; // minimum size loan to liquidate
    }



    /* ========== STATE VARIABLES ========== */

    Debt public debt;
    Info public info;

    mapping( address => address ) public fTokenForToken; // fuse tokens



    /* ========== CONSTRUCTOR ========== */

    constructor( 
        address _OHM,
        address _sOHM, 
        address _wsOHM,
        address _cauldron,
        address _MIM, 
        address _LUSD,
        address _staking,
        address _treasury, 
        uint _bounty,
        uint _minLiquidation
    ) {
        require( _OHM != address(0) );
        info.OHM = _OHM;
        require( _sOHM != address(0) );
        info.sOHM = _sOHM;
        require( _wsOHM != address(0) );
        info.wsOHM = IwsOHM( _wsOHM );

        require( _cauldron != address(0) );
        info.cauldron = ICauldron( _cauldron );
        require( _MIM != address(0) );
        info.MIM = _MIM;

        require( _LUSD != address(0) );
        info.repayment = _LUSD;

        require( _staking != address(0) );
        info.staking = IStaking( _staking );
        require( _treasury != address(0) );
        info.treasury = ITreasury( _treasury );

        info.bounty = _bounty;
        info.minLiquidation = _minLiquidation;
    }



    /* ========== MUTABLE FUNCTIONS ========== */

    // repay a loan on Fuse and burn collateral
    function repayFuse( address token, address borrower, uint amount ) external {
        require( amount >= info.minLiquidation, "Liquidation too small" );

        decayDebt(); // refresh debt (limits frequency of liquidation)
        require( debt.current.add( amount ) <= debt.max, "Debt overflow" );

        _swap( info.token, amount ); // swap to required token

        fToken( fTokenForToken[ token ] ).liquidateBorrow( borrower, amount, info.sOHM ); // liquidate borrower

        pay( false );
    }

    // repay loans on Abracadabra and burn collateral
    function repayAbra( address[] calldata borrowers, uint[] calldata amounts ) external {
        require( amount >= info.minLiquidation, "Liquidation too small" );

        uint total = getTotal( amounts );

        decayDebt(); // refresh debt (limits frequency of liquidation)
        require( debt.current.add( total ) <= debt.max, "Debt overflow" );

        _swap( info.MIM, total ); // swap to required token

        info.cauldron.liquidate( borrowers, amounts, address(this), address(0) ); // liquidate

        pay( true );
    }



    /* ========== OWNABLE FUNCTIONS ========== */

    // set bounty for liquidation
    function setBounty( uint newBounty, uint newMin ) external onlyOwner() {
        info.bounty = newBounty;
        info.minLiquidation = newMin;
    }

    // set fToken for Token
    function setfToken( address token, address fToken ) external onlyOwner() {
        fTokenForToken[ token ] = fToken;
    }



    /* ========== VIEW FUNCTIONS ========== */

    // current debt liquidated after decay
    function currentDebt() public view returns ( uint debt_ ) {
        if ( debt.lastBlock < debt.decayInBlocks ) {
            debt_ = debt.current.sub( debt.current.mul( debt.lastBlock ).div( debt.decayInBlocks ) );
        } else {
            debt_ = 0;
        }
    }

    function getTotal( uint[] calldata amounts ) public view returns ( uint total_ ) {
        for( uint i = 0; i < amounts.length; i++ ) {
            require( amounts[i] >= info.minLiquidation );

            total_ = total_.add( amounts[i] );
        }
    }



    /* ========== INTERNAL FUNCTIONS ========== */

    // refresh debt
    function decayDebt() internal {
        debt.current = currentDebt();
        debt.lastBlock = block.number;
    }

    function pay( bool fromWrapped ) internal {
        if( fromWrapped ) {
            info.wsOHM.unwrap( IERC20( address(info.wsOHM) ).balanceOf( address(this) ) ); // unwrap collateral
        }

        IERC20( info.sOHM ).safeTransfer( msg.sender, info.bounty ); // pay liquidator

        uint amount = IERC20( info.sOHM ).balanceOf( address(this) );
        info.staking.unstake( amount, false ); // unstake seized collateral
        IERC20( info.OHM ).burn( amount ); // burn seized OHM
    }

    function _swap( address tokenTo, uint amountBack ) internal {
        // treasury.manage( info.repayment, total ); // manage LUSD needed

        // swap to tokenTo, for exact amountBack
    }
}