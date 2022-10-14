// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import {IERC20} from "./IERC20.sol";

interface IBondSDA {
    /// @notice                 Creates a new bond market
    /// @param params_          Configuration data needed for market creation
    /// @return id              ID of new bond market
    function createMarket(bytes calldata params_) external returns (uint256);

    /// @notice                 Disable existing bond market
    /// @notice                 Must be market owner
    /// @param id_              ID of market to close
    function closeMarket(uint256 id_) external;
}
