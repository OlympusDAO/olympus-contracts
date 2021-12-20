// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

//https://etherscan.io/address/0x66017D22b0f8556afDd19FC67041899Eb65a21bb
/*
 * The Stability Pool holds LUSD tokens deposited by Stability Pool depositors.
 *
 * When a trove is liquidated, then depending on system conditions, some of its LUSD debt gets offset with
 * LUSD in the Stability Pool:  that is, the offset debt evaporates, and an equal amount of LUSD tokens in the Stability Pool is burned.
 *
 * Thus, a liquidation causes each depositor to receive a LUSD loss, in proportion to their deposit as a share of total deposits.
 * They also receive an ETH gain, as the ETH collateral of the liquidated trove is distributed among Stability depositors,
 * in the same proportion.
 *
 * When a liquidation occurs, it depletes every deposit by the same fraction: for example, a liquidation that depletes 40%
 * of the total LUSD in the Stability Pool, depletes 40% of each deposit.
 *
 * A deposit that has experienced a series of liquidations is termed a "compounded deposit": each liquidation depletes the deposit,
 * multiplying it by some factor in range ]0,1[
 *
 * Please see the implementation spec in the proof document, which closely follows on from the compounded deposit / ETH gain derivations:
 * https://github.com/liquity/liquity/blob/master/papers/Scalable_Reward_Distribution_with_Compounding_Stakes.pdf
 *
 * --- LQTY ISSUANCE TO STABILITY POOL DEPOSITORS ---
 *
 * An LQTY issuance event occurs at every deposit operation, and every liquidation.
 *
 * Each deposit is tagged with the address of the front end through which it was made.
 *
 * All deposits earn a share of the issued LQTY in proportion to the deposit as a share of total deposits. The LQTY earned
 * by a given deposit, is split between the depositor and the front end through which the deposit was made, based on the front end's kickbackRate.
 *
 * Please see the system Readme for an overview:
 * https://github.com/liquity/dev/blob/main/README.md#lqty-issuance-to-stability-providers
 */
interface IStabilityPool {
    // --- Functions ---
    /*
     * Initial checks:
     * - Frontend is registered or zero address
     * - Sender is not a registered frontend
     * - _amount is not zero
     * ---
     * - Triggers a LQTY issuance, based on time passed since the last issuance. The LQTY issuance is shared between *all* depositors and front ends
     * - Tags the deposit with the provided front end tag param, if it's a new deposit
     * - Sends depositor's accumulated gains (LQTY, ETH) to depositor
     * - Sends the tagged front end's accumulated LQTY gains to the tagged front end
     * - Increases deposit and tagged front end's stake, and takes new snapshots for each.
     */
    function provideToSP(uint256 _amount, address _frontEndTag) external;

    /*
     * Initial checks:
     * - _amount is zero or there are no under collateralized troves left in the system
     * - User has a non zero deposit
     * ---
     * - Triggers a LQTY issuance, based on time passed since the last issuance. The LQTY issuance is shared between *all* depositors and front ends
     * - Removes the deposit's front end tag if it is a full withdrawal
     * - Sends all depositor's accumulated gains (LQTY, ETH) to depositor
     * - Sends the tagged front end's accumulated LQTY gains to the tagged front end
     * - Decreases deposit and tagged front end's stake, and takes new snapshots for each.
     *
     * If _amount > userDeposit, the user withdraws all of their compounded deposit.
     */
    function withdrawFromSP(uint256 _amount) external;

    /*
     * Initial checks:
     * - User has a non zero deposit
     * - User has an open trove
     * - User has some ETH gain
     * ---
     * - Triggers a LQTY issuance, based on time passed since the last issuance. The LQTY issuance is shared between *all* depositors and front ends
     * - Sends all depositor's LQTY gain to  depositor
     * - Sends all tagged front end's LQTY gain to the tagged front end
     * - Transfers the depositor's entire ETH gain from the Stability Pool to the caller's trove
     * - Leaves their compounded deposit in the Stability Pool
     * - Updates snapshots for deposit and tagged front end stake
     */
    function withdrawETHGainToTrove(address _upperHint, address _lowerHint) external;

    /*
     * Initial checks:
     * - Frontend (sender) not already registered
     * - User (sender) has no deposit
     * - _kickbackRate is in the range [0, 100%]
     * ---
     * Front end makes a one-time selection of kickback rate upon registering
     */
    function registerFrontEnd(uint256 _kickbackRate) external;

    /*
     * Initial checks:
     * - Caller is TroveManager
     * ---
     * Cancels out the specified debt against the LUSD contained in the Stability Pool (as far as possible)
     * and transfers the Trove's ETH collateral from ActivePool to StabilityPool.
     * Only called by liquidation functions in the TroveManager.
     */
    function offset(uint256 _debt, uint256 _coll) external;

    /*
     * Returns the total amount of ETH held by the pool, accounted in an internal variable instead of `balance`,
     * to exclude edge cases like ETH received from a self-destruct.
     */
    function getETH() external view returns (uint256);

    /*
     * Returns LUSD held in the pool. Changes when users deposit/withdraw, and when Trove debt is offset.
     */
    function getTotalLUSDDeposits() external view returns (uint256);

    /*
     * Calculates the ETH gain earned by the deposit since its last snapshots were taken.
     */
    function getDepositorETHGain(address _depositor) external view returns (uint256);

    /*
     * Calculate the LQTY gain earned by a deposit since its last snapshots were taken.
     * If not tagged with a front end, the depositor gets a 100% cut of what their deposit earned.
     * Otherwise, their cut of the deposit's earnings is equal to the kickbackRate, set by the front end through
     * which they made their deposit.
     */
    function getDepositorLQTYGain(address _depositor) external view returns (uint256);

    /*
     * Return the LQTY gain earned by the front end.
     */
    function getFrontEndLQTYGain(address _frontEnd) external view returns (uint256);

    /*
     * Return the user's compounded deposit.
     */
    function getCompoundedLUSDDeposit(address _depositor) external view returns (uint256);

    /*
     * Return the front end's compounded stake.
     *
     * The front end's compounded stake is equal to the sum of its depositors' compounded deposits.
     */
    function getCompoundedFrontEndStake(address _frontEnd) external view returns (uint256);
}

//
interface ILQTYStaking {
    /*
        sends _LQTYAmount from the caller to the staking contract, and increases their stake.
        If the caller already has a non-zero stake, it pays out their accumulated ETH and LUSD gains from staking.
    */
    function stake(uint256 _LQTYamount) external;

    /**
        reduces the caller’s stake by _LQTYamount, up to a maximum of their entire stake. 
        It pays out their accumulated ETH and LUSD gains from staking.
    */
    function unstake(uint256 _LQTYamount) external;

    function getPendingETHGain(address _user) external view returns (uint);

    function getPendingLUSDGain(address _user) external view returns (uint);
}

/**
 *  Contract deploys reserves from treasury into the Aave lending pool,
 *  earning interest and $stkAAVE.
 */

contract LUSDAllocator is Ownable {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLES ======== */
    IStabilityPool immutable lusdStabilityPool;
    ILQTYStaking immutable lqtyStaking;
    ITreasury immutable treasury; // Olympus Treasury
    IERC20 immutable weth;  // WETH9 address (0xb603cEa165119701B58D56d10D2060fBFB3efad8)

    // TODO(zx): I don't think we care about front-end because we're our own frontend.
    address public frontEndAddress; // frontEndAddress for potential liquity rewards
    address public lusdTokenAddress; // LUSD Address (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0)
    address public lqtyTokenAddress; // LQTY Address (0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D)  from https://github.com/liquity/dev/blob/a12f8b737d765bfee6e1bfcf8bf7ef155c814e1e/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L61

    uint256 public totalValueDeployed; // total RFV deployed into lending pool
    uint256 public totalAmountDeployed; // Total amount of tokens deployed

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _lusdTokenAddress,
        address _lqtyTokenAddress,
        address _stabilityPool,
        address _lqtyStaking,
        address _frontEndAddress,
        address _wethAddress
    ) {
        require(_treasury != address(0), "treasury address cannot be 0x0");
        treasury = ITreasury(_treasury);

        require(_lusdTokenAddress != address(0), "LUSD token address cannot be 0x0");
        lusdTokenAddress = _lusdTokenAddress;

        require(_lqtyTokenAddress != address(0), "LQTY token address cannot be 0x0");
        lqtyTokenAddress = _lqtyTokenAddress;

        require(_stabilityPool != address(0), "stabilityPool address cannot be 0x0");
        lusdStabilityPool = IStabilityPool(_stabilityPool);

        require(_lqtyStaking != address(0), "LQTY staking address cannot be 0x0");
        lqtyStaking = ILQTYStaking(_lqtyStaking);

        frontEndAddress = _frontEndAddress; // address can be 0

        require(_wethAddress != address(0), "WETH token address cannot be 0x0");
        weth = IERC20(_wethAddress);
    }

    /* ======== OPEN FUNCTIONS ======== */

    /**
     *  @notice claims LQTY & ETH Rewards

        1.  Harvest from LUSD StabilityPool to get ETH+LQTY rewards
        2.  Stake LQTY rewards from #1.  This txn will also give out any outstanding ETH+LUSD rewards from prior staking
        3.  Deposit LUSD from #2 into StabilityPool
        4.  Move ETH from #1 and #2 to treasury 
     */
    function harvest() public returns (bool) {
        uint256 stabilityPoolEthRewards = getETHRewards();
        uint256 stabilityPoolLqtyRewards = getLQTYRewards();

        if (stabilityPoolEthRewards == 0 && stabilityPoolLqtyRewards == 0) {
            return false;
        }
        // 1.  Harvest from LUSD StabilityPool to get ETH+LQTY rewards
        lusdStabilityPool.withdrawFromSP(0);  //Passing 0 b/c we don't want to withdraw from the pool but harvest - see https://discord.com/channels/700620821198143498/818895484956835912/908031137010581594

        // 2.  Stake LQTY rewards from #1.  This txn will also give out any outstanding ETH+LUSD rewards from prior staking
        uint256 balanceLqty = IERC20(lqtyTokenAddress).balanceOf(address(this)); // LQTY balance received from stability pool
        
        uint stakingEthRewards = 0;
        uint stakingLUSDRewards = 0;
        if (balanceLqty > 0) {
            stakingEthRewards = lqtyStaking.getPendingETHGain(address(this));
            stakingLUSDRewards = lqtyStaking.getPendingLUSDGain(address(this));
            //Stake
            IERC20(lqtyTokenAddress).approve(address(lqtyStaking), balanceLqty); // approve to deposit into stability pool
            lqtyStaking.stake(balanceLqty); //Stake LQTY, also receives any prior ETH+LUSD rewards from prior staking TODO need to deposit this LUSD
        }

        // 3.  Deposit LUSD from #2 into StabilityPool
        if (stakingLUSDRewards > 0) {
            IERC20(lusdTokenAddress).approve(address(lusdStabilityPool), stakingLUSDRewards); // approve to deposit into stability pool
            lusdStabilityPool.provideToSP(stakingLUSDRewards, frontEndAddress);
        }


        // 4.  Move ETH from #1 and #2 to treasury 
       if (stabilityPoolEthRewards > 0 || stakingEthRewards > 0) {            
            uint256 totalEthRewards = stabilityPoolEthRewards + stakingEthRewards;            
            weth.approve(address(treasury), totalEthRewards);
            weth.safeTransferFrom(address(this), address(treasury), totalEthRewards);
       }

        return true;
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice withdraws asset from treasury, deposits asset into stability pool
     *  @param token address
     *  @param amount uint
     */
    function deposit(address token, uint256 amount) external onlyOwner {
        require(token == lusdTokenAddress, "token address does not match LUSD token");
        treasury.manage(token, amount); // retrieve amount of asset from treasury

        IERC20(token).approve(address(lusdStabilityPool), amount); // approve to deposit into stability pool
        lusdStabilityPool.provideToSP(amount, frontEndAddress); //s either a front-end address OR 0x0

        uint256 value = tokenValue(token, amount); // treasury RFV calculator
        accountingFor(amount, value, true); // account for deposit
    }

    /**
     *  @notice withdraws from stability pool, and deposits asset into treasury
     *  @param token address
     *  @param amount uint
     */
    function withdraw(address token, uint256 amount) public onlyOwner {
        require(token == lusdTokenAddress, "token address does not match LUSD token");

        lusdStabilityPool.withdrawFromSP(amount); // withdraw from SP

        uint256 balance = IERC20(token).balanceOf(address(this)); // balance of asset received from stability pool
        uint256 value = tokenValue(token, balance); // treasury RFV calculator

        accountingFor(balance, value, false); // account for withdrawal

        IERC20(token).approve(address(treasury), balance); // approve to deposit asset into treasury
        treasury.deposit(balance, token, value); // deposit using value as profit so no OHM is minted
    }

    /**
     *  @notice setsFrontEndAddress for Stability pool rewards
     *  @param _frontEndAddress address
     */
    function setFrontEndAddress(address _frontEndAddress) external onlyOwner {
        frontEndAddress = _frontEndAddress;
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     *  @notice accounting of deposits/withdrawals of assets
     *  @param amount uint
     *  @param value uint
     *  @param add bool
     */
    function accountingFor(
        uint256 amount,
        uint256 value,
        bool add
    ) internal {
        if (add) {
            totalAmountDeployed = totalAmountDeployed.add(amount);
            totalValueDeployed = totalValueDeployed.add(value); // track total value allocated into pools
        } else {
            // track total value allocated into pools
            if (amount < totalAmountDeployed) {
                totalAmountDeployed = totalAmountDeployed.sub(amount);
            } else {
                totalAmountDeployed = 0;
            }

            if (value < totalValueDeployed) {
                totalValueDeployed = totalValueDeployed.sub(value);
            } else {
                totalValueDeployed = 0;
            }
        }
    }

    /**
    Helper method copying OlympusTreasury::tokenValue(), which will change it's name
    to valueOf() in the future.  Implemented here so we don't have to upgrade contract later
     */
    function tokenValue(address _token, uint256 _amount) internal view returns (uint256 value_) {
        value_ = _amount.mul(10**9).div(10**IERC20Metadata(_token).decimals());
        return value_;
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice get ETH rewards from SP
     *  @return uint
     */
    function getETHRewards() public view returns (uint256) {
        return lusdStabilityPool.getDepositorETHGain(address(this));
    }

    /**
     *  @notice get LQTY rewards from SP
     *  @return uint
     */
    function getLQTYRewards() public view returns (uint256) {
        return lusdStabilityPool.getDepositorLQTYGain(address(this));
    }
}
