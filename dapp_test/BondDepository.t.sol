// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./utils/test.sol";
import "../contracts/BondDepository.sol";
import "../contracts/Staking.sol";
import "../contracts/OlympusERC20.sol";
import "../contracts/sOlympusERC20.sol";
contract BondDepositoryTest is DSTest {
    OlympusBondDepository internal bondDepository;
    OlympusStaking internal staking;
    OlympusERC20Token internal ohm;
    sOlympus internal sohm;

    function setUp() public {
        
        ohm = new OlympusERC20Token();
        sohm = new sOlympus();

        staking = new OlympusStaking(address(ohm), address(sohm), 8, 0, 0);
        bondDepository = new OlympusBondDepository(address(ohm), address(this));
    }

 

}
