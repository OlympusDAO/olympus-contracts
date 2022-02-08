// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/OlympusAccessControlled.sol";

interface ICurve3Pool {
    // add liquidity to Curve to receive back 3CRV tokens
    function add_liquidity(
        address _pool,
        uint256[4] memory _deposit_amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);

    // remove liquidity Curve liquidity to recieve back base token
    function remove_liquidity_one_coin(
        address _pool,
        uint256 _burn_amount,
        int128 i,
        uint256 _min_amount
    ) external returns (uint256);
}

//main Convex contract(booster.sol) basic interface
interface IConvex {
    //deposit into convex, receive a tokenized deposit.  parameter to stake immediately
    function deposit(
        uint256 _pid,
        uint256 _amount,
        bool _stake
    ) external returns (bool);
}

//sample convex reward contracts interface
interface IConvexRewards {
    //withdraw directly to curve LP token
    function withdrawAndUnwrap(uint256 _amount, bool _claim) external returns (bool);

    //claim rewards
    function getReward() external returns (bool);

    //get rewards for an address
    function earned(address _account) external view returns (uint256);
}

/**
 *  Contract deploys reserves from treasury into the Convex lending pool,
 *  earning interest and $CVX.
 */

contract ConvexAllocator is OlympusAccessControlled {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STRUCTS ======== */

    struct TokenData {
        address underlying;
        address curveToken;
        IConvexRewards rewardPool;
        address[] rewardTokens;
        int128 index;
        uint256 deployed;
        uint256 limit;
        uint256 newLimit;
        uint256 limitChangeTimelockEnd;
    }

    /* ======== STATE VARIABLES ======== */

    // Convex deposit contract
    IConvex internal immutable booster = IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    // Curve 3Pool
    ICurve3Pool internal immutable curve3Pool = ICurve3Pool(0xA79828DF1850E8a3A3064576f380D90aECDD3359);
    // Olympus Treasury
    ITreasury internal treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);

    // info for deposited tokens
    mapping(address => TokenData) public tokenInfo;
    // convex pid for token
    mapping(address => uint256) public pidForReserve;
    // total RFV deployed into lending pool
    uint256 public totalValueDeployed;
    // timelock to raise deployment limit
    uint256 public immutable timelockInBlocks = 6600;

    /* ======== CONSTRUCTOR ======== */

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    /* ======== OPEN FUNCTIONS ======== */

    /**
     * @notice claims accrued CVX rewards for all tracked crvTokens
     */
    function harvest(address[] memory tokens) external {
        for (uint256 i; i < tokens.length; i++) {
            TokenData memory tokenData = tokenInfo[tokens[i]];
            address[] memory rewardTokens = tokenData.rewardTokens;

            tokenData.rewardPool.getReward();

            for (uint256 r = 0; r < rewardTokens.length; r++) {
                uint256 balance = IERC20(rewardTokens[r]).balanceOf(address(this));

                if (balance > 0) {
                    IERC20(rewardTokens[r]).safeTransfer(address(treasury), balance);
                }
            }
        }
    }

    /* ======== POLICY FUNCTIONS ======== */

    function updateTreasury() external onlyGuardian {
        require(authority.vault() != address(0), "Zero address: Vault");
        require(address(authority.vault()) != address(treasury), "No change");
        treasury = ITreasury(authority.vault());
    }

    /**
     * @notice withdraws asset from treasury, deposits asset into lending pool, then deposits crvToken into convex
     */
    function deposit(
        address token,
        uint256 amount,
        uint256[4] calldata amounts,
        uint256 minAmount
    ) public onlyGuardian {
        require(!exceedsLimit(token, amount), "Exceeds deployment limit");
        address curveToken = tokenInfo[token].curveToken;

        // retrieve amount of asset from treasury
        treasury.manage(token, amount);

        // account for deposit
        uint256 value = treasury.tokenValue(token, amount);
        accountingFor(token, amount, value, true);

        // approve and deposit into curve
        IERC20(token).approve(address(curve3Pool), amount);
        uint256 curveAmount = curve3Pool.add_liquidity(curveToken, amounts, minAmount);

        // approve and deposit into convex
        IERC20(curveToken).approve(address(booster), curveAmount);
        booster.deposit(pidForReserve[token], curveAmount, true);
    }

    /**
     * @notice withdraws crvToken from convex, withdraws from lending pool, then deposits asset into treasury
     */
    function withdraw(
        address token,
        uint256 amount,
        uint256 minAmount,
        bool reserve
    ) public onlyGuardian {
        address curveToken = tokenInfo[token].curveToken;

        // withdraw from convex
        tokenInfo[token].rewardPool.withdrawAndUnwrap(amount, false);

        // approve and withdraw from curve
        IERC20(curveToken).approve(address(curve3Pool), amount);
        curve3Pool.remove_liquidity_one_coin(curveToken, amount, tokenInfo[token].index, minAmount);

        uint256 balance = IERC20(token).balanceOf(address(this));

        // account for withdrawal
        uint256 value = treasury.tokenValue(token, balance);
        accountingFor(token, balance, value, false);

        if (reserve) {
            // approve and deposit asset into treasury
            IERC20(token).approve(address(treasury), balance);
            treasury.deposit(balance, token, value);
        } else IERC20(token).safeTransfer(address(treasury), balance);
    }

    /**
     * @notice adds asset and corresponding crvToken to mapping
     */
    function addToken(
        address token,
        address curveToken,
        address rewardPool,
        address[] memory rewardTokens,
        int128 index,
        uint256 max,
        uint256 pid
    ) external onlyGuardian {
        require(token != address(0), "Zero address: Token");
        require(curveToken != address(0), "Zero address: Curve Token");
        require(tokenInfo[token].deployed == 0, "Token added");

        tokenInfo[token] = TokenData({
            underlying: token,
            curveToken: curveToken,
            rewardPool: IConvexRewards(rewardPool),
            rewardTokens: rewardTokens,
            index: index,
            deployed: 0,
            limit: max,
            newLimit: 0,
            limitChangeTimelockEnd: 0
        });

        pidForReserve[token] = pid;
    }

    /**
     * @notice add new reward token to be harvested
     */
    function addRewardTokens(address baseToken, address[] memory rewardTokens) external onlyGuardian {
        tokenInfo[baseToken].rewardTokens = rewardTokens;
    }

    /**
     * @notice lowers max can be deployed for asset (no timelock)
     */
    function lowerLimit(address token, uint256 newMax) external onlyGuardian {
        require(newMax < tokenInfo[token].limit, "Must be lower");
        require(newMax > tokenInfo[token].deployed, "Greater than deployed");
        tokenInfo[token].limit = newMax;
    }

    /**
     * @notice starts timelock to raise max allocation for asset
     */
    function queueRaiseLimit(address token, uint256 newMax) external onlyGuardian {
        tokenInfo[token].limitChangeTimelockEnd = block.number.add(timelockInBlocks);
        tokenInfo[token].newLimit = newMax;
    }

    /**
     * @notice changes max allocation for asset when timelock elapsed
     */
    function raiseLimit(address token) external onlyGuardian {
        require(block.number >= tokenInfo[token].limitChangeTimelockEnd, "Timelock not expired");
        require(tokenInfo[token].limitChangeTimelockEnd != 0, "Timelock not started");

        tokenInfo[token].limit = tokenInfo[token].newLimit;
        tokenInfo[token].newLimit = 0;
        tokenInfo[token].limitChangeTimelockEnd = 0;
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
            tokenInfo[token].deployed = tokenInfo[token].deployed.add(amount); // track amount allocated into pool
            totalValueDeployed = totalValueDeployed.add(value); // track total value allocated into pools
        } else {
            // track amount allocated into pool
            if (amount < tokenInfo[token].deployed) {
                tokenInfo[token].deployed = tokenInfo[token].deployed.sub(amount);
            } else tokenInfo[token].deployed = 0;

            // track total value allocated into pools
            if (value < totalValueDeployed) {
                totalValueDeployed = totalValueDeployed.sub(value);
            } else totalValueDeployed = 0;
        }
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     * @notice query all pending rewards for a specific base token
     */
    function rewardsPending(address baseToken) external view returns (uint256) {
        return tokenInfo[baseToken].rewardPool.earned(address(this));
    }

    /**
     * @notice checks to ensure deposit does not exceed max allocation for asset
     */
    function exceedsLimit(address token, uint256 amount) public view returns (bool) {
        uint256 willBeDeployed = tokenInfo[token].deployed.add(amount);
        return (willBeDeployed > tokenInfo[token].limit);
    }
}
