// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma abicoder v2;

import "ds-test/test.sol"; // ds-test

import "../../../contracts/libraries/SafeMath.sol";
import "../../../contracts/libraries/FixedPoint.sol";
import "../../../contracts/libraries/FullMath.sol";
import "../../../contracts/BondDepository.sol";
import "../../../contracts/Staking.sol";
import "../../../contracts/OlympusERC20.sol";
import "../../../contracts/sOlympusERC20.sol";
import "../../../contracts/StandardBondingCalculator.sol";
import "../../../contracts/interfaces/IUniswapV2Pair.sol";
import "../../../contracts/interfaces/IERC20Metadata.sol";
import "../../../contracts/Treasury.sol";
import "../../../contracts/BondDepository.sol";
import "./util/Hevm.sol";
import "../../../contracts/BondTeller.sol";
import "../../../contracts/governance/gOHM.sol";
import "./util/MockContract.sol";
import "../../../contracts/allocators/LUSDAllocator.sol";


contract LUSDAllocatorTest is DSTest {

    using FixedPoint for *;
    using SafeMath for uint;
    using SafeMath for uint112;

    LUSDAllocator internal allocator;
    OlympusTreasury internal treasury;
    OlympusERC20Token internal ohm;
    MockContract internal wethContract = new MockContract();

    /// @dev Hevm setup
    Hevm constant internal hevm = Hevm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    function setUp() public {
        // Start at timestamp
        hevm.warp(0);
        hevm.roll(0);

        ohm = new OlympusERC20Token();
        treasury = new OlympusTreasury(address(ohm), 1);
    }

    // Point of this test is to ensure the parameters we make in our sequence of calls
    // stays consistent.  If we change the underlying logic in the contract as one function call param changes,
    // then this test will break.  That's good as once we're in prod this becomes a golden
    // source of truth with interactions
    function test_hints() public {
      
        // allocator = new LUSDAllocator(address(treasury),
        //     address(treasury), 
        //     address(0x1), address(0x1), 
        //     address(0x1), address(0x1), 
        //     address(wethContract.address)
        // );

        // allocator.harvest();
        // assertEq(lowerHintInput, lowerHint);
        // assertEq(upperHintInput, upperHint);
    }
}
