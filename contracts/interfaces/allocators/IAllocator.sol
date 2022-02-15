// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface IAllocator {
    function deposit(address _token, uint256 _amount) external;
    function withdraw(address _token, uint256 _amount) external;

    // claims any claimable rewards for this token and sends back to Treasury
    function harvest(address _token, uint256 _amount) external;

    // claims all available rewards for this token and sends back to Treasury
    function harvestAll(address _token) external;

    // onlyGovernor sends any ERC20 token in the contract to treasury
    function rescue(address _token) external; 

    // NFTX Vault mapping utility
    function setStakingToken(address _token, address _rewardToken, uint256 vaultId, bool _isLiquidityPool) external;
    function removeStakingToken(address _token) external;
    function addDividendToken(address _token, address _xToken) external;
}