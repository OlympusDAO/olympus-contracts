// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "ds-token/token.sol"; // ds-token

import "../contracts/BondDepository.sol";
import "../contracts/Staking.sol";
import "../contracts/OlympusERC20.sol";
import "../contracts/sOlympusERC20.sol";
import "../contracts/StandardBondingCalculator.sol";
import "../lib/v2-core/contracts/UniswapV2Pair.sol";

contract BondDepositoryTest is DSTest {
    OlympusBondDepository internal bondDepository;
    OlympusStaking internal staking;
    OlympusBondingCalculator internal bondingCalculator;

    OlympusERC20Token internal ohm;
    sOlympus internal sohm;

    function setUp() public {
        ohm = new OlympusERC20Token();
        sohm = new sOlympus();

        bondingCalculator = new OlympusBondingCalculator(address(ohm));

        staking = new OlympusStaking(address(ohm), address(sohm), 8, 0, 0);
        bondDepository = new OlympusBondDepository(address(ohm), address(bondingCalculator));
    }

    function test_createBond_deposit() public {

        UniswapV2Pair pair = new UniswapV2Pair();
        pair.initialize(address(0x1), address(0x2));

        uint256 bondId = bondDepository.addBond(address(pair), address(bondingCalculator), 999999, false);
        bondDepository.setTerms(bondId, 2, false, 5, 6, 6, 10, 10, 10, 0);

        address depositor = address(0x1);
        address feo = address(0x2);
        bondDepository.deposit(5, 200, depositor, bondId, feo);
    }
}
