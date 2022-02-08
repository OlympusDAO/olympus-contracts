// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IOwnable.sol";
import "../types/Ownable.sol";
import "../libraries/SafeERC20.sol";

contract CrossChainMigrator is Ownable {
    using SafeERC20 for IERC20;

    IERC20 internal immutable wsOHM; // v1 token
    IERC20 internal immutable gOHM; // v2 token

    constructor(address _wsOHM, address _gOHM) {
        require(_wsOHM != address(0), "Zero address: wsOHM");
        wsOHM = IERC20(_wsOHM);
        require(_gOHM != address(0), "Zero address: gOHM");
        gOHM = IERC20(_gOHM);
    }

    // migrate wsOHM to gOHM - 1:1 like kind
    function migrate(uint256 amount) external {
        wsOHM.safeTransferFrom(msg.sender, address(this), amount);
        gOHM.safeTransfer(msg.sender, amount);
    }

    // withdraw wsOHM so it can be bridged on ETH and returned as more gOHM
    function replenish() external onlyOwner {
        wsOHM.safeTransfer(msg.sender, wsOHM.balanceOf(address(this)));
    }

    // withdraw migrated wsOHM and unmigrated gOHM
    function clear() external onlyOwner {
        wsOHM.safeTransfer(msg.sender, wsOHM.balanceOf(address(this)));
        gOHM.safeTransfer(msg.sender, gOHM.balanceOf(address(this)));
    }
}
