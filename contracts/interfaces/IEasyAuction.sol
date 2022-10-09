// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

interface IEasyAuction {
    function initiateAuction(
        address tokenToSell,
        address biddingToken,
        uint256 latestCancellation,
        uint256 auctionEnd,
        uint256 auctionAmount,
        uint256 minimumTotalPurchased,
        uint256 minimumPurchaseAmount,
        uint256 minFundingThreshold,
        bool isAtomicClosureAllowed,
        address accessManager,
        bytes calldata accessManagerData
    ) external returns (uint256);
}