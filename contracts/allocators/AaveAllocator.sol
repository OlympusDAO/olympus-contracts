// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface ILendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

interface IStakedTokenIncentivesController {
    function claimRewards(
        address[] memory assets,
        uint256 amount,
        address to
    ) external;

    function claimRewardsOnBehalf(
        address[] memory assets,
        uint256 amount,
        address user,
        address to
    ) external;

    function getRewardsBalance(address[] memory assets, address user) external view returns (uint256);
}

/**
 *  Contract deploys reserves from treasury into the Aave lending pool,
 *  earning interest and $stkAAVE.
 */

contract AaveAllocator is OlympusAccessControlled {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct aTokenData {
        address underlying;
        address aToken;
        uint256 deployed;
        uint256 limit;
        uint256 newLimit;
        uint256 limitChangeTimelockEnd;
    }

    /* ======== STATE VARIABLES ======== */

    // stkAave incentive controller
    IStakedTokenIncentivesController internal immutable incentives =
        IStakedTokenIncentivesController(0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5);
    // Aave Lending Pool
    ILendingPool internal immutable lendingPool = ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    // Olympus Treasury
    ITreasury internal immutable treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);

    // all relevant aTokens
    address[] public aTokens;
    // corresponding aTokens for tokens
    mapping(address => aTokenData) public aTokenInfo;
    // total RFV deployed into lending pool
    uint256 public totalValueDeployed;

    // timelock to raise deployment limit
    uint256 public immutable timelockInBlocks = 6600;
    // rebates portion of lending pool fees
    uint16 public referralCode;

    /* ======== CONSTRUCTOR ======== */

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {
        referralCode = 0;
    }

    /* ======== OPEN FUNCTIONS ======== */

    /**
     * @notice claims accrued stkAave rewards for all tracked aTokens
     */
    function harvest() public {
        incentives.claimRewards(aTokens, rewardsPending(), address(treasury));
    }

    /**
     * @notice claims accrued stkAave rewards for given aTokens
     */
    function harvestFor(address[] calldata _aTokens) external {
        incentives.claimRewards(_aTokens, rewardsPendingFor(_aTokens), address(treasury));
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     * @notice withdraws asset from treasury, deposits asset into lending pool, then deposits aToken into treasury
     */
    function deposit(address token, uint256 amount) public onlyPolicy {
        require(!exceedsLimit(token, amount), "Exceeds deposit limit");

        // retrieve amount of asset from treasury
        treasury.manage(token, amount);

        // approve and deposit into lending pool, returning aToken
        IERC20(token).approve(address(lendingPool), amount);
        lendingPool.deposit(token, amount, address(this), referralCode);

        // account for deposit
        accountingFor(token, amount, treasury.tokenValue(token, amount), true);
    }

    /**
     * @notice withdraws aToken from treasury, withdraws from lending pool, and deposits asset into treasury
     */
    function withdraw(address token, uint256 amount) public onlyPolicy {
        // approve and withdraw from lending pool, returning asset
        IERC20(aTokenInfo[token].aToken).approve(address(lendingPool), amount);
        lendingPool.withdraw(token, amount, address(this));

        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 value = treasury.tokenValue(token, balance);

        // account for withdrawal
        accountingFor(token, balance, value, false);

        // approve and deposit asset into treasury
        IERC20(token).approve(address(treasury), balance);
        treasury.deposit(balance, token, value);
    }

    /**
     * @notice adds asset and corresponding aToken to mapping
     */
    function addToken(
        address token,
        address aToken,
        uint256 max
    ) external onlyPolicy {
        require(token != address(0), "Token: Zero address");
        require(aToken != address(0), "aToken: Zero address");
        require(aTokenInfo[token].deployed == 0, "Token added");

        aTokenInfo[token] = aTokenData({
            underlying: token,
            aToken: aToken,
            deployed: 0,
            limit: max,
            newLimit: 0,
            limitChangeTimelockEnd: 0
        });
    }

    /**
     * @notice lowers max can be deployed for asset (no timelock)
     */
    function lowerLimit(address token, uint256 newMax) external onlyPolicy {
        require(newMax < aTokenInfo[token].limit, "Must be lower");
        require(newMax > aTokenInfo[token].deployed, "Must be less than deployed");
        aTokenInfo[token].limit = newMax;
    }

    /**
     * @notice starts timelock to raise max allocation for asset
     */
    function queueRaiseLimit(address token, uint256 newMax) external onlyPolicy {
        aTokenInfo[token].limitChangeTimelockEnd = block.number.add(timelockInBlocks);
        aTokenInfo[token].newLimit = newMax;
    }

    /**
     * @notice changes max allocation for asset when timelock elapsed
     */
    function raiseLimit(address token) external onlyPolicy {
        aTokenData storage info = aTokenInfo[token];
        require(block.number >= info.limitChangeTimelockEnd, "Timelock not expired");
        info.limit = info.newLimit;
        info.newLimit = 0;
        info.limitChangeTimelockEnd = 0;
    }

    /**
     * @notice set referral code for rebate on fees
     */
    function setReferralCode(uint16 code) external onlyPolicy {
        referralCode = code;
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     * @notice accounting of deposits/withdrawals of assets
     */
    function accountingFor(
        address token,
        uint256 amount,
        uint256 value,
        bool add
    ) internal {
        if (add) {
            aTokenInfo[token].deployed = aTokenInfo[token].deployed.add(amount); // track amount allocated into pool
            totalValueDeployed = totalValueDeployed.add(value); // track total value allocated into pools
        } else {
            // track amount allocated into pool
            if (amount < aTokenInfo[token].deployed) {
                aTokenInfo[token].deployed = aTokenInfo[token].deployed.sub(amount);
            } else aTokenInfo[token].deployed = 0;

            // track total value allocated into pools
            if (value < totalValueDeployed) {
                totalValueDeployed = totalValueDeployed.sub(value);
            } else totalValueDeployed = 0;
        }
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     * @notice query all pending rewards
     */
    function rewardsPending() public view returns (uint256) {
        return incentives.getRewardsBalance(aTokens, address(this));
    }

    /**
     * @notice query pending rewards for provided aTokens
     */
    function rewardsPendingFor(address[] calldata tokens) public view returns (uint256) {
        return incentives.getRewardsBalance(tokens, address(this));
    }

    /**
     * @notice checks to ensure deposit does not exceed max allocation for asset
     */
    function exceedsLimit(address token, uint256 amount) public view returns (bool) {
        uint256 willBeDeployed = aTokenInfo[token].deployed.add(amount);
        return (willBeDeployed > aTokenInfo[token].limit);
    }
}
