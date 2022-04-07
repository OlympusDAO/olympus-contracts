// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.8.4;

/// See https://www.notion.so/olympusdao/Requirements-Accelerated-Liquidity-3bd9dbc297c14e3498d5e596576c7a39
/// only applicable for "Partner A"
/// @dev this contract must be given OHMDEBTOR on the treasury
interface IIncurDebt {
    /* ========== PARTNER FUNCTIONS ========== */

    /**
     * @notice deposits gOHM to use as collateral
     * - msg.sender must be whitelisted
     * - this contract must have been approved _amount
     * @dev will unwrap and hold as sOHM in this contract
     * @param _amount amount of gOHM
     */
    function deposit(uint256 _amount) external;

    /**
     * @notice creates an LP position by borrowing OHM
     * - msg.sender must be whitelisted
     * - the strategy must be whitelisted
     * - the strategy contract must have been approved _pairAmount of _pairToken
     * - _ohmAmount must be less than or equal to available debt
     * @dev how to handle slippage?
     * @dev how to make generic across all AMMs?
     * @param _ohmAmount the desired amount of OHM to borrow
     * @param _strategy the address of the AMM strategy to use
     * @param _strategyParams strategy-specific params
     * @return amount of LP tokens created
     */
    function createLP(
        uint256 _ohmAmount,
        address _strategy,
        bytes calldata _strategyParams
    ) external returns (uint256);

    /**
     * @notice unwinds an LP position and pays off OHM debt
     * @param _strategy the address of the AMM strategy to use
     * @param _to the address to send the withdrawn pair tokens
     * @return amount of _pair token send to _to
     */
    function removeLP(
        address _strategy,
        bytes calldata _strategyParams,
        address _to
    ) external returns (uint256);

    /**
     * @notice sends all LP tokens to _to address
     * - msg.sender must be whitelisted
     * - msg.sender must be debt-free
     * @param _pairToken token paired with OHM
     * @param _strategy address of AMM strategy
     * @param _to address to send LP token
     */
    function withdrawLP(
        address _pairToken,
        address _strategy,
        address _to
    ) external;

    /**
     * @notice withdraws gOHM  to _to address
     * - msg.sender must be whitelisted
     * - _amount (in OHM) must be less than or equal to depositedOhm - debt
     * @param _amount amount of gOHM to withdraw
     * @param _to address to send gOHM
     */
    function withdrawgOHM(uint256 _amount, address _to) external;

    /**
     * @notice repays debt using deposited OHM
     * - msg.sender must be whitelisted
     * - afterwards account balance is depositedOhm - debtOhm
     */
    function repayWithExcessOHM() external;

    /**
     * @notice returns OHM available to borrow
     * @return amount of OHM
     */
    function getAvailableToBorrow() external returns (uint256);

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
     * @param _limit borrower's debt limit in OHM
     */
    function allowBorrower(address _account, uint256 _limit) external;

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
     * @param _limit borrower's debt limit in OHM
     */
    function setBorrowerDebtLimit(address _account, uint256 _limit) external;

    /**
     * @notice removes LP position, repays debt and returns tokens to owner
     * - onlyOwner (or governance)
     * - strategy must be known (can be revoked)
     * @param _account the address that will interact with contract
     * @param _strategy the address of the AMM strategy to use
     * @param _strategyParams strategy-specific params
     * @param _to where to send remaining OHM and other tokens
     */
    function forceRepay(
        address _account,
        address _strategy,
        bytes calldata _strategyParams,
        address _to
    ) external returns (uint256);

    /**
     * @notice allows the strategy to be used by lenders
     * - onlyOwner (or governance)
     * - strategy must not be zero address
     * - strategy must be a contract
     * @param _strategy the address of the AMM strategy to allow
     */
    function allowStrategy(address _strategy) external;

    /**
     * @notice disallows the strategy to be used by lenders
     * - onlyOwner (or governance)
     * - strategy must allowed
     * @param _strategy the address of the AMM strategy to allow
     */
    function revokeStrategy(address _strategy) external;
}
