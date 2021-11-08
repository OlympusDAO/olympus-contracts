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
    MockContract internal troveManager = new MockContract();
    MockContract internal sortedTroves = new MockContract();
    MockContract internal hintHelper = new MockContract();

    OlympusERC20Token internal ohm;

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
        address borrower = address(this);
        // Real one at 0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2 from https://github.com/liquity/dev/blob/ffed041cab7c8681018258724513bd5c96f959e5/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L10
        // From https://etherscan.io/address/0x66017D22b0f8556afDd19FC67041899Eb65a21bb
        // using address  0x29D0cAb031DD0C4fb1adF98D56a7b0aD2d93Ca5F
        //Got back:
        //        [ getEntireDebtAndColl(address) method Response ]
        //    debt   uint256 :  363407671459371026109145
        //    coll   uint256 :  130659000000000000000
        //    pendingLUSDDebtReward   uint256 :  0
        //    pendingETHReward   uint256 :  0
        uint256 debt = 363407671459371026109145;
        uint256 coll = 130659000000000000000;
        troveManager.givenMethodReturn(abi.encodeWithSignature("getEntireDebtAndColl(address)", borrower), // This effectively validates our function call parameters!
            abi.encode(debt, coll, uint256(0), uint256(0)));

        // Real one at 0x8FdD3fbFEb32b28fb73555518f8b361bCeA741A6 from https://github.com/liquity/dev/blob/ffed041cab7c8681018258724513bd5c96f959e5/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L9
        // From https://etherscan.io/address/0x8FdD3fbFEb32b28fb73555518f8b361bCeA741A6#readContract
        //
        // For getSize(), got back:
        // 1230 uint256
        sortedTroves.givenMethodReturnUint(abi.encodeWithSelector(ISortedTroves.getSize.selector), 1230);


        // From https://stackoverflow.com/a/67332959
        // Real one at 0xE84251b93D9524E0d2e621Ba7dc7cb3579F997C0 from https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L17
        // From https://etherscan.io/address/0xE84251b93D9524E0d2e621Ba7dc7cb3579F997C0#readContract
        //
        // For getApproxHint() with parameters:
        //        nicr: 278134435025043070977999 //  log_named_uint("nicr", uint256(363407671459371026109145).mul(1 * 10 ** 20).div(uint256(130659000000000000000)));
        //    numTrials: 18450  //  log_named_uint("numTrials", uint256(1230).mul(15));
        //    pseudoRandom: 78338746147236970124700731725183845421594913511827187288591969170390706184117 //  log_named_uint("pseudoRandom", uint(keccak256(abi.encode(block.difficulty, block.timestamp))));
        uint256 nicr = coll.mul(1 * 10 ** 20).div(debt);
        uint256 numTrials = 5000;
        uint pseudoRandom = uint(keccak256(abi.encode(block.difficulty, block.timestamp)));
        address hintAddress = 0x6196d560051036b2011AEc3a7dD76D2e5C024166;
        hintHelper.givenMethodReturn(abi.encodeWithSignature("getApproxHint(uint256,uint256,uint256)", nicr, numTrials, pseudoRandom), // This effectively validates our function call parameters!
            abi.encode(hintAddress, uint256(278133163638282765156190), uint256(100355933811120983085532615102033542730297119242157052629869244010154446336574)));

        // From https://etherscan.io/address/0x8FdD3fbFEb32b28fb73555518f8b361bCeA741A6#readContract
        //
        // For findInsertPosition with param:
        // nicr: 278134435025043070977999
        // prevId: 0x6196d560051036b2011AEc3a7dD76D2e5C024166
        // nextId: 0x6196d560051036b2011AEc3a7dD76D2e5C024166
        address lowerHintInput = address(0x0);
        address upperHintInput = 0x6196d560051036b2011AEc3a7dD76D2e5C024166;
        sortedTroves.givenMethodReturn(abi.encodeWithSignature("findInsertPosition(uint256,address,address)", nicr, hintAddress, hintAddress),
            abi.encode(lowerHintInput, upperHintInput)
        );

        allocator = new LUSDAllocator(address(treasury),
            address(0x1), address(0x1), address(sortedTroves), address(hintHelper), address(troveManager),
            address(0x0)
        );

        (address lowerHint, address upperHint) = allocator.getHints(borrower);
        assertEq(lowerHintInput, lowerHint);
        assertEq(upperHintInput, upperHint);
    }
}
