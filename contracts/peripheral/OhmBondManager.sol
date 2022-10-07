// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.15;

contract OhmBondManager is OlympusAccessControlled {
    using SafeERC20 for ERC20;

    // ========= DATA STRUCTURES ========= //
    struct BondProtocolParameters {
        address callbackAddress;
        uint256 initialPrice;
        uint256 minPrice;
        uint256 debtBuffer;
        uint256 auctionTime;
        uint256 depositInterval;
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

        bytes createMarketParams = abi.encodeWithSelector(
            fixedExpiryAuctioneer.createMarket.selector,
            address(ohm),
            address(ohm),
            bondProtocolParameters.callbackAddress,
            false,
            capacity_,
            bondProtocolParameters.initialPrice,
            bondProtocolParameters.minPrice,
            bondProtocolParameters.debtBuffer,
            block.timestamp() + bondTerm_,
            block.timestamp() + bondProtocolParameters.auctionTime,
            bondProtocolParameters.depositInterval,
            0
        );

        ohm.safeApprove(address(fixedExpiryTeller), capacity_);
        uint256 marketId = fixedExpiryAuctioneer.createMarket(createMarketParams);

        return marketId;
    }

    function createGnosisAuction(uint256 capacity_, uint256 bondTerm_) external onlyPolicy returns (uint256) {
        _topUpOhm(capacity_);

        /// Create bond token
        ohm.safeApprove(address(fixedExpiryTeller), capacity_);
        fixedExpiryTeller.deploy(address(ohm), block.timestamp() + bondTerm_);
        address bondToken = fixedExpiryTeller.create(address(ohm), block.timestamp() + bondTerm_, capacity_);

        /// Launch Gnosis Auction
        ERC20(bondToken).safeApprove(address(gnosisEasyAuction), capacity_);
        uint256 auctionId = gnosisEasyAuction.initiateAuction(
            bondToken, // auctioningToken
            address(ohm), // biddingToken
            block.timestamp() + gnosisAuctionParameters.auctionCancelTime, // last order cancellation time
            block.timestamp() + gnosisAuctionParameters.auctionTime, // auction end time
            capacity_, // auctioned amount
            capacity_ / gnosisAuctionParameters.minRatioSold, // minimum tokens bought for auction to be valid
            gnosisAuctionParameters.minBuyAmount, // minimum purchase size of auctioning token
            gnosisAuctionParameters.minFundingThreshold, // minimum funding threshold
            false, // is atomic closure allowed
            address(0), // access manager contract
            bytes(0) // access manager contract data
        );

        return auctionId;
    }

    // ========= PARAMETER ADJUSTMENT ========= //
    function setBondProtocolParameters(
        address callbackAddress_,
        uint256 initialPrice_,
        uint256 minPrice_,
        uint256 debtBuffer_,
        uint256 auctionTime_,
        uint256 depositInterval_
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
