pragma solidity ^0.8.10;

// interfaces
import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IAllocator.sol";

// types
import "./types/OlympusAccessControlled.sol";

// libraries
import "./libraries/SafeERC20.sol";

struct AllocatorData {
    bool activated;
    uint256 amountDeployed;
    uint256 valueDeployed;
}

// will get interface because allocators will need it
// TODO: not finished
contract TreasuryAdapter is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    ITreasury immutable treasury;

    IAllocator[] public allocators;

    mapping(IAllocator => AllocatorData) public allocatorData;

    uint256 public totalAmountDeployed;
    uint256 public totalValueDeployed;

    constructor(address treasuryAddress, address authorityAddress)
        OlympusAccessControlled(IOlympusAuthority(authorityAddress))
    {
        treasury = ITreasury(treasuryAddress);
    }

    //// "MODIFIERS"

    function _allocatorActivated(bool isActive) internal pure {
        require(isActive, "TreasuryAdapter::AllocatorOffline");
    }

    //// FUNCTIONS

    // TODO: needs checks
    function registerAllocator(address newAllocatorAddress) external onlyGuardian {
        IAllocator allocator = IAllocator(newAllocatorAddress);
        allocators.push(allocator);
        allocatorData[allocator].activated = true;
    }

    // TODO: needs checks
    function deactiveAllocator(address allocatorAddress, bool panic) external onlyGuardian {
        IAllocator allocator = IAllocator(allocatorAddress);
        _deactiveAllocator(allocator, panic);
    }

    function deactiveAllocator(uint256 allocatorId, bool panic) external onlyGuardian {
        IAllocator allocator = allocators[allocatorId];
        _deactiveAllocator(allocator, panic);
    }

    function requestFundsFromTreasury(uint256 allocatorId, uint256 amount) external onlyGuardian {
        _requestFundsFromTreasury(allocators[allocatorId], amount);
    }

    function requestFundsFromTreasury(address allocatorAddress, uint256 amount) external onlyGuardian {
        _requestFundsFromTreasury(IAllocator(allocatorAddress), amount);
    }

    function returnFundsToTreasury(uint256 allocatorId, uint256 amount) external onlyGuardian {
        _returnFundsToTreasury(allocators[allocatorId], amount);
    }

    function returnFundsToTreasury(address allocatorAddress, uint256 amount) external onlyGuardian {
        _returnFundsToTreasury(IAllocator(allocatorAddress), amount);
    }

    function _deactiveAllocator(IAllocator allocator, bool panic) internal {
        allocatorData[allocator].activated = false;
        if (panic) _returnFundsToTreasury(allocator, allocatorData[allocator].amountDeployed);
    }

    function _requestFundsFromTreasury(IAllocator allocator, uint256 amount) internal {
        // reads
        AllocatorData memory data = allocatorData[allocator];
        address tokenAllocated = allocator.tokenAllocated();
        uint256 value = treasury.tokenValue(tokenAllocated, amount);

        // checks
        _allocatorActivated(data.activated);

        // interaction (withdrawing)
        treasury.manage(tokenAllocated, amount);

        // effects
        totalAmountDeployed += amount;
        totalValueDeployed += value;

        data.amountDeployed += amount;
        data.valueDeployed += value;

        allocatorData[allocator] = data;

        // interaction (depositing)

        IERC20(tokenAllocated).safeTransfer(address(allocator), amount);
    }

    function _returnFundsToTreasury(IAllocator allocator, uint256 amount) internal {
        // reads
        AllocatorData memory data = allocatorData[allocator];
        address tokenAllocated = allocator.tokenAllocated();
        uint256 value = treasury.tokenValue(tokenAllocated, amount);

        // interaction (withdrawing)
        IERC20(tokenAllocated).safeTransferFrom(address(allocator), address(this), amount);

        // effects
        totalAmountDeployed -= amount;
        totalValueDeployed -= value;

        data.amountDeployed -= amount;
        data.valueDeployed -= value;

        allocatorData[allocator] = data;

        // interaction (depositing)
        assert(treasury.deposit(amount, tokenAllocated, value) == 0);
    }
}
