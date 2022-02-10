// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./libraries/SafeERC20.sol";
import "./libraries/SafeMath.sol";

import "./interfaces/IStaking.sol";
import "./interfaces/IDistributor.sol";
import "./interfaces/IERC20.sol";

interface IStakingEpoch {
    struct Epoch {
        uint256 length; // in seconds
        uint256 number; // since inception
        uint256 end; // timestamp
        uint256 distribute; // amount
    }

    function epoch() external returns (Epoch memory);
}

contract StakingHelper {
    IStaking public staking;
    IDistributor public distributor;
    IERC20 public ohm;

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    constructor(
        address _staking,
        address _distributor,
        address _ohm
    ) {
        require(_staking != address(0), "Zero address: staking");
        require(_distributor != address(0), "Zero address: distributor");
        require(_ohm != address(0), "Zero address: ohm");

        staking = IStaking(_staking);
        distributor = IDistributor(_distributor);
        ohm = IERC20(_ohm);
    }

    /**
     * @notice Stake ohm while triggering rebase if needed.
     * @dev checks block.timstamp against epoch boundry to trigger rebase.
     * @param _to address
     * @param _amount uint
     * @param _rebasing bool
     * @param _claim bool
     * @return uint
     */
    function stake(
        address _to,
        uint256 _amount,
        bool _rebasing,
        bool _claim
    ) external returns (uint256) {
        ohm.safeTransferFrom(msg.sender, address(this), _amount);
        distributor.setUnlockRebase(true);

        if (IStakingEpoch(address(staking)).epoch().end <= block.timestamp) {
            // This will trigger a rebase and transfer tokens to this contract
            uint256 bounty = IStaking(staking).unstake(address(this), 0, true, true);
            _amount += bounty;
        }

        ohm.approve(address(staking), _amount);
        uint256 result = staking.stake(_to, _amount, _rebasing, _claim);
        distributor.setUnlockRebase(false);
        return result;
    }
}
