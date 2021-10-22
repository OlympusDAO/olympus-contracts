const { ethers } = require("hardhat");
const dai_abi = require("../../abis/dai");
const { expect } = require("../utils/test_env.js");
const frax_abi = require("../../abis/frax");
const weth_abi = require("../../abis/weth");
const lusd_abi = require("../../abis/lusd");
const { advanceBlock } = require("../utils/advancement");
const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");
const old_treasury_abi = require("../../abis/old_treasury_abi");

const DAI = process.env.DAI;
const FRAX = process.env.FRAX;
const WETH = process.env.WETH;
const LUSD = process.env.LUSD;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const OLD_OHM_ADDRESS = process.env.OLD_OHM_ADDRESS;
const OLD_SOHM_ADDRESS = process.env.OLD_SOHM_ADDRESS;
const OLD_TREASURY_ADDRESS = process.env.OLD_TREASURY_ADDRESS;
const OLD_STAKING_ADDRESS = process.env.OLD_STAKING_ADDRESS;
const OLD_WSOHM_ADDRESS = process.env.OLD_WSOHM_ADDRESS;

const SUSHI_ROUTER = process.env.SUSHI_ROUTER;
const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER;

const tokenAddresses = [DAI, FRAX, WETH, LUSD];
const reserveToken = [true, true, true, true];
const EPOCH_LEGNTH = 2200;

// Some of these need to be global for the fast_track method
// TODO(zx): maybe refactor this
let deployer, user1, user2, manager, old_treasury, dai, weth, frax, lusd;
let olympusTokenMigrator, ohm, sOhm, newTreasury, newStaking;

describe("Treasury Token Migration", async () => {
  before(async () => {
    await fork_network();

    [deployer, user1, user2] = await ethers.getSigners();

    let ohmContract = await ethers.getContractFactory("OlympusERC20Token");
    ohm = await ohmContract.deploy();

    let sOhmContract = await ethers.getContractFactory("sOlympus");
    sOhm = await sOhmContract.connect(deployer).deploy();

    let newTreasuryContract = await ethers.getContractFactory("OlympusTreasury");
    newTreasury = await newTreasuryContract.deploy(ohm.address, 10);

    let newStakingContract = await ethers.getContractFactory("OlympusStaking");
    newStaking = await newStakingContract.deploy(ohm.address, sOhm.address, EPOCH_LEGNTH, 0, 0);

    let tokenMigratorContract = await ethers.getContractFactory("OlympusTokenMigrator");
    olympusTokenMigrator = await tokenMigratorContract.deploy(
      OLD_OHM_ADDRESS,
      OLD_SOHM_ADDRESS,
      OLD_TREASURY_ADDRESS,
      OLD_STAKING_ADDRESS,
      OLD_WSOHM_ADDRESS,
      DAI,
      SUSHI_ROUTER,
      UNISWAP_ROUTER,
      0
    );

    await deployer.sendTransaction({
      to: TREASURY_MANAGER,
      value: ethers.utils.parseEther("1"), // 1 ether
    });

    await impersonateAccount(TREASURY_MANAGER);

    manager = await ethers.getSigner(TREASURY_MANAGER);

    old_treasury = await new ethers.Contract(
      OLD_TREASURY_ADDRESS,
      old_treasury_abi,
      ethers.provider
    );

    const tokens = await fastTrack(1, tokenAddresses);

    dai = tokens[0];
    frax = tokens[1];
    weth = tokens[2];
    lusd = tokens[3];

    await old_treasury.connect(manager).queue(3, olympusTokenMigrator.address);

    console.log("fastTrack 1300");
    await fastTrack(13000);

    await old_treasury
      .connect(manager)
      .toggle(3, olympusTokenMigrator.address, olympusTokenMigrator.address);

    await newTreasury.connect(deployer).enableOnChainGovernance();

    console.log("fastTrack1000");
    await fastTrack(1000);

    await newTreasury.connect(deployer).enableOnChainGovernance();

    console.log("fastTrack4");
    await fastTrack(4, tokenAddresses);

    await newTreasury
      .connect(deployer)
      .enable(0, olympusTokenMigrator.address, olympusTokenMigrator.address);
  });

  it("Should fail if sender is not DAO", async () => {
    await expect(
      olympusTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken)
    ).to.revertedWith("Ownable: caller is not the owner");
    await expect(
      olympusTokenMigrator
        .conntect(user1)
        .migrateContracts("_newTreasury", "_newStaking", "_newOHM", "_newsOHM")
    ).to.be.revertedWith("Ownable: caller is not the owner");
    // TODO (zx:) APparently anyone can call this..
    // await expect(olympusTokenMigrator.connect(user1).migrate()).to.revertedWith("Only DAO can call this function");
  });

  it("should fail if token is not equal to reserve token", async () => {
    await expect(
      olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, [true, true, true])
    ).to.revertedWith("arrays length does not match");
  });

  it("Should allow DAO add tokens", async () => {
    await olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, reserveToken);
  });

  it("Should fail if new treasury is not vault", async () => {
    await expect(olympusTokenMigrator.connect(deployer).migrate()).to.revertedWith(
      "VaultOwned: caller is not the Vault"
    );
  });

  it("Should allow DAO migrate tokens", async () => {
    await ohm.connect(deployer).setVault(newTreasury.address);
    await fastTrack(2);

    await olympusTokenMigrator.connect(deployer).migrate();
    console.log("Migration done!");
    await fastTrack(3);
  });
});

async function fastTrack(loop, address = []) {
  if (loop === 4) {
    for (let i = 0; i < loop; i++) {
      await newTreasury.connect(deployer).enable(2, address[i], address[i]);
    }
  } else if (loop === 1) {
    const count = loop + 3;
    const tokens = [];
    const token_abi = [dai_abi, frax_abi, weth_abi, lusd_abi];

    for (let i = 0; i < count; i++) {
      const token_address = await new ethers.Contract(address[i], token_abi[i], ethers.provider);
      tokens[i] = token_address;
    }

    return tokens;
  } else if (loop === 2) {
    const count = loop + 2;

    const contract = [dai, frax, weth, lusd];
    const contract_name = ["dai", "frax", "weth", "lusd"];

    for (let i = 0; i < count; i++) {
      const bal_before_tx = await contract[i].connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
      console.log(`old_treasury_${contract_name[i]}_bal_before_tx`, bal_before_tx.toString());

      const bal_after_tx = await contract[i].connect(deployer).balanceOf(newTreasury.address);
      console.log(`new_treasury_${contract_name[i]}_bal_before_tx`, bal_after_tx.toString());
    }
  } else if (loop === 3) {
    const count = loop + 1;

    const contract = [dai, frax, weth, lusd];
    const contract_name = ["dai", "frax", "weth", "lusd"];

    for (let i = 0; i < count; i++) {
      const bal_before_tx = await contract[i].connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
      console.log(`old_treasury_${contract_name[i]}_bal_after_tx`, bal_before_tx.toString());

      const bal_after_tx = await contract[i].connect(deployer).balanceOf(newTreasury.address);
      console.log(`new_treasury_${contract_name[i]}bal_after_tx`, bal_after_tx.toString());
    }
  } else {
    for (let i = 0; i < loop; i++) {
      await advanceBlock();
    }
  }
}
