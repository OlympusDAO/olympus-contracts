// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

struct UserInfo {
    uint256 amount; // How many LP tokens the user has provided.
    uint256 rewardDebt;
}

interface IMasterChef {
    function pendingSushi(uint256 _pid, address _user) external view returns (uint256);

    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function emergencyWithdraw(uint256 _pid) external;

    function userInfo(uint256 _pid, address _user) external view returns (UserInfo memory);
}
