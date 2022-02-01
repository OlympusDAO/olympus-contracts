// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";

/**
    @title YieldSplitter
    @notice Abstract contract that allows users to create deposits for their gOHM and have
            their yield claimable by the specified recipient party. This contract's functions
            are designed to be as generic as possible. This contract's responsibility is
            the accounting of the yield splitting. All other logic such as error handling,
            emergency controls, sending and recieving gOHM is up to the implementation of
            this abstract contract to handle.
 */
abstract contract YieldSplitter {
    using SafeERC20 for IERC20;

    address public immutable gOHM;

    struct DepositInfo {
        uint256 id;
        address depositor;
        address recipient;
        uint256 principalAmount; // Total amount of sOhm deposited as principal, 9 decimals.
        uint256 agnosticAmount; // Total amount deposited priced in gOhm. 18 decimals.
    }

    uint256 public idCount;
    mapping(uint256 => DepositInfo) public depositInfo; // depositId -> DepositInfo
    mapping(address => uint256[]) public depositorIds; // address -> Array of the deposit id's deposited by user
    mapping(address => uint256[]) public recipientIds; // address -> Array of the deposit id's user is recipient of

    /**
        @notice Constructor
        @param gOHM_ Address of gOHM.
    */
    constructor(address gOHM_) {
        gOHM = gOHM_;
    }

    /**
        @notice Create a deposit.
        @param depositor_ Address of depositor
        @param amount_ Amount in gOhm. 18 decimals.
        @param recipient_ Address to direct staking yield to.
    */
    function _deposit(
        address depositor_,
        address recipient_,
        uint256 amount_
    ) internal returns (uint256 depositId) {
        depositorIds[depositor_].push(idCount);
        recipientIds[recipient_].push(idCount);

        depositInfo[idCount] = DepositInfo({
            id: idCount,
            depositor: depositor_,
            recipient: recipient_,
            principalAmount: IgOHM(gOHM).balanceFrom(amount_),
            agnosticAmount: amount_
        });

        depositId = idCount;
        idCount++;
    }

    /**
        @notice Add more gOhm to the depositor's principal deposit.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOhm to add. 18 decimals.
    */
    function _addToDeposit(uint256 id_, uint256 amount_) internal {
        DepositInfo storage userDeposit = depositInfo[id_];
        userDeposit.principalAmount += IgOHM(gOHM).balanceFrom(amount_);
        userDeposit.agnosticAmount += amount_;
    }

    /**
        @notice Withdraw part of the principal amount deposited.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOHM to withdraw.
    */
    function _withdrawPrincipal(uint256 id_, uint256 amount_) internal {
        DepositInfo storage userDeposit = depositInfo[id_];
        userDeposit.principalAmount -= IgOHM(gOHM).balanceFrom(amount_); // Reverts if amount > principal due to underflow
        userDeposit.agnosticAmount -= amount_;
    }

    /**
        @notice Redeem excess yield from your deposit in sOHM.
        @param id_ Id of the deposit.
        @return amountRedeemed : amount of yield redeemed in gOHM. 18 decimals.
    */
    function _redeemYield(uint256 id_) internal returns (uint256 amountRedeemed) {
        DepositInfo storage userDeposit = depositInfo[id_];

        amountRedeemed = _getOutstandingYield(userDeposit.principalAmount, userDeposit.agnosticAmount);
        userDeposit.agnosticAmount = IgOHM(gOHM).balanceTo(userDeposit.principalAmount);
    }

    /**
        @notice Redeem all excess yield from your all deposits recipient can redeem from.
        @param recipient_ Recipient that wants to redeem their yield.
        @return amountRedeemed : amount of yield redeemed in gOHM. 18 decimals.
    */
    function _redeemAllYield(address recipient_) internal returns (uint256 amountRedeemed) {
        uint256[] storage recipientIdsArray = recipientIds[recipient_]; // Could probably optimise for gas. TODO later.

        for (uint256 i = 0; i < recipientIdsArray.length; i++) {
            DepositInfo storage currentDeposit = depositInfo[recipientIdsArray[i]];
            amountRedeemed += _getOutstandingYield(currentDeposit.principalAmount, currentDeposit.agnosticAmount);
            currentDeposit.agnosticAmount = IgOHM(gOHM).balanceTo(currentDeposit.principalAmount);
        }
    }

    /**
        @notice Close a deposit. Remove all information in both the deposit info, depositorIds and recipientIds.
        @param id_ Id of the deposit.
        @dev Internally for accounting reasons principal amount is stored in 9 decimal OHM terms. 
        Since most implementations will work will gOHM, principal here is returned externally in 18 decimal gOHM terms.
        @return principal : amount of principal that was deleted. in gOHM. 18 decimals.
        @return agnosticAmount : total amount of gOHM deleted. Principal + Yield. 18 decimals.
    */
    function _closeDeposit(uint256 id_) internal returns (uint256 principal, uint256 agnosticAmount) {
        principal = IgOHM(gOHM).balanceTo(depositInfo[id_].principalAmount);
        agnosticAmount = depositInfo[id_].agnosticAmount;

        uint256[] storage depositorIdsArray = depositorIds[depositInfo[id_].depositor];
        for (uint256 i = 0; i < depositorIdsArray.length; i++) {
            if (depositorIdsArray[i] == id_) {
                // Remove id from depositor's ids array
                depositorIdsArray[i] = depositorIdsArray[depositorIdsArray.length - 1]; // Delete integer from array by swapping with last element and calling pop()
                depositorIdsArray.pop();
                break;
            }
        }

        uint256[] storage recipientIdsArray = depositorIds[depositInfo[id_].recipient];
        for (uint256 i = 0; i < recipientIdsArray.length; i++) {
            if (recipientIdsArray[i] == id_) {
                // Remove id from depositor's ids array
                recipientIdsArray[i] = recipientIdsArray[recipientIdsArray.length - 1]; // Delete integer from array by swapping with last element and calling pop()
                recipientIdsArray.pop();
                break;
            }
        }

        delete depositInfo[id_];
    }

    /**
        @notice Calculate outstanding yield redeemable based on principal and agnosticAmount.
        @return uint256 amount of yield in gOHM. 18 decimals.
     */
    function _getOutstandingYield(uint256 principal_, uint256 agnosticAmount_) internal view returns (uint256) {
        return agnosticAmount_ - IgOHM(gOHM).balanceTo(principal_);
    }
}