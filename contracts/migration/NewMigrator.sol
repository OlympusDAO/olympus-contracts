// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "../types/OlympusAccessControlled.sol";
import "../interfaces/IgOHM.sol";

contract NewMigrator is OlympusAccessControlled {
    bool public ohmMigrated;
    bool public shutdown;

    constructor(address _authority) OlympusAccessControlled(IOlympusAuthority(_authority)) {}

    function migrateContracts(
        address _staking,
        address _gOHM,
        address _sOHM
    ) external onlyGovernor {
        require(!ohmMigrated, "Already migrated");
        ohmMigrated = true;
        shutdown = false;

        require(_staking != address(0), "Zero address: staking");
        require(_gOHM != address(0), "Zero address: gOHM");

        IgOHM(_gOHM).migrate(_staking, _sOHM); // change gOHM minter
    }
}
