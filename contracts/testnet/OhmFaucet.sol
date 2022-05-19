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

interface IWOHM is IERC20 {
    function wrapFromOHM(uint256 amount_) external returns (uint256);
}

/// TODO - get this to be forward compatible if new contracts are deployed
///        i.e. if a new token is added, how can we mint without redeploying a contract
///        Add daily limit to prevent abuse
contract DevFaucet is Ownable {
    IFaucet public ohmV1;
    IWOHM public wsOHM;

    IStakingV1 public stakingV1;

    constructor(
        address ohmV1_,
        address wsOHM_,
        address stakingV1_) {
        ohmV1 = IFaucet(ohmV1_);
        wsOHM = IWOHM(wsOHM_);
        stakingV1 = IStakingV1(stakingV1_);
    }

    /*=============== FAUCET FUNCTIONS ===============*/

    function mintOHMV1() external {
        ohmV1.faucetMint(msg.sender);
    }

    function mintSOHMV1() external {
        ohmV1.faucetMint(address(this));
        stakingV1.stake(10000000000, msg.sender);
        stakingV1.claim(msg.sender);
    }

    function mintWSOHM() external {
        ohmV1.faucetMint(address(this));
        uint256 wsOHMMinted = wsOHM.wrapFromOHM(10000000000);
        wsOHM.transfer(msg.sender, wsOHMMinted);
    }

    function genericMint(address mintable_) external {
        IFaucet(mintable_).faucetMint(msg.sender);
    }

    /*=============== CONFIG FUNCTIONS ===============*/

    function setOhmV1(address ohmV1_) external onlyOwner {
        ohmV1 = IFaucet(ohmV1_);
    }

    function setStakingV1(address stakingV1_) external onlyOwner {
        stakingV1 = IStakingV1(stakingV1_);
    }
}
