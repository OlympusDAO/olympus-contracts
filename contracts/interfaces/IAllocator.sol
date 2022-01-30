pragma solidity >=0.8.0;

enum AllocatorStatus {
    OFFLINE,
    ACTIVATED,
    MIGRATING
}

struct AllocatorInitData {
    address authority;
    address token;
    address extender;
}

/**
 * @title Interface for the BaseAllocator
 * @dev
 *  These are the standard functions that an Allocator should implement. A subset of these functions
 *  is implemented in the `BaseAllocator`. Similar to those implemented, if for some reason the developer
 *  decides to implement a dedicated base contract, or not at all and rather a dedicated Allocator contract
 *  without base, imitate the functionalities implemented in it.
 */
interface IAllocator {
    /**
     * @notice
     *  Emitted when the Allocator is deployed.
     */
    event AllocatorDeployed(address authority, address token, address extender);

    /**
     * @notice
     *  Emitted when the Allocator is activated.
     */
    event AllocatorActivated(uint256 id);

    /**
     * @notice
     *  Emitted when the Allocator is deactivated.
     */
    event AllocatorDeactivated(uint256 id, bool panic);

    /**
     * @notice
     *  Emitted when the Allocators loss limit is violated.
     */
    event LossLimitViolated(uint128 lastLoss, uint128 dloss, uint256 estimatedTotalAllocated);

    /**
     * @notice
     *  Emitted when a Migration is executed.
     * @dev
     *  After this also `AllocatorDeactivated` should follow.
     */
    event MigrationExecuted(uint256 oldId, uint256 newId);

    /**
     * @notice
     *  Emitted when Ether is received by the contract.
     * @dev
     *  Only the Guardian is able to send the ether.
     */
    event EtherReceived(uint256 amount);

    function update() external;

    function deallocate(uint256[] memory amounts) external;

    function prepareMigration() external;

    function migrate() external;

    function activate() external;

    function deactivate(bool panic) external;

    function setId(uint256 allocatorId) external;

    function name() external view returns (string memory);

    function id() external view returns (uint256);

    function version() external view returns (string memory);

    function status() external view returns (AllocatorStatus);

    function getToken() external view returns (address);

    function utilityTokens() external view returns (address[] memory);

    function rewardTokens() external view returns (address[] memory);

    function estimateTotalAllocated() external view returns (uint256);

    function estimateTotalRewards() external view returns (uint256[] memory);
}
