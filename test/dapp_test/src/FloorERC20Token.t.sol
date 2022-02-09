// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "../../../contracts/FloorERC20.sol";

import "../../../contracts/FloorAuthority.sol";


contract OlymppusERC20TokenTest is DSTest {
    FloorERC20Token internal floorContract;

    IFloorAuthority internal authority;

    address internal UNAUTHORIZED_USER = address(0x1);


    function test_erc20() public {
        authority = new FloorAuthority(address(this), address(this), address(this), address(this));
        floorContract = new FloorERC20Token(address(authority));
        assertEq("Floor", floorContract.name());
        assertEq("FLOOR", floorContract.symbol());
        assertEq(9, int(floorContract.decimals()));
    }

    function testCannot_mint() public {
        authority = new FloorAuthority(address(this), address(this), address(this), UNAUTHORIZED_USER);
        floorContract = new FloorERC20Token(address(authority));
        // try/catch block pattern copied from https://github.com/Anish-Agnihotri/MultiRaffle/blob/master/src/test/utils/DSTestExtended.sol
        try floorContract.mint(address(this), 100) {
            fail();
        } catch Error(string memory error) {
            // Assert revert error matches expected message
            assertEq("UNAUTHORIZED", error);
        }
    }

    // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
    function test_mint(uint256 amount) public {
        authority = new FloorAuthority(address(this), address(this), address(this), address(this));
        floorContract = new FloorERC20Token(address(authority));
        uint256 supplyBefore = floorContract.totalSupply();
         // TODO look into https://dapphub.chat/channel/dev?msg=HWrPJqxp8BHMiKTbo
        // floorContract.setVault(address(this)); //TODO WTF msg.sender doesn't propigate from .dapprc $DAPP_TEST_CALLER config via mint() call, must use this value
        floorContract.mint(address(this), amount);
        assertEq(supplyBefore + amount, floorContract.totalSupply());
    }

    // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
    function test_burn(uint256 mintAmount, uint256 burnAmount) public {
        authority = new FloorAuthority(address(this), address(this), address(this), address(this));
        floorContract = new FloorERC20Token(address(authority));
        uint256 supplyBefore = floorContract.totalSupply();
        // floorContract.setVault(address(this));  //TODO WTF msg.sender doesn't propigate from .dapprc $DAPP_TEST_CALLER config via mint() call, must use this value
        floorContract.mint(address(this), mintAmount);
        if (burnAmount <= mintAmount){
            floorContract.burn(burnAmount);
            assertEq(supplyBefore + mintAmount - burnAmount, floorContract.totalSupply());
        } else {
            try floorContract.burn(burnAmount) {
                fail();
            } catch Error(string memory error) {
                // Assert revert error matches expected message
                assertEq("ERC20: burn amount exceeds balance", error);
            }
        }
    }
}