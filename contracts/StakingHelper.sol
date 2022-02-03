// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.7.5;

import "./interfaces/IStaking.sol";
import "./interfaces/IDistributor.sol";

contract StakingHelper {
     /**
     * @notice stake OHM
     * @param _stakingContract address of the staking contract
     * @param _stakingDistributor address of the staking distributor
     * @param _to address
     * @param _amount uint     
     * @param _rebasing bool
     * @param _claim bool
     * @return uint
     */
     function stake(
        address _stakingContract,
        address _stakingDistributor,
        address _to,
        uint256 _amount,
        bool _rebasing,
        bool _claim
    ) external returns (uint256) {
        IDistributor(_stakingDistributor).setUnlockRebase(true);
        IStaking(_stakingContract).rebase();
        uint256 result = IStaking(_stakingContract).stake(_to, _amount, _rebasing, _claim);
        IDistributor(_stakingDistributor).setUnlockRebase(false);
        return result;
    }
}
