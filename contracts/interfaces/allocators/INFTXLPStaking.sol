// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface INFTXLPStaking {
    function deposit(uint256 vaultId, uint256 amount) external;
    function exit(uint256 vaultId, uint256 amount) external;
    function withdraw(uint256 vaultId, uint256 amount) external;
    function claimRewards(uint256 vaultId) external;
}