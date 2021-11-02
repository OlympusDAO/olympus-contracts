// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface IAllocator {
    function manage(address _token, uint256 _amount) external;

    function deposit(
        address _from,
        uint256 _amount,
        address _token,
        uint256 _profit
    ) external returns (uint256 send_);

    function harvest() external;
}
