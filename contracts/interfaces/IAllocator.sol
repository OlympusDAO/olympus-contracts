pragma solidity ^0.8.10;

enum AllocatorStatus {
    OFFLINE,
    ACTIVATED,
    MIGRATING
}

struct AllocatorInitData {
    uint96 id;
    address authority;
    address token;
    address treasury;
    address extender;
}

interface IAllocator {
    function update() external;

    function deallocateTokens(uint256 amount) external;

    function prepareMigration() external;

    function migrate(address newAllocator) external;

    function activate() external;

    function deactivate(bool panic) external;

    function name() external view returns (string memory);

    function id() external view returns (uint256);

    function version() external view returns (string memory);

    function status() external view returns (AllocatorStatus);

    // function allocateTokens(uint256 amount) external;

    function getTokenAllocated() external view returns (address);

    function utilityTokens() external view returns (address[] memory);

    function rewardTokens() external view returns (address[] memory);

    function estimatedTotalAssets() external view returns (uint256);
}
