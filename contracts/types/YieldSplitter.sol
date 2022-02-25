// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";

/**
    @title IOHMIndexWrapper
    @notice This interface is used to wrap cross-chain oracles to feed an index without needing IsOHM, 
    while also being able to use sOHM on mainnet.
 */
interface IOHMIndexWrapper {
    function index() external view returns (uint256 index);
}

error YieldSplitter_NotYourDeposit();

/**
    @title YieldSplitter
    @notice Abstract contract that allows users to create deposits for their gOHM and have
            their yield claimable by the specified recipient party. This contract's functions
            are designed to be as generic as possible. This contract's responsibility is
            the accounting of the yield splitting and some error handling. All other logic such as
            emergency controls, sending and recieving gOHM is up to the implementation of
            this abstract contract to handle.
 */
abstract contract YieldSplitter {
    using SafeERC20 for IERC20;

    IOHMIndexWrapper public immutable indexWrapper;

    struct DepositInfo {
        uint256 id;
        address depositor;
        uint256 principalAmount; // Total amount of sOhm deposited as principal, 9 decimals.
        uint256 agnosticAmount; // Total amount deposited priced in gOhm. 18 decimals.
    }

    uint256 public idCount;
    mapping(uint256 => DepositInfo) public depositInfo; // depositId -> DepositInfo
    mapping(address => uint256[]) public depositorIds; // address -> Array of the deposit id's deposited by user

    /**
        @notice Constructor
        @param indexWrapper_ Address of contract that will return the sOHM to gOHM index. 
                             On mainnet this will be sOHM but on other chains can be an oracle wrapper.
    */
    constructor(address indexWrapper_) {
        indexWrapper = IOHMIndexWrapper(indexWrapper_);
    }

    /**
        @notice Create a deposit.
        @param depositor_ Address of depositor
        @param amount_ Amount in gOhm. 18 decimals.
    */
    function _deposit(address depositor_, uint256 amount_) internal returns (uint256 depositId) {
        depositorIds[depositor_].push(idCount);

        depositInfo[idCount] = DepositInfo({
            id: idCount,
            depositor: depositor_,
            principalAmount: _fromAgnostic(amount_),
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
    function _addToDeposit(
        uint256 id_,
        uint256 amount_,
        address depositorAddress
    ) internal {
        if (depositInfo[id_].depositor != depositorAddress) revert YieldSplitter_NotYourDeposit();

        DepositInfo storage userDeposit = depositInfo[id_];
        userDeposit.principalAmount += _fromAgnostic(amount_);
        userDeposit.agnosticAmount += amount_;
    }

    /**
        @notice Withdraw part of the principal amount deposited.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOHM to withdraw.
    */
    function _withdrawPrincipal(
        uint256 id_,
        uint256 amount_,
        address depositorAddress
    ) internal {
        if (depositInfo[id_].depositor != depositorAddress) revert YieldSplitter_NotYourDeposit();

        DepositInfo storage userDeposit = depositInfo[id_];
        userDeposit.principalAmount -= _fromAgnostic(amount_); // Reverts if amount > principal due to underflow
        userDeposit.agnosticAmount -= amount_;
    }

    /**
        @notice Withdraw all of the principal amount deposited.
        @param id_ Id of the deposit.
        @return amountWithdrawn : amount of gOHM withdrawn. 18 decimals.
    */
    function _withdrawAllPrincipal(uint256 id_, address depositorAddress) internal returns (uint256 amountWithdrawn) {
        if (depositInfo[id_].depositor != depositorAddress) revert YieldSplitter_NotYourDeposit();

        DepositInfo storage userDeposit = depositInfo[id_];
        amountWithdrawn = _toAgnostic(userDeposit.principalAmount);
        userDeposit.principalAmount = 0;
        userDeposit.agnosticAmount -= amountWithdrawn;
    }

    /**
        @notice Redeem excess yield from your deposit in sOHM.
        @param id_ Id of the deposit.
        @return amountRedeemed : amount of yield redeemed in gOHM. 18 decimals.
    */
    function _redeemYield(uint256 id_) internal returns (uint256 amountRedeemed) {
        DepositInfo storage userDeposit = depositInfo[id_];

        amountRedeemed = _getOutstandingYield(userDeposit.principalAmount, userDeposit.agnosticAmount);
        userDeposit.agnosticAmount = _toAgnostic(userDeposit.principalAmount);
    }

    /**
        @notice Close a deposit. Remove all information in both the deposit info, depositorIds and recipientIds.
        @param id_ Id of the deposit.
        @dev Internally for accounting reasons principal amount is stored in 9 decimal OHM terms. 
        Since most implementations will work will gOHM, principal here is returned externally in 18 decimal gOHM terms.
        @return principal : amount of principal that was deleted. in gOHM. 18 decimals.
        @return agnosticAmount : total amount of gOHM deleted. Principal + Yield. 18 decimals.
    */
    function _closeDeposit(uint256 id_, address depositorAddress)
        internal
        returns (uint256 principal, uint256 agnosticAmount)
    {
        if (depositInfo[id_].depositor != depositorAddress) revert YieldSplitter_NotYourDeposit();

        principal = _toAgnostic(depositInfo[id_].principalAmount);
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

        delete depositInfo[id_];
    }

    /**
        @notice Calculate outstanding yield redeemable based on principal and agnosticAmount.
        @return uint256 amount of yield in gOHM. 18 decimals.
     */
    function _getOutstandingYield(uint256 principal_, uint256 agnosticAmount_) internal view returns (uint256) {
        return agnosticAmount_ - _toAgnostic(principal_);
    }

    /**
        @notice Convert flat sOHM value to agnostic gOHM value at current index
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index.
             1e18 is because sOHM has 9 decimals, gOHM has 18 and index has 9.
     */
    function _toAgnostic(uint256 amount_) internal view returns (uint256) {
        return (amount_ * 1e18) / (indexWrapper.index());
    }

    /**
        @notice Convert agnostic gOHM value at current index to flat sOHM value
        @dev Agnostic value earns rebases. sOHM amount is gOHMamount * rebase_index.
             1e18 is because sOHM has 9 decimals, gOHM has 18 and index has 9.
     */
    function _fromAgnostic(uint256 amount_) internal view returns (uint256) {
        return (amount_ * (indexWrapper.index())) / 1e18;
    }
}
