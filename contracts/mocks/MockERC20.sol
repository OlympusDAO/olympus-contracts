// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../types/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(address recipient, uint256 amount) ERC20("MockERC20", "MockERC20", 18) {
        ERC20._mint(recipient, amount);
    }
}