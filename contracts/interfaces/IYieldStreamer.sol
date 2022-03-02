// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

interface IYieldStreamer {
    // Write Functions
    function deposit(
        uint256 amount_,
        address recipient_,
        uint128 paymentInterval_,
        uint128 userMinimumDaiThreshold_
    ) external;

    function addToDeposit(uint256 id_, uint256 amount_) external;

    function withdrawPrincipal(uint256 id_, uint256 amount_) external;

    function withdrawYield(uint256 id_) external;

    function withdrawAllYield() external;

    function withdrawYieldInStreamTokens(uint256 id_) external;

    function harvestStreamTokens(uint256 id_) external;

    function updateUserMinDaiThreshold(uint256 id_, uint128 threshold_) external;

    function updatePaymentInterval(uint256 id_, uint128 paymentInterval) external;

    function upkeep() external;

    // View Functions
    function upkeepEligibility() external view returns (uint256 numberOfDepositsEligible, uint256 amountOfYieldToSwap);

    function getOutstandingYield(uint256 id_) external view returns (uint256);

    function getPrincipalInGOHM(uint256 id_) external view returns (uint256);

    function getTotalHarvestableYieldGOHM(address recipient_) external view returns (uint256 totalGOHM);

    function getRecipientIds(address recipient_) external view returns (uint256[] memory);

    function getDepositorIds(address donor_) external view returns (uint256[] memory);
}
