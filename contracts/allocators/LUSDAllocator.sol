// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
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

// Copied selected methods from https://github.com/liquity/dev/blob/f0fa535fd9a44a5322ab461f1f5c421a20c0234d/packages/contracts/contracts/Interfaces/ITroveManager.sol
interface ITroveManager {
    function getEntireDebtAndColl(address _borrower) external view returns (
        uint debt,
        uint coll,
        uint pendingLUSDDebtReward,
        uint pendingETHReward
    );
}

// Copied selected methods from https://github.com/liquity/dev/blob/cdcc0c25032422e74ab84b956c59682ae6db8c39/packages/contracts/contracts/Interfaces/ISortedTroves.sol
interface ISortedTroves {
    function getSize() external view returns (uint256);
    function findInsertPosition(uint256 _ICR, address _prevId, address _nextId) external view returns (address, address);
}

// Copied selected methods from https://github.com/liquity/dev/blob/052d05837e6f1bf402a608378792da5acb8cf618/packages/contracts/contracts/HintHelpers.sol
interface IHintHelpers {
    function getApproxHint(uint _CR, uint _numTrials, uint _inputRandomSeed)
    external
    view
    returns (address hintAddress, uint diff, uint latestRandomSeed);
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
    IHintHelpers immutable hintHelper;  // 0xE84251b93D9524E0d2e621Ba7dc7cb3579F997C0 from https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L17
    ITroveManager immutable troveManager; // 0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2 from https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L10
    ISortedTroves immutable sortedTroves;  // 0x8FdD3fbFEb32b28fb73555518f8b361bCeA741A6 from https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L9
    ITreasury immutable treasury; // Olympus Treasury
    // TODO(zx): I don't think we care about front-end because we're our own frontend.
    address public frontEndAddress; // frontEndAddress for potential liquity rewards
    address public lusdTokenAddress; // LUSD Address (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0) from https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L19


    uint256 public totalValueDeployed; // total RFV deployed into lending pool
    uint256 public totalAmountDeployed; // Total amount of tokens deployed

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _lusdTokenAddress,
        address _stabilityPool,
        address _sortedTrovesAddress,
        address _hintHelpersAddress,
        address _troveManagerAddress,
        address _frontEndAddress
    ) {
        require(_treasury != address(0), "treasury address cannot be 0x0");
        treasury = ITreasury(_treasury);

        require(_stabilityPool != address(0), "stabilityPool address cannot be 0x0");
        lusdStabilityPool = IStabilityPool(_stabilityPool);

        require(_lusdTokenAddress != address(0), "LUSD token address cannot be 0x0");
        lusdTokenAddress = _lusdTokenAddress;

        require(_sortedTrovesAddress != address(0), "SortedTrove token address cannot be 0x0");
        sortedTroves = ISortedTroves(_sortedTrovesAddress);

        require(_hintHelpersAddress != address(0), "HintHelper token address cannot be 0x0");
        hintHelper = IHintHelpers(_hintHelpersAddress);

        require(_troveManagerAddress != address(0), "TroveManager token address cannot be 0x0");
        troveManager = ITroveManager(_troveManagerAddress);

        frontEndAddress = _frontEndAddress; // address can be 0
    }

    /* ======== OPEN FUNCTIONS ======== */

    /**
     *  @notice claims LQTY & ETH Rewards
     */
    function harvest() public returns (bool) {

        (address upperHint, address lowerHint) = getHints(address(this));

        //This harvests both ETH and LQTY rewards
        lusdStabilityPool.withdrawETHGainToTrove(upperHint, lowerHint);

        return true;
    }

    //Algorithm from https://github.com/liquity/dev/blob/main/README.md#adjusting-a-trove
    //TODO Try testing with address = 0x29D0cAb031DD0C4fb1adF98D56a7b0aD2d93Ca5F (went to SortedTroves https://etherscan.io/address/0x8FdD3fbFEb32b28fb73555518f8b361bCeA741A6#readContract and did getLast(), then getPrev() several times)
    function getHints(address borrower) public view returns (address upperHint, address lowerHint){
        (uint debt, uint coll, uint pendingLUSDDebtReward, uint pendingETHReward) = troveManager.getEntireDebtAndColl(borrower);

        //Got back:
//        [ getEntireDebtAndColl(address) method Response ]
//    debt   uint256 :  363407671459371026109145
//    coll   uint256 :  130659000000000000000
//    pendingLUSDDebtReward   uint256 :  0
//    pendingETHReward   uint256 :  0
        uint256 nicr = coll.mul(1 * 10 ** 20).div(debt);  //3.595383649313183e16
        uint256 numTrials =  sortedTroves.getSize().mul(15); //size = 1213, so * 15 = 18195
        uint pseudoRandom = uint(keccak256(abi.encode(block.difficulty, block.timestamp)));  // From https://stackoverflow.com/a/67332959
        (address hintAddress, uint diff, uint latestRandomSeed) = hintHelper.getApproxHint(nicr, numTrials, pseudoRandom);

        // Use the approximate hint to get the exact upper and lower hints from the deployed SortedTroves contract
        return sortedTroves.findInsertPosition(nicr, hintAddress, hintAddress);
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

        uint256 value = treasury.tokenValue(token, amount); // treasury RFV calculator
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
        uint256 value = treasury.tokenValue(token, balance); // treasury RFV calculator

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
