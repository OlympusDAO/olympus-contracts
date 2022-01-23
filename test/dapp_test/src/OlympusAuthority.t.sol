// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "../../../contracts/OlympusAuthority.sol";
import "../../../contracts/mocks/AccessControlledMock.sol";

contract OlympusAuthorityTest is DSTest {
    OlympusAuthority authority;
    AccessControlledMock accessControlledMock;

    address UNAUTHORIZED_USER = address(0x1);

    function test_onlyGovernor_not_authorized() public {
        authority = new OlympusAuthority(UNAUTHORIZED_USER, address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        try accessControlledMock.governorTest() {
            fail();
        } catch Error(string memory error) {
            assertEq("UNAUTHORIZED", error);
        }
    }

    function test_onlyGovernor_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        accessControlledMock.governorTest();
    }

    function test_onlyGuardian_not_authorized() public {
        authority = new OlympusAuthority(address(this), UNAUTHORIZED_USER, address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        try accessControlledMock.guardianTest() {
            fail();
        } catch Error(string memory error) {
            assertEq("UNAUTHORIZED", error);
        }
    }

    function test_onlyGuardian_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        accessControlledMock.guardianTest();
    }

    function test_onlyPolicy_not_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), UNAUTHORIZED_USER, address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        try accessControlledMock.policyTest() {
            fail();
        } catch Error(string memory error) {
            assertEq("UNAUTHORIZED", error);
        }
    }

    function test_onlyPolicy_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        accessControlledMock.policyTest();
    }

    function test_onlyVault_not_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), UNAUTHORIZED_USER);
        accessControlledMock = new AccessControlledMock(address(authority));
        try accessControlledMock.vaultTest() {
            fail();
        } catch Error(string memory error) {
            assertEq("UNAUTHORIZED", error);
        }
    }

    function test_onlyVault_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        accessControlledMock.vaultTest();
    }

    // TODO create tests for push/pull mechanism within OlympusAuthority

    function test_pullRole_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        authority.pushGovernor(address(this), false);
        authority.pushGuardian(address(this), false);
        authority.pushPolicy(address(this), false);
        authority.pushVault(address(this), false);
        authority.pullGovernor();
        authority.pullGuardian();
        authority.pullPolicy();
        authority.pullVault();
    }

    function test_pullRole_not_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));
        authority.pushGovernor(UNAUTHORIZED_USER, false);
        authority.pushGuardian(UNAUTHORIZED_USER, false);
        authority.pushPolicy(UNAUTHORIZED_USER, false);
        authority.pushVault(UNAUTHORIZED_USER, false);

        try authority.pullGovernor() {
            fail();
        } catch Error(string memory error) {
            assertEq("!newGovernor", error);
        }

        try authority.pullGuardian() {
            fail();
        } catch Error(string memory error) {
            assertEq("!newGuard", error);
        }

        try authority.pullPolicy() {
            fail();
        } catch Error(string memory error) {
            assertEq("!newPolicy", error);
        }

        try authority.pullVault() {
            fail();
        } catch Error(string memory error) {
            assertEq("!newVault", error);
        }
    }

    function test_pushRole_not_authorized() public {
        authority = new OlympusAuthority(UNAUTHORIZED_USER, address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));

        try authority.pushGovernor(UNAUTHORIZED_USER, true) {
            fail();
        } catch Error(string memory error) {
            assertEq("UNAUTHORIZED", error);
        }
    }

    function test_pushRole_authorized() public {
        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));
        accessControlledMock = new AccessControlledMock(address(authority));

        authority.pushGovernor(address(this), true);
    }
}
