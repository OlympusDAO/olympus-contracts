pragma solidity ^0.8.10;

// interfaces
import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";
import "../interfaces/ITreasuryExtender.sol";

// types
import "../types/OlympusAccessControlledV2.sol";

// libraries
import "../libraries/SafeERC20.sol";

error BaseAllocator_AllocatorOffline();
error BaseAllocator_AllocatorActivated();
error BaseAllocator_Migrating();
error BaseAllocator_NotMigrating();
error BaseAllocator_OnlyExtender(address sender);

/**
 * @title BaseAllocator
 * @notice
 *  This abstract contract serves as a template for writing new Olympus Allocators.
 *  Many of the functionalities regarding handling of Treasury funds by the Guardian have
 *  been delegated to the `TreasuryExtender` contract, and thus an explanation for them can be found
 *  in `TreasuryExtender.sol`.
 *
 *  The main purpose of this abstract contract and the `IAllocator` interface is to provide
 *  a unified framework for how an Allocator should behave. Below an explanation of how
 *  we expect an Allocator to behave in general, mentioning the most important points.
 *
 *  Activation:
 *   - An Allocator is first deployed with all necessary arguments. Thereafter,
 *     the allocator is registered with the `TreasuryExtender`.
 *   - Next, the Allocators allocation and loss limits are set via the extender function.
 *   - Finally, the Allocator is activated by calling `activate`.
 *
 *  Runtime:
 *   The Allocator is in communication with the Extender, it must inform the Extender
 *   what the status of the tokens is which were allocated. We only care about noting down
 *   their status in the Extender. A quick summary of the important functions on this topic:
 *
 *   - `update()` is the main function that deals with state reporting, where
 *     `_update()` is the internal function to implement, which should update Allocator
 *     internal state. update() then continues to report the Allocators state via `report`
 *     to the extender. `_update()` should handle _investment_ of funds present in Contract.
 *
 *   - `deallocate` should handle allocated token withdrawal, preparing the tokens to be withdrawn
 *     by the Extender. It is not necessary to handle approvals for this token, because it is automatically
 *     approved in the constructor. For other token withdrawals, it is assumed that reward tokens will
 *     either be sold into underlying (allocated) or that they will simply rest in the Contract, being reward tokens.
 *     Please also check function documentation.
 *
 *   - `rewardTokens` and `utilityTokens` should return the above mentioned simple reward tokens for the former case,
 *     while utility tokens should be those tokens which are continously reinvested or otherwise used by the contract
 *     in order to accrue more rewards. A reward token can also be a utility token, but then one must prepare them
 *     separately for withdrawal if they are to be returned to the treasury.
 *
 *  Migration & Deactivation:
 *   - `prepareMigration()` together with the virtual `_prepareMigration()` sets the state of the Allocator into
 *     MIGRATING, disabling further token deposits, enabling only withdrawals, and preparing all funds for withdrawal.
 *
 *   - `migrate` then executes the migration and also deactivates the Allocator.
 *
 *   - `deactivate` sets `status` to OFFLINE, meaning it simply deactivates the Allocator. It can be passed
 *     a panic boolean, meaning it handles deactivation logic in `deactivate`. The Allocator panic deactivates if
 *     this state if the loss limit is reached via `update`. The Allocator can otherwise also simply be deactivated
 *     and funds transferred back to the Treasury.
 *
 *  This was a short summary of the Allocator lifecycle.
 */
abstract contract BaseAllocator is OlympusAccessControlledV2, IAllocator {
    using SafeERC20 for IERC20;

    // The id of the Allocator as present in `TreasuryExtender`, `allocators`.
    uint256 public id;

    // The allocated (underlying) token of the Allocator
    IERC20 internal immutable token;

    // Allocator status: OFFLINE, ACTIVATED, MIGRATING
    AllocatorStatus public status;

    // The extender with which the Allocator communicates.
    ITreasuryExtender public extender;

    constructor(AllocatorInitData memory data) OlympusAccessControlledV2(IOlympusAuthority(data.authority)) {
        token = IERC20(data.token);
        extender = ITreasuryExtender(data.extender);

        token.safeApprove(data.extender, type(uint256).max);

        emit AllocatorDeployed(data.authority, data.token, data.extender);
    }

    /////// "MODIFIERS"

    function _onlyExtender(address sender) internal view {
        if (sender != address(extender)) revert BaseAllocator_OnlyExtender(sender);
    }

    function _onlyActivated(AllocatorStatus inputStatus) internal pure {
        if (inputStatus != AllocatorStatus.ACTIVATED) revert BaseAllocator_AllocatorOffline();
    }

    function _onlyOffline(AllocatorStatus inputStatus) internal pure {
        if (inputStatus != AllocatorStatus.OFFLINE) revert BaseAllocator_AllocatorActivated();
    }

    function _notMigrating(AllocatorStatus inputStatus) internal pure {
        if (inputStatus == AllocatorStatus.MIGRATING) revert BaseAllocator_Migrating();
    }

    function _isMigrating(AllocatorStatus inputStatus) internal pure {
        if (inputStatus != AllocatorStatus.MIGRATING) revert BaseAllocator_NotMigrating();
    }

    /////// VIRTUAL FUNCTIONS WHICH NEED TO BE IMPLEMENTED
    /////// SORTED BY EXPECTED COMPLEXITY AND DEPENDENCY

    /**
     * @notice
     *  Updates an Allocators state.
     * @dev
     *  This function should be implemented by the developer of the Allocator.
     *  This function should fulfill the following purposes:
     *   - invest all tokens deposited in the contract
     *   - handle rebalancing / harvesting as needed
     *   - calculate gain / loss and return those values
     *   - handle any other necessary runtime calculations, such as fees etc.
     *
     *  In essence, this function should update the main runtime state of the Allocator
     *  so that everything is properly invested, harvested, accounted for.
     */
    function _update() internal virtual returns (uint128 gain, uint128 loss);

    /**
     * @notice
     *  Deallocates tokens, prepares tokens for return to the Treasury.
     * @dev
     *  This function should deallocate (withdraw) `amounts` of each token so that they may be withdrawn
     *  by the TreasuryExtender. Otherwise, this function may also prepare the withdrawl if it is time-bound.
     *
     *  NOTE (IMPORTANT): amounts[0] is to be considered the amount of `token` to withdraw,
     *                    the rest should be utility tokens. This serves as a reminder that
     *  we consider reward tokens to either be harvested into allocated or simply contained
     *  in the contract.
     */
    function deallocate(uint256[] memory amounts) public virtual;

    /**
     * @notice
     *  Handles deactivation logic for the Allocator.
     */
    function _deactivate(bool panic) internal virtual;

    /**
     * @notice
     *  Handles migration preparatory logic.
     * @dev
     *  Within this function, the developer should arrange the withdrawal of all assets for migration.
     *  A useful function, say, to be passed into this could be `deallocate` with all of the amounts,
     *  so with n places for n-1 utility tokens + 1 allocated token, maxed out.
     */
    function _prepareMigration() internal virtual;

    /**
     * @notice
     *  Should estimate total rewards in reward tokens.
     */
    function estimateTotalRewards() public view virtual returns (uint256[] memory);

    /**
     * @notice
     *  Should estimate total amount of Allocated tokens
     * @dev
     *  The difference between this and `treasury.getAllocatorAllocated`, is that the latter is a static
     *  value recorded during reporting, but no data is available on _new_ amounts after reporting.
     *  Thus, this should take into consideration the new amounts. This can be used for say aTokens.
     */
    function estimateTotalAllocated() public view virtual returns (uint256);

    /**
     * @notice
     *  Should return all reward token addresses
     */
    function rewardTokens() public view virtual returns (address[] memory);

    /**
     * @notice
     *  Should return all utility token addresses
     */
    function utilityTokens() public view virtual returns (address[] memory);

    /**
     * @notice
     *  Should return the Allocator name
     */
    function name() external view virtual returns (string memory);

    /////// IMPLEMENTATION OPTIONAL

    /**
     * @notice
     *  Should handle activation logic
     * @dev
     *  If there is a need to handle any logic during activation, this is the function you should implement it into
     */
    function _activate() internal virtual {}

    /////// FUNCTIONS

    /**
     * @notice
     *  Receive to reject ether transfers. We only want
     *  Guardian depositing Ether into this contract.
     */
    receive() external payable {
        _onlyGuardian();
        emit EtherReceived(msg.value);
    }

    /**
     * @notice
     *  Updates an Allocators state and reports to `TreasuryExtender` if necessary.
     * @dev
     *  Can only be called by the Guardian.
     *  Can only be called while the Allocator is activated.
     *
     *  This function should update the Allocators internal state via `_update`, which should in turn
     *  return the `gain` and `loss` the Allocator has sustained in underlying allocated `token`.
     *  Please check the docs on `_update` to see what its function should be.
     *
     *  `_lossLimitViolated` checks if the Allocators is above its loss limit and deactivates it in case
     *  of serious losses. The loss limit should be set to some value which is unnacceptable to be lost
     *  in the case of normal runtime and thus require a panic shutdown, whatever it is defined to be.
     *
     *  Lastly, the Allocator reports its state to the Extender, which handles gain, loss, allocated logic.
     *  The documentation on this can be found in `TreasuryExtender.sol`.
     */
    function update() external override {
        // checks
        _onlyGuardian();
        _onlyActivated(status);

        // effects
        // handle depositing, harvesting, compounding logic inside of _update()
        // if gain is in allocated then gain > 0 otherwise gain == 0
        // we only use so we know initia
        // loss always in allocated
        (uint128 gain, uint128 loss) = _update();

        if (_lossLimitViolated(loss)) {
            deactivate(true);
            return;
        }

        // interactions
        // there is no interactions happening inside of report
        // so allocator has no state changes to make after it
        if (gain + loss > 0) extender.report(id, gain, loss);
    }

    /**
     * @notice
     *  Prepares the Allocator for token migration.
     * @dev
     *  This function prepares the Allocator for token migration by calling the to-be-implemented
     *  `_prepareMigration`, which should logically withdraw ALL allocated (1) + utility AND reward tokens
     *  from the contract. The ALLOCATED token and THE UTILITY TOKEN is going to be migrated, while the REWARD
     *  tokens can be withdrawn by the Extender to the Treasury.
     */
    function prepareMigration() external override {
        // checks
        _onlyGuardian();
        _notMigrating(status);

        // effects
        _prepareMigration();

        status = AllocatorStatus.MIGRATING;
    }

    /**
     * @notice
     *  Migrates the allocated and all utility tokens to the next Allocator.
     * @dev
     *  The allocated token and the utility tokens will be migrated by this function, while it is
     *  assumed that the reward tokens are either simply kept or already harvested into the underlying
     *  essentially being the edge case of this contract. This contract is also going to report to the
     *  Extender that a migration happened and as such it is important to follow the proper sequence of
     *  migrating.
     *
     *  Steps to migrate:
     *   - FIRST deploy the new Allocator and activate it according to the normal procedure.
     *   - IN THE MEANWHILE call `_prepareMigration()` to prepare funds for migration.
     *   - THEN call migrate. This is going to migrate the funds to the LAST allocator registered.
     *   - Check if everything went fine.
     *
     *  End state should be that allocator amounts have been swapped for allocators, that gain + loss is netted out 0
     *  for original allocator, and that the new allocators gain has been set to the original allocators gain.
     *  We don't transfer the loss because we have the information how much was initially invested + gain,
     *  and the new allocator didn't cause any loss thus we don't really need to add to it.
     */
    function migrate() external override {
        // reads
        address[] memory utilityTokensArray = utilityTokens();
        address newAllocator = extender.getAllocatorByID(extender.getTotalAllocatorCount() - 1);

        // checks
        _onlyGuardian();
        _isMigrating(status);

        // interactions
        token.safeTransfer(newAllocator, token.balanceOf(address(this)));

        for (uint256 i; i < utilityTokensArray.length; i++) {
            IERC20 utilityToken = IERC20(utilityTokensArray[i]);
            utilityToken.safeTransfer(newAllocator, utilityToken.balanceOf(address(this)));
        }

        // report migration
        extender.report(id, 1, 1);

        // turn off Allocator
        deactivate(false);

        emit MigrationExecuted(id, IAllocator(newAllocator).id());
    }

    /**
     * @notice
     *  Activates the Allocator.
     * @dev
     *  Only the Guardian can call this.
     *
     *  Add any logic you need during activation, say interactions with Extender or something else,
     *  in the virtual method `_activate`.
     */
    function activate() external override {
        // checks
        _onlyGuardian();
        _onlyOffline(status);

        // effects
        _activate();
        status = AllocatorStatus.ACTIVATED;

        emit AllocatorActivated(id);
    }

    /**
     * @notice
     *  Sets the ID of the Allocator.
     * @dev
     *  Only the Extender calls this.
     * @param allocatorId id of the allocator, to be set once.
     */
    function setId(uint256 allocatorId) external override {
        _onlyExtender(msg.sender);
        id = allocatorId;
    }

    /**
     * @notice
     *  Deactivates the Allocator.
     * @dev
     *  Only the Guardian can call this.
     *
     *  Add any logic you need during deactivation, say interactions with Extender or something else,
     *  in the virtual method `_deactivate`. Be careful to specifically use the internal or public function
     *  depending on what you need.
     * @param panic should panic logic be executed
     */
    function deactivate(bool panic) public override {
        // checks
        _onlyGuardian();

        // effects
        _deactivate(panic);
        status = AllocatorStatus.OFFLINE;

        emit AllocatorDeactivated(id, panic);
    }

    /**
     * @notice
     *  Getter for allocated Token
     * @return the address of the allocated (underlying) token
     */
    function getToken() external view override returns (address) {
        return address(token);
    }

    /**
     * @notice
     *  Getter for Allocator version.
     * @return Returns the Allocators version.
     */
    function version() public pure override returns (string memory) {
        return "v2.0.0";
    }

    /**
     * @notice
     *  Internal check if the loss limit has been violated by the Allocator.
     * @dev
     *  Called as part of `update`. The rule is that the already sustained loss + newly sustained
     *  has to be larger or equal to the limit to break the contract.
     * @param loss the amount of newly sustained loss
     * @return true if the the loss limit has been broken
     */
    function _lossLimitViolated(uint128 loss) internal returns (bool) {
        // read
        uint128 lastLoss = extender.getAllocatorPerformance(id).loss;

        // events
        if ((loss + lastLoss) >= extender.getAllocatorLimits(id).loss) {
            emit LossLimitViolated(lastLoss, loss, estimateTotalAllocated());
            return true;
        }

        return false;
    }
}
