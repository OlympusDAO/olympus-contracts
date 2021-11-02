// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

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

    function getClaimer(address user) external view returns (address);
}

/**
 *  Contract deploys reserves from treasury into the Aave lending pool,
 *  earning interest and $stkAAVE.
 */

contract AaveAllocator is Ownable {
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

    IStakedTokenIncentivesController immutable incentives; // stkAave incentive controller
    ILendingPool immutable lendingPool; // Aave Lending Pool
    ITreasury immutable treasury; // Olympus Treasury

    address[] public aTokens; // all relevant aTokens
    mapping(address => aTokenData) public aTokenInfo;

    uint256 public totalValueDeployed; // total RFV deployed into lending pool

    uint256 public immutable timelockInBlocks; // timelock to raise deployment limit

    uint16 public referralCode; // rebates portion of lending pool fees

    /** Two modes on this contract. Default mode (depositToTreasury = false)
     *  holds aDAI in this contract. The alternate mode (depositToTreasury = true)
     *  deposits aDAI into the treasury and retrieves it to withdraw. Switching
     *  to true is contigent on claimOnBehalfOf permission (which must be given
     *  by Aave governance) so that this contract can claim stkAAVE rewards.
     */
    bool public depositToTreasury;

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _lendingPool,
        address _incentives,
        uint256 _timelockInBlocks,
        uint16 _referralCode
    ) {
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);

        require(_lendingPool != address(0));
        lendingPool = ILendingPool(_lendingPool);

        require(_incentives != address(0));
        incentives = IStakedTokenIncentivesController(_incentives);

        timelockInBlocks = _timelockInBlocks;
        referralCode = _referralCode;
    }

    /* ======== OPEN FUNCTIONS ======== */

    /**
     *  @notice claims accrued stkAave rewards for all tracked aTokens
     */
    function harvest() public override {
        address _treasury = address(treasury);
        if (depositToTreasury) {
            // claims rewards accrued to treasury
            incentives.claimRewardsOnBehalf(aTokens, rewardsPending(_treasury), _treasury, _treasury);
        } else {
            // claims rewards accrued to this contract
            incentives.claimRewards(aTokens, rewardsPending(address(this)), _treasury);
        }
    }

    /**
     *  @notice claims accrued stkAave rewards for given aTokens
     *  @param _aTokens address[] memory
     */
    function harvestFor(address[] calldata _aTokens) external {
        address _treasury = address(treasury);
        if (depositToTreasury) {
            // claims rewards accrued to treasury
            incentives.claimRewardsOnBehalf(_aTokens, rewardsPending(_treasury), _treasury, _treasury);
        } else {
            // claims rewards accrued to this contract
            incentives.claimRewards(_aTokens, rewardsPending(address(this)), _treasury);
        }
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice withdraws asset from treasury, deposits asset into lending pool, then deposits aToken into treasury
     *  @param token address
     *  @param amount uint
     */
    function deposit(address token, uint256 amount) external onlyOwner {
        require(!exceedsLimit(token, amount)); // ensure deposit is within bounds

        treasury.manage(token, amount); // retrieve amount of asset from treasury

        IERC20(token).approve(address(lendingPool), amount); // approve to deposit into lending pool
        lendingPool.deposit(token, amount, address(this), referralCode); // deposit, returning aToken

        uint256 value = treasury.tokenValue(token, amount); // treasury RFV calculator
        accountingFor(token, amount, value, true); // account for deposit

        if (depositToTreasury) {
            // if aTokens are being deposited into treasury
            address aToken = aTokenInfo[token].aToken; // address of aToken
            uint256 aBalance = IERC20(aToken).balanceOf(address(this)); // balance of aToken received

            IERC20(aToken).approve(address(treasury), aBalance); // approve to deposit aToken into treasury
            treasury.deposit(aBalance, aToken, value); // deposit using value as profit so no OHM is minted
        }
    }

    /**
     *  @notice withdraws aToken from treasury, withdraws from lending pool, and deposits asset into treasury
     *  @param token address
     *  @param amount uint
     */
    function withdraw(address token, uint256 amount) public onlyOwner {
        address aToken = aTokenInfo[token].aToken; // aToken to withdraw

        if (depositToTreasury) {
            // if aTokens are being deposited into treasury
            treasury.manage(aToken, amount); // retrieve aToken from treasury
        }

        IERC20(aToken).approve(address(lendingPool), amount); // approve to withdraw from lending pool
        lendingPool.withdraw(token, amount, address(this)); // withdraw from lending pool, returning asset

        uint256 balance = IERC20(token).balanceOf(address(this)); // balance of asset received from lending pool
        uint256 value = treasury.tokenValue(token, balance); // treasury RFV calculator

        accountingFor(token, balance, value, false); // account for withdrawal

        IERC20(token).approve(address(treasury), balance); // approve to deposit asset into treasury
        treasury.deposit(balance, token, value); // deposit using value as profit so no OHM is minted
    }

    /**
     *  @notice adds asset and corresponding aToken to mapping
     *  @param token address
     *  @param aToken address
     */
    function addToken(
        address token,
        address aToken,
        uint256 max
    ) external onlyOwner {
        require(token != address(0));
        require(aToken != address(0));
        require(aTokenInfo[token].deployed == 0);

        aTokenInfo[token] = aTokenData({underlying: token, aToken: aToken, deployed: 0, limit: max, newLimit: 0, limitChangeTimelockEnd: 0});
    }

    /**
     *  @notice lowers max can be deployed for asset (no timelock)
     *  @param token address
     *  @param newMax uint
     */
    function lowerLimit(address token, uint256 newMax) external onlyOwner {
        require(newMax < aTokenInfo[token].limit);
        require(newMax > aTokenInfo[token].deployed); // cannot set limit below what has been deployed already
        aTokenInfo[token].limit = newMax;
    }

    /**
     *  @notice starts timelock to raise max allocation for asset
     *  @param token address
     *  @param newMax uint
     */
    function queueRaiseLimit(address token, uint256 newMax) external onlyOwner {
        aTokenInfo[token].limitChangeTimelockEnd = block.number.add(timelockInBlocks);
        aTokenInfo[token].newLimit = newMax;
    }

    /**
     *  @notice changes max allocation for asset when timelock elapsed
     *  @param token address
     */
    function raiseLimit(address token) external onlyOwner {
        require(block.number >= aTokenInfo[token].limitChangeTimelockEnd, "Timelock not expired");
        require(aTokenInfo[token].limitChangeTimelockEnd != 0, "Timelock not started");

        aTokenInfo[token].limit = aTokenInfo[token].newLimit;
        aTokenInfo[token].newLimit = 0;
        aTokenInfo[token].limitChangeTimelockEnd = 0;
    }

    /**
     *  @notice set referral code for rebate on fees
     *  @param code uint16
     */
    function setReferralCode(uint16 code) external onlyOwner {
        referralCode = code;
    }

    /**
     *  @notice deposit aTokens into treasury and begin claiming rewards on behalf of
     */
    function enableDepositToTreasury() external onlyOwner {
        require(incentives.getClaimer(address(treasury)) == address(this), "Contract not approved to claim rewards");
        require(!depositToTreasury, "Already enabled");

        harvest(); // claim accrued rewards to this address first

        // deposit all held aTokens into treasury
        for (uint256 i = 0; i < aTokens.length; i++) {
            address aToken = aTokens[i];
            uint256 balance = IERC20(aToken).balanceOf(address(this));
            if (balance > 0) {
                uint256 value = treasury.tokenValue(aToken, balance);
                IERC20(aToken).approve(address(treasury), balance); // approve to deposit asset into treasury
                treasury.deposit(balance, aToken, value); // deposit using value as profit so no OHM is minted
            }
        }
        depositToTreasury = true; // enable last
    }

    /**
     *  @notice revert enabling aToken treasury deposits
     */
    function revertDepositToTreasury() external onlyOwner {
        depositToTreasury = false; // future aToken deposits will be held in this contract
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
            aTokenInfo[token].deployed = aTokenInfo[token].deployed.add(amount); // track amount allocated into pool

            totalValueDeployed = totalValueDeployed.add(value); // track total value allocated into pools
        } else {
            // track amount allocated into pool
            if (amount < aTokenInfo[token].deployed) {
                aTokenInfo[token].deployed = aTokenInfo[token].deployed.sub(amount);
            } else {
                aTokenInfo[token].deployed = 0;
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
     *  @param user address
     *  @return uint
     */
    function rewardsPending(address user) public view returns (uint256) {
        return incentives.getRewardsBalance(aTokens, user);
    }

    /**
     *  @notice query pending rewards for provided aTokens
     *  @param tokens address[]
     *  @param user address
     *  @return uint
     */
    function rewardsPendingFor(address[] calldata tokens, address user) public view returns (uint256) {
        return incentives.getRewardsBalance(tokens, user);
    }

    /**
     *  @notice checks to ensure deposit does not exceed max allocation for asset
     *  @param token address
     *  @param amount uint
     */
    function exceedsLimit(address token, uint256 amount) public view returns (bool) {
        uint256 willBeDeployed = aTokenInfo[token].deployed.add(amount);

        return (willBeDeployed > aTokenInfo[token].limit);
    }
}
