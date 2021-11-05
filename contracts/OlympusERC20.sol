// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

import "./interfaces/IERC20.sol";

import "./types/ERC20.sol";
import "./types/Ownable.sol";
import "./types/VaultOwned.sol";

contract OlympusERC20Token is VaultOwned, ERC20("Olympus", "OHM", 9) {

    function mint(address account_, uint256 amount_) external onlyVault() {
        _mint(account_, amount_);
    }

    function burn(uint256 amount) public virtual {
        _burn(msg.sender, amount);
    }
     
    function burnFrom(address account_, uint256 amount_) public virtual {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) public virtual {
        _allowance[account_][msg.sender] -= amount_;
        _burn(account_, amount_);
    }
}