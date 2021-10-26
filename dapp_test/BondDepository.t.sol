// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "ds-token/token.sol"; // ds-token

import "../contracts/libraries/SafeMath.sol";
import "../contracts/libraries/FixedPoint.sol";
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

    function test_createBond_deposit(uint256 amount) public {

        ohm.mint(address(this), 10 * 10 ** 18);

        DSToken token1 = new DSToken("MIM");
        MockUniswapV2Pair pair = new MockUniswapV2Pair(
            address(ohm), address(token1),
            uint112(5 * 10 ** 9), uint112(10 * 10 ** 9));

        //        uint utoken0 = IERC20Metadata(IUniswapV2Pair(address(pair)).token0()).decimals();
        //        uint utoken1 = IERC20Metadata(IUniswapV2Pair(address(pair)).token1()).decimals();
        //        uint decimals = utoken0.add(utoken1).sub(IERC20Metadata(address(pair)).decimals());

        //        log_named_uint("token0:", utoken0);
        //        log_named_uint("token1:", utoken1);
        //        log_named_uint("decimals:", decimals);
        //
        //        (uint reserve0, uint reserve1,) = IUniswapV2Pair(address(pair)).getReserves();
        //
        //        log_named_uint("reserve0:", reserve0);
        //        log_named_uint("reserve1:", reserve1);
        //        uint k_ = reserve0.mul(reserve1).div(10 ** decimals);
        //
        //        log_named_uint("k_:", k_);
        bool capacityIsPayout = false;
        uint256 capacity = 9 * 10 ** 20;
        uint256 bondId = bondDepository.addBond(address(pair), address(bondingCalculator), capacity, capacityIsPayout);
        bondDepository.setTerms(bondId, 2, false, 5, 6, 6, 10, 10, 10, 0);

        address depositor = address(0x1);
        address feo = address(0x2);
        //                uint256 amount = 5 * 10 ** 16 ;
        //        uint256 amount = 75002556493819725874826918455844256653204641352000021311689657671948594686325;  //SafeMath: multiplication overflow
        // uint256 amount = 5136935571488474593545398400365374838660649282530; //FixedPoint::fraction: overflow

        log_named_uint("amount: ", amount);
        try bondDepository.deposit(amount, 200, depositor, bondId, feo) {
            //            fail();
        } catch Error(string memory error) {

            //            uint decimals = (IERC20Metadata( address(ohm) ).decimals() - IERC20Metadata( address(pair) ).decimals());
            //            log_named_uint("maxInt:", MAX_UINT256);
            //            log_named_uint("decimals:", decimals);
            //            log_named_uint("ohm dec:", IERC20Metadata( address(ohm) ).decimals());
            //            log_named_uint("pair dec:", IERC20Metadata( address(pair) ).decimals());



            if (uint256(-1).div(amount) < (10 ** IERC20Metadata(address(ohm)).decimals())) {//NOTE:  in Treasury::tokenValue(), we multiple, then divide.
                //uint256 amount = 75002556493819725874826918455844256653204641352000021311689657671948594686325;
                assertEq("SafeMath: multiplication overflow", error);
                return;
            }

            uint256 tokenValue = treasury.tokenValue(address(pair), amount);

            log_named_uint("tokenValue: ", tokenValue);
            uint256 bondPrice = bondDepository.bondPrice(bondId);
            log_named_uint("bondPrice: ", bondPrice);
            log_named_uint("max uint144:", uint144(-1));
            log_named_uint("max uint224:", uint224(-1));
            uint256 numerator = tokenValue;
            uint256 denominator = bondPrice;
            uint8 RESOLUTION = 112;
            if (numerator <= uint144(-1)) {
                log_named_uint("numerator:",numerator);
                log_named_uint("denominator:",denominator);
                uint256 result = (numerator << RESOLUTION) / denominator;
                log_named_uint("result:",result);
//                require(result <= uint224(-1), 'FixedPoint::fraction: overflow');
//                return uq112x112(uint224(result));
            } else {
                log_named_uint("result:",0);
//                uint256 result = FullMath.mulDiv(numerator, Q112, denominator);
//                require(result <= uint224(-1), 'FixedPoint::fraction: overflow');
//                return uq112x112(uint224(result));
            }

            uint256 payout = bondDepository.payoutFor(tokenValue, bondId);

            log_named_uint("payout: ", payout);


            // payout to bonder is computed
            if (capacityIsPayout) {

            } else {
                if (capacity < amount) {
                    assertEq("Bond concluded", error);
                    return;
                }
            }

            log_named_uint("tokenValue:", tokenValue);
            log_named_uint("payout:", payout);
            if (payout < 10000000) {
                assertEq("Bond too small", error);
                return;
            }
            // TODO this was actually successful, need to mock out our call better
            assertEq("SafeERC20: ERC20 operation did not succeed", error);
        }
    }
}
