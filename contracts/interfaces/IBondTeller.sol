// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

import {IERC20} from "./IERC20.sol";

interface IBondTeller {
    function deploy(IERC20 payoutToken, uint48 expiration) external;

    function create(
        IERC20 payoutToken,
        uint48 expiration,
        uint256 capacity
    ) external returns (address);
}
