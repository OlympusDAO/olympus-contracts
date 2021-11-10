// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IOHM.sol";
import "./interfaces/IERC20Permit.sol";

import "./types/ERC20Permit.sol";
import "./types/VaultOwned.sol";

contract OlympusERC20Token is ERC20Permit, IOHM, VaultOwned {
    using SafeMath for uint256;

    address public staking;

    constructor() ERC20("Olympus", "OHM", 9) ERC20Permit("Olympus") {}

    function mint(address account_, uint256 amount_) external override onlyVault {
        _mint(account_, amount_);
    }

    function burn(uint256 amount) external override {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account_, uint256 amount_) external override {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) internal {
        uint256 decreasedAllowance_ = allowance(account_, msg.sender).sub(amount_, "ERC20: burn amount exceeds allowance");

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }

    /* ========== APPROVAL ========== */

    // do this before setting vault
    function setStaking(address _staking) external onlyVault {
        require(_staking != address(0), "Zero address: Staking");
        require(staking == address(0), "Already set");
        staking = _staking;
    }

    // transfers to staking do not require approval. high gas saver.
    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        _transfer(sender, recipient, amount);
        if(recipient != staking) {
            _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount, "ERC20: transfer amount exceeds allowance"));
        }
        return true;
    }
}
