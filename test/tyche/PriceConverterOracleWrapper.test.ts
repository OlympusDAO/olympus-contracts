// libraries, functionality...
import { ethers } from "hardhat";
import { expect } from "chai";
const { fork_network } = require("../utils/network_fork");

// types
import { AggregatorV3Interface, PriceConverterOracleWrapper__factory } from "../../types";

describe("PriceConverterOracleWrapper", () => {
    let ohmEthOracle: AggregatorV3Interface;
    let ethDaiOracle: AggregatorV3Interface;
    let priceConverterOracleWrapper: AggregatorV3Interface;

    before(async () => {
        await fork_network(14565910);

        ohmEthOracle = (await ethers.getContractAt(
            "AggregatorV3Interface",
            "0x9a72298ae3886221820b1c878d12d872087d3a23"
        )) as AggregatorV3Interface;

        ethDaiOracle = (await ethers.getContractAt(
            "AggregatorV3Interface",
            "0x773616e4d11a78f511299002da57a0a94577f1f4"
        )) as AggregatorV3Interface;

        const factory = (await ethers.getContractFactory(
            "PriceConverterOracleWrapper"
        )) as PriceConverterOracleWrapper__factory;

        priceConverterOracleWrapper = await factory.deploy(
            ohmEthOracle.address,
            ethDaiOracle.address,
            18
        );
    });

    it("price converter oracle wrapper returns the correct price", async () => {
        let ohmEthData = await ohmEthOracle.latestRoundData();
        let ohmEthPrice = ohmEthData.answer;
        let ethDaiData = await ethDaiOracle.latestRoundData();
        let ethDaiPrice = ethDaiData.answer;
        let expectedPrice = ohmEthPrice.mul("1000000000000000000").div(ethDaiPrice);
        let returnedAnswer = await priceConverterOracleWrapper.latestRoundData();
        expect(returnedAnswer.answer).is.equal(expectedPrice);
    });
});
