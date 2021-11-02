// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

interface ICurve3Pool {
    // add liquidity (frax) to receive back FRAX3CRV-f
    function add_liquidity(
        address _pool,
        uint256[4] memory _deposit_amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);

    // remove liquidity (FRAX3CRV-f) to recieve back Frax
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

    //burn a tokenized deposit to receive curve lp tokens back
    function withdraw(uint256 _pid, uint256 _amount) external returns (bool);
}

//sample convex reward contracts interface
interface IConvexRewards {
    //get balance of an address
    function balanceOf(address _account) external returns (uint256);

    //withdraw to a convex tokenized deposit
    function withdraw(uint256 _amount, bool _claim) external returns (bool);

    //withdraw directly to curve LP token
    function withdrawAndUnwrap(uint256 _amount, bool _claim) external returns (bool);

    //claim rewards
    function getReward() external returns (bool);

    //stake a convex tokenized deposit
    function stake(uint256 _amount) external returns (bool);

    //stake a convex tokenized deposit for another address(transfering ownership)
    function stakeFor(address _account, uint256 _amount) external returns (bool);

    //get rewards for an address
    function earned(address _account) external view returns (uint256);
}

/**
 *  Contract deploys reserves from treasury into the Convex lending pool,
 *  earning interest and $CVX.
 */

contract ConvexAllocator is Ownable {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STRUCTS ======== */

    struct tokenData {
        address underlying;
        address curveToken;
        int128 index;
        uint256 deployed;
        uint256 limit;
        uint256 newLimit;
        uint256 limitChangeTimelockEnd;
    }

    /* ======== STATE VARIABLES ======== */

    IConvex immutable booster; // Convex deposit contract
    IConvexRewards immutable rewardPool; // Convex reward contract
    ITreasury immutable treasury; // Olympus Treasury
    ICurve3Pool immutable curve3Pool; // Curve 3Pool

    mapping(address => tokenData) public tokenInfo; // info for deposited tokens
    mapping(address => uint256) public pidForReserve; // convex pid for token

    uint256 public totalValueDeployed; // total RFV deployed into lending pool

    uint256 public immutable timelockInBlocks; // timelock to raise deployment limit

    address[] rewardTokens;

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _booster,
        address _rewardPool,
        address _curve3Pool,
        uint256 _timelockInBlocks
    ) {
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);

        require(_booster != address(0));
        booster = IConvex(_booster);

        require(_rewardPool != address(0));
        rewardPool = IConvexRewards(_rewardPool);

        require(_curve3Pool != address(0));
        curve3Pool = ICurve3Pool(_curve3Pool);

        timelockInBlocks = _timelockInBlocks;
    }

    /* ======== OPEN FUNCTIONS ======== */

    /**
     *  @notice claims accrued CVX rewards for all tracked crvTokens
     */
    function harvest() public {
        rewardPool.getReward();

        for (uint256 i = 0; i < rewardTokens.length; i++) {
            uint256 balance = IERC20(rewardTokens[i]).balanceOf(address(this));

            if (balance > 0) {
                IERC20(rewardTokens[i]).safeTransfer(address(treasury), balance);
            }
        }
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice withdraws asset from treasury, deposits asset into lending pool, then deposits crvToken into convex
     *  @param token address
     *  @param amount uint
     *  @param amounts uint[]
     *  @param minAmount uint
     */
    function deposit(
        address token,
        uint256 amount,
        uint256[4] calldata amounts,
        uint256 minAmount
    ) public onlyOwner {
        require(!exceedsLimit(token, amount)); // ensure deposit is within bounds

        address curveToken = tokenInfo[token].curveToken;

        treasury.manage(token, amount); // retrieve amount of asset from treasury

        // account for deposit
        uint256 value = treasury.tokenValue(token, amount);
        accountingFor(token, amount, value, true);

        IERC20(token).approve(address(curve3Pool), amount); // approve curve pool to spend tokens
        uint256 curveAmount = curve3Pool.add_liquidity(curveToken, amounts, minAmount); // deposit into curve

        IERC20(curveToken).approve(address(booster), curveAmount); // approve to deposit to convex
        booster.deposit(pidForReserve[token], curveAmount, true); // deposit into convex
    }

    /**
     *  @notice withdraws crvToken from convex, withdraws from lending pool, then deposits asset into treasury
     *  @param token address
     *  @param amount uint
     *  @param minAmount uint
     */
    function withdraw(
        address token,
        uint256 amount,
        uint256 minAmount
    ) public onlyOwner {
        rewardPool.withdrawAndUnwrap(amount, false); // withdraw to curve token

        address curveToken = tokenInfo[token].curveToken;

        IERC20(curveToken).approve(address(curve3Pool), amount); // approve 3Pool to spend curveToken
        curve3Pool.remove_liquidity_one_coin(curveToken, amount, tokenInfo[token].index, minAmount); // withdraw from curve

        uint256 balance = IERC20(token).balanceOf(address(this)); // balance of asset withdrawn

        // account for withdrawal
        uint256 value = treasury.tokenValue(token, balance);
        accountingFor(token, balance, value, false);

        IERC20(token).approve(address(treasury), balance); // approve to deposit asset into treasury
        treasury.deposit(balance, token, value); // deposit using value as profit so no OHM is minted
    }

    /**
     *  @notice adds asset and corresponding crvToken to mapping
     *  @param token address
     *  @param curveToken address
     */
    function addToken(
        address token,
        address curveToken,
        int128 index,
        uint256 max,
        uint256 pid
    ) external onlyOwner {
        require(token != address(0));
        require(curveToken != address(0));
        require(tokenInfo[token].deployed == 0);

        tokenInfo[token] = tokenData({
            underlying: token,
            curveToken: curveToken,
            index: index,
            deployed: 0,
            limit: max,
            newLimit: 0,
            limitChangeTimelockEnd: 0
        });

        pidForReserve[token] = pid;
    }

    /**
     *  @notice add new reward token to be harvested
     *  @param token address
     */
    function addRewardToken(address token) external onlyOwner {
        rewardTokens.push(token);
    }

    /**
     *  @notice lowers max can be deployed for asset (no timelock)
     *  @param token address
     *  @param newMax uint
     */
    function lowerLimit(address token, uint256 newMax) external onlyOwner {
        require(newMax < tokenInfo[token].limit);
        require(newMax > tokenInfo[token].deployed); // cannot set limit below what has been deployed already
        tokenInfo[token].limit = newMax;
    }

    /**
     *  @notice starts timelock to raise max allocation for asset
     *  @param token address
     *  @param newMax uint
     */
    function queueRaiseLimit(address token, uint256 newMax) external onlyOwner {
        tokenInfo[token].limitChangeTimelockEnd = block.number.add(timelockInBlocks);
        tokenInfo[token].newLimit = newMax;
    }

    /**
     *  @notice changes max allocation for asset when timelock elapsed
     *  @param token address
     */
    function raiseLimit(address token) external onlyOwner {
        require(block.number >= tokenInfo[token].limitChangeTimelockEnd, "Timelock not expired");
        require(tokenInfo[token].limitChangeTimelockEnd != 0, "Timelock not started");

        tokenInfo[token].limit = tokenInfo[token].newLimit;
        tokenInfo[token].newLimit = 0;
        tokenInfo[token].limitChangeTimelockEnd = 0;
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     *  @notice accounting of deposits/withdrawals of assets
     *  @param token address
     *  @param amount uint
     *  @param value uint
     *  @param add bool
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
            } else {
                tokenInfo[token].deployed = 0;
            }

            // track total value allocated into pools
            if (value < totalValueDeployed) {
                totalValueDeployed = totalValueDeployed.sub(value);
            } else {
                totalValueDeployed = 0;
            }
        }
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice query all pending rewards
     *  @return uint
     */
    function rewardsPending() public view returns (uint256) {
        return rewardPool.earned(address(this));
    }

    /**
     *  @notice checks to ensure deposit does not exceed max allocation for asset
     *  @param token address
     *  @param amount uint
     */
    function exceedsLimit(address token, uint256 amount) public view returns (bool) {
        uint256 willBeDeployed = tokenInfo[token].deployed.add(amount);

        return (willBeDeployed > tokenInfo[token].limit);
    }
}
