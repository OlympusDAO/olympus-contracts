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

    function test_createBond_deposit() public {

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

        uint256 bondId = bondDepository.addBond(address(pair), address(bondingCalculator), 9 * 10 ** 20, false);
        bondDepository.setTerms(bondId, 2, false, 5, 6, 6, 10, 10, 10, 0);

        address depositor = address(0x1);
        address feo = address(0x2);
        bondDepository.deposit(5 * 10 ** 16, 200, depositor, bondId, feo);
    }
}
