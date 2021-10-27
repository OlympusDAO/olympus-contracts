const { ethers } = require("hardhat");
const { assert, expect } = require("chai");
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

// TODO currently skipped
describe.skip("Treasury Token Migration", async () => {
    let deployer,
        user1,
        manager,
        old_treasury,
        olympusTokenMigrator,
        index,
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
            1 // timelock for defunds
        );
        const migratorAddress = olympusTokenMigrator.address;

        let gOhmContract = await ethers.getContractFactory("gOHM");
        gOhm = await gOhmContract.deploy(migratorAddress);

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
        index = await oldSohm.connect(deployer).index();
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
        // 1 = RESERVESPENDER
        // 3 = RESERVEMANAGER
        // 6 = LIQUIDITYMANAGER
        await old_treasury.connect(manager).queue(1, migratorAddress);
        await old_treasury.connect(manager).queue(3, migratorAddress);
        await old_treasury.connect(manager).queue(6, migratorAddress);

        // Note (zx): Why do we do this?
        // 2 = RESERVETOKEN
        await old_treasury.connect(manager).queue(2, lp_token_1[0]);

        await advance(13000);

        // Toggle permissions on
        await old_treasury.connect(manager).toggle(1, migratorAddress, migratorAddress);
        await old_treasury.connect(manager).toggle(3, migratorAddress, migratorAddress);
        await old_treasury.connect(manager).toggle(6, migratorAddress, migratorAddress);
        await old_treasury.connect(manager).toggle(2, lp_token_1[0], lp_token_1[0]);

        // Enables onchain governance, needs two calls. :odd:
        await newTreasury.connect(deployer).enableOnChainGovernance();
        await advance(1000);
        await newTreasury.connect(deployer).enableOnChainGovernance();

        // Give migrator access  to the new treasury
        // 0 = RESERVEDEPOSITOR
        // 4 = LIQUIDITYDEPOSITOR
        // 8 = REWARDMANAGER (allows minting)
        await newTreasury.connect(deployer).enable(0, migratorAddress, migratorAddress);
        await newTreasury.connect(deployer).enable(4, migratorAddress, migratorAddress);
        await newTreasury.connect(deployer).enable(8, migratorAddress, migratorAddress);

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

    describe("Olympus Token Migrations", async () => {
        let sOHMindex = 1;

        function toGohm(sohmAmount) {
            return sohmAmount.mul(10 ** 9).div(sOHMindex);
        }

        async function performMigration({ wallet, contract, migrationType }) {
            let oldTokenBalance = await contract.balanceOf(wallet);

            const user = await impersonate(wallet);

            await contract.connect(user).approve(olympusTokenMigrator.address, oldTokenBalance);
            await olympusTokenMigrator.connect(user).migrate(oldTokenBalance, migrationType);

            let newgOhmBalance = await gOhm.balanceOf(wallet);
            return { oldTokenBalance, newgOhmBalance };
        }

        async function performBridgeBack({ wallet, contract, migrationType }) {
            let oldgOhmBalance = await gOhm.balanceOf(wallet);

            const user = await impersonate(wallet);
            await gOhm.connect(user).approve(olympusTokenMigrator.address, oldgOhmBalance);
            await olympusTokenMigrator.connect(user).bridgeBack(oldgOhmBalance, migrationType);

            let newTokenBalance = await contract.balanceOf(wallet);

            return { oldgOhmBalance, newTokenBalance };
        }

        before(async () => {
            sOHMindex = index;
            for (let i = 0; i < olympus_tokens.length; i++) {
                const { wallet } = olympus_tokens[i];
                await sendETH(deployer, wallet);
            }
        });

        it("should migrate ohm", async () => {
            const token = olympus_tokens.find((token) => token.name === "ohm");
            const { oldTokenBalance, newgOhmBalance } = await performMigration(token);

            let gohmBalanceOld = toGohm(oldTokenBalance).toString();
            let gohmBalanceNew = newgOhmBalance.toString().slice(0, 11); //Hacky shit bruh

            assert.equal(gohmBalanceOld, gohmBalanceNew);
        });

        it("should migrate sohm", async () => {
            const token = olympus_tokens.find((token) => token.name === "sohm");
            const { oldTokenBalance, newgOhmBalance } = await performMigration(token);

            let gohmBalanceOld = toGohm(oldTokenBalance).toString();
            let gohmBalanceNew = newgOhmBalance.toString().slice(0, 11); //Hacky shit bruh

            assert.equal(gohmBalanceOld, gohmBalanceNew);
        });
        it("should migrate wsOhm", async () => {
            const token = olympus_tokens.find((token) => token.name === "wsohm");
            const { oldTokenBalance, newgOhmBalance } = await performMigration(token);

            assert.equal(
                newgOhmBalance.toString(),
                oldTokenBalance.toString(),
                "New gOhm balance does not equal tokenBalance on migrate"
            );
        });

        it("should bridgeBack ohm", async () => {
            const token = olympus_tokens.find((token) => token.name === "ohm");
            const { oldgOhmBalance, newTokenBalance } = await performBridgeBack(token);

            let gohmBalanceOld = oldgOhmBalance.toString().slice(0, 11); //Hacky shit bruh
            let gohmBalanceNew = toGohm(newTokenBalance).toString();

            assert.equal(gohmBalanceOld, gohmBalanceNew);
        });
        it("should bridgeBack sOhm", async () => {
            const token = olympus_tokens.find((token) => token.name === "sohm");
            const { oldgOhmBalance, newTokenBalance } = await performBridgeBack(token);

            let gohmBalanceOld = oldgOhmBalance.toString().slice(0, 11); //Hacky shit bruh
            let gohmBalanceNew = toGohm(newTokenBalance).toString();

            assert.equal(gohmBalanceOld, gohmBalanceNew);
        });
        it("should bridgeBack gOhm", async () => {
            const token = olympus_tokens.find((token) => token.name === "wsohm");
            const { oldgOhmBalance, newTokenBalance } = await performBridgeBack(token);

            assert.equal(
                oldgOhmBalance.toString(),
                newTokenBalance.toString(),
                "New gOhm balance does not equal tokenBalance on bridgeBack"
            );
        });
    });

    it("Should allow DAO migrate reserves ", async () => {
        const allReserveandLP = [...olympus_lp_tokens, ...treasury_tokens];
        const uni_factory_contract = swaps[0].contract;
        const sushi_factory_contract = swaps[1].contract;

        const preMigrationBalances = await getTreasuryBalance(
            deployer,
            newTreasury.address,
            allReserveandLP
        );

        await olympusTokenMigrator
            .connect(deployer)
            .migrateContracts(newTreasury.address, newStaking.address, ohm.address, sOhm.address);

        const newLPTokensPromises = [...olympus_lp_tokens].map(async (lpToken) => {
            const asset0Address = lpToken.token0;
            let newLPAddress;
            if (lpToken.is_sushi) {
                newLPAddress = await sushi_factory_contract.getPair(ohm.address, asset0Address);
            } else {
                newLPAddress = await uni_factory_contract.getPair(ohm.address, asset0Address);
            }
            const contract = new ethers.Contract(newLPAddress, lpToken.abi, ethers.provider);
            return {
                name: lpToken.name,
                isLP: true,
                address: newLPAddress,
                abi: lpToken.abi,
                contract: contract,
            };
        });

        const newLPTokens = await Promise.all(newLPTokensPromises);

        const postMigrationBalances = await getTreasuryBalance(deployer, newTreasury.address, [
            ...newLPTokens,
            ...treasury_tokens,
        ]);

        allReserveandLP.forEach((token) => {
            if (token.name === "dai") {
                // Dai will be left in treasury for defund.
                // What is the actual expected value of dai left over?
                return;
            }

            const v1BalancePreMigration = preMigrationBalances.v1Treasury[token.name];
            const v2BalancePostMigration = postMigrationBalances.v2Treasury[token.name];
            const v1BalancePostMigration = postMigrationBalances.v1Treasury[token.name];
            assert.equal(
                v1BalancePostMigration,
                0,
                `v1BalancePostMigration for ${token.name} should be 0`
            );
            assert.equal(
                v2BalancePostMigration.toString(),
                v1BalancePreMigration.toString(),
                `New Treasury Balance for ${token.name} should should be old balance`
            );
        });
    });

    // TODO: (fix this defund to validate the right things)
    it.skip("Should defund", async () => {
        let dai = treasury_tokens.find((token) => token.name === "dai");

        // Debug logs
        const v1TreasuryBalanceOld = await dai.contract
            .connect(deployer)
            .balanceOf(OLD_TREASURY_ADDRESS);
        const v2TreasuryBalanceOld = await dai.contract
            .connect(deployer)
            .balanceOf(newTreasury.address);
        const migratorBalanceOld = await dai.contract
            .connect(deployer)
            .balanceOf(olympusTokenMigrator.address);
        console.log(
            v1TreasuryBalanceOld.toString(),
            v2TreasuryBalanceOld.toString(),
            migratorBalanceOld.toString()
        );

        // let wsohm = olympus_tokens.find((token) => token.name === "wsohm");
        // migrate users token again after brdige back so olympus token migrator contract has some balance
        // await migrateToken(deployer, olympusTokenMigrator, gOhm, wsohm, false);

        await olympusTokenMigrator.connect(deployer).startTimelock();
        await advance(2);
        await olympusTokenMigrator.connect(deployer).defund();

        const v1TreasuryBalanceNew = await dai.contract
            .connect(deployer)
            .balanceOf(OLD_TREASURY_ADDRESS);
        const migratorBalanceNew = await dai.contract
            .connect(deployer)
            .balanceOf(olympusTokenMigrator.address);
        const v2TreasuryBalanceNew = await dai.contract
            .connect(deployer)
            .balanceOf(newTreasury.address);

        const expectedDai = v2TreasuryBalanceOld + v1TreasuryBalanceOld;
        assert.equal(0, v1TreasuryBalanceNew.toString());
        assert.equal(expectedDai.toString(), v2TreasuryBalanceNew.toString());
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
        let status = 2; //2=RESERVETOKEN

        if (token.isLP) {
            status = 5; //5=LIQUIDITYTOKEN
        }
        await treasury.connect(deployer).enable(status, token.address, token.address);
    });

    return await Promise.all(enableTokensPromises);
}

// Single token balance function.
async function getTreasuryTokenBalance(deployer, newTreasuryAddress, token) {
    const { contract, name } = token;

    const v1Balance = await contract.connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
    const v2Balance = await contract.connect(deployer).balanceOf(newTreasuryAddress);
    return { v1Balance, v2Balance };
}

async function getTreasuryBalance(deployer, newTreasuryAddress, tokens) {
    let tokenContract, tokenName;
    let v2Treasury = {};
    let v1Treasury = {};
    for (let i = 0; i < tokens.length; i++) {
        tokenName = tokens[i].name;
        tokenContract = tokens[i].contract;

        const v1TreasuryBalance = await tokenContract
            .connect(deployer)
            .balanceOf(OLD_TREASURY_ADDRESS);
        v1Treasury[tokenName] = v1TreasuryBalance.toString();
        // DEBUG
        // console.log(`v1Treasury_${tokenName}_balance`, v1TreasuryBalance.toString());

        const newTreasuryBalance = await tokenContract
            .connect(deployer)
            .balanceOf(newTreasuryAddress);
        v2Treasury[tokenName] = newTreasuryBalance.toString();
        // DEBUG
        // console.log(`v2treasury_${tokenName}_balance`, newTreasuryBalance.toString());
    }
    return { v1Treasury, v2Treasury };
}

async function migrateToken(deployer, migrator, gOhm, token, isBridgeBack = false) {
    const contract = token.contract;
    const name = token.name;
    const userAddress = token.wallet;
    const type = token.migrationType;

    let oldTokenBalance = await contract.balanceOf(userAddress);
    let oldgOhmBalance = await gOhm.balanceOf(userAddress);

    console.log(
        `===============User Token (${name}) Migration: isBridgeBack:${isBridgeBack} ===============`
    );

    console.log(`(old) user_${name}_balance:`, oldTokenBalance.toString());
    console.log("(old) user_gohm_balance:", oldgOhmBalance.toString());

    const user = await impersonate(userAddress);
    await sendETH(deployer, userAddress);

    await contract.connect(user).approve(migrator.address, oldTokenBalance);
    if (isBridgeBack) {
        await migrator.connect(user).bridgeBack(oldgOhmBalance, type);
    } else {
        await migrator.connect(user).migrate(oldTokenBalance, type);
    }

    let newTokenBalance = await contract.balanceOf(userAddress);
    let newgOhmBalance = await gOhm.balanceOf(userAddress);

    console.log(`(new) user_${name}_balance:`, newTokenBalance.toString());
    console.log("(new) user_gohm_balance:", newgOhmBalance.toString());
    console.log();
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
