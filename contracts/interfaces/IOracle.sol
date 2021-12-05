// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface IOracle { // Chainlink oracle interface
    function getLatestPrice() external view returns (uint256);
    function setPrice(uint256 _price) external;
}