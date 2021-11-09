// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "../../../contracts/OlympusAuthority.sol";


contract OlympusAuthorityTest is DSTest {

    OlympusAuthority authority;
    address dummy = address(0x1);

    function setUp() public {
        authority = new OlympusAuthority(dummy, address(this), address(this), address(this));
    }

    function testCannot_governor() public {

        authority.pushGuardian(address(0x0), true);
        authority.pushPolicy(address(0x0), true);

        try authority.pushGovernor(address(0x0), true) {
            fail();
        } catch Error(string memory error) {
            // Assert revert error matches expected message
            assertEq("UNAUTHORIZED", error);
        }
    }


}
