// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma abicoder v2;

import "ds-test/test.sol"; // ds-test

import "../../../contracts/libraries/SafeMath.sol";
import "../../../contracts/libraries/FixedPoint.sol";
import "../../../contracts/libraries/FullMath.sol";
import "../../../contracts/Staking.sol";
import "../../../contracts/OlympusERC20.sol";
import "../../../contracts/sOlympusERC20.sol";
import "../../../contracts/governance/gOHM.sol";
import "../../../contracts/Treasury.sol";
import "../../../contracts/StakingDistributor.sol";
import "../../../contracts/OlympusAuthority.sol";

import "./util/Hevm.sol";
import "./util/MockContract.sol";

contract StakingTest is DSTest {
    using FixedPoint for *;
    using SafeMath for uint256;
    using SafeMath for uint112;

    OlympusStaking internal staking;
    OlympusTreasury internal treasury;
    OlympusAuthority internal authority;
    Distributor internal distributor;

    OlympusERC20Token internal ohm;
    sOlympus internal sohm;
    gOHM internal gohm;

    MockContract internal abcToken;

    /// @dev Hevm setup
    Hevm internal constant hevm = Hevm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    uint256 internal constant amount = 1000;
    uint256 internal constant EPOCH_LENGTH = 8; // In Seconds
    uint256 internal constant START_TIME = 0; // Starting at this epoch
    uint256 internal constant NEXT_REBASE_TIME = 1; // Next epoch is here
    uint256 internal constant BOUNTY = 42000; // TODO whats bounty?

    function setUp() public {
        // Start at timestamp
        hevm.warp(START_TIME);

        authority = new OlympusAuthority(address(this), address(this), address(this), address(this));

        ohm = new OlympusERC20Token(address(authority));
        gohm = new gOHM(address(this), address(this));
        sohm = new sOlympus();
        sohm.setIndex(10);
        sohm.setgOHM(address(gohm));

        abcToken = new MockContract();

        treasury = new OlympusTreasury(address(ohm), 1, address(authority));
        // If you want to test the Treasury permissions
        // authority.pushVault(address(treasury), true);
        staking = new OlympusStaking(
            address(ohm),
            address(sohm),
            address(gohm),
            EPOCH_LENGTH,
            START_TIME,
            NEXT_REBASE_TIME,
            address(authority)
        );

        distributor = new Distributor(address(treasury), address(ohm), address(staking), address(authority));
        distributor.setBounty(BOUNTY);

        staking.setDistributor(address(distributor));

        sohm.initialize(address(staking), address(treasury));
        gohm.migrate(address(staking), address(sohm));

        ohm.mint(address(this), amount);
    }

    function testStakeNoBalance() public {
        uint256 newAmount = amount.mul(2);
        try staking.stake(address(this), newAmount, true, true) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "TRANSFER_FROM_FAILED"); // Should be 'Transfer exceeds balance'
        }
    }

    function testStakeWithoutAllowance() public {
        try staking.stake(address(this), amount, true, true) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "TRANSFER_FROM_FAILED"); // Should be 'Transfer exceeds allowance'
        }
    }

    function testStake() public {
        ohm.approve(address(staking), amount);
        uint256 amountStaked = staking.stake(address(this), amount, true, true);
        assertEq(amountStaked, amount);
    }

    function testStakeAtRebase() public {
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        ohm.approve(address(staking), amount);
        bool isSohm = true;
        bool claim = true;
        uint256 amountStaked = staking.stake(address(this), amount, isSohm, claim);

        uint256 expectedAmount = amount.add(BOUNTY);
        assertEq(amountStaked, expectedAmount);
    }

    function testUnstake() public {
        bool triggerRebase = true;
        bool isSohm = true;
        bool claim = true;

        // Stake the ohm
        ohm.approve(address(staking), amount);
        uint256 amountStaked = staking.stake(address(this), amount, isSohm, claim);
        assertEq(amount, amountStaked);
        uint256 ohmBalance = ohm.balanceOf(address(this));
        uint256 sOhmBalance = sohm.balanceOf(address(this));

        assertEq(ohmBalance, 0);
        assertEq(sOhmBalance, amount);

        // test the unstake
        sohm.approve(address(staking), sOhmBalance);
        staking.unstake(address(this), sOhmBalance, triggerRebase, isSohm);

        ohmBalance = ohm.balanceOf(address(this));
        sOhmBalance = sohm.balanceOf(address(this));

        assertEq(ohmBalance, amount);
        assertEq(sOhmBalance, 0);
    }

    function testUnstakeAtRebase() public {
        bool triggerRebase = true;
        bool isSohm = true;
        bool claim = true;

        // Stake the ohm
        ohm.approve(address(staking), amount);
        uint256 amountStaked = staking.stake(address(this), amount, isSohm, claim);
        assertEq(amount, amountStaked);

        // test the unstake
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        // Post initial rebase, distribution amount is 0, so sOHM balance doens't change.
        uint256 ohmBalance = ohm.balanceOf(address(this));
        uint256 sOhmBalance = sohm.balanceOf(address(this));
        assertEq(ohmBalance, 0);
        assertEq(sOhmBalance, amount);

        sohm.approve(address(staking), sOhmBalance);
        // TODO: this fails because the staking contract doesn't have enough ohm to gibb.
        staking.unstake(address(this), sOhmBalance, triggerRebase, isSohm);

        ohmBalance = ohm.balanceOf(address(this));
        sOhmBalance = sohm.balanceOf(address(this));

        assertEq(ohmBalance, amount);
        assertEq(sOhmBalance, 0);
    }
}
