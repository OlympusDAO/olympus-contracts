/// SPDX-License-Identifier: AGPl-3.0
pragma solidity ^0.8.10;

/// Local interface imports
import "../interfaces/IERC20.sol";
import "../interfaces/IStaking.sol";

/// Local type imports
import "../types/OlympusAccessControlled.sol";

/// Local library imports
import "../libraries/SafeERC20.sol";

/// Bophades Vault Interfaces
interface IBophadesVault {
    function deposit(uint256 assets_, address receiver_) external returns (uint256);
}

/// Types
enum Token {
    SOHM,
    GOHM
}

/// Errors
error InvalidAddress();
error MigrationDisabled();

contract BophadesTokenMigrator is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    /*///////////////////////////////////////////////////////////////
                              EVENTS
    //////////////////////////////////////////////////////////////*/

    event Migrated(Token from_, Token to_, uint256 amount_);

    /*///////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    IBophadesVault public immutable sOHMVault;
    IBophadesVault public immutable gOHMVault;
    IERC20 public immutable OHM;
    IERC20 public immutable sOHM;
    IERC20 public immutable gOHM;
    IStaking public immutable oldStaking;

    bool public enabled;

    constructor(
        address sOHMVault_,
        address gOHMVault_,
        address OHM_,
        address sOHM_,
        address gOHM_,
        address oldStaking_,
        address authority_
    ) OlympusAccessControlled(IOlympusAuthority(authority_)) {
        if (
            sOHMVault_ == address(0) ||
            gOHMVault_ == address(0) ||
            OHM_ == address(0) ||
            sOHM_ == address(0) ||
            gOHM_ == address(0) ||
            oldStaking_ == address(0)
        ) revert InvalidAddress();

        sOHMVault = IBophadesVault(sOHMVault_);
        gOHMVault = IBophadesVault(gOHMVault_);
        OHM = IERC20(OHM_);
        sOHM = IERC20(sOHM_);
        gOHM = IERC20(gOHM_);
        oldStaking = IStaking(oldStaking_);
    }

    /*///////////////////////////////////////////////////////////////
                                MIGRATION
    //////////////////////////////////////////////////////////////*/

    function migrate(
        uint256 amount_,
        Token from_,
        Token to_
    ) external returns (uint256) {
        if (!enabled) revert MigrationDisabled();

        bool isSohm = from_ == Token.SOHM;

        if (isSohm) {
            sOHM.transferFrom(msg.sender, address(this), amount_);
        } else {
            gOHM.transferFrom(msg.sender, address(this), amount_);
        }

        uint256 ohmAmount = _unstake(amount_, isSohm);

        uint256 shares = _bophadesDeposit(ohmAmount, to_);

        emit Migrated(from_, to_, amount_);

        return shares;
    }

    function migrateAll(Token to_) external returns (uint256) {
        if (!enabled) revert MigrationDisabled();

        uint256 sohmBal = sOHM.balanceOf(msg.sender);
        uint256 gohmBal = gOHM.balanceOf(msg.sender);

        /// Rewriting logic here because calling migrate twice will cost the user more gas
        sOHM.transferFrom(msg.sender, address(this), sohmBal);
        gOHM.transferFrom(msg.sender, address(this), gohmBal);

        uint256 sohmToOhm = _unstake(sohmBal, true);
        uint256 gohmToOhm = _unstake(gohmBal, false);

        uint256 ohmAmount = sohmToOhm + gohmToOhm;

        uint256 shares = _bophadesDeposit(ohmAmount, to_);

        emit Migrated(Token.SOHM, to_, sohmBal);
        emit Migrated(Token.GOHM, to_, gohmBal);

        return shares;
    }

    /*///////////////////////////////////////////////////////////////
                            INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _unstake(uint256 amount_, bool sohm_) internal returns (uint256 ohmAmount) {
        ohmAmount = oldStaking.unstake(address(this), amount_, false, sohm_);
    }

    function _bophadesDeposit(uint256 amount_, Token to_) internal returns (uint256 shares) {
        if (to_ == Token.SOHM) {
            shares = sOHMVault.deposit(amount_, msg.sender);
        } else {
            shares = gOHMVault.deposit(amount_, msg.sender);
        }
    }

    /*///////////////////////////////////////////////////////////////
                            CONTROL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function flipEnabled() external onlyPolicy {
        enabled = !enabled;
    }
}
