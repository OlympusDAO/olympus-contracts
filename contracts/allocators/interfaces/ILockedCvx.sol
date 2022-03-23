// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// comments check if interface is fine with v2
interface ILockedCvx {
    struct LockedBalance {
        uint112 amount;
        uint112 boosted;
        uint32 unlockTime;
    }

    struct EarnedData {
        address token;
        uint256 amount;
    }

    function lock(
        address _account,
        uint256 _amount,
        uint256 _spendRatio
    ) external;

    function processExpiredLocks(bool _relock) external; // ok, was edited

    function getReward(address _account, bool _stake) external; // ok

    function balanceAtEpochOf(uint256 _epoch, address _user) external view returns (uint256 amount);

    function claimableRewards(address _account) external view returns (EarnedData[] memory userRewards);

    function totalSupplyAtEpoch(uint256 _epoch) external view returns (uint256 supply);

    function epochCount() external view returns (uint256);

    function epochs(uint256 _id) external view returns (uint224, uint32);

    function checkpointEpoch() external;

    function balanceOf(address _account) external view returns (uint256);

    function lockedBalanceOf(address _user) external view returns (uint256 amount);

    function pendingLockOf(address _user) external view returns (uint256 amount);

    function pendingLockAtEpochOf(uint256 _epoch, address _user) external view returns (uint256 amount);

    function stakingToken() external view returns (address);

    function totalSupply() external view returns (uint256 supply);

    function lockedBalances(address _user)
        external
        view
        returns (
            uint256 total,
            uint256 unlockable,
            uint256 locked,
            LockedBalance[] memory lockData
        );

    function addReward(
        address _rewardsToken,
        address _distributor,
        bool _useBoost
    ) external;

    function approveRewardDistributor(
        address _rewardsToken,
        address _distributor,
        bool _approved
    ) external;

    function setStakeLimits(uint256 _minimum, uint256 _maximum) external;

    function setBoost(
        uint256 _max,
        uint256 _rate,
        address _receivingAddress
    ) external;

    function setKickIncentive(uint256 _rate, uint256 _delay) external;

    function shutdown() external;

    function recoverERC20(address _tokenAddress, uint256 _tokenAmount) external;
}
