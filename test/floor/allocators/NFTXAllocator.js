const { expect } = require("chai");
const { ethers } = require("hardhat");
const { FakeContract, smock } = require('@defi-wonderland/smock')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const TEST_ADDRESS_1 = '0xec2C577f651E9e3293a85F082c4b444659393a28';
const TEST_ADDRESS_2 = '0xE76A35d32E6Fd38c572F6C8cde600Aa4134Ace46';
const TEST_ADDRESS_3 = '0x8B59124b6280F2c72F7e9065c408A33EFE313058';
const TEST_ADDRESS_4 = '0xe0751cBf756456981d370Ff98e3c0202ECDaA089';


/**
 * Validates our expected NFTX allocator logic.
 */

describe("NFTX Allocator Logic", function () {

  let allocator, bondingCalculator, floor, punk, punketh, treasury, xtoken, rewardToken;
  let inventoryStakingMock, liquidityStakingMock;

  // Store any user addresses we want to interact with
  let deployer, alice, bob, users;


  /**
   * Initialise our investor contract so that we can make calls against it, with a
   * defined deployer and array of users if needed.
   */

  beforeEach(async function () {
    // Set up our deployer / owner address
    [deployer, alice, bob, ...users] = await ethers.getSigners();

    // Set up our Floor authority and allocate our deployer all roles
    const floorAuthorityContract = await ethers.getContractFactory("FloorAuthority");
    const floorAuthority = await floorAuthorityContract.deploy(
      deployer.address,
      deployer.address,
      deployer.address,
      deployer.address
    );    

    const floorContract = await ethers.getContractFactory("FloorERC20Token");

    // Set up our base floor token
    floor = await floorContract.deploy(floorAuthority.address);

    // Set up the tokens we will be sending to NFTX vaults
    punk = await floorContract.deploy(floorAuthority.address);
    punketh = await floorContract.deploy(floorAuthority.address);

    // Set up alternative punketh to prevent test conflict
    punketh_alt = await floorContract.deploy(floorAuthority.address);

    // Set up our xtoken equivalents
    xPunkToken = await floorContract.deploy(floorAuthority.address);
    xPunkEthToken = await floorContract.deploy(floorAuthority.address);

    rewardToken = await floorContract.deploy(floorAuthority.address);

    // Get the ContractFactory for the Treasury contract
    const treasuryContract = await ethers.getContractFactory("TreasuryMock");
    treasury = await treasuryContract.deploy(floor.address, 10, floorAuthority.address);

    // Create a mock of the NFTX liquidity staking contract
    const inventoryStakingMockContract = await ethers.getContractFactory("NFTXInventoryStaking");
    inventoryStakingMock = await inventoryStakingMockContract.deploy(xPunkToken.address);

    // Set our allocator token
    inventoryStakingMock._setAllocatorToken(punk.address);

    // Mint some xToken to our inventory staking
    xPunkToken.mint(inventoryStakingMock.address, 100_000);

    // Create a mock of the NFTX liquidity staking contract
    const liquidityStakingMockContract = await ethers.getContractFactory("NFTXLPStakingMock");
    liquidityStakingMock = await liquidityStakingMockContract.deploy(xPunkEthToken.address, rewardToken.address);

    // Set our allocator token
    liquidityStakingMock._setAllocatorToken(punketh.address);

    // Mint some xToken to our liquidity staking
    xPunkEthToken.mint(liquidityStakingMock.address, 100_000);

    // Mint some reward token to our liquidity staking
    rewardToken.mint(liquidityStakingMock.address, 100);

    // Set up our NFTX allocation contract
    const allocatorContract = await ethers.getContractFactory("NFTXAllocator");
    allocator = await allocatorContract.deploy(
      floorAuthority.address,
      inventoryStakingMock.address,
      liquidityStakingMock.address,
      treasury.address
    );

    // Set up a mock bonding calculator that can be referenced. This will double
    // any value entered as the inherant value.
    const bondingCalculatorContract = await ethers.getContractFactory("BondingCalculatorMock");
    bondingCalculator = await bondingCalculatorContract.deploy();

    // Reset our treasury audit
    await treasury.auditReserves();
  });


  /**
   * Confirm that expected roles can add tokens.
   */

  it("Should be able to add token", async function () {
    allocator.addDividendToken(TEST_ADDRESS_1, TEST_ADDRESS_2);

    valid_token_mapping = await allocator.dividendTokenInfo(TEST_ADDRESS_1);

    expect(valid_token_mapping.underlying).to.equal(TEST_ADDRESS_1);
    expect(valid_token_mapping.xToken).to.equal(TEST_ADDRESS_2);
    expect(valid_token_mapping.deployed).to.equal(0);

    invalid_token_mapping = await allocator.dividendTokenInfo(TEST_ADDRESS_2);

    expect(invalid_token_mapping.underlying).to.equal(NULL_ADDRESS);
    expect(invalid_token_mapping.xToken).to.equal(NULL_ADDRESS);
    expect(invalid_token_mapping.deployed).to.equal(0);
  });


  /**
   * Confirm that the public cannot add tokens.
   */

  it("Should not allow public to add token", async function () {
    expect(
      allocator.connect(alice).addDividendToken(TEST_ADDRESS_3, TEST_ADDRESS_3)
    ).to.be.revertedWith('UNAUTHORIZED');

    invalid_token_mapping = await allocator.dividendTokenInfo(TEST_ADDRESS_3);

    expect(invalid_token_mapping.underlying).to.equal(NULL_ADDRESS);
    expect(invalid_token_mapping.xToken).to.equal(NULL_ADDRESS);
    expect(invalid_token_mapping.deployed).to.equal(0);
  });


  /**
   * Confirm that we can manage NFTX vaults through mapping and unmapping.
   */

  it("Should be able to set and remove NFTX vault mappings", async function () {
    // Try and set a null address token
    expect(allocator.setStakingToken(NULL_ADDRESS, rewardToken.address, 1, true)).to.be.revertedWith('Cannot set vault for NULL token');

    // Set a vault against a token
    await allocator.setStakingToken(TEST_ADDRESS_1, rewardToken.address, 1, true);

    mapping = await allocator.stakingTokenInfo(TEST_ADDRESS_1);
    expect(mapping.rewardToken).to.equal(rewardToken.address);
    expect(mapping.vaultId).to.equal(1);
    expect(mapping.isLiquidityPool).to.equal(true);
    expect(mapping.exists).to.equal(true);

    // Update the vault mapping
    await allocator.setStakingToken(TEST_ADDRESS_1, rewardToken.address, 2, false);

    mapping = await allocator.stakingTokenInfo(TEST_ADDRESS_1);
    expect(mapping.rewardToken).to.equal(rewardToken.address);
    expect(mapping.vaultId).to.equal(2);
    expect(mapping.isLiquidityPool).to.equal(false);
    expect(mapping.exists).to.equal(true);

    // Delete the vault mapping
    allocator.removeStakingToken(TEST_ADDRESS_1);

    mapping = await allocator.stakingTokenInfo(TEST_ADDRESS_1);
    expect(mapping.rewardToken).to.equal(NULL_ADDRESS);
    expect(mapping.vaultId).to.equal(0);
    expect(mapping.isLiquidityPool).to.equal(false);
    expect(mapping.exists).to.equal(false);
  });


  /**
   * Confirm that our harvest function is reverted as we're unable to specify
   * an amount to request as a parameter, but still need to adhere to the
   * interface.
   */

  it("Should not allow for harvest function call", async function () {
    expect(
      allocator.harvest(TEST_ADDRESS_1, 100)
    ).to.be.revertedWith('Method is deprecated in favour of harvestAll(address _token)');
  });


  /**
   * Confirm that we can run a harvestAll command against a known vault.
   */

  it("Should be able to harvest all rewards against a token", async function () {
    // Approve our reward token in the treasury
    await treasury.enable(2, rewardToken.address, bondingCalculator.address);  // RESERVETOKEN
    await treasury.enable(0, allocator.address, bondingCalculator.address);    // RESERVEDEPOSITOR

    // Set up an inventory and liquidity pool vaults
    await allocator.setStakingToken(TEST_ADDRESS_1, rewardToken.address, 123, false);  // Inventory
    await allocator.setStakingToken(TEST_ADDRESS_2, rewardToken.address, 321, true);   // Liquidity

    // Confirm that an invalid mapping with no vault ID will be prevented
    expect(allocator.harvestAll(TEST_ADDRESS_3)).to.be.revertedWith('Unsupported token');

    // Confirm that we cannot claim rewards from an inventory pool
    expect(allocator.harvestAll(TEST_ADDRESS_1)).to.be.revertedWith('Must be liquidity staking token');

    // Trigger our rewards to be claimed against the mapped vault ID
    await allocator.harvestAll(TEST_ADDRESS_2);

    // We can now confirm that we receive the expected reward tokens. These will
    // be transferred to the treasury from the allocator upon receipt. This amount
    // is hardcoded to 10 in our liquidity staking mock.
    expect(await rewardToken.balanceOf(TEST_ADDRESS_2), 0);
    expect(await rewardToken.balanceOf(treasury.address), 10);
    expect(await rewardToken.balanceOf(liquidityStakingMock.address), 90);
  });


  /**
   * Checks that we can rescue tokens from the contract, but cannot rescue tokens
   * that are known. This prevents our accounting system being circumvented.
   */

  it("Should be able to rescue tokens from contract", async function () {
    // Set a vault against a token
    await allocator.setStakingToken(punketh_alt.address, rewardToken.address, 1, true);

    // Confirm that we now have knowledge of the token in our mappings
    unknown_token_mapping = await allocator.dividendTokenInfo(punk.address);
    expect(unknown_token_mapping.underlying).to.equal(NULL_ADDRESS);
    expect(unknown_token_mapping.xToken).to.equal(NULL_ADDRESS);
    expect(unknown_token_mapping.deployed).to.equal(0);

    // Send a known ERC20 to the contract
    await punketh_alt.mint(allocator.address, 100);
    expect(await punketh_alt.balanceOf(allocator.address)).to.equal(100);

    // Try and rescue the token but check that we receive an error
    expect(allocator.rescue(punketh_alt.address)).to.be.revertedWith('Known token cannot be rescued');

    // Send an unknown ERC20 to the contract
    await punk.mint(allocator.address, 100);
    expect(await punk.balanceOf(allocator.address)).to.equal(100);

    // Confirm that we have no knowledge of the token in our mappings
    unknown_token_mapping = await allocator.dividendTokenInfo(punk.address);
    expect(unknown_token_mapping.underlying).to.equal(NULL_ADDRESS);
    expect(unknown_token_mapping.xToken).to.equal(NULL_ADDRESS);
    expect(unknown_token_mapping.deployed).to.equal(0);

    // Confirm that the Govenor does not currently hold any of the unknown token
    expect(await punk.balanceOf(deployer.address)).to.equal(0);

    // Trigger our rescue call
    await allocator.rescue(punk.address);

    // Confirm that the unknown token has been withdrawn
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(deployer.address)).to.equal(100);

    // Confirm that only the Govenor can process this call
    expect(allocator.connect(alice.address).rescue(punk.address)).to.be.reverted;

    // Try and rescue again as a valid account. This should now raise a revert as
    // we don't hold the token within the contract.
    expect(allocator.rescue(punk.address)).to.be.revertedWith('Token not held in contract');
  });


  /**
   * Test our deposit and withdraw functionality against both a risk and liquidity pool. This
   * will also test how the accounting interacts with the treasury.
   */

  it("Should be able to deposit and withdraw inventory and liquidity", async function () {
    // Populate the allocator with tokens
    await punk.mint(treasury.address, 10_000);
    await punketh.mint(treasury.address, 10_000);

    // Set up an inventory and liquidity vault respectively
    await allocator.setStakingToken(punk.address, rewardToken.address, 1, false);
    await allocator.setStakingToken(punketh.address, rewardToken.address, 2, true);

    // Add an inventory and liquidity token
    await allocator.addDividendToken(punk.address, xPunkToken.address);
    await allocator.addDividendToken(punketh.address, xPunkEthToken.address);

    // Test unknown tokens sent to deposit
    expect(allocator.deposit(NULL_ADDRESS, 500)).to.be.revertedWith('Unsupported staking token')
    expect(allocator.deposit(DAI_ADDRESS, 500)).to.be.revertedWith('Unsupported staking token')

    // Approve the token in the treasury
    await treasury.enable(2, punk.address, bondingCalculator.address);       // RESERVETOKEN
    await treasury.enable(8, punk.address, bondingCalculator.address);       // RISKRESERVETOKEN
    await treasury.enable(5, punketh.address, bondingCalculator.address);    // LIQUIDITYTOKEN

    await treasury.enable(2, xPunkToken.address, bondingCalculator.address);    // RESERVETOKEN
    await treasury.enable(2, xPunkEthToken.address, bondingCalculator.address); // RESERVETOKEN

    // Give our contract the required permissions
    await treasury.enable(0, allocator.address, bondingCalculator.address);  // RESERVEDEPOSITOR
    await treasury.enable(1, allocator.address, bondingCalculator.address);  // RESERVESPENDER
    await treasury.enable(3, allocator.address, bondingCalculator.address);  // RESERVEMANAGER
    await treasury.enable(4, allocator.address, bondingCalculator.address);  // LIQUIDITYDEPOSITOR
    await treasury.enable(6, allocator.address, bondingCalculator.address);  // LIQUIDITYMANAGER
    await treasury.enable(13, allocator.address, bondingCalculator.address); // ALLOCATOR

    // Populate our treasury with a risk valuation. The 2 doesn't matter.
    await treasury.setRiskOffValuation(punk.address, 2);

    // Confirm that our deposit will fail as we haven't set up a calculator for our xToken
    expect(allocator.deposit(punk.address, 1_000)).to.be.revertedWith('Unsupported xToken calculator');

    // Add a calculator for the xToken
    const tokenCalculator = await ethers.getContractFactory("NFTXXTokenCalculator");
    xTokenCalculator = await tokenCalculator.deploy(inventoryStakingMock.address, treasury.address);
    await treasury.enable(12, xPunkToken.address, xTokenCalculator.address);  // XTOKEN

    // Add a calculator for the LP xToken
    const tokenWethCalculator = await ethers.getContractFactory("NFTXXTokenWethCalculator");
    xTokenWethCalculator = await tokenWethCalculator.deploy(liquidityStakingMock.address, treasury.address);
    await treasury.enable(12, xPunkEthToken.address, xTokenWethCalculator.address);  // XTOKEN

    // Sent to inventory
    await allocator.deposit(punk.address, 1_000);

    // The treasury started with a supply of 10_000 punk, and we have deposited 1_000
    // to NFTX, so we should have a decreased amount in the treasury and have the xtoken
    // supply equivalent in the allocator.
    expect(await punk.balanceOf(treasury.address)).to.equal(9_000);
    expect(await punketh.balanceOf(treasury.address)).to.equal(10_000);
    expect(await xPunkToken.balanceOf(treasury.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(treasury.address)).to.equal(0);
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punketh.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkToken.balanceOf(allocator.address)).to.equal(1_000);
    expect(await xPunkEthToken.balanceOf(allocator.address)).to.equal(0);

    // We are restricted by the NFTX vault due to a 2 second delay in the mint. This means
    // that we need to make a separate call to subsequently deposit the xToken into the
    // treasury in a secondary call. We can see from the above assertions that the treasury
    // has no xPunkToken yet, but the allocator has retained them. This call will move that.
    await allocator.depositXTokenToTreasury(punk.address);

    expect(await punk.balanceOf(treasury.address)).to.equal(9_000);
    expect(await punketh.balanceOf(treasury.address)).to.equal(10_000);
    expect(await xPunkToken.balanceOf(treasury.address)).to.equal(1_000);
    expect(await xPunkEthToken.balanceOf(treasury.address)).to.equal(0);
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punketh.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkToken.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(allocator.address)).to.equal(0);

    // Try and deposit the xToken again, though we have no addition xToken to move to
    // the treasury.
    await allocator.depositXTokenToTreasury(punk.address);

    let dividendTokenInfo = await allocator.dividendTokenInfo(punk.address);
    expect(dividendTokenInfo.underlying).to.equal(punk.address);
    expect(dividendTokenInfo.xToken).to.equal(xPunkToken.address);
    expect(dividendTokenInfo.deployed).to.equal(1_000);

    // Send to liquidity
    await allocator.deposit(punketh.address, 5_000);

    // Validate our accountingFor output
    expect(await punk.balanceOf(treasury.address)).to.equal(9_000);
    expect(await punketh.balanceOf(treasury.address)).to.equal(5_000);
    expect(await xPunkToken.balanceOf(treasury.address)).to.equal(1_000);
    expect(await xPunkEthToken.balanceOf(treasury.address)).to.equal(0);
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punketh.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkToken.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(allocator.address)).to.equal(5_000);

    await allocator.depositXTokenToTreasury(punketh.address);

    expect(await punk.balanceOf(treasury.address)).to.equal(9_000);
    expect(await punketh.balanceOf(treasury.address)).to.equal(5_000);
    expect(await xPunkToken.balanceOf(treasury.address)).to.equal(1_000);
    expect(await xPunkEthToken.balanceOf(treasury.address)).to.equal(5_000);
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punketh.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkToken.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(allocator.address)).to.equal(0);

    dividendTokenInfo = await allocator.dividendTokenInfo(punketh.address);
    expect(dividendTokenInfo.underlying).to.equal(punketh.address);
    expect(dividendTokenInfo.xToken).to.equal(xPunkEthToken.address);
    expect(dividendTokenInfo.deployed).to.equal(5_000);

    // Now that we have funds in the treasury and allocator, we can
    // test our withdrawal logic.

    // Test unknown tokens sent to deposit
    expect(allocator.withdraw(NULL_ADDRESS, 500)).to.be.revertedWith('Unsupported staking token')
    expect(allocator.withdraw(DAI_ADDRESS, 500)).to.be.revertedWith('Unsupported staking token')

    // Withdraw from inventory
    await allocator.withdraw(punk.address, 1_000);

    // Validate our accountingFor output
    expect(await punk.balanceOf(treasury.address)).to.equal(10_000);
    expect(await punketh.balanceOf(treasury.address)).to.equal(5_000);
    expect(await xPunkToken.balanceOf(treasury.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(treasury.address)).to.equal(5_000);
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punketh.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkToken.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(allocator.address)).to.equal(0);

    dividendTokenInfo = await allocator.dividendTokenInfo(punk.address);
    expect(dividendTokenInfo.underlying).to.equal(punk.address);
    expect(dividendTokenInfo.xToken).to.equal(xPunkToken.address);
    expect(dividendTokenInfo.deployed).to.equal(0);

    // Withdrawl from liquidity
    await allocator.withdraw(punketh.address, 5_000);

    // Validate our accountingFor output
    expect(await punk.balanceOf(treasury.address)).to.equal(10_000);
    expect(await punketh.balanceOf(treasury.address)).to.equal(10_000);
    expect(await xPunkToken.balanceOf(treasury.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(treasury.address)).to.equal(0);
    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punketh.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkToken.balanceOf(allocator.address)).to.equal(0);
    expect(await xPunkEthToken.balanceOf(allocator.address)).to.equal(0);

    dividendTokenInfo = await allocator.dividendTokenInfo(punketh.address);
    expect(dividendTokenInfo.underlying).to.equal(punketh.address);
    expect(dividendTokenInfo.xToken).to.equal(xPunkEthToken.address);
    expect(dividendTokenInfo.deployed).to.equal(0);
  });


  /**
   * Test that we can circumvent the rescue restrictions by temporarily removing and
   * then re-setting the vault.
   */

  it('Should be able to rescue known token via alternative flow', async function () {
    // Add some punk to our allocator
    await punk.mint(allocator.address, 5_000);

    // Set a vault
    await allocator.setStakingToken(punk.address, rewardToken.address, 0, false);

    // Confirm cannot rescue as token is known
    expect(allocator.rescue(punk.address)).to.be.revertedWith('Known token cannot be rescued');

    // Confirm that the allocator still holds the PUNK
    expect(await punk.balanceOf(allocator.address), 5_000);
    expect(await punk.balanceOf(deployer.address), 0);

    // Remove vault
    await allocator.removeStakingToken(punk.address);

    // Confirm can now rescue
    await allocator.rescue(punk.address);

    // Set vault again
    await allocator.setStakingToken(punk.address, rewardToken.address, 0, false);

    // Confirm that the allocator no longer has PUNK and the governor now has it
    expect(await punk.balanceOf(allocator.address), 0);
    expect(await punk.balanceOf(deployer.address), 5_000);
  })


  /**
   * - Deposit PUNK in treasury
   * - Allocate PUNK to NFTX
   * - Withdraw allocation to treasury
   * - Audit reserves
   * - Expect excess reserves to be the same
   */

  it('Handle excess PUNK reserves when the same', async function () {
    // Set up an inventory and liquidity vault respectively
    await allocator.setStakingToken(punk.address, rewardToken.address, 1, false);

    // Add an inventory and liquidity token
    await allocator.addDividendToken(punk.address, xPunkToken.address);

    // Approve the token in the treasury
    await treasury.enable(0, allocator.address, bondingCalculator.address);   // RESERVEDEPOSITOR
    await treasury.enable(0, deployer.address, bondingCalculator.address);    // RESERVEDEPOSITOR
    await treasury.enable(3, allocator.address, bondingCalculator.address);   // RESERVEMANAGER
    await treasury.enable(2, punk.address, bondingCalculator.address);        // RESERVETOKEN
    await treasury.enable(2, xPunkToken.address, bondingCalculator.address);  // RESERVETOKEN
    await treasury.enable(13, allocator.address, bondingCalculator.address);  // ALLOCATOR

    // Add a calculator for the xToken
    const tokenCalculator = await ethers.getContractFactory("NFTXXTokenCalculator");
    xTokenCalculator = await tokenCalculator.deploy(inventoryStakingMock.address, treasury.address);
    await treasury.enable(12, xPunkToken.address, xTokenCalculator.address);  // XTOKEN

    // Deposit PUNK in treasury
    await punk.mint(deployer.address, 5_000);
    await punk.connect(deployer).approve(treasury.address, 5_000);
    await treasury.deposit(5_000, punk.address, treasury.tokenValue(punk.address, 5_000));

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(5_000);
    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);

    // Allocate PUNK to NFTX
    await allocator.deposit(punk.address, 3_000);

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(2_000);
    expect(await treasury.totalReserves()).to.equal(2_000);
    expect(await treasury.excessReserves()).to.equal(2_000);

    // Move NFTX xToken from allocator to treasury
    await allocator.depositXTokenToTreasury(punk.address);

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(2_000);
    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);

    // Withdraw allocation to treasury
    await allocator.withdraw(punk.address, 3_000);

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(5_000);
    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);
  })


  /**
   * - Set `riskOffValuation` of PUNK to 20,000 * 1e9
   * - Deposit PUNK in treasury
   * - Allocate PUNK to NFTX
   * - Increase PUNK `riskOffValuation` to 40,000 * 1e9
   * - Audit reserves
   * - Withdraw allocation to treasury
   * - Expect excess reserves to ignore the increased `riskOffValuation`
   */

  it('Handle excess PUNK reserves with changing riskOffValuation value', async function () {
    // Set up an inventory and liquidity vault respectively
    await allocator.setStakingToken(punk.address, rewardToken.address, 1, false);

    // Add an inventory and liquidity token
    await allocator.addDividendToken(punk.address, xPunkToken.address);

    // Approve the token in the treasury
    await treasury.enable(0, allocator.address, bondingCalculator.address);   // RESERVEDEPOSITOR
    await treasury.enable(0, deployer.address, bondingCalculator.address);    // RESERVEDEPOSITOR
    await treasury.enable(3, allocator.address, bondingCalculator.address);   // RESERVEMANAGER
    await treasury.enable(2, punk.address, bondingCalculator.address);        // RESERVETOKEN
    await treasury.enable(2, xPunkToken.address, bondingCalculator.address);  // RESERVETOKEN
    await treasury.enable(13, allocator.address, bondingCalculator.address);  // ALLOCATOR

    // Add a calculator for the xToken
    const tokenCalculator = await ethers.getContractFactory("NFTXXTokenCalculator");
    xTokenCalculator = await tokenCalculator.deploy(inventoryStakingMock.address, treasury.address);
    await treasury.enable(12, xPunkToken.address, xTokenCalculator.address);  // XTOKEN

    // Set up our permissions, allowing the deployer to set risk valuation
    await treasury.enable(8, punk.address, punk.address)  // RISKRESERVETOKEN
    await treasury.setRiskOffValuation(punk.address, 20_000 * 1e9);

    // Deposit PUNK in treasury
    await punk.mint(deployer.address, 5_000);
    await punk.connect(deployer).approve(treasury.address, 5_000);
    await treasury.deposit(5_000, punk.address, treasury.tokenValue(punk.address, 5_000));

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(5_000);

    // Audit reserves
    await treasury.auditReserves()

    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(5_000);

    // Allocate PUNK to NFTX
    await allocator.deposit(punk.address, 3_000);

    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(2_000);

    await treasury.setRiskOffValuation(punk.address, 40_000 * 1e9);

    expect(await treasury.totalReserves()).to.equal(2_000);
    expect(await treasury.excessReserves()).to.equal(2_000);

    // Move NFTX xToken from allocator to treasury
    await allocator.depositXTokenToTreasury(punk.address);

    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);

    // Withdraw allocation to treasury
    await allocator.withdraw(punk.address, 3_000);

    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(5_000);
    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);

    // Allocate PUNK to NFTX
    await allocator.deposit(punk.address, 2_000);

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(3_000);

    await treasury.setRiskOffValuation(punk.address, 30_000 * 1e9);

    // Move NFTX xToken from allocator to treasury
    await allocator.depositXTokenToTreasury(punk.address);

    expect(await punk.balanceOf(allocator.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(3_000);

    // Withdraw allocation to treasury
    await allocator.withdraw(punk.address, 2_000);

    expect(await punk.balanceOf(deployer.address)).to.equal(0);
    expect(await punk.balanceOf(treasury.address)).to.equal(5_000);
    expect(await treasury.totalReserves()).to.equal(5_000);
    expect(await treasury.excessReserves()).to.equal(5_000);
  })

});
