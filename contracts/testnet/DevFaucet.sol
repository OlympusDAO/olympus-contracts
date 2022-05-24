// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";
import "../types/Ownable.sol";
import "../types/OlympusAccessControlled.sol";

interface IFaucet is IERC20 {
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
contract DevFaucet is OlympusAccessControlled {
    /*================== ERRORS ==================*/

    error CanOnlyMintOnceADay();
    error MintTooLarge();

    /*============= STATE VARIABLES =============*/
    IERC20 public DAI;
    IFaucet[] public mintable;
    IWOHM public wsOHM;

    /// Define current staking contracts
    /// @dev These have to be specifically and separately defined because they do not have
    ///      compatible interfaces
    IStakingV1 public stakingV1;
    IStaking public stakingV2;

    /// Define array to push future staking contracts to if they are ever swapped
    /// @dev These have to conform to the current staking interface (or at least the stake function)
    IStaking[] public futureStaking;

    /// Keep track of the last block a user minted at so we can prevent spam
    mapping(address => uint256) public lastMint;

    constructor(
        address dai_,
        address ohmV1_,
        address ohmV2_,
        address wsOHM_,
        address stakingV1_,
        address stakingV2_,
        address authority_
    ) OlympusAccessControlled(IOlympusAuthority(authority_)) {
        DAI = IERC20(dai_);
        mintable.push(IFaucet(ohmV1_));
        mintable.push(IFaucet(ohmV2_));
        wsOHM = IWOHM(wsOHM_);
        stakingV1 = IStakingV1(stakingV1_);
        stakingV2 = IStaking(stakingV2_);

        mintable[0].approve(wsOHM_, type(uint256).max);
        mintable[0].approve(stakingV1_, type(uint256).max);
        mintable[1].approve(stakingV2_, type(uint256).max);
    }

    /*================== Modifiers ==================*/

    function _beenADay(uint256 lastMint_, uint256 timestamp_) internal pure returns (bool) {
        return (timestamp_ - lastMint_) > 1 days;
    }

    /*=============== FAUCET FUNCTIONS ===============*/

    function mintDAI() external {
        if (!_beenADay(lastMint[msg.sender], block.timestamp)) revert CanOnlyMintOnceADay();

        lastMint[msg.sender] = block.timestamp;

        DAI.transfer(msg.sender, 100000000000000000000);
    }

    function mintETH(uint256 amount_) external {
        if (!_beenADay(lastMint[msg.sender], block.timestamp)) revert CanOnlyMintOnceADay();
        if (amount_ > 150000000000000000) revert MintTooLarge();

        lastMint[msg.sender] = block.timestamp;

        /// Transfer rather than Send so it reverts if balance too low
        payable(msg.sender).transfer(amount_);
    }

    function mintOHM(uint256 ohmIndex_) external {
        if (!_beenADay(lastMint[msg.sender], block.timestamp)) revert CanOnlyMintOnceADay();

        lastMint[msg.sender] = block.timestamp;

        IFaucet ohm = mintable[ohmIndex_];

        if (ohm.balanceOf(address(this)) < 10000000000) {
            ohm.faucetMint(msg.sender);
        } else {
            ohm.transfer(msg.sender, 10000000000);
        }
    }

    function mintSOHM(uint256 ohmIndex_) external {
        if (!_beenADay(lastMint[msg.sender], block.timestamp)) revert CanOnlyMintOnceADay();

        lastMint[msg.sender] = block.timestamp;

        IFaucet ohm = mintable[ohmIndex_];

        if (ohm.balanceOf(address(this)) < 10000000000) {
            ohm.faucetMint(address(this));
        }

        if (ohmIndex_ > 1) {
            IStaking currStaking = futureStaking[ohmIndex_ - 2];
            currStaking.stake(msg.sender, 10000000000, true, true);
        } else if (ohmIndex_ == 1) {
            stakingV2.stake(msg.sender, 10000000000, true, true);
        } else {
            stakingV1.stake(10000000000, msg.sender);
            stakingV1.claim(msg.sender);
        }
    }

    function mintWSOHM() external {
        if (!_beenADay(lastMint[msg.sender], block.timestamp)) revert CanOnlyMintOnceADay();

        lastMint[msg.sender] = block.timestamp;

        if (mintable[0].balanceOf(address(this)) < 10000000000) {
            mintable[0].faucetMint(address(this));
        }

        uint256 wsOHMMinted = wsOHM.wrapFromOHM(10000000000);
        wsOHM.transfer(msg.sender, wsOHMMinted);
    }

    function mintGOHM() external {
        if (!_beenADay(lastMint[msg.sender], block.timestamp)) revert CanOnlyMintOnceADay();

        lastMint[msg.sender] = block.timestamp;

        if (mintable[1].balanceOf(address(this)) < 10000000000) {
            mintable[1].faucetMint(address(this));
        }

        stakingV2.stake(msg.sender, 10000000000, false, true);
    }

    /*=============== CONFIG FUNCTIONS ===============*/

    function setDAI(address dai_) external onlyGovernor {
        DAI = IERC20(dai_);
    }

    function setOHM(uint256 ohmIndex_, address ohm_) external onlyGovernor {
        mintable[ohmIndex_] = IFaucet(ohm_);
    }

    function addOHM(address ohm_) external onlyGovernor {
        mintable.push(IFaucet(ohm_));
    }

    function setStakingV1(address stakingV1_) external onlyGovernor {
        stakingV1 = IStakingV1(stakingV1_);
    }

    function setStakingV2(address stakingV2_) external onlyGovernor {
        stakingV2 = IStaking(stakingV2_);
    }

    function addStaking(address staking_) external onlyGovernor {
        futureStaking.push(IStaking(staking_));
    }

    function approveStaking(address ohm_, address staking_) external onlyGovernor {
        IERC20(ohm_).approve(staking_, type(uint256).max);
    }

    /*=============== RECEIVE FUNCTION ===============*/

    receive() external payable {
        return;
    }
}
