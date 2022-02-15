const { expect } = require("chai");
const { ethers } = require("hardhat");


/**
 *
 */

describe("TokenWethCalculator", function () {

  // Set up some variables that are initialised in `beforeEach`
  let tokenWethCalculatorContract;
  let mockedPair;

  let PUNK, WETH;

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

    // Register our calculator contract
    tokenWethCalculatorContract = await ethers.getContractFactory("TokenWethCalculator");

    // Set up 2 ERC tokens that we will use in our mock pairing
    const floorContract = await ethers.getContractFactory("FloorERC20Token");
    PUNK = await floorContract.deploy(authority.address);
    WETH = await floorContract.deploy(authority.address);

    let punkReserve = 50000000000000;
    let wethReserve = 10000000000000;

    // Set up a mocked pair
    const mockedPairContract = await ethers.getContractFactory("UniswapV2PairMock");
    mockedPair = await mockedPairContract.deploy(PUNK.address, WETH.address, punkReserve, wethReserve);
    reversedMockedPair = await mockedPairContract.deploy(WETH.address, PUNK.address, wethReserve, punkReserve);
  });


  /**
   * 
   */

  it("Should prevent zero address contracts from being entered", async function () {
    expect(
      tokenWethCalculatorContract.deploy(ethers.constants.AddressZero, WETH.address, 40_000)
    ).to.be.revertedWith('Zero address: _token');

    expect(
      tokenWethCalculatorContract.deploy(PUNK.address, ethers.constants.AddressZero, 40_000)
    ).to.be.revertedWith('Zero address: _WETH');

    // Set up our TokenWethCalculator
    expect(
      tokenWethCalculatorContract.deploy(ethers.constants.AddressZero, ethers.constants.AddressZero, 40_000)
    ).to.be.revertedWith('Zero address: _token');

    // Run an await with a successful run to ensure we capture all previous revertedWith
    await tokenWethCalculatorContract.deploy(PUNK.address, WETH.address, 40_000);
  });


  /**
   * 
   */

  it("Should return correct valuation based on percentage", async function () {
    // Set up our TokenWethCalculator at 40%
    let tokenCalculator = await tokenWethCalculatorContract.deploy(PUNK.address, WETH.address, 40_000);
    expect(await tokenCalculator.valuation(mockedPair.address, 1_000)).to.equal(800_000000);
    expect(await tokenCalculator.valuation(mockedPair.address, 10_000)).to.equal(8000_000000);
    expect(await tokenCalculator.valuation(mockedPair.address, 25_000)).to.equal(20000_000000);
    expect(await tokenCalculator.valuation(mockedPair.address, 100_000)).to.equal(80000_000000);

    // Confirm that we can calculate our valuation regardless of pair ordering
    expect(await tokenCalculator.valuation(reversedMockedPair.address, 1_000)).to.equal(800_000000);
    expect(await tokenCalculator.valuation(reversedMockedPair.address, 10_000)).to.equal(8000_000000);
    expect(await tokenCalculator.valuation(reversedMockedPair.address, 25_000)).to.equal(20000_000000);
    expect(await tokenCalculator.valuation(reversedMockedPair.address, 100_000)).to.equal(80000_000000);

    // Set up our TokenWethCalculator at 25%
    tokenCalculator = await tokenWethCalculatorContract.deploy(PUNK.address, WETH.address, 25_000);
    expect(await tokenCalculator.valuation(mockedPair.address, 1_000)).to.equal(500_000000);
    expect(await tokenCalculator.valuation(mockedPair.address, 10_000)).to.equal(5000_000000);
    expect(await tokenCalculator.valuation(mockedPair.address, 25_000)).to.equal(12500_000000);
    expect(await tokenCalculator.valuation(mockedPair.address, 100_000)).to.equal(50000_000000);

    // Set up our TokenWethCalculator at 0%
    tokenCalculator = await tokenWethCalculatorContract.deploy(PUNK.address, WETH.address, 0);
    expect(await tokenCalculator.valuation(mockedPair.address, 1_000)).to.equal(0);
    expect(await tokenCalculator.valuation(mockedPair.address, 10_000)).to.equal(0);
    expect(await tokenCalculator.valuation(mockedPair.address, 25_000)).to.equal(0);
    expect(await tokenCalculator.valuation(mockedPair.address, 100_000)).to.equal(0);
  });

});
