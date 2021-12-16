// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.10;

import "../interfaces/IOHM.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IOlympusAuthority.sol";
import "../types/OlympusAccessControlled.sol";

// The supply rebalancer corrects an imbalance in supply between OHMv1 and OHMv2
// as a result of token migration. This serves to fix lower rewards resulting
// from a change in the -- rewards = reward rate * total supply -- equation.
contract SupplyRebalancer is OlympusAccessControlled {
    // The OHMv2 Token
    IOHM public immutable ohm = IOHM(0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5);
    // The Olympus Treasury
    ITreasury public immutable treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);
    // The maximum amount to mint. Starts at 1 million and decreases upon mints. Does not increase.
    uint256 public maxMint = 1_000_000 * 1e9;

    constructor(IOlympusAuthority authority) OlympusAccessControlled(authority) {}

    // Mints tokens to this address
    function mint(uint256 amount) external onlyGovernor {
        treasury.mint(address(this), amount);
        maxMint -= amount;
    }

    // Burns tokens from this address
    function burn(uint256 amount) external onlyGovernor {
        ohm.burn(amount);
    }
}