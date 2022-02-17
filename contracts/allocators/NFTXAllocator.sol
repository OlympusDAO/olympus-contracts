// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/INFTXInventoryStaking.sol";
import "../interfaces/INFTXLPStaking.sol";

import "../interfaces/allocators/IAllocator.sol";

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
        bool exists;
    }

    event TreasuryAssetDeployed(address token, uint256 amount, uint256 value);
    event TreasuryAssetReturned(address token, uint256 amount, uint256 value);


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

        // Ensure that a calculator exists for the `dividendTokenInfo[_token].xToken`
        require(treasury.bondCalculator(dividendTokenInfo[_token].xToken) != address(0), "Unsupported xToken calculator");

        // Retrieve amount of asset from treasury, decreasing total reserves
        treasury.allocatorManage(_token, _amount);

        uint256 value = treasury.tokenValue(_token, _amount);
        emit TreasuryAssetDeployed(_token, _amount, value);

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
     * @notice Withdraws from staking pool, and deposits asset into treasury.
     */

    function withdraw(address _token, uint256 _amount) external override onlyPolicy {
        require(stakingTokenInfo[_token].exists, "Unsupported staking token");
        require(dividendTokenInfo[_token].underlying == _token, "Unsupported dividend token");

        // Retrieve amount of asset from treasury, decreasing total reserves
        treasury.allocatorManage(dividendTokenInfo[_token].xToken, _amount);

        uint256 valueWithdrawn = treasury.tokenValue(dividendTokenInfo[_token].xToken, _amount);
        emit TreasuryAssetDeployed(dividendTokenInfo[_token].xToken, _amount, valueWithdrawn);

        // Approve and withdraw from staking pool, returning asset and potentially reward tokens
        if (stakingTokenInfo[_token].isLiquidityPool) {
            IERC20(dividendTokenInfo[_token].xToken).approve(address(liquidityStaking), _amount);
            liquidityStaking.withdraw(stakingTokenInfo[_token].vaultId, _amount);
        } else {
            IERC20(dividendTokenInfo[_token].xToken).approve(address(inventoryStaking), _amount);
            inventoryStaking.withdraw(stakingTokenInfo[_token].vaultId, _amount); 
        }

        // Get the balance of the returned vToken or vTokenWeth
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 value = treasury.tokenValue(_token, balance);

        // Deposit the token back into the treasury, increasing total reserves and minting 0 FLOOR
        IERC20(_token).approve(address(treasury), balance);
        treasury.deposit(balance, _token, value);

        emit TreasuryAssetReturned(_token, balance, value);

        // Account for withdrawal
        accountingFor(_token, balance, false);
    }

    /**
     * @notice Staked positions return an xToken which should be regularly deposited
     * back into the Treasury to account for their value. This cannot be done
     * in the same transaction as `deposit()` because of a 2 second timelock in NFTX.
     */

    function depositXTokenToTreasury(address _token) external onlyPolicy {
        require(stakingTokenInfo[_token].exists, "Unsupported staking token");
        require(dividendTokenInfo[_token].underlying == _token, "Unsupported dividend token");

        // Get the balance of the xToken
        uint256 balance = IERC20(dividendTokenInfo[_token].xToken).balanceOf(address(this));
        uint256 value = treasury.tokenValue(dividendTokenInfo[_token].xToken, balance);

        // Deposit the xToken back into the treasury, increasing total reserves and minting 0 FLOOR
        IERC20(dividendTokenInfo[_token].xToken).approve(address(treasury), balance);
        treasury.deposit(balance, dividendTokenInfo[_token].xToken, value);

        emit TreasuryAssetReturned(dividendTokenInfo[_token].xToken, balance, value);
    }

    /**
     * @notice adds asset and corresponding xToken to mapping
     */

    function addDividendToken(address _token, address _xToken) external override onlyPolicy {
        require(_token != address(0), "Token: Zero address");
        require(_xToken != address(0), "xToken: Zero address");
        require(!dividendTokenInfo[_token].exists, "Token already added");

        dividendTokenInfo[_token] = dividendTokenData({
            underlying: _token,
            xToken: _xToken,
            deployed: 0,
            exists: true
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
