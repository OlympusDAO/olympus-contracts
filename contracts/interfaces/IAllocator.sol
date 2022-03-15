pragma solidity >=0.8.0;

// interfaces
import "./IERC20.sol";
import "./ITreasuryExtender.sol";
import "./IOlympusAuthority.sol";

enum AllocatorStatus {
    OFFLINE,
    ACTIVATED,
    MIGRATING
}

struct AllocatorInitData {
    IOlympusAuthority authority;
    ITreasuryExtender extender;
    IERC20[] tokens;
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
    event AllocatorDeployed(address authority, address extender);

    /**
     * @notice
     *  Emitted when the Allocator is activated.
     */
    event AllocatorActivated();

    /**
     * @notice
     *  Emitted when the Allocator is deactivated.
     */
    event AllocatorDeactivated(bool panic);

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
    event MigrationExecuted(address allocator);

    /**
     * @notice
     *  Emitted when Ether is received by the contract.
     * @dev
     *  Only the Guardian is able to send the ether.
     */
    event EtherReceived(uint256 amount);

    function update(uint256 id) external;

    function deallocate(uint256[] memory amounts) external;

    function prepareMigration() external;

    function migrate() external;

    function activate() external;

    function deactivate(bool panic) external;

    function addId(uint256 id) external;

    function name() external view returns (string memory);

    function ids() external view returns (uint256[] memory);

    function tokenIds(uint256 id) external view returns (uint256);

    function version() external view returns (string memory);

    function status() external view returns (AllocatorStatus);

    function tokens() external view returns (IERC20[] memory);

    function utilityTokens() external view returns (IERC20[] memory);

    function rewardTokens() external view returns (IERC20[] memory);

    function amountAllocated(uint256 id) external view returns (uint256);
}
