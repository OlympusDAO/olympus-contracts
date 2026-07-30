// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

/**
 * @title Bug #2 — BondDepository.debtDecay() Underflow
 * @notice When secondsSince >= length, totalDebt -= decay underflows
 *         in Solidity 0.8+, permanently bricking all deposit() calls
 *         for that market. Based on BondDepository.sol lines 176, 320-326.
 */

contract Bug2_DebtDecay {
    uint64 public totalDebt;
    uint48 public lastDecay;
    uint48 public length;

    constructor(uint64 _initialDebt, uint48 _length) {
        totalDebt = _initialDebt;
        lastDecay = uint48(block.timestamp);
        length = _length;
    }

    function debtDecay() public view returns (uint64) {
        uint256 secondsSince = block.timestamp - lastDecay;
        return uint64((totalDebt * secondsSince) / length);
    }

    function decay() external {
        totalDebt -= debtDecay(); // underflows in 0.8+ when decay > totalDebt
        lastDecay = uint48(block.timestamp);
    }

    function getSecondsSince() external view returns (uint256) {
        return block.timestamp - lastDecay;
    }
}

contract Bug2Test is Test {
    uint64 constant DEBT = 1_000_000_000_000; // 1000 OHM
    uint48 constant LEN = 86400; // 1 day

    function testExploit() public {
        Bug2_DebtDecay bug = new Bug2_DebtDecay(DEBT, LEN);
        console.log("Initial totalDebt: %s", bug.totalDebt());

        // Phase 1: 12h within length — decay works
        vm.warp(block.timestamp + 43200);
        bug.decay();
        console.log("After 12h: totalDebt=%s", bug.totalDebt());
        assertLt(bug.totalDebt(), DEBT);

        // Phase 2: Advance past length — underflow
        vm.warp(block.timestamp + LEN + 1);

        uint256 d = bug.debtDecay();
        uint256 t = bug.totalDebt();
        console.log("totalDebt=%s debtDecay=%s", t, d);
        assertGe(d, t, "decay >= totalDebt => guaranteed underflow");

        vm.expectRevert();
        bug.decay();
        console.log("MARKET BRICKED — deposit() permanently reverts");
    }
}
