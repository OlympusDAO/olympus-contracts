// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/EnumerableSet.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IERC2612Permit.sol";

import "./types/ERC20Permit.sol";
import "./types/Ownable.sol";




contract VaultOwned is Ownable {
    
  address internal _vault;

  function setVault( address vault_ ) external onlyOwner() returns ( bool ) {
    _vault = vault_;

    return true;
  }

  function vault() public view returns (address) {
    return _vault;
  }

  modifier onlyVault() {
    require( _vault == msg.sender, "VaultOwned: caller is not the Vault" );
    _;
  }

}

contract OlympusERC20Token is ERC20Permit, VaultOwned {

    using SafeMath for uint256;

    constructor() ERC20("Olympus", "OHM", 9) {
    }

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