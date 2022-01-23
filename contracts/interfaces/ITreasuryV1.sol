// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface ITreasuryV1 {
    function withdraw(uint256 amount, address token) external;

    function manage(address token, uint256 amount) external;

    function valueOf(address token, uint256 amount) external view returns (uint256);

    function excessReserves() external view returns (uint256);
}
