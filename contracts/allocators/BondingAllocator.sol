// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface IBond {
    function deposit( uint256 _amount, uint256 _maxPrice, address _depositor ) external returns ( uint );
    function redeem( address _recipient, bool _stake ) external returns ( uint );
    function pendingPayoutFor( address _depositor ) external view returns ( uint );
}

/// @title   Olympus Bonding Manager
/// @author  Olympus
/// @notice  Bonds to depositories on behalf of Olympus
contract OlympusBondingManager is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    /// STATE VARIABLES ///

    /// @notice array of all interacted with depositories
    address[] public depositories;

    /// @notice mapping if depository has been deposited to
    mapping(address => bool) public depositoryUsed;

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

        if(!depositoryUsed[_depository]) {
            depositoryUsed[_depository] = true;
            depositories.push(_depository);
        }
    }

    /// @notice         Transfers specified ERC20 and amount to treaury
    /// @param _asset   Addres of asset to transfer to treasury
    /// @param _amount  Amount of `_asset` to be transfered to treasury
    function withdraw(IERC20 _asset, uint256 _amount) external onlyGuardian {
        _asset.safeTransfer(address(treasury), _amount);
    }

    /// @notice  References depositories that have been deposited and redeems if redeemable balance
    function redeem() external {
        for(uint i; i < depositories.length; i++) {
            IBond depository = IBond(depositories[i]);
            uint256 pendingPayout = depository.pendingPayoutFor(address(treasury));
            if(pendingPayout > 0) {
                depository.redeem(address(treasury), true);
            }
        }
    }

}