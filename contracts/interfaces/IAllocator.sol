pragma solidity ^0.8.10;

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

interface IAllocator {
    event AllocatorDeployed(address authority, address token, address extender);

    event AllocatorActivated(uint256 id);

    event AllocatorDeactivated(uint256 id, bool panic);

    event LossLimitViolated(uint128 lastLoss, uint128 dloss, uint256 estimatedTotalAllocated);

    event MigrationExecuted(uint256 oldId, uint256 newId);

    event EtherReceived(uint256 amount);

    function update() external;

    function deallocate(uint256 amount) external;

    function prepareMigration() external;

    function migrate(address newAllocator) external;

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
