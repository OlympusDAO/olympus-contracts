// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;
pragma abicoder v2;

import "../libraries/SafeERC20.sol";

import "../interfaces/INFTXLPStaking.sol";


contract NFTXLPStakingMock is INFTXLPStaking {

    using SafeERC20 for IERC20;

    address xToken;
    address rewardToken;
    address allocatorToken;

    constructor(address _xToken, address _rewardToken) {
        require(_xToken != address(0), "Zero address: xToken");
        require(_rewardToken != address(0), "Zero address: rewardToken");

        xToken = _xToken;
        rewardToken = _rewardToken;
    }

    function deposit(uint256 vaultId, uint256 amount) external override {
        // Take the source token from the allocator
        IERC20(allocatorToken).safeTransferFrom(msg.sender, address(this), amount);

        // Return the xToken to the allocator
        IERC20(xToken).safeTransfer(msg.sender, amount);
    }

    function withdraw(uint256 vaultId, uint256 amount) external override {
        // Take the xtoken from the allocator
        IERC20(xToken).safeTransferFrom(msg.sender, address(this), amount);

        // Return the base token to the allocator
        IERC20(allocatorToken).safeTransfer(msg.sender, amount);
    }

    function exit(uint256 vaultId, uint256 amount) external override {}

    function claimRewards(uint256 vaultId) external override {
        // Return the base token to the allocator
        IERC20(rewardToken).safeTransfer(msg.sender, 10);
    }

    function vaultStakingInfo(uint256 vaultId) external view override returns (StakingPool memory _stakingPool) {
        _stakingPool = StakingPool({
            stakingToken: address(0),
            rewardToken: address(0)
        });
    }

    function _setAllocatorToken(address _allocatorToken) external {
        allocatorToken = _allocatorToken;
    }
}
