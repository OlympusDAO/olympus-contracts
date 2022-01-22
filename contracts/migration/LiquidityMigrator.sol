// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IOlympusAuthority.sol";
import "../interfaces/ITreasury.sol";
import "../types/OlympusAccessControlled.sol";
import "../libraries/SafeERC20.sol";

contract LiquidityMigrator is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    ITreasury internal immutable oldTreasury = ITreasury(0x31F8Cc382c9898b273eff4e0b7626a6987C846E8);
    ITreasury internal immutable newTreasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);
    IERC20 internal immutable oldOHM = IERC20(0x383518188C0C6d7730D91b2c03a03C837814a899);

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    function remove(
        uint256 amount,
        IERC20 pair,
        IUniswapV2Router router,
        IERC20 token,
        uint256 minToken,
        uint256 minOhm,
        uint256 deadline
    ) external onlyGovernor {
        // Fetch the treasury balance of the given liquidity pair
        uint256 max = pair.balanceOf(address(oldTreasury));
        uint256 lpAmount = amount < max ? amount : max;
        oldTreasury.manage(address(pair), lpAmount);

        // Remove the liquidity
        pair.approve(address(router), lpAmount);
        router.removeLiquidity(
            address(token),
            address(oldOHM),
            lpAmount,
            minToken,
            minOhm,
            address(this),
            deadline
        );
        
        // deposit the paired token into the new treasury
        uint256 amountToken = token.balanceOf(address(this));
        token.approve(address(newTreasury), amountToken);
        newTreasury.deposit(amountToken, address(token), newTreasury.tokenValue(address(token), amountToken));

        // transfer the OHM to the governor
        // it will be burned, or migrated and burned, from there
        oldOHM.safeTransfer(authority.governor(), oldOHM.balanceOf(address(this)));
    }
}
