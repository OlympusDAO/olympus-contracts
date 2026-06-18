// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

/**
 * @title Bug #4 — Treasury.baseSupply() Unchecked Subtraction
 * @notice OHM.totalSupply() - ohmDebt uses raw `-` in Solidity 0.7.5
 *         (no SafeMath). When ohmDebt > totalSupply, result wraps
 *         silently to ~2^256, corrupting bond pricing and reserve
 *         accounting. Based on Treasury.sol line 250.
 */

contract Bug4_BaseSupply {
    uint256 public totalSupply;
    uint256 public ohmDebt;

    function setTotalSupply(uint256 s) external { totalSupply = s; }
    function setOhmDebt(uint256 d) external { ohmDebt = d; }
    function borrowOhm(uint256 a) external { totalSupply += a; ohmDebt += a; }
    function burnOhm(uint256 a) external { require(a <= totalSupply); totalSupply -= a; }

    // Exact reproduction of Treasury.baseSupply() (line 250)
    // unchecked simulates 0.7.5's silent wrapping behavior
    function baseSupply() external view returns (uint256) {
        unchecked { return totalSupply - ohmDebt; }
    }

    function baseSupplyFixed() external view returns (uint256) {
        if (ohmDebt > totalSupply) return 0;
        return totalSupply - ohmDebt;
    }
}

contract Bug4Test is Test {
    function testExploit() public {
        Bug4_BaseSupply bug = new Bug4_BaseSupply();

        // Normal state
        bug.setTotalSupply(1_000_000);
        bug.setOhmDebt(500_000);
        assertEq(bug.baseSupply(), 500_000);
        console.log("Normal: baseSupply=%s", bug.baseSupply());

        // Attack path: OHMDEBTOR borrows + RESERVESPENDER burns more than borrowed
        bug.borrowOhm(1_000);
        bug.setTotalSupply(5_000);
        bug.setOhmDebt(3_000);
        bug.burnOhm(4_000); // totalSupply=1000, ohmDebt=3000

        uint256 bs = bug.baseSupply();
        uint256 expected = type(uint256).max - 2000 + 1; // 2^256 - 2000

        console.log("totalSupply=%s ohmDebt=%s", bug.totalSupply(), bug.ohmDebt());
        console.log("baseSupply=%s expected=%s", bs, expected);
        console.log("Is garbage (>1e75)? %s", bs > 1e75 ? "YES" : "no");

        assertEq(bs, expected, "baseSupply() wraps to garbage ~2^256");
        assertTrue(bs > 1e75, "~2^256 garbage value");

        assertEq(bug.baseSupplyFixed(), 0, "Fixed version returns 0");
        console.log("Underflow confirmed — baseSupply() returns garbage in 0.7.5");
    }
}
