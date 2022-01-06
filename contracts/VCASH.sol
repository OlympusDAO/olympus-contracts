// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.5;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./libraries/SafeMath.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IOHM.sol";
import "./interfaces/IERC20Permit.sol";

import "./types/ERC20Permit.sol";
import "./types/OlympusAccessControlled.sol";

contract VCASH is ERC20Permit, IOHM, Ownable, AccessControl, OlympusAccessControlled {
    using SafeMath for uint256;
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	address public childChainManagerProxy;

    constructor (address _authority) 
        ERC20("Mono Glue", "mGLU", 18) 
        ERC20Permit("Mono Glue") 
        OlympusAccessControlled(IOlympusAuthority(_authority)) 
    {

    }

	function mint (address account, uint256 amount) public override {
		require(hasRole(MINTER_ROLE, msg.sender) || authority.vault() == msg.sender, "VCASH: caller is not a minter");
		_mint(account, amount);
	}

    function burn(uint256 amount) external override {
        _burn(msg.sender, amount);
    }

	function burn (address account, uint256 amount)  external {
		require(hasRole(MINTER_ROLE, msg.sender), "VCASH: caller is not a burner");
		_burn(account, amount);
	}
	
	function setMinter(address _minter) public onlyOwner {
        _setupRole(MINTER_ROLE, _minter);
    }

	// being proxified smart contract, most probably childChainManagerProxy contract's address
    // is not going to change ever, but still, lets keep it 
    function updateChildChainManager(address newChildChainManagerProxy) external onlyOwner {
        require(newChildChainManagerProxy != address(0), "Bad ChildChainManagerProxy address");
        
        childChainManagerProxy = newChildChainManagerProxy;
    }

    function deposit(address user, bytes calldata depositData) external {
        require(msg.sender == childChainManagerProxy, "You're not allowed to deposit");

        uint256 amount = abi.decode(depositData, (uint256));

        mint(user, amount);
    }

    function withdraw(uint256 amount) external {
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
}