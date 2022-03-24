// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.8.4;

/// @notice simplified IncurDebt to work as a Tokemak controller
/// @dev this contract must be given OHMDEBTOR on the treasury
interface IIncurDebtV1 {
    /* ========== TOKEMAK FUNCTIONS ========== */

    /**
     * @notice deposits gOHM/sOHM to use as collateral
     * - msg.sender must be a borrower
     * - this contract must have been approved _amount
     * @dev will unwrap and hold as sOHM in this contract
     * @param _amount amount of gOHM/sOHM
     * @param _token token(gOHM/sOHM) to deposit with
     */
    function deposit(uint256 _amount, address _token) external;

    /**
     * @notice allow borrowers to borrow OHM
     * - msg.sender must be a borrower
     * - _ohmAmount must be less than or equal to borrowers debt limit
     * - _ohmAmount must be less than or equal to borrowers available loan limit
     * @param _ohmAmount amount of OHM to borrow
     */
    function borrow(uint256 _ohmAmount) external;

    /**
     * @notice withdraws gOHM/sOHM  to _to address
     * - msg.sender must be a borrower
     * - _amount (in OHM) must be less than or equal to depositedOhm - debt
     * @param _amount amount of gOHM/sOHM to withdraw
     * @param _to address to send _amount
     * @param _token token to send _amount
     */
    function withdraw(
        uint256 _amount,
        address _to,
        address _token
    ) external;

    /**
     * @notice repay debt with collateral
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     */
    function repayDebtWithCollateral() external;

    /**
     * @notice repay debt with collateral and withdraw the accrued earnings to sOHM/gOHM
     * - msg.sender must be a borrower
     * - borrower must have outstanding debt
     * @param _tokenToReceiveExcess amount of OHM to borrow
     */
    function repayDebtWithCollateralAndWithdrawTheRest(address _tokenToReceiveExcess) external;

    /**
     * @notice deposits OHM to pay debt
     * - msg.sender must be a borrower
     * - msg.sender's OHM allowance must be >= _ohmAmount
     * - borrower must have outstanding debt
     * @param _ohmAmount amount of OHM to borrow
     */
    function repayDebtWithOHM(uint256 _ohmAmount) external;

    /**
     * @notice updates borrowers sOHM collateral to current index
     * @param _borrower borrowers address
     */
    function updateCollateralInSOHM(address _borrower) external;

    /**
     * @notice gets available OHM to borrow for account
     * @return amount OHM available to borrow
     */
    function getAvailableToBorrow() external view returns (uint256);

    /* ========== MANAGEMENT FUNCTIONS ========== */

    /**
     * @notice sets the maximum debt limit for the system
     * - onlyOwner (or governance)
     * - must be greater than or equal to existing debt
     * @param _limit in OHM
     */
    function setGlobalDebtLimit(uint256 _limit) external;

    /**
     * @notice lets a user become a borrower
     * - onlyOwner (or governance)
     * - user must not be borrower
     * @param _borrower the address that will interact with contract
     */
    function allowBorrower(address _borrower) external;

    /**
     * @notice sets the maximum debt limit for a borrower
     * - onlyOwner (or governance)
     * - limit must be greater than or equal to borrower's outstanding debt
     * - limit must be less than or equal to the global debt limit
     * @param _borrower the address that will interact with contract
     * @param _limit borrower's debt limit in OHM
     */
    function setBorrowerDebtLimit(address _borrower, uint256 _limit) external;

    /**
     * @notice revoke user right to borrow
     * - onlyOwner (or governance)
     * - user must be borrower
     * - borrower must not have outstanding debt
     * @param _borrower the address that will interact with contract
     */
    function revokeBorrower(address _borrower) external;

    /**
     * @notice repays debt using collateral and returns remaining tokens to borrower
     * - onlyOwner (or governance)
     * - sends remaining tokens to owner in sOHM
     * @param _borrower the address that will interact with contract
     * @param _to where to send remaining sOHM
     */
    function forceRepay(address _borrower, address _to) external;

    /**
     * @notice seize and burn _borrowers collateral and forgive debt
     * - will burn all collateral, including excess of debt
     * - onlyGovernance
     * @param _borrower the account to seize
     */
    function seize(address _borrower) external;
}
