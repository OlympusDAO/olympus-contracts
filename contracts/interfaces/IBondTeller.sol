// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

interface IBondTeller {
    function deploy(address payoutToken, uint256 expiration) external;

    function create(address payoutToken, uint256 expiration, uint256 capacity) external returns (address);
}