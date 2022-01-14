pragma solidity ^0.8.10;

struct AllocatorData {
    uint256 amountAllocated;
    uint256 valueAllocated;
    uint256 maxAmountAllocated;
}

interface ITreasuryExtender {
    // TODO: throw events into functions
    event NewAllocatorRegistered(address allocatorAddress, address allocatorToken, uint256 allocatorId);

    event AllocatorFunded(address allocatorAddress, uint256 amount, uint256 value);

    event AllocatorWithdrawal(address allocatorAddress, uint256 amount, uint256 value);

    event AllocationLimitChanged(address allocatorAddress, uint256 amount);

    function registerAllocator(address newAllocatorAddress) external;

    function setAllocationLimit(address allocatorAddress, uint256 limit) external;

    function setAllocationLimit(uint256 allocatorId, uint256 limit) external;

    function requestFundsFromTreasury(uint256 allocatorId, uint256 amount) external;

    function requestFundsFromTreasury(address allocatorAddress, uint256 amount) external;

    function returnFundsToTreasury(uint256 allocatorId, uint256 amount) external;

    function returnFundsToTreasury(address allocatorAddress, uint256 amount) external;

    function getAllocatorByID(uint256 allocatorId) external view returns (address);

    function getTotalAmountAllocated() external view returns (uint256);

    function getTotalValueAllocated() external view returns (uint256);
}
