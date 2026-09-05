// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

/**
 * @title Bug #1 — Treasury.repayDebtWithOHM() Arithmetic Underflow
 * @notice RESERVEDEBTOR who borrowed reserve tokens (not OHM)
 *         has ohmDebt==0. Calling repayDebtWithOHM() triggers
 *         SafeMath.sub(amount) on zero, permanently reverting.
 *         Based on OlympusTreasury.sol lines 197-207.
 *
 * @dev To run: forge install foundry-rs/forge-std && forge test --match-contract Bug1Test -vvv
 */

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
}

contract Bug1_RepayDebt {
    using SafeMath for uint256;

    mapping(address => uint256) public ohmDebt;
    mapping(address => uint256) public totalDebt;
    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public isReserveDebtor;
    mapping(address => bool) public isOhmDebtor;

    function setDebtor(address user, bool reserve, bool ohm) external {
        isReserveDebtor[user] = reserve;
        isOhmDebtor[user] = ohm;
    }
    function setBalance(address user, uint256 a) external { balanceOf[user] = a; }
    function borrowReserve(address user, uint256 v) external { totalDebt[user] = totalDebt[user].add(v); }
    function borrowOhm(address user, uint256 v) external {
        totalDebt[user] = totalDebt[user].add(v);
        ohmDebt[user] = ohmDebt[user].add(v);
    }

    // Exact reproduction of Treasury.repayDebtWithOHM() (lines 197-207)
    function repayDebtWithOHM(uint256 _amount) external {
        require(isReserveDebtor[msg.sender] || isOhmDebtor[msg.sender], "Not a debtor");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_amount);
        totalDebt[msg.sender] = totalDebt[msg.sender].sub(_amount);
        ohmDebt[msg.sender] = ohmDebt[msg.sender].sub(_amount); // BUG: ohmDebt==0
    }
}

contract Bug1Test is Test {
    Bug1_RepayDebt bug;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        bug = new Bug1_RepayDebt();
    }

    function testExploit() public {
        // Alice = RESERVEDEBTOR (borrowed USDC, not OHM)
        bug.setDebtor(alice, true, false);
        bug.borrowReserve(alice, 1_000_000);
        bug.setBalance(alice, 1_000_000);

        assertEq(bug.ohmDebt(alice), 0, "ohmDebt must be 0");
        assertEq(bug.totalDebt(alice), 1_000_000, "totalDebt > 0");

        console.log("Alice: ohmDebt=%s, totalDebt=%s", bug.ohmDebt(alice), bug.totalDebt(alice));

        // repayDebtWithOHM reverts — SafeMath.sub(0, amount) underflows
        vm.prank(alice);
        vm.expectRevert("SafeMath: subtraction overflow");
        bug.repayDebtWithOHM(500_000);

        console.log("REPAYMENT REVERTED — RESERVEDEBTOR cannot repay with OHM");

        // Bob = OHMDEBTOR (borrowed OHM directly) — works normally
        bug.setDebtor(bob, false, true);
        bug.borrowOhm(bob, 10_000);
        bug.setBalance(bob, 10_000);

        vm.prank(bob);
        bug.repayDebtWithOHM(10_000);

        assertEq(bug.ohmDebt(bob), 0, "OHMDEBTOR repays normally");
        console.log("OHMDEBTOR repays normally — asymmetry confirmed");
    }
}
