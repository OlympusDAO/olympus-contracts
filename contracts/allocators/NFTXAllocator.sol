// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../interfaces/allocators/IAllocator.sol";
import "../interfaces/allocators/INFTXInventoryStaking.sol";
import "../interfaces/allocators/INFTXLPStaking.sol";

import "../types/FloorAccessControlled.sol";


/**
 * Contract deploys reserves from treasury into NFTX vaults,
 * earning interest and rewards.
 */

contract NFTXAllocator is IAllocator, FloorAccessControlled {

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /**
     * @notice describes the token used for staking in NFTX.
     */

    struct stakingTokenData {
        uint256 vaultId;
        address rewardToken;
        bool isLiquidityPool;
        bool exists;
    }

    /**
     * @notice describes the dividend token minted from staking token.
     */

    struct dividendTokenData {
        address underlying; // stakingToken
        address xToken; // dividendToken
        uint256 deployed;
    }


    // NFTX Inventory Staking contract
    INFTXInventoryStaking internal inventoryStaking;

    // NFTX Liquidity Staking contract
    INFTXLPStaking internal liquidityStaking;

    // Floor Treasury contract
    ITreasury internal treasury;

    // Corresponding NFTX token vault data for tokens
    mapping (address => stakingTokenData) public stakingTokenInfo;

    // Corresponding xTokens for tokens
    mapping (address => dividendTokenData) public dividendTokenInfo;


    /**
     * @notice initialises the construct with no additional logic.
     */

    constructor (
        IFloorAuthority _authority,
        address _inventoryStaking,
        address _liquidityStaking,
        address _treasury
    ) FloorAccessControlled(_authority) {
        inventoryStaking = INFTXInventoryStaking(_inventoryStaking);
        liquidityStaking = INFTXLPStaking(_liquidityStaking);

        treasury = ITreasury(_treasury);
    }


    /**
     * Deprecated in favour of harvestAll(address _token).
     */

    function harvest(address _token, uint256 _amount) external override {
        revert("Method is deprecated in favour of harvestAll(address _token)");
    }


    /**
     * @notice claims rewards from the vault.
     */

    function harvestAll(address _token) override external {
        // We only want to allow harvesting from a specified liquidity pool mapping
        require(stakingTokenInfo[_token].exists, "Unsupported token");
        require(stakingTokenInfo[_token].isLiquidityPool, "Must be liquidity staking token");

        // Trigger our rewards to be claimed
        liquidityStaking.claimRewards(stakingTokenInfo[_token].vaultId);

        // Get the reward token for this stakingToken
        address _rewardToken = stakingTokenInfo[_token].rewardToken;
        
        // Deposit the harvested rewards into the treasury
        uint256 balance = IERC20(_rewardToken).balanceOf(address(this));
        uint256 value = treasury.tokenValue(_rewardToken, balance);

        // Approve and deposit asset into treasury
        IERC20(_rewardToken).approve(address(treasury), balance);

        // Pass the tokenValue as profit to stop the treasury minting FLOOR
        treasury.deposit(balance, _rewardToken, value);
    }


    /**
     * @notice sends any ERC20 token in the contract to caller.
     */

    function rescue(address _token) external override onlyGovernor {
        // If the token is known, then we shouldn't be able to rescue it
        require(!stakingTokenInfo[_token].exists, "Known token cannot be rescued");

        // Get the amount of token held on contract
        uint256 _amount = IERC20(_token).balanceOf(address(this));

        // Confirm that we hold some of the specified token
        require(_amount > 0, "Token not held in contract");

        // Send to Governor
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }


    /**
     * @notice withdraws asset from treasury, deposits asset into NFTX staking.
     */

    function deposit(address _token, uint256 _amount) external override onlyPolicy {
        require(stakingTokenInfo[_token].exists, "Unsupported staking token");
        require(dividendTokenInfo[_token].underlying == _token, "Unsupported dividend token");

        // Retrieve amount of asset from treasury
        treasury.allocatorWithdraw(_amount, _token);

        // Approve and deposit into inventory pool, returning xToken
        if (stakingTokenInfo[_token].isLiquidityPool) {
            IERC20(_token).approve(address(liquidityStaking), _amount);
            liquidityStaking.deposit(stakingTokenInfo[_token].vaultId, _amount);
        } else {
            IERC20(_token).approve(address(inventoryStaking), _amount);
            inventoryStaking.deposit(stakingTokenInfo[_token].vaultId, _amount);
        }

        // Account for deposit
        accountingFor(_token, _amount, true); 
    }


    /**
     * @notice Withdraws from lending pool, and deposits asset into treasury.
     */

    function withdraw(address _token, uint256 _amount) external override onlyPolicy {
        require(stakingTokenInfo[_token].exists, "Unsupported staking token");
        require(dividendTokenInfo[_token].underlying == _token, "Unsupported dividend token");

        address gainToken;

        // Approve and withdraw from lending pool, returning asset and potentially reward tokens
        if (stakingTokenInfo[_token].isLiquidityPool) {
            IERC20(dividendTokenInfo[_token].xToken).approve(address(liquidityStaking), _amount);
            liquidityStaking.withdraw(stakingTokenInfo[_token].vaultId, _amount);

            gainToken = stakingTokenInfo[_token].rewardToken;
        } else {
            IERC20(dividendTokenInfo[_token].xToken).approve(address(inventoryStaking), _amount);
            inventoryStaking.withdraw(stakingTokenInfo[_token].vaultId, _amount); 

            gainToken = _token;
        }

        // Capture the balance of our token
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 base = balance;
        uint256 gain;

        // The liquidity pool withdraw() method also claims the rewardToken so we will need
        // to calculate the additional rewardToken gain and deposit that into the treasury.
        if (stakingTokenInfo[_token].isLiquidityPool) {
            gain = IERC20(gainToken).balanceOf(address(this));
            IERC20(gainToken).approve(address(treasury), gain);
        }
        // Otherwise, we expect our reward gains to be the same token as staked, so we just
        // calculate the difference from our accounted deployed amount.
        else {
            if (balance > dividendTokenInfo[_token].deployed) {
                base = dividendTokenInfo[_token].deployed;
                gain = balance - base;
            }
        }

        // Account for withdrawal
        accountingFor(_token, balance, false);

        // Approve and deposit asset into treasury
        IERC20(_token).approve(address(treasury), balance);

        // Deposit the tokens into the treasury without affecting total reserves
        treasury.allocatorDeposit(base, _token);

        // If we have additional returns then we need to deposit the additional value
        // into the treasury via the standard function call.
        if (gain > 0) {
            uint256 gain_value = treasury.tokenValue(gainToken, gain);
            treasury.deposit(gain, gainToken, gain_value);
        }
    }


    /**
     * @notice adds asset and corresponding xToken to mapping
     */

    function addDividendToken(address _token, address _xToken) external override onlyPolicy {
        require(_token != address(0), "Token: Zero address");
        require(_xToken != address(0), "xToken: Zero address");
        require(dividendTokenInfo[_token].deployed == 0, "Token already added");

        dividendTokenInfo[_token] = dividendTokenData({
            underlying: _token,
            xToken: _xToken,
            deployed: 0
        });
    }


    /**
     * @notice set vault mapping.
     */

    function setStakingToken(address _token, address _rewardToken, uint256 _vaultId, bool _isLiquidityPool) external override onlyPolicy {
        require(_token != address(0), "Cannot set vault for NULL token");

        // Set up our vault mapping information
        stakingTokenInfo[_token].vaultId = _vaultId;
        stakingTokenInfo[_token].isLiquidityPool = _isLiquidityPool;
        stakingTokenInfo[_token].rewardToken = _rewardToken;
        stakingTokenInfo[_token].exists = true;
    }


    /**
     * @notice remove vault mapping.
     */

    function removeStakingToken(address _token) external override onlyPolicy {
        delete stakingTokenInfo[_token];
    }


    /**
     * @notice accounting of deposit / withdrawal of assets.
     */

    function accountingFor(
        address token,
        uint256 amount,
        bool add
    ) internal {
        if (add) {
            // track amount allocated into pool
            dividendTokenInfo[token].deployed = dividendTokenInfo[token].deployed.add(amount);
        }
        else {
            // track amount allocated into pool
            dividendTokenInfo[token].deployed = (amount < dividendTokenInfo[token].deployed) ? dividendTokenInfo[token].deployed.sub(amount) : 0;
        }
    }

}
