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

contract TreasuryExtender is OlympusAccessControlledImproved, ITreasuryExtender {
    using SafeERC20 for IERC20;

    ITreasury immutable treasury;

    IAllocator[] public allocators;

    mapping(IAllocator => AllocatorData) public allocatorData;

    uint256 private totalValueAllocated;

    constructor(address treasuryAddress, address authorityAddress)
        OlympusAccessControlledImproved(IOlympusAuthority(authorityAddress))
    {
        treasury = ITreasury(treasuryAddress);
        allocators.push(IAllocator(address(0)));
    }

    //// "MODIFIERS"

    function _allocatorActivated(AllocatorStatus status) internal pure {
        require(AllocatorStatus.ACTIVATED == status, "TreasuryExtender::AllocatorOffline");
    }

    function _allocatorOffline(AllocatorStatus status) internal pure {
        require(AllocatorStatus.OFFLINE == status, "TreasuryExtender::AllocatorActivated");
    }

    function _onlyAllocator(uint256 id, address sender) internal view {
        require(IAllocator(sender) == allocators[id], "TreasuryExtender::OnlyAllocator");
    }

    //// FUNCTIONS

    function registerAllocator(address newAllocatorAddress) external override {
        // reads
        IAllocator allocator = IAllocator(newAllocatorAddress);

        // checks
        _onlyGuardian();
        require(allocator.id() == 0, "TreasuryExtender::AllocatorRegistered");

        // effects
        allocators.push(allocator);

        // interactions
        allocator.setId(allocators.length - 1);

        // events
        emit NewAllocatorRegistered(newAllocatorAddress, allocator.getToken(), allocator.id());
    }

    function setAllocatorLimits(address allocatorAddress, AllocatorLimits memory limits) external override {
        // reads
        IAllocator allocator = IAllocator(allocatorAddress);

        // interactions
        _setAllocatorLimits(allocator, limits);
    }

    function setAllocatorLimits(uint256 id, AllocatorLimits memory limits) external override {
        // reads
        IAllocator allocator = allocators[id];

        // interactions
        _setAllocatorLimits(allocator, limits);
    }

    // either gain is in allocated or we can just fetch it via balances
    // so either gain > loss, loss == 0,
    // or gain < loss, gain == 0
    // or gain == 0 && loss == 0
    function report(
        uint256 id,
        uint128 gain,
        uint128 loss
    ) external override {
        // check before reading because might be common in some
        if (gain == 0 && loss == 0) return;

        // reads
        IAllocator allocator = allocators[id];
        AllocatorPerformance memory perf = allocatorData[allocator].performance;

        // checks
        _onlyAllocator(id, msg.sender);
        _allocatorActivated(allocator.status());

        // effect
        perf.gain += gain;
        perf.loss += loss;

        allocatorData[allocator].performance = perf;

        if (loss != 0) allocatorData[allocator].holdings.allocated -= loss;

        if (gain > loss) emit AllocatorReportedGain(id, gain);
        else emit AllocatorReportedLoss(id, loss);
    }

    function requestFundsFromTreasury(uint256 id, uint256 amount) external override {
        _requestFundsFromTreasury(allocators[id], amount);
    }

    function requestFundsFromTreasury(address allocatorAddress, uint256 amount) external override {
        _requestFundsFromTreasury(IAllocator(allocatorAddress), amount);
    }

    function returnFundsToTreasury(uint256 id, uint256 amount) external override {
        _returnFundsToTreasury(allocators[id], amount);
    }

    function returnFundsToTreasury(address allocatorAddress, uint256 amount) external override {
        _returnFundsToTreasury(IAllocator(allocatorAddress), amount);
    }

    function returnRewardsToTreasury(
        uint256 id,
        address token,
        uint256 amount
    ) external {
        _returnRewardsToTreasury(allocators[id], IERC20(token), amount);
    }

    function returnRewardsToTreasury(
        address allocatorAddress,
        address token,
        uint256 amount
    ) external {
        _returnRewardsToTreasury(IAllocator(allocatorAddress), IERC20(token), amount);
    }

    function getAllocatorByID(uint256 id) external view override returns (address allocatorAddress) {
        allocatorAddress = address(allocators[id]);
    }

    function getTotalValueAllocated() external view override returns (uint256) {
        return totalValueAllocated;
    }

    function getAllocatorLimits(uint256 id) external view override returns (AllocatorLimits memory) {
        return allocatorData[allocators[id]].limits;
    }

    function getAllocatorPerformance(uint256 id) external view override returns (AllocatorPerformance memory) {
        return allocatorData[allocators[id]].performance;
    }

    function getAllocatorAllocated(uint256 id) external view override returns (uint256) {
        return allocatorData[allocators[id]].holdings.allocated;
    }

    function _setAllocatorLimits(IAllocator allocator, AllocatorLimits memory limits) internal {
        // checks
        _onlyGuardian();
        _allocatorOffline(allocator.status());

        // effects
        allocatorData[allocator].limits = limits;

        // events
        emit AllocatorLimitsChanged(allocator.id(), limits.allocated, limits.loss);
    }

    function _requestFundsFromTreasury(IAllocator allocator, uint256 amount) internal {
        // reads
        AllocatorData memory data = allocatorData[allocator];
        address tokenAllocated = allocator.getToken();
        uint256 value = treasury.tokenValue(tokenAllocated, amount);

        // checks
        _onlyGuardian();
        _allocatorActivated(allocator.status());
        _allocatorBelowLimit(data, amount);

        // interaction (withdrawing)
        treasury.manage(tokenAllocated, amount);

        // effects
        totalValueAllocated += value;
        allocatorData[allocator].holdings.allocated += amount;

        // interaction (depositing)
        IERC20(tokenAllocated).safeTransfer(address(allocator), amount);

        // events
        emit AllocatorFunded(allocator.id(), amount, value);
    }

    function _returnFundsToTreasury(IAllocator allocator, uint256 amount) internal {
        // reads
        uint256 allocated = allocatorData[allocator].holdings.allocated;
        uint128 gain = allocatorData[allocator].performance.gain;

        if (amount > allocated) {
            amount -= allocated;
            if (amount > gain) {
                amount = allocated + gain;
                gain = 0;
            } else {
                // yes, amount should never > gain, we have safemath
                gain -= uint128(amount);
                amount += allocated;
            }
            allocated = 0;
        } else {
            allocated -= amount;
        }

        address tokenAllocated = allocator.getToken();
        uint256 value = treasury.tokenValue(tokenAllocated, amount);

        // checks
        _onlyGuardian();

        // interaction (withdrawing)
        IERC20(tokenAllocated).safeTransferFrom(address(allocator), address(this), amount);

        // effects
        totalValueAllocated -= value;
        allocatorData[allocator].holdings.allocated = allocated;
        if (allocated == 0) allocatorData[allocator].performance.gain = gain;

        // interaction (depositing)
        assert(treasury.deposit(amount, tokenAllocated, value) == 0);

        // events
        emit AllocatorWithdrawal(allocator.id(), amount, value);
    }

    function _returnRewardsToTreasury(
        IAllocator allocator,
        IERC20 token,
        uint256 amount
    ) internal {
        // reads
        uint256 balance = token.balanceOf(address(allocator));
        amount = (balance < amount) ? balance : amount;
        uint256 value = treasury.tokenValue(address(token), amount);

        // checks
        _onlyGuardian();

        // interactions
        token.safeTransferFrom(address(allocator), address(this), amount);

        assert(treasury.deposit(amount, address(token), value) == 0);

        // events
        emit AllocatorRewardsWithdrawal(allocator.id(), amount, value);
    }

    function _allocatorBelowLimit(AllocatorData memory data, uint256 amount) internal pure {
        require(data.holdings.allocated + amount <= data.limits.allocated, "TreasuryExtender::MaxAllocation");
    }
}
