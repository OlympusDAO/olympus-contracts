// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface IKP3RVault {
    // Create lock for KP3R
    function create_lock(
        uint256 _value,
        uint256 _unlock_time
    ) external;

    // Increase amount of KP3R
     function increase_amount(
        uint256 _value
    ) external;

    // Increase unlock time
     function increase_unlock_time(
        uint256 _unlock_time
    ) external;

    // Withdraw once lock is over
     function withdraw() external;
}

interface IGauge {
    function vote(
        address[] calldata _tokenVote, 
        uint256[] calldata _weights
    ) external;
}

interface IClaim {
    function claim() external returns (uint256);
    function redeem(uint id) external;

    struct option {
        uint amount;
        uint strike;
        uint expiry;
        bool exercised;
    }

    function options(uint _id) external view returns(option memory);
}

/// @title   Olympus KP3R Holder
/// @author  JeffX
/// @notice  Manages KP3R from treasury and locks into vKP3R contract
contract OlympusKP3RHolder is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    // KP3RVault deposit contract
    IKP3RVault internal immutable KP3RVault = IKP3RVault(0x2FC52C61fB0C03489649311989CE2689D93dC1a2); 
    // Foxed Forex Gauge contract
    IGauge internal immutable gauge = IGauge(0x81a8CAb6bb568fC94bCa70C9AdbFCF05592dEd7b);
    // KP3R token
    IERC20 internal immutable KP3R = IERC20(0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44);
    // rKP3R distributor
    IClaim internal immutable distributor = IClaim(0xd4260B2781e2460f49dB746112BB592ba3fb6382);
    // USDC
    IERC20 internal immutable USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    // rKP3R token
    IClaim internal immutable rKP3R = IClaim(0xEdB67Ee1B171c4eC66E6c10EC43EDBbA20FaE8e9);
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

    /// @notice             Manages KP3R from treasury and creates lock in vKP3R
    /// @param _amount      Amount of KP3R that will be managed from treasury and used to create lock
    /// @param _unlockTime  Timestamp at which lock will be over
    function createLock(uint256 _amount, uint256 _unlockTime) external onlyGuardian {

        // retrieve amount of KP3R from treasury
        treasury.manage(address(KP3R), _amount); 

        // approve and deposit into curve
        KP3R.approve(address(KP3RVault), _amount); 

        KP3RVault.create_lock(_amount, _unlockTime);
    }

    /// @notice         Manages KP3R from treasury adds to already exisiting lock
    /// @param _amount  Amount of KP3R that will be managed from treasury and used to add to already existing lock
    /// @param _manage  Bool if managing KP3R from treasury
    function increaseAmount(uint256 _amount, bool _manage) external onlyGuardian {
        if(_manage) { treasury.manage(address(KP3R), _amount); }

        // approve and deposit into curve
        KP3R.approve(address(KP3RVault), _amount); 

        KP3RVault.increase_amount(_amount);
    }

    /// @notice             Increases unlock time of existing lock
    /// @param _unlockTime  Updated Timestamp at which lock will be over
    function increaseLockTime(uint256 _unlockTime) external onlyGuardian {
        KP3RVault.increase_unlock_time(_unlockTime);
    }

    /// @notice  After timelock is over unlock KP3R and transfer to treasury
    function unlockKP3R() external onlyGuardian {
        KP3RVault.withdraw();

        uint amount = KP3R.balanceOf(address(this));

        KP3R.safeTransfer(address(treasury), amount);
    }

    /// @notice         Transfers specified ERC20 and amount to treaury
    /// @param _asset   Addres of asset to transfer to treasury
    /// @param _amount  Amount of `_asset` to be transfered to treasury
    function withdraw(IERC20 _asset, uint256 _amount) external onlyGuardian {
        _asset.safeTransfer(address(treasury), _amount);
    }

    /// @notice            Vote in Fixed Forex Gauge
    /// @param _tokenVote  Addresses of tokens that are being voted on
    /// @param _weights    Weight of vote each corresponding token recieves
    function vote(address[] calldata _tokenVote, uint[] calldata _weights) external onlyGuardian {
        gauge.vote(_tokenVote, _weights);
    }

    /// @notice  Claim rKP3R
    function rKP3RClaim() external {
        distributor.claim();
    }

    /// @notice  Burn rKP3R and mint oKP3R
    function oKP3Rclaim() external onlyGuardian {
        rKP3R.claim();
    }

    /// @notice         Exercise oKP3R, pay in USDC
    /// @param _id      ID of option to exercise / oKP3R to burn
    /// @param _manage  Bool if managing USDC from treasury
    function oKP3RRedeem(uint _id, bool _manage) external onlyGuardian {
        IClaim.option memory option = rKP3R.options(_id);
        uint _amount = option.strike;

        if(_manage) { treasury.manage(address(KP3R), _amount); }

        USDC.approve(address(rKP3R), _amount);
        rKP3R.redeem(_id);
    }

    /// @notice              Claim for other possible distributors
    /// @param _distributor  Address to claim from
    function claim(IClaim _distributor) external {
        _distributor.claim();
    }



}