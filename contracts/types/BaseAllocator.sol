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

abstract contract BaseAllocator is OlympusAccessControlledV2, IAllocator {
    using SafeERC20 for IERC20;

    uint256 public id;

    IERC20 internal immutable token;

    AllocatorStatus public status;

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

    function _update() internal virtual returns (uint128 gain, uint128 loss);

    function deallocate(uint256 amount) public virtual;

    function _deactivate(bool panic) internal virtual;

    function _prepareMigration() internal virtual;

    function estimateTotalRewards() public view virtual returns (uint256[] memory);

    function estimateTotalAllocated() public view virtual returns (uint256);

    function rewardTokens() public view virtual returns (address[] memory);

    function utilityTokens() public view virtual returns (address[] memory);

    function name() external view virtual returns (string memory);

    /////// IMPLEMENTATION OPTIONAL

    function _activate() internal virtual {}

    /////// FUNCTIONS

    receive() external payable {
        _onlyGuardian();
        emit EtherReceived(msg.value);
    }

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

    function prepareMigration() external override {
        // checks
        _onlyGuardian();
        _notMigrating(status);

        // effects
        _prepareMigration();

        status = AllocatorStatus.MIGRATING;
    }

    function migrate(address newAllocator) external override {
        // reads
        address[] memory utilityTokensArray = utilityTokens();

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

        deactivate(false);

        emit MigrationExecuted(id, IAllocator(newAllocator).id());
    }

    function activate() external override {
        // checks
        _onlyGuardian();
        _onlyOffline(status);

        // effects
        _activate();
        status = AllocatorStatus.ACTIVATED;

        emit AllocatorActivated(id);
    }

    function setId(uint256 allocatorId) external override {
        _onlyExtender(msg.sender);
        id = allocatorId;
    }

    function deactivate(bool panic) public override {
        // checks
        _onlyGuardian();

        // effects
        _deactivate(panic);
        status = AllocatorStatus.OFFLINE;

        emit AllocatorDeactivated(id, panic);
    }

    function getToken() external view override returns (address) {
        return address(token);
    }

    function version() public pure override returns (string memory) {
        return "v2.0.0";
    }

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
