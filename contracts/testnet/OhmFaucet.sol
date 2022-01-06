// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../types/Ownable.sol";

contract OhmFaucet is Ownable {
    IERC20 public ohm;

    constructor(address _ohm) {
        ohm = IERC20(_ohm);
    }

    function setOhm(address _ohm) external onlyOwner {
        ohm = IERC20(_ohm);
    }

    function dispense() external {
        ohm.transfer(msg.sender, 1e9);
    }
}
