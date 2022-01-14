pragma solidity ^0.8.10;

// interfaces
import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";
import "../interfaces/ITreasuryExtender.sol";

// types
import "../types/OlympusAccessControlledImproved.sol";

// libraries
import "../libraries/SafeERC20.sol";

abstract contract BaseAllocator is OlympusAccessControlledImproved, IAllocator {
    using SafeERC20 for IERC20;

    IERC20 private immutable tokenAllocated;
    uint256 public immutable id;

    AllocatorStatus public status;

    ITreasury public treasury;

    ITreasuryExtender public extender;

    constructor(AllocatorInitData memory data) OlympusAccessControlledImproved(IOlympusAuthority(authority)) {
        id = data.id;
        tokenAllocated = IERC20(data.token);
        treasury = ITreasury(data.treasury);
        extender = ITreasuryExtender(data.extender);

        tokenAllocated.safeApprove(data.treasury, type(uint256).max);
    }

    function update() external virtual;

    function deallocateTokens(uint256 amount) external virtual;

    function prepareMigration() external virtual;

    function name() external view virtual returns (string memory);

    function utilityTokens() public view virtual returns (address[] memory);

    function rewardTokens() public view virtual returns (address[] memory);

    function migrate(address newAllocator) external override {
        _onlyGuardian();
        tokenAllocated.safeTransfer(newAllocator, tokenAllocated.balanceOf(address(this)));

        address[] memory utilityTokensArray = utilityTokens();

        for (uint256 i; i < utilityTokensArray.length; i++) {
            IERC20 utilityToken = IERC20(utilityTokensArray[i]);
            utilityToken.safeTransfer(newAllocator, utilityToken.balanceOf(address(this)));
        }
    }

    function activate() external override {
        _onlyGuardian();
        _activate();
        status = AllocatorStatus.ACTIVATED;
    }

    function deactivate(bool panic) external override {
        _onlyGuardian();
        _deactivate(panic);
        status = AllocatorStatus.OFFLINE;
    }

    function getTokenAllocated() external view override returns (address) {
        return address(tokenAllocated);
    }

    function version() public pure override returns (string memory) {
        return "v2.0.0";
    }

    function _deactivate(bool panic) internal virtual;

    function _activate() internal virtual {}
}
