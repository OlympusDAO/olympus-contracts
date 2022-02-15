const { expect } = require("chai");
const { ethers } = require("hardhat");


/**
 * Helpers for user contract addresses.
 */

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // 18 decimal
const PUNK_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // 18 decimal
const USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // 6 decimal
const PUNK_WETH_ADDRESS = "0x0463a06fbc8bf28b3f120cd1bfc59483f099d332"; // 18 decimal


/**
 * Numerical ENUM representation as defined by Treasury.sol STATUS.
 */

const STATUS_LIQUIDITYTOKEN = 5;
const STATUS_RISKRESERVETOKEN = 8;


/**
 * Validates new Treasury functionality made for the FLOOR fork.
 */

describe("FLOOR Treasury - tokenValue Tests", function () {

  // Our deployed treasury contract
  let floor;
  let treasury;

  // Store any user addresses we want to interact with
  let deployer;
  let users;


  /**
   * Initialise our treasury contract so that we can make calls against it, with a
   * defined deployer and array of users if needed.
   */

  beforeEach(async function () {
    // Set up our deployer / owner address
    [deployer, ...users] = await ethers.getSigners();

    // We need to get our FLOOR contract and authority contract to use in treasury deployment
    const authorityContract = await ethers.getContractFactory("FloorAuthority");
    const authority = await authorityContract.deploy(deployer.address, deployer.address, deployer.address, deployer.address);

    const floorContract = await ethers.getContractFactory("FloorERC20Token");
    floor = await floorContract.deploy(authority.address);

    const punkContract = await ethers.getContractFactory("FloorERC20Token");
    punk = await punkContract.deploy(authority.address);

    // Get the ContractFactory for the Treasury contract
    const treasuryContract = await ethers.getContractFactory("FloorTreasury");
    treasury = await treasuryContract.deploy(floor.address, "0", authority.address);
  });


  /**
   * We should be able to submit WETH to our tokenValue calculation and get
   * back the expected number of FLOOR tokens in the response.
   */

  xit("Should allow for WETH -> FLOOR", async function () {
    test_cases = {
      "0"                    : "0",
      "1000000000"           : "1000",
      "1000000000000000000"  : "1000000000000",
      "1100000000000000000"  : "1100000000000",
      "500000000000000000"   : "500000000000",
      "123450000000000000"   : "123450000000",
      "10000000000000000000" : "10000000000000"
    }

    for (let [input, output] of Object.entries(test_cases)) {
      expect(await treasury.tokenValue(WETH_ADDRESS, input)).to.equal(output);
    }
  });


  /**
   * We should be able to submit a token defined in our RiskOff flow to our tokenValue
   * calculation and get back the expected number of FLOOR tokens in the response.
   * 
   * This test also validates that the correct permissions are enabled in the treasury
   * and that the RiskOffValuation can be set.
   */

  xit("Should allow for RiskOff Valuation -> FLOOR", async function () {
    // Set contract addresses that we want to apply RiskOff to
    const address_x = PUNK_ADDRESS;
    const address_y = USDC_ADDRESS;

    // Confirm that we can't set our RiskOff valuation without permissions applied
    expect(treasury.setRiskOffValuation(address_x, 2)).to.be.revertedWith("Risk on permission not given");

    // Set up our permissions, allowing the deployer to set risk valuation
    // await treasury.initialize()
    await treasury.enable(STATUS_RISKRESERVETOKEN, address_x, address_x)
    await treasury.enable(STATUS_RISKRESERVETOKEN, address_y, address_y)

    await treasury.setRiskOffValuation(address_x, "20000000000000");  // 20 000 FLOOR
    await treasury.setRiskOffValuation(address_y, "3000000000");   // 3 FLOOR

    // 1 PUNK -> 20,0000 FLOOR
    expect(await treasury.tokenValue(address_x, "1000000000000000000")).to.equal("20000000000000");
    expect(await treasury.riskOffValuation(address_x)).to.equal("20000000000000");

    // 5 USDC -> 1 FLOOR
    expect(await treasury.tokenValue(address_y, "500000000")).to.equal("1500000000000");
    expect(await treasury.riskOffValuation(address_y)).to.equal("3000000000");

    // Remove our user's permissions from managing and confirm that we can no longer
    // set the RiskOff valuation
    await treasury.disable(STATUS_RISKRESERVETOKEN, address_x)
    expect(treasury.setRiskOffValuation(address_x, 2)).to.be.revertedWith("Risk on permission not given");
  });


  /**
   * We should be able to submit a liquidity token to our tokenValue calculation
   * and get back the expected number of FLOOR tokens in the response.
   * 
   * This test is currently skipped as the resulting output is generated in realtime
   * so will fluctuate. This could be mocked, but seems pointless to do.
   */

  xit("Should allow for Valid Liquidity Token -> FLOOR", async function () {
    // Initialise our bonding calculator from our FLOOR address
    const bondingCalculatorContract = await ethers.getContractFactory("TokenWethCalculator");
    const bondingCalculator = await bondingCalculatorContract.deploy(punk.address, floor.address, 40000);

    // Enable PUNK_WETH address as a liquidity token against our bonding calculator
    await treasury.enable(STATUS_LIQUIDITYTOKEN, PUNK_WETH_ADDRESS, bondingCalculator.address);
    expect(await treasury.tokenValue(PUNK_WETH_ADDRESS, "1000000000000000000")).to.equal("2001053827000");
  });


  /**
   * We should be able to submit a liquidity token that also has a RiskOffValuation
   * to our tokenValue calculation and get back the expected number of FLOOR tokens
   * in the response. The processes should not be mutually exclusive.
   * 
   * The RiskOff valuation will take precident over the Liquidity formula as it uses
   * the base amount.
   */

  xit("Should allow for Valid Liquidity Token -> RiskOff Valuation -> FLOOR", async function () {
    // By default, PUNK_WETH will just be treated as WETH
    expect(await treasury.tokenValue(PUNK_WETH_ADDRESS, "10000000000000000000")).to.equal("10000000000000");

    // Initialise our bonding calculator from our FLOOR address
    const bondingCalculatorContract = await ethers.getContractFactory("FloorBondingCalculator");
    const bondingCalculator = await bondingCalculatorContract.deploy(floor.address);

    // Enable PUNK_WETH address as a liquidity token against our bonding calculator
    await treasury.enable(STATUS_LIQUIDITYTOKEN, PUNK_WETH_ADDRESS, bondingCalculator.address);

    // We now have PUNK_WETH treated as a liquidity token
    expect(await treasury.tokenValue(PUNK_WETH_ADDRESS, "10000000000000000000")).to.equal("20010538276000");

    // Enable PUNK_WETH as a RiskOff token and set a RiskOff valuation
    await treasury.enable(STATUS_RISKRESERVETOKEN, PUNK_WETH_ADDRESS, PUNK_WETH_ADDRESS)
    await treasury.setRiskOffValuation(PUNK_WETH_ADDRESS, "500000000000000000");

    // We now have PUNK_WETH treated as a liquidity token with a RiskOffValuation to boot
    expect(await treasury.tokenValue(PUNK_WETH_ADDRESS, "10000000000000000000")).to.equal("5000000000000000000000000000");
  });

});
