// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

interface IAllocator {
    // Should have deposit/withdraw methods (interfaces aren't standardized)
    function harvest() external; // For FraxSharesAllocator.sol 
    
    // For CvxCRVAllocator.sol
    function getRewards() external;
    function stakeAll() external;
    function withdraw() external;

}