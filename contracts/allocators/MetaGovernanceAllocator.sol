// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface IStaking {
    function stake(uint256 _amount, address _recipient) external returns (bool);

    function unstake(uint256 _amount, bool _trigger) external;

    function claim(address _recipient) external;
}

/// @title   Meta Governance Allocator
/// @author  Olympus
/// @notice  Manages BTRFLY or LOBI from treasury to stake back to treasury
contract MetaGovernanceAllocator is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    /// @notice Olympus Treasury
    ITreasury internal treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);
    /// @notice BTRFLY token address
    address internal immutable BTRFLY = 0xC0d4Ceb216B3BA9C3701B291766fDCbA977ceC3A;
    /// @notice Staked BTRFLY token address
    address internal immutable xBTRFLY = 0xCC94Faf235cC5D3Bf4bEd3a30db5984306c86aBC;
    /// @notice Redacted staking contract
    address internal immutable redactedStaking = 0xBdE4Dfb0dbb0Dd8833eFb6C5BD0Ce048C852C487;
    /// @notice LOBI token address
    address internal immutable LOBI = 0xDEc41Db0c33F3F6f3cb615449C311ba22D418A8d;
    /// @notice Staked LOBI token address
    address internal immutable sLOBI = 0x8Ab17e2cd4F894F8641A31f99F673a5762F53c8e;
    /// @notice LOBI Staking contract
    address internal immutable lobiStaking = 0x3818eff63418e0a0BA3980ABA5fF388b029b6d90;

    /// CONSTRUCTOR ///

    ///  @param _authority  Address of the Olympus Authority contract
    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    /// POLICY FUNCTIONS ///

    /// @notice  If vault has been updated through authority contract update treasury address
    function updateTreasury() external onlyGuardian {
        require(authority.vault() != address(0), "Zero address: Vault");
        require(address(authority.vault()) != address(treasury), "No change");
        treasury = ITreasury(authority.vault());
    }

    /// @notice           Stakes either BTRFLY or LOBI from treasury
    /// @param _redacted  Bool if staking to redacted or lobi
    /// @param _amount    Amount of token that will be withdrawn from treasury and staked
    function stake(bool _redacted, uint256 _amount) external onlyGuardian {
        (address staking, address token, ) = _redactedOrLobi(_redacted);

        // retrieve amount of token from treasury
        treasury.manage(token, _amount);

        // approve token to be spent by staking
        IERC20(token).approve(staking, _amount);

        // stake token to treasury
        IStaking(staking).stake(_amount, address(treasury));

        // claim stake for treasury
        IStaking(staking).claim(address(treasury));
    }

    /// @notice           Unstakes either BTRFLY or LOBI from treasury
    /// @param _redacted  Bool if unstakiung to redacted or lobi
    /// @param _amount    Amount of token that will be withdrawn from treasury and unstaked
    function unstake(bool _redacted, uint256 _amount) external onlyGuardian {
        (address staking, address token, address stakedToken) = _redactedOrLobi(_redacted);

        // retrieve amount of staked token from treasury
        treasury.manage(stakedToken, _amount);

        // approve staked token to be spent by staking contract
        IERC20(stakedToken).approve(staking, _amount);

        // unstake token
        IStaking(staking).unstake(_amount, false);

        // send token back to treasury
        IERC20(token).safeTransfer(address(treasury), _amount);
    }

    /// INTERNAL VIEW FUNCTIONS ///

    /// @notice              Returns addresses depending on wanting to interact with redacted or lobi
    /// @param _redacted     Bool if address for redacted or lobi
    /// @return staking      Address of staking contract
    /// @return token        Address of native token
    /// @return stakedToken  Address of staked token
    function _redactedOrLobi(bool _redacted)
        internal
        view
        returns (
            address staking,
            address token,
            address stakedToken
        )
    {
        if (_redacted) {
            staking = redactedStaking;
            token = BTRFLY;
            stakedToken = xBTRFLY;
        } else {
            staking = lobiStaking;
            token = LOBI;
            stakedToken = sLOBI;
        }
    }
}
