const chai = require("chai");
const { assert, expect } = require("chai");
const { helpers } = require("../utils/helpers");
const { solidity } = require("ethereum-waffle");

const { fork_network } = require("../utils/network_fork");
const { advanceBlock, increase } = require("../utils/advancement");
const { protocols } = require("../utils/protocols");
const { olympus } = require("../utils/olympus");
const { coins } = require("../utils/coins");

const { tokemak, alchemix } = protocols;
const bne = helpers.bne;
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const ALCHEMIX = "0xdbdb4d16eda451d0503b854cf79d55697f90c8df";
const TOKEMAK_TOKEN = "0x245cc372c84b3645bf0ffe6538620b04a217988b";
const TOKEMAK_T_ALCX = "0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84";
const TOKEMAK_REWARD = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
const TOKEMAK_MANAGER = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14";
const TREASURY_MANAGER = "0x245cc372c84b3645bf0ffe6538620b04a217988b";
const TREASURY_ADDRESS = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
const GUARDIAN_ADDRESS = "0x245cc372c84b3645bf0ffe6538620b04a217988b";
const ALCHEMIX_STAKING_POOL = "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa";
const OLYMPUS_AUTHORITY_ADDRESS = "0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A";

describe("Alchemix Allocator", async () => {
    let user,
        manager,
        treasury,
        guardian,
        t_alchemix,
        alchemix_token,
        TreasuryExtender,
        treasuryExtender,
        AlchemixAllocator,
        alchemixAllocator;

    beforeEach(async () => {
        await fork_network(14315090);
        [user] = await ethers.getSigners();

        TreasuryExtender = await ethers.getContractFactory("TreasuryExtender");
        treasuryExtender = await TreasuryExtender.deploy(
            TREASURY_ADDRESS,
            OLYMPUS_AUTHORITY_ADDRESS
        );

        AlchemixAllocator = await ethers.getContractFactory("AlchemixAllocatorV2");
        alchemixAllocator = await AlchemixAllocator.deploy(
            tokemak.reactors.talcx,
            alchemix.talcx_staking,
            olympus.treasury,
            coins.toke,
            tokemak.core.rewards,
            tokemak.core.manager,
            {
                authority: olympus.authority,
                tokens: [coins.alcx],
                extender: treasuryExtender.address,
            }
        );

        treasury = await ethers.getContractAt("OlympusTreasury", TREASURY_ADDRESS);

        alchemix_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            ALCHEMIX
        );

        t_alchemix = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            TOKEMAK_T_ALCX
        );
        manager = await ethers.getContractAt("IManager", TOKEMAK_MANAGER);

        await impersonateAccount(TREASURY_MANAGER);
        const owner = await ethers.getSigner(TREASURY_MANAGER);

        await treasury.connect(owner).enable(3, treasuryExtender.address, treasuryExtender.address);
        await treasury.connect(owner).enable(0, treasuryExtender.address, treasuryExtender.address);

        await impersonateAccount(GUARDIAN_ADDRESS);
        guardian = await ethers.getSigner(GUARDIAN_ADDRESS);
    });

    async function extenderSetup(amount) {
        await treasuryExtender.connect(guardian).registerDeposit(alchemixAllocator.address);
        await treasuryExtender.connect(guardian).setAllocatorLimits(1, {
            allocated: bne(10, 23),
            loss: bne(10, 19),
        });
        await alchemixAllocator.connect(guardian).activate();
        await treasuryExtender.connect(guardian).requestFundsFromTreasury(1, amount);
    }

    async function increaseCycle() {
        await impersonateAccount("0x90b6C61B102eA260131aB48377E143D6EB3A9d4B");
        const onlyRollover = await ethers.getSigner("0x90b6C61B102eA260131aB48377E143D6EB3A9d4B");

        await increase(530336);
        const fake_IpfsHash = "QmZsREKTfcMuTU4qrE2GbaMLfxwKrHWrUoA3XKH1kycQ5C";

        await manager.connect(onlyRollover).completeRollover(fake_IpfsHash); // used to increase tokemak cycle
    }

    it("Should fail if caller is not guardian address", async () => {
        await expect(alchemixAllocator.connect(user).update(1)).to.be.revertedWith("UNAUTHORIZED");
    });

    it("Should fail if allocator is not approved by extender", async () => {
        await expect(alchemixAllocator.connect(guardian).update(1)).to.be.revertedWith(
            "BaseAllocator_AllocatorNotActivated()"
        );
    });

    it("Should successfully call update function", async () => {
        const treasuryBalanceBeforeTx = await alchemix_token.balanceOf(TREASURY_ADDRESS);

        const tAlcxBalanceBeforeTx = await alchemixAllocator.amountAllocated(0);

        await extenderSetup(bne(10, 20));

        await alchemixAllocator.connect(guardian).update(1);

        const tAlcxBalanceAfterTx = await alchemixAllocator.amountAllocated(0);
        const treasuryBalanceAfterTx = await alchemix_token.balanceOf(TREASURY_ADDRESS);

        assert.equal(tAlcxBalanceBeforeTx, 0);

        assert.equal(tAlcxBalanceAfterTx, Number(bne(10, 20)));

        assert.equal(
            Number(treasuryBalanceBeforeTx).toString().slice(0, 5),
            (Number(treasuryBalanceAfterTx) + Number(bne(10, 20))).toString().slice(0, 5)
        );
    });

    it("Should compound rewards", async () => {
        await extenderSetup(bne(10, 20));
        await alchemixAllocator.connect(guardian).update(1);

        const tAlcxBalance = await alchemixAllocator.amountAllocated(0);
        assert.equal(tAlcxBalance, Number(bne(10, 20)));

        const gainBeforeTx = await treasuryExtender.getAllocatorPerformance(1);

        await advance(1000);
        await alchemixAllocator.connect(guardian).update(1);

        const gainAfterTx = await treasuryExtender.getAllocatorPerformance(1);

        expect(gainBeforeTx[0]).to.equal(0);
        expect(gainAfterTx[0]).to.be.above(0);

        const tAlcxBalanceAfterTx = await alchemixAllocator.amountAllocated(0);
        expect(tAlcxBalanceAfterTx).to.be.above(tAlcxBalance);
    });

    it("Should deactivate allocator", async () => {
        await extenderSetup(bne(10, 20));
        await alchemixAllocator.connect(guardian).update(1);

        const tAlcxBalance = await alchemixAllocator.amountAllocated(0);
        const tALCXBalanceBeforeTx = await t_alchemix.balanceOf(alchemixAllocator.address);

        const ALCXTreasuryBalanceBeforeTx = await alchemix_token.balanceOf(TREASURY_ADDRESS);

        assert.equal(await alchemixAllocator.status(), 1);
        await alchemixAllocator.connect(guardian).deactivate(true);

        const ALCXTreasuryBalanceAfterTx = await alchemix_token.balanceOf(TREASURY_ADDRESS);
        expect(ALCXTreasuryBalanceBeforeTx + ALCXTreasuryBalanceAfterTx).to.be.above(
            ALCXTreasuryBalanceBeforeTx
        );

        assert.equal(await alchemixAllocator.status(), 0);
        const tALCXTreasuryBalanceAfterTx = await t_alchemix.balanceOf(TREASURY_ADDRESS);

        assert.equal(Number(tALCXTreasuryBalanceAfterTx), Number(tAlcxBalance));
        assert.equal(Number(tALCXBalanceBeforeTx), 0);
    });

    it("Should fail to deallocate allocator", async () => {
        await extenderSetup(bne(10, 20));
        await alchemixAllocator.connect(guardian).update(1);

        await alchemixAllocator.connect(guardian).deallocate([bne(10, 20)]);
        await expect(alchemixAllocator.connect(guardian).deallocate([0])).to.revertedWith(
            "requested withdraw cycle not reached yet"
        );
    });

    it("Should deallocate allocator", async () => {
        await extenderSetup(bne(10, 20));
        await alchemixAllocator.connect(guardian).update(1);

        const tAlcxBalance = await alchemixAllocator.amountAllocated(0);

        const ALCXRewardClaimedBeforeWithdraw = await alchemix_token.balanceOf(
            alchemixAllocator.address
        );
        assert.equal(Number(ALCXRewardClaimedBeforeWithdraw), 0);

        //should first request for withdrawal
        await alchemixAllocator.connect(guardian).deallocate([bne(10, 20)]);
        const ALCXRewardClaimedAfterWithdraw = await alchemix_token.balanceOf(
            alchemixAllocator.address
        );

        const tALCXBalanceAfterTx = await t_alchemix.balanceOf(alchemixAllocator.address);
        assert.equal(Number(tALCXBalanceAfterTx), Number(tAlcxBalance));

        await increaseCycle();

        //should be able to withdraw after withdraw cycle is reached
        await alchemixAllocator.connect(guardian).deallocate([0]);

        const ALCXBalanceAfterTx = await alchemix_token.balanceOf(alchemixAllocator.address);

        assert.equal(
            Number(ALCXBalanceAfterTx),
            Number(tAlcxBalance) + Number(ALCXRewardClaimedAfterWithdraw)
        );
    });

    it("Should fail to prepareMigration for allocator", async () => {
        await extenderSetup(bne(10, 20));
        await alchemixAllocator.connect(guardian).update(1);
        await expect(alchemixAllocator.connect(guardian).prepareMigration()).to.revertedWith(
            "tAlcx deposited, call deallocate"
        );
    });

    it("prepareMigration should work for allocator", async () => {
        await extenderSetup(bne(10, 20));
        await alchemixAllocator.connect(guardian).update(1);

        const tAlcxBalance = await alchemixAllocator.amountAllocated(0);
        const ALCXBalanceBeforeWithdraw = await alchemix_token.balanceOf(alchemixAllocator.address);

        assert.equal(Number(ALCXBalanceBeforeWithdraw), 0);
        assert.equal(await alchemixAllocator.status(), 1);

        await alchemixAllocator.connect(guardian).deallocate([bne(10, 20)]);
        await increaseCycle();

        await alchemixAllocator.connect(guardian).prepareMigration();
        const ALCXBalanceAfterWithdraw = await alchemix_token.balanceOf(alchemixAllocator.address);

        expect(Number(ALCXBalanceAfterWithdraw)).to.be.above(Number(tAlcxBalance));
        assert.equal(await alchemixAllocator.status(), 2);
    });

    it("Should fail to migrate allocator", async () => {
        await extenderSetup(bne(10, 20));

        await expect(alchemixAllocator.connect(guardian).migrate()).to.revertedWith(
            "BaseAllocator_NotMigrating()"
        );
    });

    it("Should migrate allocator", async () => {
        await extenderSetup(bne(10, 20));
        const AlchemixAllocator2 = await ethers.getContractFactory("AlchemixAllocatorV2");

        const alchemixAllocator2 = await AlchemixAllocator2.deploy(
            tokemak.reactors.talcx,
            alchemix.talcx_staking,
            olympus.treasury,
            coins.toke,
            tokemak.core.rewards,
            tokemak.core.manager,
            {
                authority: olympus.authority,
                tokens: [coins.alcx],
                extender: treasuryExtender.address,
            }
        );

        await treasuryExtender.connect(guardian).registerDeposit(alchemixAllocator2.address);
        await treasuryExtender.connect(guardian).setAllocatorLimits(2, {
            allocated: bne(10, 23),
            loss: bne(10, 19),
        });

        await alchemixAllocator2.connect(guardian).activate();
        await alchemixAllocator.connect(guardian).update(1);

        await alchemixAllocator.connect(guardian).deallocate([bne(10, 20)]);
        await increaseCycle();

        await alchemixAllocator.connect(guardian).prepareMigration();
        assert.equal(await alchemixAllocator.status(), 2);

        const migratingAllocatorAlcxBal = await alchemix_token.balanceOf(alchemixAllocator.address);
        await alchemixAllocator.connect(guardian).migrate();

        assert.equal(await alchemixAllocator.status(), 0);
        const newAllocatorAddress = treasuryExtender.getAllocatorByID(2);

        const newAllocatorAlcxBal = await alchemix_token.balanceOf(newAllocatorAddress);
        assert.equal(Number(migratingAllocatorAlcxBal), Number(newAllocatorAlcxBal));

        const migratedAllocatorAlcxBal = await alchemix_token.balanceOf(alchemixAllocator.address);
        assert.equal(Number(migratedAllocatorAlcxBal), 0);
    });
});

async function advance(count) {
    for (let i = 0; i < count; i++) {
        await advanceBlock();
    }
}
