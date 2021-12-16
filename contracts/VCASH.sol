// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VCASH is ERC20("Virtual Cash", "vCASH"), Ownable, AccessControl {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	address public childChainManagerProxy;

	function mint (address account, uint256 amount) public {
		require(hasRole(MINTER_ROLE, msg.sender), "VCASH: caller is not a minter");
		_mint(account, amount);
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
}