// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;
pragma abicoder v2;

import "../libraries/SafeERC20.sol";

import "../interfaces/ITreasury.sol";
import "../interfaces/ITreasuryV1.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IOlympusAuthority.sol";

import "../types/OlympusAccessControlled.sol";

interface ICurveFactory {
    function exchange_underlying(uint i, uint j, uint dx, uint min_dy) external returns(uint);
}

contract LUSDSwapContract is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    ICurveFactory internal immutable curveFactory = ICurveFactory(0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA);

    // Olympus Treasury V1
    ITreasuryV1 internal immutable treasuryV1 = ITreasuryV1(0x31F8Cc382c9898b273eff4e0b7626a6987C846E8);

    // Olympus Treasury V2
    ITreasury internal immutable treasuryV2 = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);

    address internal immutable LUSD = 0x69b81152c5A8d35A67B32A4D3772795d96CaE4da;
    address internal immutable DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    /**
     * @notice Swaps LUSD to DAI
     */
    function swapLUSDForDAI(
        uint256 _amountLUSD,
        uint256 _minAmountLUSD
    ) external onlyGuardian {
        // Manage LUSD from v1 treasury
        treasuryV1.manage(LUSD, _amountLUSD);

        // Approve LUSD to be spent by the  Curve pool
        IERC20(LUSD).approve(address(curveFactory), _amountLUSD);

        // Swap specified LUSD for DAI
       curveFactory.exchange_underlying(
            0,
            1,
            _amountLUSD,
            _minAmountLUSD
        );

        // Send DAI to v2 treasury
        IERC20(DAI).safeTransfer(address(treasuryV2), IERC20(DAI).balanceOf(address(this)));
    }
}
