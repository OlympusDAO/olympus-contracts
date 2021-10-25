const { ethers } = require("hardhat");
const { expect } = require("../utils/test_env.js");
const { advanceBlock } = require("../utils/advancement");
const { fork_network, fork_reset } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");
const old_treasury_abi = require("../../abis/old_treasury_abi");
const old_sohm_abi = require("../../abis/sohm");

const { treasury_tokens, olympus_tokens, olympus_lp_tokens, swaps } = require("./tokens");

const EPOCH_LEGNTH = 2200;
const DAI_ADDRESS = process.env.DAI;
const SUSHI_ROUTER = process.env.SUSHI_ROUTER;
const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER;
const OLD_OHM_ADDRESS = process.env.OLD_OHM_ADDRESS;
const OLD_SOHM_ADDRESS = process.env.OLD_SOHM_ADDRESS;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const NON_TOKEN_HOLDER = process.env.NON_TOKEN_HOLDER;
const OLD_WSOHM_ADDRESS = process.env.OLD_WSOHM_ADDRESS;
const OLD_STAKING_ADDRESS = process.env.OLD_STAKING_ADDRESS;
const OLD_TREASURY_ADDRESS = process.env.OLD_TREASURY_ADDRESS;

const tokenAddresses = treasury_tokens.map((token) => token.address);
const reserveToken = treasury_tokens.map((token) => token.isReserve);

const lp_token_0 = olympus_lp_tokens.map((lp_token) => lp_token.token0);
const lp_token_1 = olympus_lp_tokens.map((lp_token) => lp_token.token1);
const is_sushi_lp = olympus_lp_tokens.map((lp_token) => lp_token.is_sushi);
const lp_token_addresses = olympus_lp_tokens.map((lp_token) => lp_token.address);

describe("Treasury Token Migration", async () => {
    let deployer,
        user1,
        manager,
        old_treasury,
        olympusTokenMigrator,
        ohm,
        sOhm,
        gOhm,
        newTreasury,
        newStaking;

    before(async () => {
        await fork_network(13487643);
        [deployer, user1] = await ethers.getSigners();

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

        /**
         * Connect the contracts once they have been deployed
         * */

        // Set gOHM on migrator contract
        await olympusTokenMigrator.connect(deployer).setgOHM(gOhm.address);

        // Setting the vault for new ohm:
        await ohm.connect(deployer).setVault(newTreasury.address);

        // Initialize staking
        newStaking.connect(deployer).setContract(1, gOhm.address);
        newStaking.connect(deployer).setWarmup(0);

        // Initialize new sOHM
        const oldSohm = await new ethers.Contract(OLD_SOHM_ADDRESS, old_sohm_abi, ethers.provider);
        const index = await oldSohm.connect(deployer).index();
        sOhm.connect(deployer).setIndex(index);
        sOhm.connect(deployer).setgOHM(gOhm.address);
        sOhm.connect(deployer).initialize(newStaking.address);

        // Send treasury_manager eth for gas on simimulated mainnet
        await sendETH(deployer, TREASURY_MANAGER);

        manager = await impersonate(TREASURY_MANAGER);

        old_treasury = await new ethers.Contract(
            OLD_TREASURY_ADDRESS,
            old_treasury_abi,
            ethers.provider
        );

        await setContracts(treasury_tokens);
        await setContracts(olympus_tokens);
        await setContracts(olympus_lp_tokens);
        await setContracts(swaps);

        // Give migrator permissions for managing old treasury
        // 3 = RESERVEMANAGER
        // 6 = LIQUIDITYMANAGER
        // 1 = RESERVESPENDER
        await old_treasury.connect(manager).queue(3, olympusTokenMigrator.address);
        await old_treasury.connect(manager).queue(6, olympusTokenMigrator.address);
        await old_treasury.connect(manager).queue(1, olympusTokenMigrator.address);

        // Note (zx): Why do we do this?
        // 2 = RESERVETOKEN
        await old_treasury.connect(manager).queue(2, lp_token_1[0]);

        await advance(13000);

        // Toggle permissions on
        await old_treasury
            .connect(manager)
            .toggle(3, olympusTokenMigrator.address, olympusTokenMigrator.address);

        await old_treasury
            .connect(manager)
            .toggle(6, olympusTokenMigrator.address, olympusTokenMigrator.address);

        await old_treasury
            .connect(manager)
            .toggle(1, olympusTokenMigrator.address, olympusTokenMigrator.address);

        await old_treasury.connect(manager).toggle(2, lp_token_1[0], lp_token_1[0]);

        // Enables onchain governance, needs two calls. :odd:
        await newTreasury.connect(deployer).enableOnChainGovernance();
        await advance(1000);
        await newTreasury.connect(deployer).enableOnChainGovernance();

        // Give migrator access to be the reserve depositor
        // Give migrator access to mint rewards.
        // 0 = RESERVED DEPOSITOR
        // 8 = Rewards manager (allows minting)
        await enableAddress(deployer, newTreasury, 0, olympusTokenMigrator.address);
        await enableAddress(deployer, newTreasury, 8, olympusTokenMigrator.address);
        await enableTokens(deployer, newTreasury, treasury_tokens);
    });

    after(async () => {
        await fork_reset();
    });

    it("Should fail if sender is not DAO", async () => {
        await expect(
            olympusTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken)
        ).to.revertedWith("Ownable: caller is not the owner");

        await expect(
            olympusTokenMigrator
                .connect(user1)
                .addLPTokens(lp_token_addresses, lp_token_0, lp_token_1, is_sushi_lp)
        ).to.revertedWith("Ownable: caller is not the owner");

        await expect(
            olympusTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken)
        ).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if user does not have any of the ohm tokens to migrate ", async () => {
        await sendETH(deployer, NON_TOKEN_HOLDER);
        const user = await impersonate(NON_TOKEN_HOLDER);
        await expect(olympusTokenMigrator.connect(user).migrate(1000000, 0)).to.revertedWith(
            "ERC20: transfer amount exceeds balance"
        );
    });

    it("should fail if token is not equal to reserve token", async () => {
        await expect(
            olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, [true, true, true])
        ).to.revertedWith("token array lengths do not match");

        await expect(
            olympusTokenMigrator
                .connect(deployer)
                .addLPTokens(lp_token_addresses, lp_token_0, lp_token_1, [true, true])
        ).to.revertedWith("token array lengths do not match");
    });

    it("Should migrate user ohm, sohm, and wsohm to gohm when migration is false ", async () => {
        let token;
        for (let i = 0; i < olympus_tokens.length; i++) {
            token = olympus_tokens[i];
            await migrateToken(deployer, olympusTokenMigrator, gOhm, token, false);
        }
    });

    it("Should allow DAO add tokens", async () => {
        await olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, reserveToken);
    });

    it("Should allow DAO add lp tokens", async () => {
        await olympusTokenMigrator
            .connect(deployer)
            .addLPTokens(lp_token_addresses, lp_token_0, lp_token_1, is_sushi_lp);
    });

    it("Should fail if user does not have any of the ohm tokens to bridge back ", async () => {
        await sendETH(deployer, NON_TOKEN_HOLDER);
        const user = await impersonate(NON_TOKEN_HOLDER);
        await expect(olympusTokenMigrator.connect(user).bridgeBack(1000000, 0)).to.revertedWith(
            "SafeMath: subtraction overflow"
        );
    });

    it("Should bridgeBack user ohm, sohm, and wsohm from gohm when migration is false ", async () => {
        let token;
        for (let i = 0; i < olympus_tokens.length; i++) {
            token = olympus_tokens[i];
            await migrateToken(deployer, olympusTokenMigrator, gOhm, token, true);
        }
    });

    it("Should allow DAO migrate tokens ", async () => {
        await getTreasuryBalance(deployer, newTreasury.address, [
            ...treasury_tokens,
            ...olympus_lp_tokens,
        ]);

        await olympusTokenMigrator
            .connect(deployer)
            .migrateContracts(newTreasury.address, newStaking.address, ohm.address, sOhm.address);

        await getTreasuryBalance(deployer, newTreasury.address, [
            ...treasury_tokens,
            ...olympus_lp_tokens,
        ]);
    });

    it("Should defund", async () => {
        //migrate users token again after brdige back so olympus token migrator contract has some balance
        let ohmToken = olympus_tokens.find((token) => token.name === "ohm");
        await migrateToken(deployer, olympusTokenMigrator, gOhm, ohmToken, false);

        await olympusTokenMigrator.connect(deployer).startTimelock();
        await advance(1000);
        await olympusTokenMigrator.connect(deployer).defund();
    });
});

async function advance(count) {
    for (let i = 0; i < count; i++) {
        await advanceBlock();
    }
}

async function sendETH(deployer, address) {
    await deployer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther("1"), // 1 ether
    });
}

async function impersonate(address) {
    await impersonateAccount(address);
    const owner = await ethers.getSigner(address);
    return owner;
}

async function setContracts(array) {
    array.forEach((token) => {
        token.contract = new ethers.Contract(token.address, token.abi, ethers.provider);
    });
}

async function enableAddress(deployer, treasury, enum_number, address = 0x0) {
    await treasury.connect(deployer).enable(enum_number, address, address);
}

async function enableTokens(deployer, treasury, tokenList = []) {
    let enableTokensPromises = tokenList.map(async (token) => {
        await treasury.connect(deployer).enable(2, token.address, token.address);
    });

    return await Promise.all(enableTokensPromises);
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

async function migrateToken(deployer, migrator, gOhm, token, isBridgeBack = false) {
    const contract = token.contract;
    const name = token.name;
    const userAddress = token.wallet;
    const type = token.type;

    const tokenBalance = await contract.balanceOf(userAddress);
    const gOhmBalance = await gOhm.balanceOf(userAddress);

    console.log(`user_${name}_balance:`, tokenBalance.toString());
    console.log("user_gohm_balance:", gOhmBalance.toString());

    const user = await impersonate(userAddress);
    await sendETH(deployer, userAddress);

    await contract.connect(user).approve(migrator.address, tokenBalance);
    if (isBridgeBack) {
        await migrator.connect(user).bridgeBack(gOhmBalance, type);
    } else {
        await migrator.connect(user).migrate(tokenBalance, type);
    }

    console.log("===============User Token Migration/Bridge Done!===============");

    tokenBalance = await contract.balanceOf(userAddress);
    gOhmBalance = await gOhm.balanceOf(userAddress);
    console.log(`user_${name}_balance:`, tokenBalance.toString());
    console.log("user_gohm_balance:", gOhmBalance.toString());
}

// TODO(zx): DEBUG re-use this method at the end of migration to view full balances.
async function getTreasuryBalanceOldAndNewAfterTx() {
    for (let i = 0; i < treasury_tokens.length; i++) {
        console.log("===============Treasury Token Migration Done!===============");
        const contract = treasury_tokens[i].contract;
        const name = treasury_tokens[i].name;

        const bal_before_tx = await contract.connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
        console.log(`old_treasury_${name}_bal_after_tx`, bal_before_tx.toString());

        const bal_after_tx = await contract.connect(deployer).balanceOf(newTreasury.address);
        console.log(`new_treasury_${name}_bal_after_tx`, bal_after_tx.toString());
    }

    const uni_factory_contract = swaps[0].contract;
    const sushi_factory_contract = swaps[1].contract;

    const new_ohm_frax_lp_address = await uni_factory_contract.getPair(
        ohm.address,
        tokenAddresses[0]
    );
    const new_ohm_dai_lp_address = await sushi_factory_contract.getPair(
        ohm.address,
        tokenAddresses[3]
    );
    const new_ohm_lusd_lp_address = await sushi_factory_contract.getPair(
        ohm.address,
        tokenAddresses[2]
    );

    const new_ohm_frax_lp = new ethers.Contract(
        new_ohm_frax_lp_address,
        olympus_lp_tokens[0].abi,
        ethers.provider
    );
    const new_ohm_dai_lp = new ethers.Contract(
        new_ohm_dai_lp_address,
        olympus_lp_tokens[0].abi,
        ethers.provider
    );
    const new_ohm_lusd_lp = new ethers.Contract(
        new_ohm_lusd_lp_address,
        olympus_lp_tokens[0].abi,
        ethers.provider
    );
    const addr = [new_ohm_frax_lp, new_ohm_lusd_lp, new_ohm_dai_lp];

    for (let i = 0; i < 3; i++) {
        const name = ["frax", "lusd", "dai"];

        console.log("===============Treasury LP Migration Done!===============");

        const bal_before_tx = await addr[i].connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
        console.log(`old_treasury_${name[i]}_bal_after_tx`, bal_before_tx.toString());

        const bal_after_tx = await addr[i].connect(deployer).balanceOf(newTreasury.address);
        console.log(`new_treasury_${name[i]}_bal_after_tx`, bal_after_tx.toString());
    }
}
