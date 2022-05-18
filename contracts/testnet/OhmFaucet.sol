// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";
import "../types/Ownable.sol";

interface IFaucet {
    function faucetMint(address recipient_) external;
}

interface IStakingV1 {
    function stake(uint256 amount_, address recipient_) external returns (bool);

    function claim(address recipient_) external;
}

/// TODO - get this to be forward compatible if new contracts are deployed
///        i.e. if a new token is added, how can we mint without redeploying a contract
contract DevFaucet is Ownable {
    IFaucet public ohm;
    IStakingV1 public stakingV1;

    constructor(address ohm_, address stakingV1_) {
        ohm = IFaucet(ohm_);
        stakingV1 = IStakingV1(stakingV1_);
    }

    /*=============== FAUCET FUNCTIONS ===============*/
    function mintOHMV1() external {
        ohm.faucetMint(msg.sender);
    }

    function mintSOHMV1() external {
        ohm.faucetMint(address(this));
        stakingV1.stake(10000000000, msg.sender);
        stakingV1.claim(msg.sender);
    }

    /*=============== CONFIG FUNCTIONS ===============*/
    function setOhm(address ohm_) external onlyOwner {
        ohm = IFaucet(ohm_);
    }

    function setStakingV1(address stakingV1_) external onlyOwner {
        stakingV1 = IStakingV1(stakingV1_);
    }
}
