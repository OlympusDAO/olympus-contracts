// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "./types/ERC20.sol";
import "./types/Ownable.sol";

contract AlphaFLOOR is ERC20, Ownable {
    using SafeMath for uint256;

    constructor() ERC20("AlphaFloor", "aFLOOR", 9) {
        _mint(owner(), 500_000_000_000_000);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}