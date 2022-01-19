// SPDX-License-Identifier: Unlicensed
pragma solidity 0.7.5;

import "../types/OlympusAccessControlled.sol";

contract AccessControlledMock is OlympusAccessControlled {
    constructor(address _auth) OlympusAccessControlled(IOlympusAuthority(_auth)) {}

    bool public governorOnlyTest;

    bool public guardianOnlyTest;

    bool public policyOnlyTest;

    bool public vaultOnlyTest;

    function governorTest() external onlyGovernor returns (bool) {
        governorOnlyTest = true;
        return governorOnlyTest;
    }

    function guardianTest() external onlyGuardian returns (bool) {
        guardianOnlyTest = true;
        return guardianOnlyTest;
    }

    function policyTest() external onlyPolicy returns (bool) {
        policyOnlyTest = true;
        return policyOnlyTest;
    }

    function vaultTest() external onlyVault returns (bool) {
        governorOnlyTest = true;
        return governorOnlyTest;
    }
}
