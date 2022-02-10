// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import "../interfaces/IERC20.sol";
import "../interfaces/IOwnable.sol";
import "../types/Ownable.sol";

contract SimpleVesting is Ownable {

    modifier notSet() {
        require(distributePerPeriod == 0, "Set");
        _;
    }

    modifier canDistribute { // distributions are a month apart
        require(block.timestamp >= nextDistribution, "Before distribution");
        _;
    }

    uint256 public distributePerPeriod; // amount of gOHM
    uint256 public nextDistribution; // timestamp
    uint256 public distributionPace = 4 weeks; // time between distributions

    IERC20 private immutable gOHM = IERC20(0x0ab87046fBb341D058F17CBC4c1133F25a20a52f); // wrapped staked OHM

    constructor() {}

    /// @notice distribute tokens when available
    function distribute() external onlyOwner canDistribute {
        nextDistribution += distributionPace;
        gOHM.transfer(msg.sender, distributePerPeriod);
    }

    /// @notice                     sets the vesting terms and transfers ownership
    /// @param firstDistribution    the timestamp of the first distribution
    /// @param newOwner             the address to receive tokens
    function lock(uint256 firstDistribution, address newOwner) external onlyOwner notSet {
        distributePerPeriod = gOHM.balanceOf(address(this)) / 4;
        nextDistribution = firstDistribution;
        _owner = newOwner;
    }

    /// @notice rescind tokens before initialization
    function unwind() external onlyOwner notSet {
        gOHM.transfer(msg.sender, gOHM.balanceOf(address(this)));
    }
}