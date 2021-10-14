// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";

interface IDepository {
    function setAdjustment ( 
        uint _index,
        bool _addition,
        uint _delta,
        uint _blocks
    ) external;

    function bondTerms( uint _index ) external view returns (
        uint controlVariable_,
        uint vestingTerm_,
        uint minimumPrice_,
        uint maxPayout_,
        uint fee_,
        uint maxDebt_
    );
}

contract BCVPC {

    using SafeMath for uint;

    /* ========== STRUCTS ========== */

    struct Payout {
        uint amount; // OHM paid
        uint blockstamp; // block occurred
    }



    /* ========== STATE VARIABLES ========== */

    uint public targetPercent; // target total OHM as payouts during period
    uint public immutable period; // length in blocks

    IDepository public depository; // bond originator

    mapping( uint => Payout[] ) public payouts; // storage of all past payouts

    mapping( uint => uint ) public weights; // weight per bond type
    uint public totalWeight; // total weight (denominator)



    /* ========== MUTABLE FUNCTIONS ========== */

    // anyone can trigger a BCV update
    // if a bond is 20% underweight for the period, its BCV will increase 20% over next period
    function updateBCVs( uint[] calldata _indexes ) external {
        for( uint i = 0; i < _indexes.length; i++ ) {
            uint index = _indexes[i];

            (uint BCV,,,,,) = depository.bondTerms( index );
            uint newBCV = BCV.mul( getSum( index ) ).div( getTarget() );

            if ( newBCV > BCV ) {
                depository.setAdjustment(index, true, newBCV.sub( BCV ), period);
            } else {
                depository.setAdjustment(index, false, BCV.sub( newBCV ), period);
            }
        }
    }



    /* ========== ONLY DEPOSITORY ========== */

    // Depository stores the payout amount and block it occurred for each bond
    function storePayout( uint _index, uint _amount ) external {
        require( msg.sender == address(depository), "Only depository" );

        payouts[ _index ].push( Payout({
            amount: _amount,
            blockstamp: block.number
        }));
    }



    /* ========== ONLY POLICY ========== */

    // policy sets target sum of OHM paid per period length
    function setTargetSum( uint _target ) external onlyPolicy() {
        targetSum = _target;
    }

    // policy sets a weight for each bond (determines portion of target sum allocated)
    function setWeight( uint _index, uint _weight ) external onlyPolicy() {
        totalWeight = totalWeight.add( _weight ).sub( weights[ _index ] );
        weights[ _index ] = _weight;
    }



    /* ========== VIEW FUNCTIONS ========== */

    function getTarget() public view returns ( uint ) {
        return ohm.totalSupply.mul( targetPercent ).div( 1e9 );
    }

    // returns sum of OHM paid for a bond in the past period
    function getSum( uint _index ) public view returns ( uint sum_ ) {
        uint blockstampAfter = block.number.sub( period );

        uint[] memory array = payouts[ _index ];

        for( uint i = 0; i < array.length; i++ ) {
            if( array[i].blockstamp > blockstampAfter ) {
                sum_ = sum_.add( array[i].payout );
            }
        }
    }
}