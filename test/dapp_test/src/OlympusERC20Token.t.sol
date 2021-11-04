// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

import "ds-test/test.sol"; // ds-test
import "../../../contracts/OlympusERC20.sol";

contract OlymppusERC20TokenTest is DSTest {
    OlympusERC20Token internal ohmContract;

    function setUp() public {
        ohmContract = new OlympusERC20Token();
    }

    function test_erc20() public {
        assertEq("Olympus", ohmContract.name());
        assertEq("OHM", ohmContract.symbol());
        assertEq(9, ohmContract.decimals());
    }

    function testCannot_mint() public {
        // try/catch block pattern copied from https://github.com/Anish-Agnihotri/MultiRaffle/blob/master/src/test/utils/DSTestExtended.sol
        try ohmContract.mint(address(this), 100) {
            fail();
        } catch Error(string memory error) {
            // Assert revert error matches expected message
            assertEq("VaultOwned: caller is not the Vault", error);
        }
    }

    // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
    function test_mint(uint256 amount) public {
        uint256 supplyBefore = ohmContract.totalSupply();
         // TODO look into https://dapphub.chat/channel/dev?msg=HWrPJqxp8BHMiKTbo
        ohmContract.setVault(address(this)); //TODO WTF msg.sender doesn't propigate from .dapprc $DAPP_TEST_CALLER config via mint() call, must use this value
        ohmContract.mint(address(this), amount);
        assertEq(supplyBefore + amount, ohmContract.totalSupply());
    }

    // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
    function test_burn(uint256 mintAmount, uint256 burnAmount) public {
        uint256 supplyBefore = ohmContract.totalSupply();
        ohmContract.setVault(address(this));  //TODO WTF msg.sender doesn't propigate from .dapprc $DAPP_TEST_CALLER config via mint() call, must use this value
        ohmContract.mint(address(this), mintAmount);
        if (burnAmount <= mintAmount){
            ohmContract.burn(burnAmount);
            assertEq(supplyBefore + mintAmount - burnAmount, ohmContract.totalSupply());
        } else {
            try ohmContract.burn(burnAmount) {
                fail();
            } catch Error(string memory error) {
                // Assert revert error matches expected message
                assertEq("ERC20: burn amount exceeds balance", error);
            }
        }
    }


}
