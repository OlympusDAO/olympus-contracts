// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "ds-token/token.sol"; // ds-token

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
import "./util/MockUniswapV2Pair.sol";
import "../lib/ds-token/src/token.sol";
import "../contracts/Treasury.sol";


contract BondDepositoryTest is DSTest {

    using FixedPoint for *;
    using SafeMath for uint;
    using SafeMath for uint112;

    OlympusBondDepository internal bondDepository;
    OlympusStaking internal staking;
    OlympusBondingCalculator internal bondingCalculator;
    OlympusTreasury internal treasury;

    OlympusERC20Token internal ohm;
    sOlympus internal sohm;

    function setUp() public {
        ohm = new OlympusERC20Token();
        ohm.setVault(address(this));
        sohm = new sOlympus();

        bondingCalculator = new OlympusBondingCalculator(address(ohm));
        treasury = new OlympusTreasury(address(ohm), 0);

        staking = new OlympusStaking(address(ohm), address(sohm), 8, 0, 0);
        bondDepository = new OlympusBondDepository(address(ohm), address(treasury));
    }

//    function test_createBond_deposit(uint256 amount) public {
//        this.createBond_deposit(amount, false,  9 * 10 ** 20);
//    }

    function test_createBond_mulDiv() public {
        try this.createBond_deposit(2763957476737854671246564045522737104576123858413359401, false,  9 * 10 ** 20){
            fail();
        } catch Error(string memory error) {
            assertEq("FullMath::mulDiv: overflow", error);
        }
    }

    function test_createBond_mulOverflow() public {
        try this.createBond_deposit(75002556493819725874826918455844256653204641352000021311689657671948594686325, false,  9 * 10 ** 20){
            fail();
        } catch Error(string memory error) {
            assertEq("SafeMath: multiplication overflow", error);
        }
    }

    function test_createBond_fixedPointFractionOverflow() public {
        try this.createBond_deposit(5136935571488474593545398400365374838660649282530, false,  9 * 10 ** 20){
            fail();
        } catch Error(string memory error) {
            assertEq("FixedPoint::fraction: overflow", error);
        }
    }

    function test_createBond_bondCreateERC20() public {
        try this.createBond_deposit(5 * 10 ** 16, false,  9 * 10 ** 20){
            fail();
        } catch Error(string memory error) {
            assertEq("SafeERC20: ERC20 operation did not succeed", error);  //TODO use gnosis MockContract
        }
    }

    function test_createBond_zeroAmount() public {
        try this.createBond_deposit(0, false,  9 * 10 ** 20){
            fail();
        } catch Error(string memory error) {
            assertEq("Bond too small", error);
        }
    }

    function createBond_deposit(uint256 amount, bool capacityIsPayout, uint256 capacity) external {

        ohm.mint(address(this), 10 * 10 ** 18);

        DSToken token1 = new DSToken("MIM");
        MockUniswapV2Pair pair = new MockUniswapV2Pair(
            address(ohm), address(token1),
            uint112(5 * 10 ** 9), uint112(10 * 10 ** 9));


        uint256 bondId = bondDepository.addBond(address(pair), address(bondingCalculator), capacity, capacityIsPayout);
        bondDepository.setTerms(bondId, 2, false, 5, 6, 6, 10, 10, 10, 0);

        address depositor = address(0x1);
        address feo = address(0x2);

        log_named_uint("amount: ", amount);

        bondDepository.deposit(amount, 200, depositor, bondId, feo);
    }


}
