pragma solidity ^0.8.10;

// interfaces
import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IAllocator.sol";
import "./interfaces/ITreasuryExtender.sol";

// types
import "./types/OlympusAccessControlledV2.sol";

// libraries
import "./libraries/SafeERC20.sol";

error TreasuryExtender_AllocatorOffline();
error TreasuryExtender_AllocatorNotActivated();
error TreasuryExtender_AllocatorNotOffline();
error TreasuryExtender_AllocatorRegistered(uint256 id);
error TreasuryExtender_OnlyAllocator(uint256 id, address sender);
error TreasuryExtender_MaxAllocation(uint256 allocated, uint256 limit);

/**
 * @title Treasury Extender
 * @notice
 *  This contract serves as an accounting and management contract which
 *  will interact with the Olympus Treasury to fund Allocators.
 *
 *  Accounting:
 *  For each Allocator there are multiple deposit IDs referring to individual tokens,
 *  for each deposit ID we record 5 distinct values grouped into 3 fields,
 *  together grouped as AllocatorData:
 *
 *  AllocatorLimits { allocated, loss } - This is the maximum amount
 *  an Allocator should have allocated at any point, and also the maximum
 *  loss an allocator should experience without automatically shutting down.
 *
 *  AllocatorPerformance { gain, loss } - This is the current gain (total - allocated)
 *  and the loss the Allocator sustained over its time of operation.
 *
 *  AllocatorHoldings { allocated } - This is the amount of tokens an Allocator
 *  has currently been allocated by the Extender.
 *
 *  Important: The above is only tracked in the underlying token specified by the ID,
 *  (see BaseAllocator.sol) while rewards are retrievable by the standard ERC20 functions.
 *  The point is that we only exactly track that which exits the Treasury.
 */
contract TreasuryExtender is OlympusAccessControlledV2, ITreasuryExtender {
    using SafeERC20 for IERC20;

    // The Olympus Treasury.
    ITreasury public immutable treasury;

    // Enumerable Allocators according to deposit IDs.
    /// @dev NOTE: Allocator enumeration starts from index 1.
    IAllocator[] public allocators;

    // Get an an Allocator's Data for for an Allocator and deposit ID
    mapping(IAllocator => mapping(uint256 => AllocatorData)) public allocatorData;

    constructor(address treasuryAddress, address authorityAddress)
        OlympusAccessControlledV2(IOlympusAuthority(authorityAddress))
    {
        treasury = ITreasury(treasuryAddress);
        // This nonexistent allocator at address(0) is pushed
        // as a placeholder so enumeration may start from index 1.
        allocators.push(IAllocator(address(0)));
    }

    //// CHECKS

    function _allocatorActivated(AllocatorStatus status) internal pure {
        if (AllocatorStatus.ACTIVATED != status) revert TreasuryExtender_AllocatorNotActivated();
    }

    function _allocatorOffline(AllocatorStatus status) internal pure {
        if (AllocatorStatus.OFFLINE != status) revert TreasuryExtender_AllocatorNotOffline();
    }

    function _onlyAllocator(
        IAllocator byStatedId,
        address sender,
        uint256 id
    ) internal pure {
        if (IAllocator(sender) != byStatedId) revert TreasuryExtender_OnlyAllocator(id, sender);
    }

    //// FUNCTIONS

    /**
     * @notice
     *  Registers an Allocator. Adds a deposit id and prepares storage slots for writing.
     *  Does not activate the Allocator.
     * @dev
     *  Calls `addId` from `IAllocator` with the index of the deposit in `allocators`
     * @param newAllocator the Allocator to be registered
     */
    function registerDeposit(address newAllocator) external override onlyGuardian {
        // reads
        IAllocator allocator = IAllocator(newAllocator);

        // effects
        allocators.push(allocator);

        uint256 id = allocators.length - 1;

        // interactions
        allocator.addId(id);

        // events
        emit NewDepositRegistered(newAllocator, address(allocator.tokens()[allocator.tokenIds(id)]), id);
    }

    /**
     * @notice
     *  Sets an Allocators AllocatorLimits.
     *  AllocatorLimits is part of AllocatorData, variable meanings follow:
     *  allocated - The maximum amount a Guardian may allocate this Allocator from Treasury.
     *  loss - The maximum loss amount this Allocator can take.
     * @dev
     *  Can only be called while the Allocator is offline.
     * @param id the deposit id to set AllocatorLimits for
     * @param limits the AllocatorLimits to set
     */
    function setAllocatorLimits(uint256 id, AllocatorLimits calldata limits) external override onlyGuardian {
        IAllocator allocator = allocators[id];

        // checks
        _allocatorOffline(allocator.status());

        // effects
        allocatorData[allocator][id].limits = limits;

        // events
        emit AllocatorLimitsChanged(id, limits.allocated, limits.loss);
    }

    /**
     * @notice
     *  Reports an Allocators status to the Extender.
     *  Updates Extender state accordingly.
     * @dev
     *  Can only be called while the Allocator is activated or migrating.
     *  The idea is that first the Allocator updates its own state, then
     *  it reports this state to the Extender, which then updates its own state.
     *
     *  There is 3 different combinations the Allocator may report:
     *
     *  (gain + loss) == 0, the Allocator will NEVER report this state
     *  gain > loss, gain is reported and incremented but allocated not.
     *  loss > gain, loss is reported, allocated and incremented.
     *  loss == gain == type(uint128).max , migration case, zero out gain, loss, allocated
     *
     *  NOTE: please take care to properly calculate loss by, say, only reporting loss above a % threshold
     *        of allocated. This is to serve as a low pass filter of sorts to ignore noise in price movements.
     *  NOTE: when migrating the next Allocator should report his state to the Extender, in say an `_activate` call.
     *
     * @param id the deposit id of the token to report state for
     * @param gain the gain the Allocator has made in allocated token
     * @param loss the loss the Allocator has sustained in allocated token
     */
    function report(
        uint256 id,
        uint128 gain,
        uint128 loss
    ) external override {
        // reads
        IAllocator allocator = allocators[id];
        AllocatorData storage data = allocatorData[allocator][id];
        AllocatorPerformance memory perf = data.performance;
        AllocatorStatus status = allocator.status();

        // checks
        _onlyAllocator(allocator, msg.sender, id);
        if (status == AllocatorStatus.OFFLINE) revert TreasuryExtender_AllocatorOffline();

        // EFFECTS
        if (gain >= loss) {
            // MIGRATION
            // according to above gain must equal loss because
            // gain can't be larger than max uint128 value
            if (loss == type(uint128).max) {
                AllocatorData storage newAllocatorData = allocatorData[allocators[allocators.length - 1]][id];

                newAllocatorData.holdings.allocated = data.holdings.allocated;
                newAllocatorData.performance.gain = data.performance.gain;
                data.holdings.allocated = 0;

                perf.gain = 0;
                perf.loss = 0;

                emit AllocatorReportedMigration(id);

                // GAIN
            } else {
                perf.gain += gain;

                emit AllocatorReportedGain(id, gain);
            }

            // LOSS
        } else {
            data.holdings.allocated -= loss;

            perf.loss += loss;

            emit AllocatorReportedLoss(id, loss);
        }

        data.performance = perf;
    }

    /**
     * @notice
     *  Requests funds from the Olympus Treasury to fund an Allocator.
     * @dev
     *  Can only be called while the Allocator is activated.
     *  Can only be called by the Guardian.
     *
     *  This function is going to allocate an `amount` of deposit id tokens to the Allocator and
     *  properly record this in storage. This done so that at any point, we know exactly
     *  how much was initially allocated and also how much value is allocated in total.
     *
     *  The related functions are `getAllocatorAllocated` and `getTotalValueAllocated`.
     *
     *  To note is also the `_allocatorBelowLimit` check.
     * @param id the deposit id of the token to fund allocator with
     * @param amount the amount of token to withdraw, the token is known in the Allocator
     */
    function requestFundsFromTreasury(uint256 id, uint256 amount) external override onlyGuardian {
        // reads
        IAllocator allocator = allocators[id];
        AllocatorData memory data = allocatorData[allocator][id];
        address token = address(allocator.tokens()[allocator.tokenIds(id)]);
        uint256 value = treasury.tokenValue(token, amount);

        // checks
        _allocatorActivated(allocator.status());
        _allocatorBelowLimit(data, amount);

        // interaction (withdrawing)
        treasury.manage(token, amount);

        // effects
        allocatorData[allocator][id].holdings.allocated += amount;

        // interaction (depositing)
        IERC20(token).safeTransfer(address(allocator), amount);

        // events
        emit AllocatorFunded(id, amount, value);
    }

    /**
     * @notice
     *  Returns funds from an Allocator to the Treasury.
     * @dev
     *  External hook: Logic is handled in the internal function.
     *  Can only be called by the Guardian.
     *
     *  This function is going to withdraw `amount` of allocated token from an Allocator
     *  back to the Treasury. Prior to calling this function, `deallocate` should be called,
     *  in order to prepare the funds for withdrawal.
     *
     *  The maximum amount which can be withdrawn is `gain` + `allocated`.
     *  `allocated` is decremented first after which `gain` is decremented in the case
     *  that `allocated` is not sufficient.
     * @param id the deposit id of the token to fund allocator with
     * @param amount the amount of token to withdraw, the token is known in the Allocator
     */
    function returnFundsToTreasury(uint256 id, uint256 amount) external override onlyGuardian {
        // reads
        IAllocator allocator = allocators[id];
        uint256 allocated = allocatorData[allocator][id].holdings.allocated;
        uint128 gain = allocatorData[allocator][id].performance.gain;
        address token = address(allocator.tokens()[allocator.tokenIds(id)]);

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

        uint256 value = treasury.tokenValue(token, amount);

        // checks
        _allowTreasuryWithdrawal(IERC20(token));

        // interaction (withdrawing)
        IERC20(token).safeTransferFrom(address(allocator), address(this), amount);

        // effects
        allocatorData[allocator][id].holdings.allocated = allocated;
        if (allocated == 0) allocatorData[allocator][id].performance.gain = gain;

        // interaction (depositing)
        assert(treasury.deposit(amount, token, value) == 0);

        // events
        emit AllocatorWithdrawal(id, amount, value);
    }

    /**
     * @notice
     *  Returns rewards from an Allocator to the Treasury.
     *  Also see `_returnRewardsToTreasury`.
     * @dev
     *  External hook: Logic is handled in the internal function.
     *  Can only be called by the Guardian.
     * @param id the deposit id of the token to fund allocator with
     * @param token the address of the reward token to withdraw
     * @param amount the amount of the reward token to withdraw
     */
    function returnRewardsToTreasury(
        uint256 id,
        address token,
        uint256 amount
    ) external {
        _returnRewardsToTreasury(allocators[id], IERC20(token), amount);
    }

    /**
     * @notice
     *  Returns rewards from an Allocator to the Treasury.
     *  Also see `_returnRewardsToTreasury`.
     * @dev
     *  External hook: Logic is handled in the internal function.
     *  Can only be called by the Guardian.
     * @param allocatorAddress the address of the Allocator to returns rewards from
     * @param token the address of the reward token to withdraw
     * @param amount the amount of the reward token to withdraw
     */
    function returnRewardsToTreasury(
        address allocatorAddress,
        address token,
        uint256 amount
    ) external {
        _returnRewardsToTreasury(IAllocator(allocatorAddress), IERC20(token), amount);
    }

    /**
     * @notice
     *  Get an Allocators address by it's ID.
     * @dev
     *  Our first Allocator is at index 1, NOTE: 0 is a placeholder.
     * @param id the id of the allocator, NOTE: valid interval: 1 =< id < allocators.length
     * @return allocatorAddress the allocator's address
     */
    function getAllocatorByID(uint256 id) external view override returns (address allocatorAddress) {
        allocatorAddress = address(allocators[id]);
    }

    /**
     * @notice
     *  Get the total number of Allocators ever registered.
     * @dev
     *  Our first Allocator is at index 1, 0 is a placeholder.
     * @return total number of allocators ever registered
     */
    function getTotalAllocatorCount() external view returns (uint256) {
        return allocators.length;
    }

    /**
     * @notice
     *  Get an Allocators limits.
     * @dev
     *  For an explanation of AllocatorLimits, see `setAllocatorLimits`
     * @return the Allocator's limits
     */
    function getAllocatorLimits(uint256 id) external view override returns (AllocatorLimits memory) {
        return allocatorData[allocators[id]][id].limits;
    }

    /**
     * @notice
     *  Get an Allocators performance.
     * @dev
     *  An Allocator's performance is the amount of `gain` and `loss` it has sustained in its
     *  lifetime. `gain` is the amount of allocated tokens (underlying) acquired, while
     *  `loss` is the amount lost. `gain` and `loss` are incremented separately.
     *  Thus, overall performance can be gauged as gain - loss
     * @return the Allocator's performance
     */
    function getAllocatorPerformance(uint256 id) external view override returns (AllocatorPerformance memory) {
        return allocatorData[allocators[id]][id].performance;
    }

    /**
     * @notice
     *  Get an Allocators amount allocated.
     * @dev
     *  This is simply the amount of `token` which was allocated to the allocator.
     * @return the Allocator's amount allocated
     */
    function getAllocatorAllocated(uint256 id) external view override returns (uint256) {
        return allocatorData[allocators[id]][id].holdings.allocated;
    }

    /**
     * @notice
     *  Returns rewards from an Allocator to the Treasury.
     * @dev
     *  External hook: Logic is handled in the internal function.
     *  Can only be called by the Guardian.
     *
     *  The assumption is that the reward tokens being withdrawn are going to be
     *  either deposited into the contract OR harvested into allocated (underlying).
     *
     *  For this reason we don't need anything other than `balanceOf`.
     * @param allocator the Allocator to returns rewards from
     * @param token the reward token to withdraw
     * @param amount the amount of the reward token to withdraw
     */
    function _returnRewardsToTreasury(
        IAllocator allocator,
        IERC20 token,
        uint256 amount
    ) internal onlyGuardian {
        // reads
        uint256 balance = token.balanceOf(address(allocator));
        amount = (balance < amount) ? balance : amount;
        uint256 value = treasury.tokenValue(address(token), amount);

        // checks
        _allowTreasuryWithdrawal(token);

        // interactions
        token.safeTransferFrom(address(allocator), address(this), amount);
        assert(treasury.deposit(amount, address(token), value) == 0);

        // events
        emit AllocatorRewardsWithdrawal(address(allocator), amount, value);
    }

    /**
     * @notice
     *  Approve treasury for withdrawing if token has not been approved.
     * @param token Token to approve.
     */
    function _allowTreasuryWithdrawal(IERC20 token) internal {
        if (token.allowance(address(this), address(treasury)) == 0) token.approve(address(treasury), type(uint256).max);
    }

    /**
     * @notice
     *  Check if token is below limit for allocation and if not approve it.
     * @param data allocator data to check limits and amount allocated
     * @param amount amount of tokens to allocate
     */
    function _allocatorBelowLimit(AllocatorData memory data, uint256 amount) internal pure {
        uint256 newAllocated = data.holdings.allocated + amount;
        if (newAllocated > data.limits.allocated)
            revert TreasuryExtender_MaxAllocation(newAllocated, data.limits.allocated);
    }
}
