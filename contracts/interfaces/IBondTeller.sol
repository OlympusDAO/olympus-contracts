// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

import {IERC20} from "./IERC20.v2.sol";

interface IBondTeller {
    /// @notice             Instantiates a new fixed expiry bond token
    /// @param payoutToken  Token received upon bonding
    /// @param expiration   Expiry timestamp for the bond
    function deploy(IERC20 payoutToken, uint48 expiration) external;

    /// @notice             Mint bond tokens for a specific expiry
    /// @param expiration   Expiry timestamp for the bond
    /// @param capacity     Amount of bond tokens to mint
    function create(
        IERC20 payoutToken,
        uint48 expiration,
        uint256 capacity
    ) external returns (IERC20, uint256);
}
