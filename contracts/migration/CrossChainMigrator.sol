// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IOwnable.sol";
import "./types/Ownable.sol";

contract Migrate is Ownable {
    IERC20 internal immutable wsOHM; // v1 token
    IERC20 internal immutable gOHM; // v2 token

    uint256 public immutable timelockLength = 300000; // approx 3.5 days
    uint256 public timelockEnd; // timestamp when contract can be cleared

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

    // start timelock
    function startTimelock() external onlyOwner {
        require(timelockEnd == 0, "Timelock set");
        timelockEnd = block.timestamp + timelockLength;
    }

    // withdraw migrated wsOHM and unmigrated gOHM after timelock
    function clear() external onlyOwner {
        require(block.timestamp >= timelockEnd, "Timelock");
        require(timelockEnd != 0, "Timelock not set");
        wsOHM.safeTransfer(msg.sender, wsOHM.balanceOf(address(this)));
        gOHM.safeTransfer(msg.sender, gOHM.balanceOf(address(this)));
    }
}