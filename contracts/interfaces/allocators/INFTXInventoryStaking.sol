// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface INFTXInventoryStaking {
    function deposit(uint256 vaultId, uint256 _amount) external;
    function withdraw(uint256 vaultId, uint256 _share) external;
}