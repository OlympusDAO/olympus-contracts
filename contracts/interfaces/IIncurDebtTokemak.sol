// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.8.4;

/// @notice simplified IncurDebt to work as a Tokemak controller
/// @dev this contract must be given OHMDEBTOR on the treasury
interface IIncurDebtTokemak {
    /* ========== TOKEMAK FUNCTIONS ========== */

    /**
     * @notice deposits gOHM to use as collateral
     * - msg.sender must be whitelisted
     * - this contract must have been approved _amount of gOHM
     * @dev will unwrap and hold as sOHM in this contract
     * @param _gOHMAmount amount of gOHM
     */
    function deposit(uint256 _gOHMAmount) external;

    /**
     * @notice deposits gOHM to use as collateral
     * - msg.sender must be whitelisted
     * - _ohmAmount must be <= availableDebt
     * @param _ohmAmount amount of OHM to borrow
     * @param _to address that will receive borrowed OHM
     */
    function borrow(uint256 _ohmAmount, address _to) external;

    /**
     * @notice deposits gOHM to use as collateral
     * - msg.sender must be whitelisted
     * - msg.sender's OHM allowance must be >= _ohmAmount 
     * @param _ohmAmount amount of OHM to borrow
     */
    function repay(uint256 _ohmAmount) external;

    /**
     * @notice gets available OHM to borrow for account
     * @param _account account to inspect
     * @return amount OHM available to borrow
     */
    function getAvailableToBorrow(address _account) external returns(uint256);

    /* ========== MANAGEMENT FUNCTIONS ========== */
    
    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - must be greater than or equal to existing debt
     * @param _limit in OHM
     */
    function setGlobalDebtLimit(uint256 _limit) external;
    
    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - limit must be less than globalDebtLimit
     * - borrower must not already be allowed
     * @param _account the address that will interact with contract
     * @param _debtLimit borrower's debt limit in OHM
     */
    function allowBorrower(address _account, uint256 _debtLimit) external;

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - borrower must not have outstanding debt
     * @param _account the address that will interact with contract
     */
    function revokeBorrower(address _account) external;

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - limit must be greater than or equal to borrower's outstanding debt
     * @param _account the address that will interact with contract
     * @param _debtLimit borrower's debt limit in OHM
     */
    function setBorrowerDebtLimit(address _account, uint256 _debtLimit) external;

    /**
     * @notice removes LP position, repays debt and returns tokens to owner
     * - onlyOwner (or governance)
     * @param _account the address that will interact with contract
     * @param _to where to send remaining gOHM
     */
    function forceRepay(
        address _account,
        address _to
    ) external returns (uint256);
}