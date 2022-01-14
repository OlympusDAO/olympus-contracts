pragma solidity ^0.8.10;

// interfaces
import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IAllocator.sol";
import "./interfaces/ITreasuryExtender.sol";

// types
import "./types/OlympusAccessControlledImproved.sol";

// libraries
import "./libraries/SafeERC20.sol";

// will get interface because allocators will need it
// TODO: not finished
contract TreasuryExtender is OlympusAccessControlledImproved, ITreasuryExtender {
    using SafeERC20 for IERC20;

    ITreasury immutable treasury;

    IAllocator[] public allocators;

    mapping(IAllocator => AllocatorData) public allocatorData;

    uint256 private totalAmountAllocated;
    uint256 private totalValueAllocated;

    constructor(address treasuryAddress, address authorityAddress)
        OlympusAccessControlledImproved(IOlympusAuthority(authorityAddress))
    {
        treasury = ITreasury(treasuryAddress);
    }

    //// "MODIFIERS"

    function _allocatorActivated(AllocatorStatus status) internal pure {
        require(AllocatorStatus.ACTIVATED == status, "TreasuryExtender::AllocatorOffline");
    }

    //// FUNCTIONS

    // TODO: needs checks
    function registerAllocator(address newAllocatorAddress) external override {
        _onlyGuardian();
        IAllocator allocator = IAllocator(newAllocatorAddress);
        allocators.push(allocator);
    }

    function setAllocationLimit(address allocatorAddress, uint256 limit) external override {
        _onlyGuardian();
        IAllocator allocator = IAllocator(allocatorAddress);
        _setAllocationLimit(allocator, limit);
    }

    function setAllocationLimit(uint256 allocatorId, uint256 limit) external override {
        _onlyGuardian();
        IAllocator allocator = allocators[allocatorId];
        _setAllocationLimit(allocator, limit);
    }

    function requestFundsFromTreasury(uint256 allocatorId, uint256 amount) external override {
        _onlyGuardian();
        _requestFundsFromTreasury(allocators[allocatorId], amount);
    }

    function requestFundsFromTreasury(address allocatorAddress, uint256 amount) external override {
        _onlyGuardian();
        _requestFundsFromTreasury(IAllocator(allocatorAddress), amount);
    }

    function returnFundsToTreasury(uint256 allocatorId, uint256 amount) external override {
        _onlyGuardian();
        _returnFundsToTreasury(allocators[allocatorId], amount);
    }

    function returnFundsToTreasury(address allocatorAddress, uint256 amount) external override {
        _onlyGuardian();
        _returnFundsToTreasury(IAllocator(allocatorAddress), amount);
    }

    function getAllocatorByID(uint256 allocatorId) external view override returns (address allocatorAddress) {
        allocatorAddress = address(allocators[allocatorId]);
    }

    function getTotalAmountAllocated() external view override returns (uint256) {
        return totalAmountAllocated;
    }

    function getTotalValueAllocated() external view override returns (uint256) {
        return totalValueAllocated;
    }

    function _setAllocationLimit(IAllocator allocator, uint256 limit) internal {
        allocatorData[allocator].maxAmountAllocated = limit;
    }

    function _requestFundsFromTreasury(IAllocator allocator, uint256 amount) internal {
        // reads
        AllocatorData memory data = allocatorData[allocator];
        address tokenAllocated = allocator.getTokenAllocated();
        uint256 value = treasury.tokenValue(tokenAllocated, amount);

        // checks
        _allocatorActivated(allocator.status());

        // interaction (withdrawing)
        treasury.manage(tokenAllocated, amount);

        // effects
        totalAmountAllocated += amount;
        totalValueAllocated += value;

        data.amountAllocated += amount;
        data.valueAllocated += value;

        allocatorData[allocator] = data;

        // interaction (depositing)
        IERC20(tokenAllocated).safeTransfer(address(allocator), amount);
    }

    function _returnFundsToTreasury(IAllocator allocator, uint256 amount) internal {
        // reads
        AllocatorData memory data = allocatorData[allocator];
        address tokenAllocated = allocator.getTokenAllocated();
        uint256 value = treasury.tokenValue(tokenAllocated, amount);

        // interaction (withdrawing)
        IERC20(tokenAllocated).safeTransferFrom(address(allocator), address(this), amount);

        // effects
        totalAmountAllocated -= amount;
        totalValueAllocated -= value;

        data.amountAllocated -= amount;
        data.valueAllocated -= value;

        allocatorData[allocator] = data;

        // interaction (depositing)
        assert(treasury.deposit(amount, tokenAllocated, value) == 0);
    }
}
