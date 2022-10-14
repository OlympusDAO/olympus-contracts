import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { config, ethers } from "hardhat";
import {
    MockERC20,
    OhmBondManager,
    OhmBondManager__factory,
    OlympusAuthority,
    OlympusTreasury,
} from "../../types";
import { addEth, addressZero, bne, getCoin, impersonate, pinBlock } from "../utils/scripts";
import { advanceTime } from "../utils/Utilities";
import { olympus } from "../utils/olympus";
import { coins } from "../utils/coins";
import { BigNumber } from "ethers";
import { easyAuctionAbi, feAuctioneerAbi, feTellerAbi, bondAggregatorAbi } from "../utils/abi";

// Network
const url: string = config.networks.hardhat.forking!.url;

// Variables
const snapshotId = 0;

describe.only("OhmBondManager", () => {
    // Signers
    let owner: SignerWithAddress;
    let guardian: SignerWithAddress;
    let policy: SignerWithAddress;
    let other: SignerWithAddress;

    // Contracts
    let ohmBondManager: OhmBondManager;
    let feAuctioneer: any;
    let feTeller: any;
    let easyAuction: any;
    let bondAggregator: any;
    let authority: OlympusAuthority;
    let treasury: OlympusTreasury;

    // Tokens
    let ohm: MockERC20;

    before(async () => {
        await pinBlock(15732752, url);
    });

    beforeEach(async () => {
        [owner, other] = await ethers.getSigners();

        authority = (await ethers.getContractAt(
            "OlympusAuthority",
            olympus.authority
        )) as OlympusAuthority;

        treasury = (await ethers.getContractAt(
            "OlympusTreasury",
            olympus.treasury
        )) as OlympusTreasury;

        guardian = await impersonate(await authority.guardian());
        policy = await impersonate(await authority.policy());

        ohm = await getCoin(coins.ohm);

        ohmBondManager = await new OhmBondManager__factory(owner).deploy(
            ohm.address,
            olympus.treasury,
            "0x007FEA2a31644F20b0fE18f69643890b6F878AA6", // Fixed Expiry Auctioneer
            "0x007FE7c498A2Cf30971ad8f2cbC36bd14Ac51156", // Fixed Expiry Teller
            "0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101", // Gnosis Easy Auction
            authority.address
        );

        feAuctioneer = await ethers.getContractAt(
            feAuctioneerAbi,
            "0x007FEA2a31644F20b0fE18f69643890b6F878AA6"
        );

        feTeller = await ethers.getContractAt(
            feTellerAbi,
            "0x007FE7c498A2Cf30971ad8f2cbC36bd14Ac51156"
        );

        bondAggregator = await ethers.getContractAt(
            bondAggregatorAbi,
            "0x007A66B9e719b3aBb2f3917Eb47D4231a17F5a0D"
        );

        easyAuction = await ethers.getContractAt(
            easyAuctionAbi,
            "0x0b7fFc1f4AD541A4Ed16b40D8c37f0929158D101"
        );

        await treasury.connect(guardian).enable(8, ohmBondManager.address, addressZero);

        await addEth(owner.address, bne(10, 23));
        await addEth(other.address, bne(10, 23));
        await addEth(guardian.address, bne(10, 23));
        await addEth(policy.address, bne(10, 23));
    });

    describe("setBondProtocolParameters", () => {
        it("can only be called by policy", async () => {
            await expect(
                ohmBondManager.connect(policy).setBondProtocolParameters(
                    "1000000000000000000000000000000000000", // 1e36
                    "500000000000000000000000000000000000", // 5e35
                    100_000,
                    604800,
                    21600
                )
            ).to.not.be.reverted;

            await expect(
                ohmBondManager.connect(other).setBondProtocolParameters(
                    "1000000000000000000000000000000000000", // 1e36
                    "500000000000000000000000000000000000", // 5e35
                    100_000,
                    604800,
                    21600
                )
            ).to.be.reverted;

            await expect(
                ohmBondManager.connect(owner).setBondProtocolParameters(
                    "1000000000000000000000000000000000000", // 1e36
                    "500000000000000000000000000000000000", // 5e35
                    100_000,
                    604800,
                    21600
                )
            ).to.be.reverted;
        });

        it("correctly sets parameters", async () => {
            // Verify initial state
            const params = await ohmBondManager.bondProtocolParameters();
            expect(params.initialPrice).to.equal(BigNumber.from("0"));
            expect(params.minPrice).to.equal(BigNumber.from("0"));
            expect(params.debtBuffer).to.equal(BigNumber.from("0"));
            expect(params.auctionTime).to.equal(BigNumber.from("0"));
            expect(params.depositInterval).to.equal(BigNumber.from("0"));

            // Set params
            await ohmBondManager.connect(policy).setBondProtocolParameters(
                "1000000000000000000000000000000000000", // 1e36
                "500000000000000000000000000000000000", // 5e35
                100_000,
                604800,
                21600
            );

            // Verify end state
            const paramsAfter = await ohmBondManager.bondProtocolParameters();
            expect(paramsAfter.initialPrice).to.equal(
                BigNumber.from("1000000000000000000000000000000000000")
            );
            expect(paramsAfter.minPrice).to.equal(
                BigNumber.from("500000000000000000000000000000000000")
            );
            expect(paramsAfter.debtBuffer).to.equal(BigNumber.from("100000"));
            expect(paramsAfter.auctionTime).to.equal(BigNumber.from("604800"));
            expect(paramsAfter.depositInterval).to.equal(BigNumber.from("21600"));
        });
    });

    describe("setGnosisAuctionParameters", () => {
        it("can only be called by policy", async () => {
            await expect(
                ohmBondManager
                    .connect(policy)
                    .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000")
            ).to.not.be.reverted;

            await expect(
                ohmBondManager
                    .connect(other)
                    .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000")
            ).to.be.reverted;

            await expect(
                ohmBondManager
                    .connect(guardian)
                    .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000")
            ).to.be.reverted;
        });

        it("correctly sets parameters", async () => {
            // Verify initial state
            const params = await ohmBondManager.gnosisAuctionParameters();
            expect(params.auctionCancelTime).to.equal(BigNumber.from("0"));
            expect(params.auctionTime).to.equal(BigNumber.from("0"));
            expect(params.minRatioSold).to.equal(BigNumber.from("0"));
            expect(params.minBuyAmount).to.equal(BigNumber.from("0"));
            expect(params.minFundingThreshold).to.equal(BigNumber.from("0"));

            // Set params
            await ohmBondManager
                .connect(policy)
                .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000");

            // Verify end state
            const paramsAfter = await ohmBondManager.gnosisAuctionParameters();
            expect(paramsAfter.auctionCancelTime).to.equal(BigNumber.from("518400"));
            expect(paramsAfter.auctionTime).to.equal(BigNumber.from("604800"));
            expect(paramsAfter.minRatioSold).to.equal(BigNumber.from("2"));
            expect(paramsAfter.minBuyAmount).to.equal(BigNumber.from("10000000"));
            expect(paramsAfter.minFundingThreshold).to.equal(BigNumber.from("1000000000000"));
        });
    });

    describe("createBondProtocolMarket", () => {
        beforeEach(async () => {
            await ohmBondManager.connect(policy).setBondProtocolParameters(
                "1000000000000000000000000000000000000", // 1e36
                "500000000000000000000000000000000000", // 5e35
                100_000,
                604800,
                21600
            );
        });

        it("can only be called by policy", async () => {
            await expect(
                ohmBondManager.connect(policy).createBondProtocolMarket("10000000000000", 1210000)
            ).to.not.be.reverted;

            await expect(
                ohmBondManager.connect(other).createBondProtocolMarket("10000000000000", 1210000)
            ).to.be.reverted;

            await expect(
                ohmBondManager.connect(guardian).createBondProtocolMarket("10000000000000", 1210000)
            ).to.be.reverted;
        });

        it("should correctly instantiate a market", async () => {
            await ohmBondManager
                .connect(policy)
                .createBondProtocolMarket("10000000000000", 1210000);
            const marketId = (await bondAggregator.marketCounter()).sub("1");

            // Verify market state
            const marketData = await feAuctioneer.markets(marketId);
            expect(marketData.owner).to.equal(ohmBondManager.address);
            expect(marketData.payoutToken).to.equal(ohm.address);
            expect(marketData.quoteToken).to.equal(ohm.address);
            expect(marketData.callbackAddr).to.equal(addressZero);
            expect(marketData.capacityInQuote).to.be.false;
            expect(marketData.capacity).to.equal(BigNumber.from("10000000000000"));
            expect(marketData.sold).to.equal(BigNumber.from("0"));
        });
    });

    describe("closeBondProtocolMarket", () => {
        beforeEach(async () => {
            await ohmBondManager.connect(policy).setBondProtocolParameters(
                "1000000000000000000000000000000000000", // 1e36
                "500000000000000000000000000000000000", // 5e35
                100_000,
                604800,
                21600
            );
            await ohmBondManager
                .connect(policy)
                .createBondProtocolMarket("10000000000000", 1210000);
        });

        it("can only be called by policy", async () => {
            const marketId = (await bondAggregator.marketCounter()).sub("1");
            await expect(ohmBondManager.connect(policy).closeBondProtocolMarket(marketId)).to.not.be.reverted;

            await expect(ohmBondManager.connect(other).closeBondProtocolMarket(marketId)).to.be.reverted;

            await expect(ohmBondManager.connect(guardian).closeBondProtocolMarket(marketId)).to.be.reverted;
        });

        it("should correctly close the market", async () => {
            const marketId = (await bondAggregator.marketCounter()).sub("1");
            await ohmBondManager.connect(policy).closeBondProtocolMarket(marketId);

            expect((await feAuctioneer.isLive(marketId))).to.be.false;
        });
    });

    describe("createGnosisAuction", () => {
        beforeEach(async () => {
            await ohmBondManager
                .connect(policy)
                .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000");
        });

        it("can only be called by policy", async () => {
            await expect(
                ohmBondManager.connect(policy).createGnosisAuction("10000000000000", 1210000)
            ).to.not.be.reverted;

            await expect(
                ohmBondManager.connect(other).createGnosisAuction("10000000000000", 1210000)
            ).to.be.reverted;

            await expect(
                ohmBondManager.connect(guardian).createGnosisAuction("10000000000000", 1210000)
            ).to.be.reverted;
        });

        it("should correctly instantiate a market", async () => {
            await ohmBondManager.connect(policy).createGnosisAuction("10000000000000", 1210000);
            const auctionId = await easyAuction.auctionCounter();
            const auctionData = await easyAuction.auctionData(auctionId);

            /// Verify end state
            expect(auctionData.auctioningToken).to.not.eq(addressZero);
            expect(auctionData.biddingToken).to.equal(ohm.address);
            expect(auctionData.orderCancellationEndDate).to.be.gte(
                BigNumber.from("1665411455").add(6 * 24 * 60 * 60)
            );
            expect(auctionData.auctionEndDate).to.be.gte(
                BigNumber.from("1665411455").add(7 * 24 * 60 * 60)
            );
        });
    });

    describe("settleGnosisAuction", () => {
        beforeEach(async () => {
            await ohmBondManager
                .connect(policy)
                .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000");

            await ohmBondManager.connect(policy).createGnosisAuction("10000000000000", 1210000);
        });

        it("can only be called by policy", async () => {
            await advanceTime(1210005);

            const auctionId = await easyAuction.auctionCounter();
            await expect(ohmBondManager.connect(policy).settleGnosisAuction(auctionId)).to.not.be.reverted;

            await expect(ohmBondManager.connect(other).settleGnosisAuction(auctionId)).to.be.reverted;

            await expect(ohmBondManager.connect(guardian).settleGnosisAuction(auctionId)).to.be.reverted;
        });

        it("should settle the auction", async () => {
            await advanceTime(1210005);

            const auctionId = await easyAuction.auctionCounter();
            await expect(ohmBondManager.connect(policy).settleGnosisAuction(auctionId)).to.not.be.reverted;

            const auctionData = await easyAuction.auctionData(auctionId);
            expect(auctionData.minimumBiddingAmountPerOrder).to.equal("0");
        });
    });

    describe("series of market creations", () => {
        beforeEach(async () => {
            await ohmBondManager.connect(policy).setBondProtocolParameters(
                "1000000000000000000000000000000000000", // 1e36
                "500000000000000000000000000000000000", // 5e35
                100_000,
                604800,
                21600
            );

            await ohmBondManager
                .connect(policy)
                .setGnosisAuctionParameters(518400, 604800, 2, "10000000", "1000000000000");
        });

        it("should not steal OHM when launching subsequent markets", async () => {
            await ohmBondManager.connect(policy).createBondProtocolMarket(10000000000000, 1210000);
            await ohmBondManager.connect(policy).createGnosisAuction(10000000000000, 1210000);

            expect((await ohm.allowance(ohmBondManager.address, feTeller.address))).to.equal(10000000000000);
            expect((await ohm.balanceOf(ohmBondManager.address))).to.equal(10000000000000);
        });
    });

    describe("setEmergencyApproval", () => {
        it("can only be called by policy", async () => {
            await expect(ohmBondManager.connect(policy).setEmergencyApproval(ohm.address, feTeller.address, "10000000000000")).to.not.be.reverted;

            await expect(ohmBondManager.connect(other).setEmergencyApproval(ohm.address, feTeller.address, "10000000000000")).to.be.reverted;

            await expect(ohmBondManager.connect(guardian).setEmergencyApproval(ohm.address, feTeller.address, "10000000000000")).to.be.reverted;
        });

        it("should set approval on the passed token", async () => {
            expect((await ohm.allowance(ohmBondManager.address, feTeller.address))).to.equal("0");
            await ohmBondManager.connect(policy).setEmergencyApproval(ohm.address, feTeller.address, "10000000000000");
            expect((await ohm.allowance(ohmBondManager.address, feTeller.address))).to.equal("10000000000000");
        });
    });

    describe("emergencyWithdraw", () => {
        beforeEach(async () => {
            ohm.connect(guardian).transfer(ohmBondManager.address, "1000000000000");
        });

        it("can only be called by policy", async () => {
            await expect(ohmBondManager.connect(policy).emergencyWithdraw("1000000000000")).to.not
                .be.reverted;

            await expect(ohmBondManager.connect(other).emergencyWithdraw("1000000000000")).to.be
                .reverted;

            await expect(ohmBondManager.connect(guardian).emergencyWithdraw("1000000000000")).to.be
                .reverted;
        });

        it("should send OHM to Treasury", async () => {
            // Verify initial state
            const treasuryBalBefore = await ohm.balanceOf(treasury.address);
            expect(await ohm.balanceOf(ohmBondManager.address)).to.equal(
                BigNumber.from("1000000000000")
            );

            // Emergency withdraw
            await ohmBondManager.connect(policy).emergencyWithdraw("1000000000000");

            // Verify end state
            const treasuryBalAfter = await ohm.balanceOf(treasury.address);
            expect(await ohm.balanceOf(ohmBondManager.address)).to.equal(BigNumber.from("0"));
            expect(treasuryBalAfter.sub(treasuryBalBefore)).to.equal(
                BigNumber.from("1000000000000")
            );
        });
    });
});
