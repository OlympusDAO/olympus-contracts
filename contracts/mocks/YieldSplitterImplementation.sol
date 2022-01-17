// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {YieldSplitter} from "../types/YieldSplitter.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";

/**
    @title YieldSplitterImpl
    @notice Implements the abstract contract Yield Splitter by making all the internal functions public for testing purposes.
*/
contract YieldSplitterImpl is YieldSplitter {
    /**
    @notice Constructor
    @param gOHM_ Address of gOHM.
    */
    constructor(address gOHM_) YieldSplitter(gOHM_) {}

    /**
        @notice Create a deposit.
        @param depositor_ Address of depositor
        @param amount_ Amount in gOhm. 18 decimals.
        @param recipient_ Address to direct staking yield to.
    */
    function deposit(
        address depositor_,
        address recipient_,
        uint256 amount_
    ) external returns (uint256 depositId) {
        depositId = _deposit(depositor_, recipient_, amount_);
    }

    /**
        @notice Add more gOhm to the depositor's principal deposit.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOhm to add. 18 decimals.
    */
    function addToDeposit(uint256 id_, uint256 amount_) external {
        _addToDeposit(id_, amount_);
    }

    /**
        @notice Withdraw part of the principal amount deposited.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOHM to withdraw.
    */
    function withdrawPrincipal(uint256 id_, uint256 amount_) external {
        _withdrawPrincipal(id_, amount_);
    }

    /**
        @notice Redeem excess yield from your deposit in sOHM.
        @param id_ Id of the deposit.
        @return amountRedeemed : amount of yield redeemed in gOHM. 18 decimals.
    */
    function redeemYield(uint256 id_) external returns (uint256) {
        uint256 amountRedeemed = _redeemYield(id_);
        return amountRedeemed;
    }

    /**
        @notice Redeem all excess yield from your all deposits recipient can redeem from.
        @param recipient_ Recipient that wants to redeem their yield.
        @return amountRedeemed : amount of yield redeemed in gOHM. 18 decimals.
    */
    function redeemAllYield(address recipient_) external returns (uint256 amountRedeemed) {
        amountRedeemed = _redeemAllYield(recipient_);
    }

    /**
        @notice Close a deposit. Remove all information in both the deposit info, depositorIds and recipientIds.
        @param id_ Id of the deposit.
        @dev Internally for accounting reasons principal amount is stored in 9 decimal OHM terms. 
        Since most implementations will work will gOHM, principal here is returned externally in 18 decimal gOHM terms.
        @return principal : amount of principal that was deleted. in gOHM. 18 decimals.
        @return agnosticAmount : total amount of gOHM deleted. Principal + Yield. 18 decimals.
    */
    function closeDeposit(uint256 id_) external returns (uint256 principal, uint256 agnosticAmount) {
        (principal, agnosticAmount) = _closeDeposit(id_);
    }

    /**
        @notice Calculate outstanding yield redeemable based on principal and agnosticAmount.
        @return uint256 amount of yield in gOHM. 18 decimals.
     */
    function getOutstandingYield(uint256 principal_, uint256 agnosticAmount_) external view returns (uint256) {
        return _getOutstandingYield(principal_, agnosticAmount_);
    }
}
