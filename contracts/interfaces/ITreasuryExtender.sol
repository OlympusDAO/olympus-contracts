pragma solidity ^0.8.10;

struct AllocatorPerformance {
    uint128 gain;
    uint128 loss;
}

struct AllocatorLimits {
    uint128 allocated;
    uint128 loss;
}

struct AllocatorHoldings {
    uint256 allocated;
}

struct AllocatorData {
    AllocatorHoldings holdings;
    AllocatorLimits limits;
    AllocatorPerformance performance;
}

interface ITreasuryExtender {
    event NewAllocatorRegistered(address allocatorAddress, address allocatorToken, uint256 allocatorId);

    event AllocatorFunded(uint256 allocatorId, uint256 amount, uint256 value);

    event AllocatorWithdrawal(uint256 allocatorId, uint256 amount, uint256 value);

    event AllocatorRewardsWithdrawal(uint256 allocatorId, uint256 amount, uint256 value);

    event AllocatorReportedGain(uint256 allocatorId, uint128 gain);

    event AllocatorReportedLoss(uint256 allocatorId, uint128 loss);

    event AllocatorLimitsChanged(uint256 allocatorId, uint128 allocationLimit, uint128 lossLimit);

    function registerAllocator(address newAllocatorAddress) external;

    function setAllocatorLimits(address allocatorAddress, AllocatorLimits memory limits) external;

    function setAllocatorLimits(uint256 allocatorId, AllocatorLimits memory limits) external;

    function report(
        uint256 id,
        uint128 gain,
        uint128 loss
    ) external;

    function requestFundsFromTreasury(uint256 allocatorId, uint256 amount) external;

    function requestFundsFromTreasury(address allocatorAddress, uint256 amount) external;

    function returnFundsToTreasury(uint256 allocatorId, uint256 amount) external;

    function returnFundsToTreasury(address allocatorAddress, uint256 amount) external;

    function returnRewardsToTreasury(
        uint256 allocatorId,
        address token,
        uint256 amount
    ) external;

    function returnRewardsToTreasury(
        address allocatorAddress,
        address token,
        uint256 amount
    ) external;

    function getAllocatorByID(uint256 allocatorId) external view returns (address);

    function getTotalValueAllocated() external view returns (uint256);

    function getAllocatorAllocated(uint256 id) external view returns (uint256);

    function getAllocatorLimits(uint256 id) external view returns (AllocatorLimits memory);

    function getAllocatorPerformance(uint256 id) external view returns (AllocatorPerformance memory);
}
