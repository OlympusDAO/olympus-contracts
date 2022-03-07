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

/**
 * @title Interface for the TreasuryExtender
 */
interface ITreasuryExtender {
    /**
     * @notice
     *  Emitted when a new Deposit is registered.
     */
    event NewDepositRegistered(address allocator, address token, uint256 id);

    /**
     * @notice
     *  Emitted when an Allocator is funded
     */
    event AllocatorFunded(uint256 id, uint256 amount, uint256 value);

    /**
     * @notice
     *  Emitted when allocated funds are withdrawn from an Allocator
     */
    event AllocatorWithdrawal(uint256 id, uint256 amount, uint256 value);

    /**
     * @notice
     *  Emitted when rewards are withdrawn from an Allocator
     */
    event AllocatorRewardsWithdrawal(address allocator, uint256 amount, uint256 value);

    /**
     * @notice
     *  Emitted when an Allocator reports a gain
     */
    event AllocatorReportedGain(uint256 id, uint128 gain);

    /**
     * @notice
     *  Emitted when an Allocator reports a loss
     */
    event AllocatorReportedLoss(uint256 id, uint128 loss);

    /**
     * @notice
     *  Emitted when an Allocator reports a migration
     */
    event AllocatorReportedMigration(uint256 id);

    /**
     * @notice
     *  Emitted when an Allocator limits are modified
     */
    event AllocatorLimitsChanged(uint256 id, uint128 allocationLimit, uint128 lossLimit);

    function registerDeposit(address newAllocator) external;

    function setAllocatorLimits(uint256 id, AllocatorLimits memory limits) external;

    function report(
        uint256 id,
        uint128 gain,
        uint128 loss
    ) external;

    function requestFundsFromTreasury(uint256 id, uint256 amount) external;

    function returnFundsToTreasury(uint256 id, uint256 amount) external;

    function returnRewardsToTreasury(
        uint256 id,
        address token,
        uint256 amount
    ) external;

    function getTotalAllocatorCount() external view returns (uint256);

    function getAllocatorByID(uint256 id) external view returns (address);

    function getAllocatorAllocated(uint256 id) external view returns (uint256);

    function getAllocatorLimits(uint256 id) external view returns (AllocatorLimits memory);

    function getAllocatorPerformance(uint256 id) external view returns (AllocatorPerformance memory);
}
