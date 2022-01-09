// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface IBond {
    function deposit( uint256 _amount, uint256 _maxPrice, address _depositor ) external returns ( uint );
}

contract OlympusBondingManager is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    // Olympus Treasury
    ITreasury internal treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);

    /// CONSTRUCTOR ///

    /// @param _authority  Address of the Olympus Authority contract
    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}


    /// POLICY FUNCTIONS ///

    /// @notice  If vault has been updated through authority contract update treasury address
    function updateTreasury() external onlyGuardian {
        require(authority.vault() != address(0), "Zero address: Vault");
        require(address(authority.vault()) != address(treasury), "No change");
        treasury = ITreasury(authority.vault());
    }

    /// @notice             Bonds `_token` into `_depository`
    /// @param _depository  Address of contract to bond with
    /// @param _token       Address of token to be bonded
    /// @param _amount      Amount of `_asset` to be transfered from treasury and to bond
    /// @param _maxPrice    Max price willing to pay for bond
    /// @param _managing    Bool if managing `_token` from treasury
    function bond(
        address _depository, 
        address _token, 
        uint256 _amount, 
        uint256 _maxPrice, 
        bool _managing
    ) external onlyGuardian {
        if(_managing) {
            // retrieve amount of token from treasury
            treasury.manage(_token, _amount); 
        }

        // approve token to be spent by staking
        IERC20(_token).approve(_depository, _amount);

        // stake token to treasury
        IBond(_depository).deposit(_amount, _maxPrice, address(treasury));
    }

    /// @notice         Transfers specified ERC20 and amount to treaury
    /// @param _asset   Addres of asset to transfer to treasury
    /// @param _amount  Amount of `_asset` to be transfered to treasury
    function withdraw(IERC20 _asset, uint256 _amount) external onlyGuardian {
        _asset.safeTransfer(address(treasury), _amount);
    }

}