// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

interface IOnsenAllocator {
    function harvest(bool _stake) external;
}

// @notice contract will claim rewards from multiple allocators in one function call
contract RewardHarvester is Ownable {
    /* ======== STATE VARIABLES ======== */

    address public immutable onsenAllocator;
    address[] public allocators;

    /* ======== CONSTRUCTOR ======== */

    constructor(address _onsenAllocator, address[] memory _allocators) {
        require(_onsenAllocator != address(0));
        onsenAllocator = _onsenAllocator;
        for (uint256 i; i < _allocators.length; i++) {
            require(_allocators[i] != address(0));
        }
        allocators = _allocators;
    }

    /* ======== PUBLIC FUNCTION ======== */

    /**
     *  @notice harvest rewards from allocators
     *  @param _useOnsen bool
     */
    function harvest(bool _useOnsen) external {
        for (uint256 i; i < allocators.length; i++) {
            IAllocator(allocators[i]).harvest();
        }
        if (_useOnsen) {
            IOnsenAllocator(onsenAllocator).harvest(true);
        }
    }

    /* ======== POLICY FUNCTION ======== */

    /**
     *  @notice update array of allocators
     *  @param _allocators address[]
     */
    function updateAllocator(address[] calldata _allocators) external onlyOwner {
        allocators = _allocators;
    }
}
