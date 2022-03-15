// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;
pragma abicoder v2;

import "../libraries/SafeERC20.sol";

import "../interfaces/ITreasury.sol";
import "../interfaces/ITreasuryV1.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IOlympusAuthority.sol";

import "../types/OlympusAccessControlled.sol";

interface ICurveFactory {
    function exchange_underlying(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external returns (uint256);
}

/// @title   LUSD Swap Contract
/// @notice  Swaps LUSD from treasury v1 to DAI then sends to treasury v2
/// @author  JeffX
contract LUSDSwapContract is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    /// ERRORS ///

    /// @notice Error for if more DAI than 1:1 backing is attempted to be sent
    error OverOHMV1Backing();

    /// STATE VARIABLES ///

    /// @notice Curve Factory
    ICurveFactory internal immutable curveFactory = ICurveFactory(0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA);
    /// @notice Olympus Treasury V1
    ITreasuryV1 internal immutable treasuryV1 = ITreasuryV1(0x31F8Cc382c9898b273eff4e0b7626a6987C846E8);
    /// @notice Olympus Treasury V2
    ITreasury internal immutable treasuryV2 = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);
    /// @notice Olympus Token V1
    IERC20 internal immutable OHMV1 = IERC20(0x383518188C0C6d7730D91b2c03a03C837814a899);
    /// @notice LUSD
    address internal immutable LUSD = 0x5f98805A4E8be255a32880FDeC7F6728C6568bA0;
    /// @notice DAI
    address internal immutable DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    /// @notice Remaining amount of DAI to have each OHM V1 backed by 1 DAI;
    uint256 public OHMV1BackingInDAIRemaining;

    /// CONSTRUCTOR ///

    /// @param _authority  Address of the Olympus Authority contract
    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {
        OHMV1BackingInDAIRemaining = OHMV1.totalSupply() * 1e9;
    }

    /// POLICY FUNCTIONS ///

    /// @notice                        Manages LUSD from treasury V1 and swaps for LUSD
    /// @param _amountLUSD             Amount of LUSD that will be managed from treasury V1 and swapped
    /// @param _minAmountDAI           Minimum amount of DAI to receive
    /// @param _amountDAIToV1Treasury  Amount of DAI that was received from swap to be sent to V1 treasury
    function swapLUSDForDAI(
        uint256 _amountLUSD,
        uint256 _minAmountDAI,
        uint256 _amountDAIToV1Treasury
    ) external onlyGuardian {
        // Manage LUSD from v1 treasury
        treasuryV1.manage(LUSD, _amountLUSD);

        // Approve LUSD to be spent by the  Curve pool
        IERC20(LUSD).approve(address(curveFactory), _amountLUSD);

        // Swap specified LUSD for DAI
        uint256 daiReceived = curveFactory.exchange_underlying(0, 1, _amountLUSD, _minAmountDAI);

        if (_amountDAIToV1Treasury > 0) {
            if (OHMV1BackingInDAIRemaining < _amountDAIToV1Treasury) revert OverOHMV1Backing();
            IERC20(DAI).safeTransfer(address(treasuryV1), _amountDAIToV1Treasury);
            OHMV1BackingInDAIRemaining -= _amountDAIToV1Treasury;
            daiReceived -= _amountDAIToV1Treasury;
        }

        IERC20(DAI).approve(address(treasuryV2), daiReceived);

        // Deposit DAI into v2 treasury, all as profit
        treasuryV2.deposit(daiReceived, DAI, treasuryV2.tokenValue(DAI, daiReceived));
    }
}
