// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IOlympusAuthority.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IOHM.sol";
import "../interfaces/IsOHM.sol";
import "../types/OlympusAccessControlled.sol";
import "../libraries/SafeERC20.sol";

contract LiquidityMigrator is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    ITreasury internal immutable oldTreasury = ITreasury(0x31F8Cc382c9898b273eff4e0b7626a6987C846E8);
    ITreasury internal immutable newTreasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);
    IOHM internal immutable oldOHM = IOHM(0x383518188C0C6d7730D91b2c03a03C837814a899);
    IERC20 internal immutable newOHM = IERC20(0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5);
    IsOHM internal immutable oldsohm = IsOHM(0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F);
    IsOHM internal immutable newsohm = IsOHM(0x04906695D6D12CF5459975d7C3C03356E4Ccd460);

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

        // burn the OHM
        oldOHM.burn(oldOHM.balanceOf(address(this)));
    }

    function migrate(
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

        // burn the old OHM
        uint256 amountOld = oldOHM.balanceOf(address(this));
        oldOHM.burn(amountOld);

        // mint new OHM after converting to new supply
        uint256 amountNew = amountOld * newsohm.index() / oldsohm.index();
        treasury.mint(address(this), amountNew);

        newOHM.approve(address(router), amountNew);
        token.approve(address(router), amountToken);

        router.addLiquidity(
            address(token), 
            address(newOHM), 
            amountToken, 
            amountNew, 
            amountToken * 99 / 100, 
            amountNew * 99 / 100, 
            address(newTreasury), 
            deadline
        );
    }
}
