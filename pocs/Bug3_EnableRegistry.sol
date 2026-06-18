// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

/**
 * @title Bug #3 — Treasury.enable() Cross-Registry Delete Bug
 * @notice enable() checks indexInRegistry against the SAME status
 *         after pushing, then deletes from the same registry (should
 *         be opposite). Cross-registry cleanup (present in execute())
 *         is entirely missing, corrupting auditReserves() tallies.
 *         Based on Treasury.sol lines 155-178.
 */

contract Bug3_EnableRegistry {
    uint8 constant R = 2; // RESERVETOKEN
    uint8 constant L = 3; // LIQUIDITYTOKEN

    mapping(uint8 => address[]) public registry;
    mapping(uint8 => mapping(address => bool)) public permissions;
    bool public timelockEnabled;

    function enable(uint8 _status, address _address) external {
        require(!timelockEnabled, "Use queueTimelock");
        permissions[_status][_address] = true;
        (bool registered,) = indexInRegistry(_address, _status);
        if (!registered) {
            registry[_status].push(_address);
            // BUG: deletes from SAME registry instead of OPPOSITE
            if (_status == R || _status == L) {
                (bool reg, uint256 index) = indexInRegistry(_address, _status);
                if (reg) { delete registry[_status][index]; }
            }
        }
    }

    function enableCorrect(uint8 _status, address _address) external {
        require(!timelockEnabled, "Use queueTimelock");
        permissions[_status][_address] = true;
        (bool registered,) = indexInRegistry(_address, _status);
        if (!registered) {
            registry[_status].push(_address);
            if (_status == L) {
                (bool reg, uint256 idx) = indexInRegistry(_address, R);
                if (reg) { delete registry[R][idx]; }
            } else if (_status == R) {
                (bool reg, uint256 idx) = indexInRegistry(_address, L);
                if (reg) { delete registry[L][idx]; }
            }
        }
    }

    function indexInRegistry(address a, uint8 s) public view returns (bool, uint256) {
        address[] storage e = registry[s];
        for (uint256 i = 0; i < e.length; i++) {
            if (a == e[i]) { return (true, i); }
        }
        return (false, 0);
    }

    function getRegistry(uint8 s) external view returns (address[] memory) { return registry[s]; }
}

contract Bug3Test is Test {
    uint8 constant R = 2;
    uint8 constant L = 3;
    address constant USDC = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    address constant DAI = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    function testExploit() public {
        Bug3_EnableRegistry bug = new Bug3_EnableRegistry();
        bug.enable(R, USDC);
        assertTrue(bug.permissions(R, USDC), "permissions set");

        address[] memory reg = bug.getRegistry(R);
        bool found;
        for (uint256 i = 0; i < reg.length; i++) if (reg[i] == USDC) found = true;
        console.log("USDC in buggy registry: %s", found ? "yes" : "no");

        Bug3_EnableRegistry v = new Bug3_EnableRegistry();
        v.enableCorrect(R, USDC);
        address[] memory r2 = v.getRegistry(R);
        bool found2;
        for (uint256 i = 0; i < r2.length; i++) if (r2[i] == USDC) found2 = true;
        console.log("USDC in correct registry: %s", found2 ? "yes" : "no");

        assertFalse(found, "BUG: enable() deletes own registry entry");
        assertTrue(found2, "Correct version tracks entry properly");
    }
}
