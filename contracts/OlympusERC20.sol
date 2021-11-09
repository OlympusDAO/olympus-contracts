// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/EnumerableSet.sol";

import "./types/ERC20Permit.sol";
import "./types/OlympusAccessControlled.sol";

contract OlympusERC20Token is ERC20Permit, OlympusAccessControlled {

    using SafeMath for uint256;

    constructor(address _authority) 
        ERC20("Olympus", "OHM", 9) 
        OlympusAccessControlled( IOlympusAuthority(_authority) ) {}

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
        uint256 decreasedAllowance_ =
            allowance(account_, msg.sender).sub(
                amount_,
                "ERC20: burn amount exceeds allowance"
            );

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }
}