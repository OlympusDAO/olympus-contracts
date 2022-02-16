// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

import "../libraries/SafeERC20.sol";

import "../interfaces/INFTXInventoryStaking.sol";


contract NFTXInventoryStaking is INFTXInventoryStaking {

    using SafeERC20 for IERC20;

    address xToken;
    address allocatorToken;

    constructor(address _xToken) {
        require(_xToken != address(0), "Zero address: xToken");
        xToken = _xToken;
    }

    function deposit(uint256 vaultId, uint256 _amount) external override {
        // Take the source token from the allocator
        IERC20(allocatorToken).safeTransferFrom(msg.sender, address(this), _amount);

        // Return the xToken to the allocator
        IERC20(xToken).safeTransfer(msg.sender, _amount);
    }

    function withdraw(uint256 vaultId, uint256 _share) external override {
        // Take the xtoken from the allocator
        IERC20(xToken).safeTransferFrom(msg.sender, address(this), _share);

        // Return the base token to the allocator
        IERC20(allocatorToken).safeTransfer(msg.sender, _share);
    }

    function _setAllocatorToken(address _allocatorToken) external {
        allocatorToken = _allocatorToken;
    }

    function xTokenShareValue(uint256 vaultId) external pure override returns (uint256 _value) {
      _value = 0;
    }

}
