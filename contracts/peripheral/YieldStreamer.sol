// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import {IERC20} from "../interfaces/IERC20.sol";
import {IgOHM} from "../interfaces/IgOHM.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {IYieldStreamer} from "../interfaces/IYieldStreamer.sol";
import {OlympusAccessControlled, IOlympusAuthority} from "../types/OlympusAccessControlled.sol";
import {IUniswapV2Router} from "../interfaces/IUniswapV2Router.sol";
import {IStaking} from "../interfaces/IStaking.sol";
import {YieldSplitter} from "../types/YieldSplitter.sol";

error YieldStreamer_DepositDisabled();
error YieldStreamer_WithdrawDisabled();
error YieldStreamer_UpkeepDisabled();
error YieldStreamer_UnauthorisedAction();
error YieldStreamer_MinTokenThresholdTooLow();
error YieldStreamer_InvalidAmount();

/**
    @title YieldStreamer
    @notice This contract allows users to deposit their gOhm and have their yield
            converted into a streamToken(normally DAI) and sent to their address every interval.
 */
contract YieldStreamer is IYieldStreamer, YieldSplitter, OlympusAccessControlled {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    address public immutable OHM;
    address public immutable gOHM;
    address public immutable streamToken; // Default is DAI but can be any token
    IUniswapV2Router public immutable sushiRouter;
    address[] public sushiRouterPath = new address[](2);
    IStaking public immutable staking;

    bool public depositDisabled;
    bool public withdrawDisabled;
    bool public upkeepDisabled;

    uint256 public maxSwapSlippagePercent; // 6 decimals 1e6 is 100%
    uint256 public feeToDaoPercent; // 6 decimals 1e6 is 100%
    uint256 public minimumTokenThreshold;

    struct RecipientInfo {
        address recipientAddress;
        uint128 lastUpkeepTimestamp;
        uint128 paymentInterval; // Time before yield is able to be swapped to stream tokens
        uint128 unclaimedStreamTokens;
        uint128 userMinimumAmountThreshold;
    }

    mapping(uint256 => RecipientInfo) public recipientInfo; // depositId -> RecipientInfo
    mapping(address => uint256[]) public recipientIds; // address -> Array of the deposit id's user is recipient of
    uint256[] public activeDepositIds; // All deposit ids that are not empty or deleted

    event Deposited(address indexed depositor_, uint256 amount_);
    event Withdrawn(address indexed depositor_, uint256 amount_);
    event UpkeepComplete(uint256 indexed timestamp);
    event EmergencyShutdown(bool active_);

    /**
        @notice Constructor
        @param gOHM_ Address of gOHM.
        @param sOHM_ Address of sOHM.
        @param OHM_ Address of OHM.
        @param streamToken_ Address of the token the ohm will be swapped to.
        @param sushiRouter_ Address of sushiswap router.
        @param staking_ Address of sOHM staking contract.
        @param authority_ Address of Olympus authority contract.
        @param maxSwapSlippagePercent_ Maximum acceptable slippage when swapping OHM to streamTokens as percentage 6 decimals.
        @param feeToDaoPercent_ How much of yield goes to DAO before swapping to streamTokens as percentage 6 decimals.
        @param minimumTokenThreshold_ Minimum a user can set threshold for amount of tokens accumulated as yield 
                                    before sending to recipient's wallet.
    */
    constructor(
        address gOHM_,
        address sOHM_,
        address OHM_,
        address streamToken_,
        address sushiRouter_,
        address staking_,
        address authority_,
        uint128 maxSwapSlippagePercent_,
        uint128 feeToDaoPercent_,
        uint256 minimumTokenThreshold_
    ) YieldSplitter(sOHM_) OlympusAccessControlled(IOlympusAuthority(authority_)) {
        gOHM = gOHM_;
        OHM = OHM_;
        streamToken = streamToken_;
        sushiRouter = IUniswapV2Router(sushiRouter_);
        staking = IStaking(staking_);
        sushiRouterPath[0] = OHM;
        sushiRouterPath[1] = streamToken;
        maxSwapSlippagePercent = maxSwapSlippagePercent_;
        feeToDaoPercent = feeToDaoPercent_;
        minimumTokenThreshold = minimumTokenThreshold_;

        IERC20(gOHM).approve(address(staking), MAX_INT);
        IERC20(OHM).approve(address(sushiRouter), MAX_INT);
    }

    /**
        @notice Deposit gOHM, creates a deposit in the active deposit pool to be unkept.
        @param amount_ Amount of gOHM.
        @param recipient_ Address to direct staking yield and vault shares to.
        @param paymentInterval_ How much time must elapse before yield is able to be swapped for stream tokens.
        @param userMinimumAmountThreshold_ Minimum amount of stream tokens a user must have during upkeep for it to be sent to their wallet.
    */
    function deposit(
        uint256 amount_,
        address recipient_,
        uint128 paymentInterval_,
        uint128 userMinimumAmountThreshold_
    ) external override {
        if (depositDisabled) revert YieldStreamer_DepositDisabled();
        if (amount_ <= 0) revert YieldStreamer_InvalidAmount();
        if (userMinimumAmountThreshold_ < minimumTokenThreshold) revert YieldStreamer_MinTokenThresholdTooLow();

        uint256 depositId = _deposit(msg.sender, amount_);

        recipientInfo[depositId] = RecipientInfo({
            recipientAddress: recipient_,
            lastUpkeepTimestamp: uint128(block.timestamp),
            paymentInterval: paymentInterval_,
            unclaimedStreamTokens: 0,
            userMinimumAmountThreshold: userMinimumAmountThreshold_
        });

        activeDepositIds.push(depositId);
        recipientIds[recipient_].push(depositId);

        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), amount_);

        emit Deposited(msg.sender, amount_);
    }

    /**
        @notice Add more gOHM to your principal deposit.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOHM to add.
    */
    function addToDeposit(uint256 id_, uint256 amount_) external override {
        if (depositDisabled) revert YieldStreamer_DepositDisabled();

        _addToDeposit(id_, amount_, msg.sender);

        IERC20(gOHM).safeTransferFrom(msg.sender, address(this), amount_);

        emit Deposited(msg.sender, amount_);
    }

    /**
        @notice Withdraw part or all of your principal amount deposited.
        @dev If withdrawing all your principal, all accumulated yield will be sent to recipient 
             and deposit will be closed.
        @param id_ Id of the deposit.
        @param amount_ Amount of gOHM to withdraw.
    */
    function withdrawPrincipal(uint256 id_, uint256 amount_) external override {
        if (withdrawDisabled) revert YieldStreamer_WithdrawDisabled();

        if (amount_ >= IgOHM(gOHM).balanceTo(depositInfo[id_].principalAmount)) {
            address recipient = recipientInfo[id_].recipientAddress;
            uint256 unclaimedStreamTokens = recipientInfo[id_].unclaimedStreamTokens;
            (uint256 principal, uint256 totalGOHM) = _closeDeposit(id_, msg.sender);
            delete recipientInfo[id_];

            uint256 depositLength = activeDepositIds.length;
            for (uint256 i = 0; i < depositLength; i++) {
                // Delete integer from array by swapping with last element and calling pop()
                if (activeDepositIds[i] == id_) {
                    activeDepositIds[i] = activeDepositIds[depositLength - 1];
                    activeDepositIds.pop();
                    break;
                }
            }

            uint256[] storage recipientIdsArray = recipientIds[recipient];
            uint256 recipientLength = recipientIdsArray.length;
            for (uint256 i = 0; i < recipientLength; i++) {
                // Delete integer from array by swapping with last element and calling pop()
                if (recipientIdsArray[i] == id_) {
                    recipientIdsArray[i] = recipientIdsArray[recipientLength - 1];
                    recipientIdsArray.pop();
                    break;
                }
            }

            IERC20(gOHM).safeTransfer(msg.sender, principal);
            IERC20(gOHM).safeTransfer(recipient, totalGOHM - principal);
            if (unclaimedStreamTokens != 0) {
                IERC20(streamToken).safeTransfer(recipient, unclaimedStreamTokens);
            }
        } else {
            _withdrawPrincipal(id_, amount_, msg.sender);
            IERC20(gOHM).safeTransfer(msg.sender, amount_);
        }

        emit Withdrawn(msg.sender, amount_);
    }

    /**
        @notice Withdraw excess yield from your deposit in gOHM.
        @dev  Use withdrawYieldInStreamTokens() to withdraw yield in stream tokens.
        @param id_ Id of the deposit.
    */
    function withdrawYield(uint256 id_) external override {
        if (withdrawDisabled) revert YieldStreamer_WithdrawDisabled();
        if (recipientInfo[id_].recipientAddress != msg.sender) revert YieldStreamer_UnauthorisedAction();

        uint256 yield = _redeemYield(id_);

        IERC20(gOHM).safeTransfer(msg.sender, yield);
    }

    /**
        @notice Withdraw all excess yield from your all deposits you are the recipient of in gOHM.
        @dev  Use withdrawYieldInStreamTokens() to withdraw yield in stream tokens.
    */
    function withdrawAllYield() external override {
        if (withdrawDisabled) revert YieldStreamer_WithdrawDisabled();

        uint256 total;
        uint256[] memory receiptIds = recipientIds[msg.sender];

        for (uint256 i = 0; i < receiptIds.length; i++) {
            total += _redeemYield(receiptIds[i]);
        }

        IERC20(gOHM).safeTransfer(msg.sender, total);
    }

    /**
        @notice Withdraw excess yield from your deposit in streamTokens
        @param id_ Id of the deposit
    */
    function withdrawYieldInStreamTokens(uint256 id_) external override {
        if (withdrawDisabled) revert YieldStreamer_WithdrawDisabled();
        if (recipientInfo[id_].recipientAddress != msg.sender) revert YieldStreamer_UnauthorisedAction();

        recipientInfo[id_].lastUpkeepTimestamp = uint128(block.timestamp);

        uint256 gOHMYield = _redeemYield(id_);
        uint256 totalOhmToSwap = staking.unwrap(address(this), gOHMYield);
        staking.unstake(address(this), totalOhmToSwap, false, false);

        uint256[] memory calculatedAmounts = sushiRouter.getAmountsOut(totalOhmToSwap, sushiRouterPath);
        uint256[] memory amounts = sushiRouter.swapExactTokensForTokens(
            totalOhmToSwap,
            (calculatedAmounts[1] * (1000000 - maxSwapSlippagePercent)) / 1000000,
            sushiRouterPath,
            msg.sender,
            block.timestamp
        );

        uint256 streamTokensToSend = recipientInfo[id_].unclaimedStreamTokens + amounts[1];
        recipientInfo[id_].unclaimedStreamTokens = 0;
        IERC20(streamToken).safeTransfer(msg.sender, streamTokensToSend);
    }

    /**
        @notice harvest all your unclaimed stream tokens
        @param id_ Id of the deposit
    */
    function harvestStreamTokens(uint256 id_) external override {
        if (withdrawDisabled) revert YieldStreamer_WithdrawDisabled();
        if (recipientInfo[id_].recipientAddress != msg.sender) revert YieldStreamer_UnauthorisedAction();

        uint256 streamTokensToSend = recipientInfo[id_].unclaimedStreamTokens;
        recipientInfo[id_].unclaimedStreamTokens = 0;
        IERC20(streamToken).safeTransfer(msg.sender, streamTokensToSend);
    }

    /**
        @notice User updates the minimum amount of streamTokens threshold before upkeep sends streamTokens to recipients wallet
        @param id_ Id of the deposit
        @param threshold_ amount of streamTokens
    */
    function updateUserMinDaiThreshold(uint256 id_, uint128 threshold_) external override {
        if (threshold_ < minimumTokenThreshold) revert YieldStreamer_MinTokenThresholdTooLow();
        if (depositInfo[id_].depositor != msg.sender) revert YieldStreamer_UnauthorisedAction();

        recipientInfo[id_].userMinimumAmountThreshold = threshold_;
    }

    /**
        @notice User updates the minimum amount of time passes before the deposit is included in upkeep
        @param id_ Id of the deposit
        @param paymentInterval_ amount of time in seconds
    */
    function updatePaymentInterval(uint256 id_, uint128 paymentInterval_) external override {
        if (depositInfo[id_].depositor != msg.sender) revert YieldStreamer_UnauthorisedAction();

        recipientInfo[id_].paymentInterval = paymentInterval_;
    }

    /**
        @notice Upkeeps all deposits if they are eligible.
                Upkeep consists of converting all eligible deposits yield from gOhm into streamToken(usually DAI).
                Sends the yield to recipient wallets if above user set threshold.
                Eligible for upkeep means enough time(payment interval) has passed since their last upkeep.
    */
    function upkeep() external override {
        if (upkeepDisabled) revert YieldStreamer_UpkeepDisabled();

        uint256 totalGOHM;
        uint256 depositLength = activeDepositIds.length;

        for (uint256 i = 0; i < depositLength; i++) {
            uint256 currentId = activeDepositIds[i];

            if (_isUpkeepEligible(currentId)) {
                totalGOHM += getOutstandingYield(currentId);
            }
        }

        uint256 feeToDao = (totalGOHM * feeToDaoPercent) / 1000000;
        IERC20(gOHM).safeTransfer(authority.governor(), feeToDao);

        uint256 totalOhmToSwap = staking.unwrap(address(this), totalGOHM - feeToDao);
        staking.unstake(address(this), totalOhmToSwap, false, false);

        uint256[] memory calculatedAmounts = sushiRouter.getAmountsOut(totalOhmToSwap, sushiRouterPath);
        uint256[] memory amounts = sushiRouter.swapExactTokensForTokens(
            totalOhmToSwap,
            (calculatedAmounts[1] * (1000000 - maxSwapSlippagePercent)) / 1000000,
            sushiRouterPath,
            address(this),
            block.timestamp
        );

        for (uint256 i = 0; i < depositLength; i++) {
            // TODO: Is there a more gas efficient way than looping through this again and checking same condition
            uint256 currentId = activeDepositIds[i];

            if (_isUpkeepEligible(currentId)) {
                RecipientInfo storage currentrecipientInfo = recipientInfo[currentId];

                currentrecipientInfo.lastUpkeepTimestamp = uint128(block.timestamp);
                currentrecipientInfo.unclaimedStreamTokens += uint128(
                    (amounts[1] * _redeemYield(currentId)) / totalGOHM
                );

                if (currentrecipientInfo.unclaimedStreamTokens >= currentrecipientInfo.userMinimumAmountThreshold) {
                    uint256 streamTokensToSend = currentrecipientInfo.unclaimedStreamTokens;
                    currentrecipientInfo.unclaimedStreamTokens = 0;
                    IERC20(streamToken).safeTransfer(currentrecipientInfo.recipientAddress, streamTokensToSend);
                }
            }
        }

        emit UpkeepComplete(block.timestamp);
    }

    /************************
     * View Functions
     ************************/

    /**
        @notice Returns the total amount of yield in gOhm the user can withdraw from all deposits. 
                Does not include harvestable stream tokens which is found in recipientInfo.
        @param recipient_ Address of recipient.
    */
    function getTotalHarvestableYieldGOHM(address recipient_) external view returns (uint256 totalGOHM) {
        for (uint256 i = 0; i < recipientIds[recipient_].length; i++) {
            totalGOHM += getOutstandingYield(recipientIds[recipient_][i]);
        }
    }

    /**
        @notice Gets the number of deposits eligible for upkeep and amount of ohm of yield available to swap.
                Eligible for upkeep means enough time(payment interval of deposit) has passed since last upkeep.
        @return numberOfDepositsEligible : number of deposits eligible for upkeep.
        @return amountOfYieldToSwap : total amount of yield in gOHM ready to be swapped in next upkeep.
     */
    function upkeepEligibility() external view returns (uint256 numberOfDepositsEligible, uint256 amountOfYieldToSwap) {
        for (uint256 i = 0; i < activeDepositIds.length; i++) {
            if (_isUpkeepEligible(activeDepositIds[i])) {
                numberOfDepositsEligible++;
                amountOfYieldToSwap += getOutstandingYield(activeDepositIds[i]);
            }
        }
    }

    /**
        @notice Returns the outstanding yield of a deposit.
        @param id_ Id of the deposit.
     */
    function getOutstandingYield(uint256 id_) public view returns (uint256) {
        return _getOutstandingYield(depositInfo[id_].principalAmount, depositInfo[id_].agnosticAmount);
    }

    /**
        @notice Get deposits principal amount in gOhm
        @param id_ Id of the deposit.
     */
    function getPrincipalInGOHM(uint256 id_) external view returns (uint256) {
        return IgOHM(gOHM).balanceTo(depositInfo[id_].principalAmount);
    }

    /**
        @notice Returns whether deposit id is eligible for upkeep.
                Eligible for upkeep means enough time(payment interval of deposit) has passed since last upkeep.
        @return bool
     */
    function _isUpkeepEligible(uint256 id_) internal view returns (bool) {
        return block.timestamp >= recipientInfo[id_].lastUpkeepTimestamp + recipientInfo[id_].paymentInterval;
    }

    /**
        @notice Returns the array of deposit id's belonging to the recipient
        @return uint256[] array of recipient Id's
     */
    function getRecipientIds(address recipient_) external view returns (uint256[] memory) {
        return recipientIds[recipient_];
    }

    /**
        @notice Returns the array of deposit id's belonging to the depositor
        @return uint256[] array of depositor Id's
     */
    function getDepositorIds(address donor_) external view returns (uint256[] memory) {
        return depositorIds[donor_];
    }

    /************************
     * Restricted Setter Functions
     ************************/

    /**
        @notice Setter for maxSwapSlippagePercent.
        @param slippagePercent_ new slippage value is a percentage with 6 decimals. 1e6 = 100%
    */
    function setMaxSwapSlippagePercent(uint256 slippagePercent_) external onlyGovernor {
        if (slippagePercent_ > 1e6) revert YieldStreamer_InvalidAmount();
        maxSwapSlippagePercent = slippagePercent_;
    }

    /**
        @notice Setter for feeToDaoPercent.
        @param feePercent_ new fee value is a percentage with 6 decimals. 1e6 = 100%
    */
    function setFeeToDaoPercent(uint256 feePercent_) external onlyGovernor {
        if (feePercent_ > 1e6) revert YieldStreamer_InvalidAmount();
        feeToDaoPercent = feePercent_;
    }

    /**
        @notice Setter for minimumTokenThreshold.
        @param minimumTokenThreshold_ new minimumTokenThreshold value.
    */
    function setminimumTokenThreshold(uint256 minimumTokenThreshold_) external onlyGovernor {
        minimumTokenThreshold = minimumTokenThreshold_;
    }

    /************************
     * Emergency Functions
     ************************/

    function emergencyShutdown(bool active_) external onlyGovernor {
        depositDisabled = active_;
        withdrawDisabled = active_;
        upkeepDisabled = active_;
        emit EmergencyShutdown(active_);
    }

    function disableDeposits(bool active_) external onlyGovernor {
        depositDisabled = active_;
    }

    function disableWithdrawals(bool active_) external onlyGovernor {
        withdrawDisabled = active_;
    }

    function disableUpkeep(bool active_) external onlyGovernor {
        upkeepDisabled = active_;
    }
}
