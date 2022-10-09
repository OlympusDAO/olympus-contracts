// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma abicoder v2;

import {ERC20} from "../types/ERC20.sol";
import {IBondSDA} from "../interfaces/IBondSDA.sol";
import {IBondTeller} from "../interfaces/IBondTeller.sol";
import {IEasyAuction} from "../interfaces/IEasyAuction.sol";
import {ITreasury} from "../interfaces/ITreasury.sol";
import {IOlympusAuthority} from "../interfaces/IOlympusAuthority.sol";
import {OlympusAccessControlled} from "../types/OlympusAccessControlled.sol";

contract OhmBondManager is OlympusAccessControlled {

    // ========= DATA STRUCTURES ========= //
    struct BondProtocolParameters {
        address callbackAddress;
        uint256 initialPrice;
        uint256 minPrice;
        uint32 debtBuffer;
        uint256 auctionTime;
        uint32 depositInterval;
    }

    struct GnosisAuctionParameters {
        uint256 auctionCancelTime;
        uint256 auctionTime;
        uint256 minRatioSold;
        uint256 minBuyAmount;
        uint256 minFundingThreshold;
    }

    // ========= STATE VARIABLES ========= //

    /// Tokens
    ERC20 public ohm;

    /// Contract Dependencies
    ITreasury public treasury;

    /// Market Creation Systems
    IBondSDA public fixedExpiryAuctioneer;
    IBondTeller public fixedExpiryTeller;
    IEasyAuction public gnosisEasyAuction;

    /// Market parameters
    BondProtocolParameters public bondProtocolParameters;
    GnosisAuctionParameters public gnosisAuctionParameters;

    constructor(
        address ohm_,
        address treasury_,
        address feAuctioneer_,
        address gnosisAuction_,
        address authority_
    ) OlympusAccessControlled(IOlympusAuthority(authority_)) {
        ohm = ERC20(ohm_);
        treasury = ITreasury(treasury_);
        fixedExpiryAuctioneer = IBondSDA(feAuctioneer_);
        gnosisEasyAuction = IEasyAuction(gnosisAuction_);
    }

    // ========= MARKET CREATION ========= //
    function createBondProtocolMarket(uint256 capacity_, uint256 bondTerm_) external onlyPolicy returns (uint256) {
        _topUpOhm(capacity_);

        IBondSDA.MarketParams memory createMarketParams = IBondSDA.MarketParams({
            payoutToken: ohm,
            quoteToken: ohm,
            callbackAddr: bondProtocolParameters.callbackAddress,
            capacityInQuote: false,
            capacity: capacity_,
            formattedInitialPrice: bondProtocolParameters.initialPrice,
            formattedMinimumPrice: bondProtocolParameters.minPrice,
            debtBuffer: bondProtocolParameters.debtBuffer,
            vesting: uint48(block.timestamp + bondTerm_),
            conclusion: uint48(block.timestamp + bondProtocolParameters.auctionTime),
            depositInterval: bondProtocolParameters.depositInterval,
            scaleAdjustment: int8(0)
        });

        ohm.approve(address(fixedExpiryTeller), capacity_);
        uint256 marketId = fixedExpiryAuctioneer.createMarket(createMarketParams);

        return marketId;
    }

    function createGnosisAuction(uint256 capacity_, uint256 bondTerm_) external onlyPolicy returns (uint256) {
        _topUpOhm(capacity_);

        /// Create bond token
        ohm.approve(address(fixedExpiryTeller), capacity_);
        fixedExpiryTeller.deploy(address(ohm), block.timestamp + bondTerm_);
        address bondToken = fixedExpiryTeller.create(address(ohm), block.timestamp + bondTerm_, capacity_);

        /// Launch Gnosis Auction
        ERC20(bondToken).approve(address(gnosisEasyAuction), capacity_);
        uint256 auctionId = gnosisEasyAuction.initiateAuction(
            bondToken, // auctioningToken
            address(ohm), // biddingToken
            block.timestamp + gnosisAuctionParameters.auctionCancelTime, // last order cancellation time
            block.timestamp + gnosisAuctionParameters.auctionTime, // auction end time
            capacity_, // auctioned amount
            capacity_ / gnosisAuctionParameters.minRatioSold, // minimum tokens bought for auction to be valid
            gnosisAuctionParameters.minBuyAmount, // minimum purchase size of auctioning token
            gnosisAuctionParameters.minFundingThreshold, // minimum funding threshold
            false, // is atomic closure allowed
            address(0), // access manager contract
            new bytes(0) // access manager contract data
        );

        return auctionId;
    }

    // ========= PARAMETER ADJUSTMENT ========= //
    function setBondProtocolParameters(
        address callbackAddress_,
        uint256 initialPrice_,
        uint256 minPrice_,
        uint32 debtBuffer_,
        uint256 auctionTime_,
        uint32 depositInterval_
    ) external onlyPolicy {
        bondProtocolParameters = BondProtocolParameters({
            callbackAddress: callbackAddress_,
            initialPrice: initialPrice_,
            minPrice: minPrice_,
            debtBuffer: debtBuffer_,
            auctionTime: auctionTime_,
            depositInterval: depositInterval_
        });
    }

    function setGnosisAuctionParameters(
        uint256 auctionCancelTime_,
        uint256 auctionTime_,
        uint256 minRatioSold_,
        uint256 minBuyAmount_,
        uint256 minFundingThreshold_
    ) external onlyPolicy {
        gnosisAuctionParameters = GnosisAuctionParameters({
            auctionCancelTime: auctionCancelTime_,
            auctionTime: auctionTime_,
            minRatioSold: minRatioSold_,
            minBuyAmount: minBuyAmount_,
            minFundingThreshold: minFundingThreshold_
        });
    }

    // ========= INTERNAL FUNCTIONS ========= //
    function _topUpOhm(uint256 amountToDeploy_) internal {
        uint256 ohmBalance = ohm.balanceOf(address(this));

        if (amountToDeploy_ > ohmBalance) {
            uint256 amountToMint = amountToDeploy_ - ohmBalance;
            treasury.mint(address(this), amountToMint);
        }
    }
}
