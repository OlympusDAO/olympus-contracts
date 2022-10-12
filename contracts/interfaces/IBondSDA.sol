// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

import {IERC20} from "./IERC20.sol";

interface IBondSDA {
    /// @notice                 Creates a new bond market
    /// @param params_          Configuration data needed for market creation
    /// @return id              ID of new bond market
    function createMarket(bytes calldata params_) external returns (uint256);
}
