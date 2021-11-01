// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma abicoder v2;

import "ds-test/test.sol"; // ds-test

import "../contracts/libraries/SafeMath.sol";
import "../contracts/libraries/FixedPoint.sol";
import "../contracts/libraries/FullMath.sol";
import "../contracts/BondDepository.sol";
import "../contracts/Staking.sol";
import "../contracts/OlympusERC20.sol";
import "../contracts/sOlympusERC20.sol";
import "../contracts/StandardBondingCalculator.sol";
import "../contracts/interfaces/IUniswapV2Pair.sol";
import "../contracts/interfaces/IERC20Metadata.sol";
import "../contracts/Treasury.sol";
import "../contracts/BondDepository.sol";
import "./util/Hevm.sol";
import "../contracts/BondTeller.sol";
import "../contracts/governance/gOHM.sol";
import "./util/MockContract.sol";


contract BondDepositoryTest is DSTest {

    using FixedPoint for *;
    using SafeMath for uint;
    using SafeMath for uint112;

    OlympusBondDepository internal bondDepository;
    OlympusStaking internal staking;
    OlympusBondingCalculator internal bondingCalculator;
    OlympusTreasury internal treasury;
    BondTeller internal teller;

    OlympusERC20Token internal ohm;
    sOlympus internal sohm;
    gOHM internal gohm;

    MockContract internal abcToken;

    /// @dev Hevm setup
    Hevm constant internal hevm = Hevm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    function setUp() public {
        // Start at timestamp
        hevm.warp(0);
        hevm.roll(0);

        ohm = new OlympusERC20Token();
//        ohm.setVault(address(this));

        gohm = new gOHM(address(this));
        sohm = new sOlympus();
        sohm.setIndex(10);
        sohm.setgOHM(address(gohm));


        abcToken = new MockContract();
        abcToken.givenMethodReturn(abi.encodeWithSelector(ERC20.name.selector), abi.encode("ABC DAO"));
        abcToken.givenMethodReturn(abi.encodeWithSelector(ERC20.symbol.selector), abi.encode("ABC"));
        abcToken.givenMethodReturnUint(abi.encodeWithSelector(ERC20.decimals.selector), 18);

        bondingCalculator = new OlympusBondingCalculator(address(ohm));
        treasury = new OlympusTreasury(address(ohm), 1);

        staking = new OlympusStaking(address(ohm), address(sohm), 8, 0, 0);
        sohm.initialize(address(staking));
        gohm.migrate(address(staking), address(sohm));

        bondDepository = new OlympusBondDepository(address(ohm), address(treasury));

        teller = new BondTeller(address(bondDepository), address(staking), address(treasury), address(ohm), address(sohm), address(gohm));
        bondDepository.setTeller(address(teller));
    }

    // @dev Do not delete this!  Test driver generates paramters, so used to create our 'normal' tests
    //    function test_createBond_deposit(
    //    //        uint256 amount,
    //        bool capacityIsPayout,
    //        uint256 capacity)
    //    public {
    //        uint256 amount = 5 * 10 ** 16;
    //    uint256 ohmMintAmount = 10 * 10 ** 18;
    //        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
    //        uint256 initialDebt = 0;
    //
    //        try  this.createBond_deposit(amount, ohmMintAmount, capacityIsPayout, capacity, terms, initialDebt){
    //        } catch Error(string memory error) {
    ////            assertEq("SafeERC20: ERC20 operation did not succeed", error);
    //TODO use gnosis MockContract, this isn't a real error
    //        }
    //    }

//    function test_vaultOwned() public {
//        ohm.setVault(address(0x0));
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 18;
//        try this.createBond_deposit(2763957476737854671246564045522737104576123858413359401, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("VaultOwned: caller is not the Vault", error);
//        }
//    }
//
//    function test_createBond_mulDiv() public {
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 18;
//        try this.createBond_deposit(2763957476737854671246564045522737104576123858413359401, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("FullMath::mulDiv: overflow", error);
//        }
//    }
//
//    function test_createBond_mulOverflow() public {
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 18;
//        try this.createBond_deposit(75002556493819725874826918455844256653204641352000021311689657671948594686325, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("SafeMath: multiplication overflow", error);
//        }
//    }
//
//    function test_createBond_fixedPointFractionOverflow() public {
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 18;
//        try this.createBond_deposit(5136935571488474593545398400365374838660649282530, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("FixedPoint::fraction: overflow", error);
//        }
//    }

    function test_createBond_happyPath() public {
        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 16, minimumPrice : 10, maxPayout : 10000, maxDebt : 10});
        uint256 initialDebt = 0;
        uint256 ohmMintAmount = 11 * 10 ** 18;

//        treasury.enableOnChainGovernance();
//        hevm.roll(8);
//        //7 day timelock TODO add test where it's not long enough
//        treasury.enableOnChainGovernance();
//        treasury.enable(OlympusTreasury.STATUS.REWARDMANAGER, address(teller), address(bondingCalculator));
//
//        treasury.enable(OlympusTreasury.STATUS.RESERVETOKEN, address(abcToken), address(bondingCalculator));
//        treasury.enable(OlympusTreasury.STATUS.RESERVEDEPOSITOR, address(this), address(bondingCalculator));
//
//        ohm.setVault(address(treasury));
//
//        abcToken.givenMethodReturnBool(abi.encodeWithSelector(IERC20.transferFrom.selector), true);
//
//        treasury.deposit(11 * 10 ** 18, address(abcToken), 1 * 10 ** 9);


        this.createBond_deposit(5 * 10 ** 16, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt);


    }
//
//    function test_createBond_bondTooLarge() public {
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 9;
//        try this.createBond_deposit(5 * 10 ** 16, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("Bond too large", error);
//        }
//    }
//
//    function test_createBond_zeroAmount() public {
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 18;
//
//        try this.createBond_deposit(0, ohmMintAmount, false, 9 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("Bond too small", error);
//        }
//    }
//
//    function test_createBond_bondConcluded() public {
//        OlympusBondDepository.Terms memory terms = OlympusBondDepository.Terms({controlVariable : 2, fixedTerm : false, vestingTerm : 5, expiration : 6, conclusion : 6, minimumPrice : 10, maxPayout : 1, maxDebt : 10});
//        uint256 initialDebt = 0;
//        uint256 ohmMintAmount = 10 * 10 ** 18;
//        try this.createBond_deposit(5 * 10 ** 25, ohmMintAmount, false, 1 * 10 ** 20, terms, initialDebt){
//            fail();
//        } catch Error(string memory error) {
//            assertEq("Bond concluded", error);
//        }
//    }

    function createBond_deposit(
        uint256 amount,
        uint256 treasuryDeposit,
        bool capacityIsPayout,
        uint256 capacity,
        OlympusBondDepository.Terms memory terms,
        uint256 initialDebt
    ) external {
        log_named_uint("amount", amount);
        log_named_uint("ohmMintAmount", treasuryDeposit);
        log_named_uint("capacityIsPayout", capacityIsPayout ? 1 : 0);
        log_named_uint("capacity", capacity);

//        ohm.mint(address(this), ohmMintAmount);
        treasury.enableOnChainGovernance();
        hevm.roll(8);
        //7 day timelock TODO add test where it's not long enough
        treasury.enableOnChainGovernance();
        treasury.enable(OlympusTreasury.STATUS.REWARDMANAGER, address(teller), address(bondingCalculator));

        treasury.enable(OlympusTreasury.STATUS.RESERVETOKEN, address(abcToken), address(bondingCalculator));
        treasury.enable(OlympusTreasury.STATUS.RESERVEDEPOSITOR, address(this), address(bondingCalculator));

        ohm.setVault(address(treasury));

        abcToken.givenMethodReturnBool(abi.encodeWithSelector(IERC20.transferFrom.selector), true);

        treasury.deposit(treasuryDeposit, address(abcToken), 1 * 10 ** 9);

        MockContract pair = new MockContract();
        //TODO this one is wild:  error StateChangeWhileStatic unless we comment out MockContract's call to abi.encodeWithSignature("updateInvocationCount(bytes4,bytes)"
        pair.givenMethodReturnBool(abi.encodeWithSelector(IERC20.transfer.selector), true);

        pair.givenMethodReturn(abi.encodeWithSelector(ERC20.name.selector), abi.encode("MockUniswapPair"));
        pair.givenMethodReturn(abi.encodeWithSelector(ERC20.symbol.selector), abi.encode("MOCK"));
        pair.givenMethodReturnUint(abi.encodeWithSelector(ERC20.decimals.selector), 18);

        pair.givenMethodReturnAddress(abi.encodeWithSelector(IUniswapV2Pair.token0.selector), address(ohm));
        pair.givenMethodReturnAddress(abi.encodeWithSelector(IUniswapV2Pair.token1.selector), address(abcToken));
        pair.givenMethodReturn(abi.encodeWithSelector(IUniswapV2Pair.getReserves.selector),
            abi.encode(uint112(5 * 10 ** 9), uint112(10 * 10 ** 9), uint32(0)));

        uint256 bondId = bondDepository.addBond(address(pair), address(bondingCalculator), capacity, capacityIsPayout);
        bondDepository.setTerms(bondId, terms.controlVariable, terms.fixedTerm, terms.vestingTerm, terms.expiration, terms.conclusion, terms.minimumPrice, terms.maxPayout, terms.maxDebt, initialDebt);

        address depositor = address(0x1);
        address feo = address(0x2);

        (uint256 payout, uint256 index) = bondDepository.deposit(amount, 200, depositor, bondId, feo);
        log_named_uint("payout", payout);
        log_named_uint("index", index);

        assertEq(5 * 10 ** 7, payout);
        assertEq(0, index);
    }
}
