pragma solidity ^0.8.10;

import "../interfaces/IOlympusAuthority.sol";

/// @dev Reasoning for this contract = modifiers literaly copy code
/// instead of pointing towards the logic to execute. Over many
/// functions this bloats contract size unnecessarily.
/// imho modifiers are a meme.
abstract contract OlympusAccessControlledImproved {
    /* ========== EVENTS ========== */

    event AuthorityUpdated(IOlympusAuthority indexed authority);

    string UNAUTHORIZED = "UNAUTHORIZED"; // save gas

    /* ========== STATE VARIABLES ========== */

    IOlympusAuthority public authority;

    /* ========== Constructor ========== */

    constructor(IOlympusAuthority _authority) {
        authority = _authority;
        emit AuthorityUpdated(_authority);
    }

    /* ========== "MODIFIERS" ========== */

    function _onlyGovernor() internal view {
        require(msg.sender == authority.governor(), UNAUTHORIZED);
    }

    function _onlyGuardian() internal view {
        require(msg.sender == authority.guardian(), UNAUTHORIZED);
    }

    function _onlyPolicy() internal view {
        require(msg.sender == authority.policy(), UNAUTHORIZED);
    }

    function _onlyVault() internal view {
        require(msg.sender == authority.vault(), UNAUTHORIZED);
    }

    /* ========== GOV ONLY ========== */

    function initializeAuthority(IOlympusAuthority _newAuthority) internal {
        require(authority == IOlympusAuthority(address(0)), "ALREADY INITIALIZED!");
        authority = _newAuthority;
        emit AuthorityUpdated(_newAuthority);
    }

    function setAuthority(IOlympusAuthority _newAuthority) external {
        _onlyGovernor();
        authority = _newAuthority;
        emit AuthorityUpdated(_newAuthority);
    }
}
