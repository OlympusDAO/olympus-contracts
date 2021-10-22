const { ethers } = require("hardhat");
const { expect } = require("../utils/test_env");
const { advanceBlock } = require("../utils/advancement");
const { fork_network, fork_reset } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");
const old_treasury_abi = require("../../abis/old_treasury_abi");
const { tokens } = require("./tokens");

const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const OLD_OHM_ADDRESS = process.env.OLD_OHM_ADDRESS;
const OLD_SOHM_ADDRESS = process.env.OLD_SOHM_ADDRESS;
const OLD_TREASURY_ADDRESS = process.env.OLD_TREASURY_ADDRESS;
const OLD_STAKING_ADDRESS = process.env.OLD_STAKING_ADDRESS;
const OLD_WSOHM_ADDRESS = process.env.OLD_WSOHM_ADDRESS;
const DAI_ADDRESS = process.env.DAI;

const SUSHI_ROUTER = process.env.SUSHI_ROUTER;
const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER;

const EPOCH_LEGNTH = 2200;

// Some of these need to be global for the fast_track method
// TODO(zx): maybe refactor this
let deployer, user1, user2, manager, old_treasury;
let olympusTokenMigrator, ohm, sOhm, gOhm, newTreasury, newStaking;

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
            DAI_ADDRESS,
            SUSHI_ROUTER,
            UNISWAP_ROUTER,
            0 // timelock
        );

        let gOhmContract = await ethers.getContractFactory("gOHM");
        gOhm = await gOhmContract.deploy(olympusTokenMigrator.address);

        // Set gOHM on migrator contract
        olympusTokenMigrator.connect(deployer).setgOHM(gOhm.address);

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
        buildContracts(tokens);

        // 3 is the reserve manager
        await old_treasury.connect(manager).queue(3, olympusTokenMigrator.address);

        await advanceBlocks(13000);

        await old_treasury
            .connect(manager)
            .toggle(3, olympusTokenMigrator.address, olympusTokenMigrator.address);

        // Enables onchain governance, needs two calls. :odd:
        await newTreasury.connect(deployer).enableOnChainGovernance();
        await advanceBlocks(1000);
        await newTreasury.connect(deployer).enableOnChainGovernance();

        await enableTokens(newTreasury, deployer, tokens);

        // 0 = RESERVED DEPOSITOR
        await newTreasury
            .connect(deployer)
            .enable(0, olympusTokenMigrator.address, olympusTokenMigrator.address);

        // 8 = Rewards manager (allows minting)
        await newTreasury
            .connect(deployer)
            .enable(8, olympusTokenMigrator.address, olympusTokenMigrator.address);
    });

    after(async () => {
        await fork_reset();
    });

    it("Should fail if sender is not Owner", async () => {
        const tokenAddresses = tokens.map((token) => token.address);
        const reserveToken = tokens.map((token) => token.isReserve);

        await expect(
            olympusTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken)
        ).to.revertedWith("Ownable: caller is not the owner");

        await expect(
            olympusTokenMigrator
                .connect(user1)
                .migrateContracts(
                    newTreasury.address,
                    newStaking.address,
                    ohm.address,
                    sOhm.address
                )
        ).to.be.revertedWith("Ownable: caller is not the owner");
        // TODO (zx:) This method is allowed to be called by anyone with ohms.
        // await expect(olympusTokenMigrator.connect(user1).migrate()).to.revertedWith("Only DAO can call this function");
    });

    it("should fail if token is not equal to reserve token", async () => {
        const tokenAddresses = tokens.map((token) => token.address);

        await expect(
            olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, [true, true, true])
        ).to.revertedWith("token array lengths do not match");
    });

    it("Should allow DAO add tokens", async () => {
        const tokenAddresses = tokens.map((token) => token.address);
        const reserveToken = tokens.map((token) => token.isReserve);

        await olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, reserveToken);
    });

    it("Should allow DAO migrate tokens", async () => {
        await ohm.connect(deployer).setVault(newTreasury.address);
        await getTreasuryBalance(deployer, newTreasury.address, tokens);

        //TODO (zx): fix this shit
        // Set up the staking contract properly
        await olympusTokenMigrator
            .connect(deployer)
            .migrateContracts(newTreasury.address, newStaking.address, ohm.address, sOhm.address);

        console.log("===============Migration done!===============");

        await getTreasuryBalance(deployer, newTreasury.address, tokens);
    });
});

async function enableTokens(treasury, deployer, tokens = []) {
    const tokenAddresses = tokens.map((token) => token.address);

    let enablePromises = tokenAddresses.map(async (tokenAddress) => {
        // 2 = RESERVETOKEN
        return await treasury.connect(deployer).enable(2, tokenAddress, tokenAddress);
    });
    return Promise.all(enablePromises);
}

async function buildContracts(tokenList) {
    tokenList.forEach((token) => {
        token.contract = new ethers.Contract(token.address, token.abi, ethers.provider);
    });
}

async function getTreasuryBalance(deployer, newTreasuryAddress, tokens) {
    let tokenContract, tokenName;
    for (let i = 0; i < tokens.length; i++) {
        tokenName = tokens[i].name;
        tokenContract = tokens[i].contract;

        const oldTreasuryBalance = await tokenContract
            .connect(deployer)
            .balanceOf(OLD_TREASURY_ADDRESS);
        console.log(`old_treasury_${tokenName}_balance`, oldTreasuryBalance.toString());

        const newTreasuryBalance = await tokenContract
            .connect(deployer)
            .balanceOf(newTreasuryAddress);
        console.log(`new_treasury_${tokenName}_balance`, newTreasuryBalance.toString());
    }
}

async function advanceBlocks(numBlocks) {
    for (let i = 0; i < numBlocks; i++) {
        await advanceBlock();
    }
}
