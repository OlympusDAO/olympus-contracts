// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";
import "../types/OlympusAccessControlled.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

interface ComptrollerInterface {
    /*** Assets You Are In ***/

    function enterMarkets(address[] calldata cTokens) external returns (uint256[] memory);

    function exitMarket(address cToken) external returns (uint256);

    /*** Policy Hooks ***/

    function mintAllowed(
        address cToken,
        address minter,
        uint256 mintAmount
    ) external returns (uint256);

    function redeemAllowed(
        address cToken,
        address redeemer,
        uint256 redeemTokens
    ) external returns (uint256);
}

interface CTokenInterface {
    function balanceOf(address owner) external view returns (uint256);
}

interface CErc20Interface is CTokenInterface {
    function mint(uint256 mintAmount) external returns (uint256);

    function redeem(uint256 redeemTokens) external returns (uint256);
}

contract FuseAllocator is OlympusAccessControlled {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLES ======== */
    ITreasury public treasury; // Olympus Treasury

    /* ======== CONSTRUCTOR ======== */

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {
        treasury = ITreasury(_authority.vault());
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     * @notice Deposit the tokens in exchange for the corresponding fTokens,
     * then enter the designated pool with those fTokens.
     * @dev The amount of fTokens received is the number of tokens divided by the exchange rate
     * (https://docs.rari.capital/fuse/#exchange-rate)
     * @param comptrollerAddress address The address of the desired pool's comptroller.
     * @param tokenAddress address The address of the token to deposit.
     * @param fTokenAddress address The address of the fToken corresponding to the given token address.
     * @param amount uin256 The amount of tokens to deposit.
     */
    function deposit(
        address comptrollerAddress,
        address tokenAddress,
        address fTokenAddress,
        uint256 amount
    ) external onlyGuardian {
        ComptrollerInterface comptroller = ComptrollerInterface(comptrollerAddress);
        IERC20 token = IERC20(tokenAddress);
        treasury.manage(tokenAddress, amount); // withdraw specified amount of token from treasury

        token.approve(fTokenAddress, amount); // approve the fToken address to transfer 'amount' in tokenAddress

        CErc20Interface fToken = CErc20Interface(fTokenAddress);
        uint256 mintAllowed = comptroller.mintAllowed(fTokenAddress, address(this), amount);
        require(
            mintAllowed == 0,
            string(abi.encodePacked("Mint not allowed for specified token and amount, error code ", mintAllowed))
        );
        require(fToken.mint(amount) == 0, "Failed to mint fTokens");

        address[] memory fTokens;
        fTokens[0] = fTokenAddress;
        require(comptroller.enterMarkets(fTokens)[0] == 0, "Failed to enter pool");
    }

    /**
     * @notice Redeem the specified fTokens and transfer redeemed tokens to the treasury / contract owner
     * @dev The amount of tokens received is based on the current exchange rate
     * (https://docs.rari.capital/fuse/#exchange-rate)
     * @param comptrollerAddress address The address of the comptroller for the pool to withdraw from.
     * @param tokenAddress address The address of the token to withdraw.
     * @param fTokenAddress address The address of the fToken corresponding to the provided token address,
     */
    function withdraw(
        address comptrollerAddress,
        address tokenAddress,
        address fTokenAddress
    ) external onlyGuardian {
        ComptrollerInterface comptroller = ComptrollerInterface(comptrollerAddress);
        require(comptroller.exitMarket(fTokenAddress) == 0, "Failed to exit pool");

        CErc20Interface fToken = CErc20Interface(fTokenAddress);
        uint256 amount = fToken.balanceOf(address(this));
        uint256 redeemAllowed = comptroller.redeemAllowed(fTokenAddress, address(this), amount);
        require(
            redeemAllowed == 0,
            string(abi.encodePacked("Redeem not allowed for specified token and amount, error code ", redeemAllowed))
        );
        require(fToken.redeem(amount) == 0, "Failed to redeem fTokens");

        IERC20 token = IERC20(tokenAddress);
        token.approve(address(treasury), amount); // approve treasury to receive withdrawn tokens
        // send all withdrawn tokens to treasury
        treasury.deposit(amount, tokenAddress, treasury.tokenValue(tokenAddress, amount));
    }
}
