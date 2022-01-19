// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../interfaces/ITreasury.sol";
import "../interfaces/IERC20.sol";
import "./FraxSharesAllocator.sol";

/**
 * @notice this allows us to test proxy upgrades
 */
contract FraxSharesAllocatorVNext is Initializable, OwnableUpgradeable {
    /* ======== STATE VARIABLES ======== */
    /* !!!! UPGRADABLE CONTRACT !!!! */
    /* NEW STATE VARIABLES MUST BE APPENDED TO END */

    uint256 private constant MAX_TIME = 4 * 365 * 86400 + 1; // 4 years and 1 second
    ITreasury public treasury;
    IERC20 public fxs; // $FXS token
    IveFXS public veFXS; // $veFXS token
    IveFXSYieldDistributorV4 public veFXSYieldDistributorV4;

    // uint256 public totalValueDeployed; // FXS isn't a reserve token, so will always be 0
    uint256 public totalAmountDeployed;
    uint256 public lockEnd; // tracks the expiry of veFXS to know if can be extended

    function didUpgrade() external pure returns (bool) {
        return true;
    }
}
