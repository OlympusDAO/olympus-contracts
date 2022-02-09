// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;
pragma abicoder v2;

import "ds-test/test.sol"; // ds-test

import "../../../contracts/libraries/SafeMath.sol";
import "../../../contracts/libraries/FixedPoint.sol";
import "../../../contracts/libraries/FullMath.sol";
import "../../../contracts/Staking.sol";
import "../../../contracts/FloorERC20.sol";
import "../../../contracts/sFloorERC20.sol";
import "../../../contracts/governance/gFLOOR.sol";
import "../../../contracts/Treasury.sol";
import "../../../contracts/StakingDistributor.sol";
import "../../../contracts/FloorAuthority.sol";

import "./util/Hevm.sol";
import "./util/MockContract.sol";

contract StakingTest is DSTest {
    using FixedPoint for *;
    using SafeMath for uint256;
    using SafeMath for uint112;

    FloorStaking internal staking;
    FloorTreasury internal treasury;
    FloorAuthority internal authority;
    Distributor internal distributor;

    FloorERC20Token internal floor;
    sFloor internal sfloor;
    gFLOOR internal gfloor;

    MockContract internal mockToken;

    /// @dev Hevm setup
    Hevm internal constant hevm = Hevm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    uint256 internal constant AMOUNT = 1000;
    uint256 internal constant EPOCH_LENGTH = 8; // In Seconds
    uint256 internal constant START_TIME = 0; // Starting at this epoch
    uint256 internal constant NEXT_REBASE_TIME = 1; // Next epoch is here
    uint256 internal constant BOUNTY = 42;

    function setUp() public {
        // Start at timestamp
        hevm.warp(START_TIME);

        // Setup mockToken to deposit into treasury (for excess reserves)
        mockToken = new MockContract();
        mockToken.givenMethodReturn(abi.encodeWithSelector(ERC20.name.selector), abi.encode("mock DAO"));
        mockToken.givenMethodReturn(abi.encodeWithSelector(ERC20.symbol.selector), abi.encode("MOCK"));
        mockToken.givenMethodReturnUint(abi.encodeWithSelector(ERC20.decimals.selector), 18);
        mockToken.givenMethodReturnBool(abi.encodeWithSelector(IERC20.transferFrom.selector), true);

        authority = new FloorAuthority(address(this), address(this), address(this), address(this));

        floor = new FloorERC20Token(address(authority));
        gfloor = new gFLOOR(address(this), address(this));
        sfloor = new sFloor();
        sfloor.setIndex(10);
        sfloor.setgFLOOR(address(gfloor));

        treasury = new FloorTreasury(address(floor), 1, address(authority));

        staking = new FloorStaking(
            address(floor),
            address(sfloor),
            address(gfloor),
            EPOCH_LENGTH,
            START_TIME,
            NEXT_REBASE_TIME,
            address(authority)
        );

        distributor = new Distributor(address(treasury), address(floor), address(staking), address(authority));
        distributor.setBounty(BOUNTY);
        staking.setDistributor(address(distributor));
        treasury.enable(FloorTreasury.STATUS.REWARDMANAGER, address(distributor), address(0)); // Allows distributor to mint floor.
        treasury.enable(FloorTreasury.STATUS.RESERVETOKEN, address(mockToken), address(0)); // Allow mock token to be deposited into treasury
        treasury.enable(FloorTreasury.STATUS.RESERVEDEPOSITOR, address(this), address(0)); // Allow this contract to deposit token into treeasury

        sfloor.initialize(address(staking), address(treasury));
        // gfloor.migrate(address(staking), address(sfloor));

        // Give the treasury permissions to mint
        authority.pushVault(address(treasury), true);

        // Deposit a token who's profit (3rd param) determines how much floor the treasury can mint
        uint256 depositAmount = 20e18;
        treasury.deposit(depositAmount, address(mockToken), BOUNTY.mul(2)); // Mints (depositAmount- 2xBounty) for this contract
    }

    function testStakeNoBalance() public {
        uint256 newAmount = AMOUNT.mul(2);
        try staking.stake(address(this), newAmount, true, true) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "TRANSFER_FROM_FAILED"); // Should be 'Transfer exceeds balance'
        }
    }

    function testStakeWithoutAllowance() public {
        try staking.stake(address(this), AMOUNT, true, true) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "TRANSFER_FROM_FAILED"); // Should be 'Transfer exceeds allowance'
        }
    }

    function testStake() public {
        floor.approve(address(staking), AMOUNT);
        uint256 amountStaked = staking.stake(address(this), AMOUNT, true, true);
        assertEq(amountStaked, AMOUNT);
    }

    function testStakeAtRebaseToGfloor() public {
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        floor.approve(address(staking), AMOUNT);
        bool isSfloor = false;
        bool claim = true;
        uint256 gFLOORRecieved = staking.stake(address(this), AMOUNT, isSfloor, claim);

        uint256 expectedAmount = gfloor.balanceTo(AMOUNT.add(BOUNTY));
        assertEq(gFLOORRecieved, expectedAmount);
    }

    function testStakeAtRebase() public {
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        floor.approve(address(staking), AMOUNT);
        bool isSfloor = true;
        bool claim = true;
        uint256 amountStaked = staking.stake(address(this), AMOUNT, isSfloor, claim);

        uint256 expectedAmount = AMOUNT.add(BOUNTY);
        assertEq(amountStaked, expectedAmount);
    }

    function testUnstake() public {
        bool triggerRebase = true;
        bool isSfloor = true;
        bool claim = true;

        // Stake the floor
        uint256 initialFloorBalance = floor.balanceOf(address(this));
        floor.approve(address(staking), initialFloorBalance);
        uint256 amountStaked = staking.stake(address(this), initialFloorBalance, isSfloor, claim);
        assertEq(amountStaked, initialFloorBalance);

        // Validate balances post stake
        uint256 floorBalance = floor.balanceOf(address(this));
        uint256 sFloorBalance = sfloor.balanceOf(address(this));
        assertEq(floorBalance, 0);
        assertEq(sFloorBalance, initialFloorBalance);

        // Unstake sFLOOR
        sfloor.approve(address(staking), sFloorBalance);
        staking.unstake(address(this), sFloorBalance, triggerRebase, isSfloor);

        // Validate Balances post unstake
        floorBalance = floor.balanceOf(address(this));
        sFloorBalance = sfloor.balanceOf(address(this));
        assertEq(floorBalance, initialFloorBalance);
        assertEq(sFloorBalance, 0);
    }

    function testUnstakeAtRebase() public {
        bool triggerRebase = true;
        bool isSfloor = true;
        bool claim = true;

        // Stake the floor
        uint256 initialFloorBalance = floor.balanceOf(address(this));
        floor.approve(address(staking), initialFloorBalance);
        uint256 amountStaked = staking.stake(address(this), initialFloorBalance, isSfloor, claim);
        assertEq(amountStaked, initialFloorBalance);

        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        // Validate balances post stake
        // Post initial rebase, distribution amount is 0, so sFLOOR balance doens't change.
        uint256 floorBalance = floor.balanceOf(address(this));
        uint256 sFloorBalance = sfloor.balanceOf(address(this));
        assertEq(floorBalance, 0);
        assertEq(sFloorBalance, initialFloorBalance);

        // Unstake sFLOOR
        sfloor.approve(address(staking), sFloorBalance);
        staking.unstake(address(this), sFloorBalance, triggerRebase, isSfloor);

        // Validate balances post unstake
        floorBalance = floor.balanceOf(address(this));
        sFloorBalance = sfloor.balanceOf(address(this));
        uint256 expectedAmount = initialFloorBalance.add(BOUNTY); // Rebase earns a bounty
        assertEq(floorBalance, expectedAmount);
        assertEq(sFloorBalance, 0);
    }

    function testUnstakeAtRebaseFromGfloor() public {
        bool triggerRebase = true;
        bool isSfloor = false;
        bool claim = true;

        // Stake the floor
        uint256 initialFloorBalance = floor.balanceOf(address(this));
        floor.approve(address(staking), initialFloorBalance);
        uint256 amountStaked = staking.stake(address(this), initialFloorBalance, isSfloor, claim);
        uint256 gfloorAmount = gfloor.balanceTo(initialFloorBalance);
        assertEq(amountStaked, gfloorAmount);

        // test the unstake
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        // Validate balances post-stake
        uint256 floorBalance = floor.balanceOf(address(this));
        uint256 gfloorBalance = gfloor.balanceOf(address(this));
        assertEq(floorBalance, 0);
        assertEq(gfloorBalance, gfloorAmount);

        // Unstake gFLOOR
        gfloor.approve(address(staking), gfloorBalance);
        staking.unstake(address(this), gfloorBalance, triggerRebase, isSfloor);

        // Validate balances post unstake
        floorBalance = floor.balanceOf(address(this));
        gfloorBalance = gfloor.balanceOf(address(this));
        uint256 expectedFloor = initialFloorBalance.add(BOUNTY); // Rebase earns a bounty
        assertEq(floorBalance, expectedFloor);
        assertEq(gfloorBalance, 0);
    }
}
