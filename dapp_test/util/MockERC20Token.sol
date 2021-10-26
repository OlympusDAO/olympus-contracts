// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../../contracts/libraries/SafeMath.sol";
import "../../contracts/interfaces/IERC20.sol";
import "../../contracts/types/ERC20.sol";

// TODO explore using https://github.com/gnosis/mock-contract
contract MockERC20Token is ERC20 {

    using SafeMath for uint256;

    constructor (string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_, decimals_){
    }

    function mint(address account_, uint256 amount_) external {
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