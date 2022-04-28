const chai = require("chai");
const { assert, expect } = require("chai");
const { helpers } = require("../utils/helpers");
const { solidity } = require("ethereum-waffle");

const { fork_network } = require("../utils/network_fork");
const { increase } = require("../utils/advancement");
const { protocols } = require("../utils/protocols");
const { olympus } = require("../utils/olympus");
const { coins } = require("../utils/coins");

const { tokemak } = protocols;
const bne = helpers.bne;
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const gOhmHolderAddress = "0x168fa4917e7cD18f4eD3dc313c4975851cA9E5E7";
const tokeHolderAddress = "0x23A5eFe19Aa966388E132077d733672cf5798C03";

describe("Tokemak Allocator", async () => {
    let user,
        manager,
        treasury,
        multisig,
        tokeHolder,
        toke_token,
        gohm_token,
        gOhmHolder,
        t_gohm_token,
        alchemix_token,
        t_staking_token,
        t_alchemix_token,
        TreasuryExtender,
        treasuryExtender,
        TokeMakAllocator,
        MockTokemakReward,
        mockTokemakReward,
        tokeMakAllocator;

    beforeEach(async () => {
        await fork_network(14665950);
        [user] = await ethers.getSigners();

        TreasuryExtender = await ethers.getContractFactory("TreasuryExtender");
        treasuryExtender = await TreasuryExtender.deploy(olympus.treasury, olympus.authority);

        MockTokemakReward = await ethers.getContractFactory("MockTokemakReward");
        mockTokemakReward = await MockTokemakReward.deploy();

        TokeMakAllocator = await ethers.getContractFactory("TokeMakAllocator");
        tokeMakAllocator = await TokeMakAllocator.deploy(
            tokemak.core.ldVoteL1,
            tokemak.core.staking,
            mockTokemakReward.address,
            tokemak.core.manager,
            olympus.treasury,
            {
                authority: olympus.authority,
                tokens: [coins.toke],
                extender: treasuryExtender.address,
            }
        );

        treasury = await ethers.getContractAt("OlympusTreasury", olympus.treasury);

        alchemix_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            coins.alcx
        );

        t_alchemix_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            tokemak.reactors.talcx
        );

        toke_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            coins.toke
        );

        gohm_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            coins.gohm
        );

        t_gohm_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            tokemak.reactors.gohm
        );

        t_staking_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            tokemak.core.staking
        );

        manager = await ethers.getContractAt("IManager", tokemak.core.manager);

        await impersonateAccount(olympus.multisig);
        multisig = await ethers.getSigner(olympus.multisig);

        await impersonateAccount(gOhmHolderAddress);
        gOhmHolder = await ethers.getSigner(gOhmHolderAddress);

        await impersonateAccount(tokeHolderAddress);
        tokeHolder = await ethers.getSigner(tokeHolderAddress);

        await toke_token.connect(tokeHolder).transfer(mockTokemakReward.address, bne(10, 20));

        await gohm_token.connect(gOhmHolder).transfer(olympus.treasury, bne(10, 20));

        await treasury
            .connect(multisig)
            .enable(3, treasuryExtender.address, treasuryExtender.address);
        await treasury
            .connect(multisig)
            .enable(0, treasuryExtender.address, treasuryExtender.address);
    });

    async function setup(amount) {
        await tokeMakAllocator.connect(multisig).approveToken(coins.alcx, tokemak.reactors.talcx);
        await tokeMakAllocator.connect(multisig).approveToken(coins.gohm, tokemak.reactors.gohm);

        await treasuryExtender.connect(multisig).registerDeposit(tokeMakAllocator.address);
        await treasuryExtender.connect(multisig).registerDeposit(tokeMakAllocator.address);
        await treasuryExtender.connect(multisig).registerDeposit(tokeMakAllocator.address);

        await treasuryExtender.connect(multisig).setAllocatorLimits(1, {
            allocated: bne(10, 23),
            loss: bne(10, 19),
        });

        await treasuryExtender.connect(multisig).setAllocatorLimits(2, {
            allocated: bne(10, 23),
            loss: bne(10, 19),
        });

        await treasuryExtender.connect(multisig).setAllocatorLimits(3, {
            allocated: bne(10, 23),
            loss: bne(10, 19),
        });

        await tokeMakAllocator.connect(multisig).activate();
        await treasuryExtender.connect(multisig).requestFundsFromTreasury(1, amount);
        await treasuryExtender.connect(multisig).requestFundsFromTreasury(2, amount);
        await treasuryExtender.connect(multisig).requestFundsFromTreasury(3, amount);

        const amount0 = await toke_token.balanceOf(tokeMakAllocator.address);
        const amount1 = await alchemix_token.balanceOf(tokeMakAllocator.address);
        const amount2 = await gohm_token.balanceOf(tokeMakAllocator.address);

        await tokeMakAllocator
            .connect(multisig)
            .deposit(amount0, coins.toke, tokemak.core.staking, 0);
        await tokeMakAllocator
            .connect(multisig)
            .deposit(amount1, coins.alcx, tokemak.reactors.talcx, 1);
        await tokeMakAllocator
            .connect(multisig)
            .deposit(amount2, coins.gohm, tokemak.reactors.gohm, 2);
    }

    async function increaseCycle() {
        await impersonateAccount("0x90b6C61B102eA260131aB48377E143D6EB3A9d4B");
        const onlyRollover = await ethers.getSigner("0x90b6C61B102eA260131aB48377E143D6EB3A9d4B");

        await increase(5030336);
        const fake_IpfsHash = "QmZsREKTfcMuTU4qrE2GbaMLfxwKrHWrUoA3XKH1kycQ5C";

        await manager.connect(onlyRollover).completeRollover(fake_IpfsHash); // used to increase tokemak cycle
    }

    it("Should fail if caller is not multisig address", async () => {
        await expect(tokeMakAllocator.connect(user).update(1)).to.be.revertedWith("UNAUTHORIZED");
    });

    it("Should fail if allocator is not approved by extender", async () => {
        await expect(tokeMakAllocator.connect(multisig).update(1)).to.be.revertedWith(
            "BaseAllocator_AllocatorNotActivated()"
        );
    });

    it("Should deposit token", async () => {
        const tokeBalanceBeforeTx = await t_staking_token.balanceOf(tokeMakAllocator.address);
        const alcxBalanceBeforeTx = await t_alchemix_token.balanceOf(tokeMakAllocator.address);
        const gohmBalanceBeforeTx = await t_gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(tokeBalanceBeforeTx, 0);
        assert.equal(alcxBalanceBeforeTx, 0);
        assert.equal(gohmBalanceBeforeTx, 0);

        await setup(bne(10, 20));

        const tokeBalanceAfterTx = await t_staking_token.balanceOf(tokeMakAllocator.address);
        const alcxBalanceAfterTx = await t_alchemix_token.balanceOf(tokeMakAllocator.address);
        const gohmBalanceAfterTx = await t_gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(Number(tokeBalanceAfterTx), bne(10, 20));
        assert.equal(Number(alcxBalanceAfterTx), bne(10, 20));
        assert.equal(Number(gohmBalanceAfterTx), bne(10, 20));
    });

    it("Should successfully call update function", async () => {
        await setup(bne(10, 20));
        await expect(tokeMakAllocator.connect(multisig).update(1)).to.be.revertedWith(
            "TokeMakAllocator_CallUpdateClaimInfoFunctionFirst()"
        );
    });

    it("Should successfully call update function", async () => {
        await setup(bne(10, 20));
        const recipient = {
            chainId: 0,
            cycle: 0,
            wallet: tokeMakAllocator.address,
            amount: bne(10, 20),
        };

        const tokeBalanceBeforeTx = await t_staking_token.balanceOf(tokeMakAllocator.address);
        assert.equal(Number(tokeBalanceBeforeTx), bne(10, 20));

        const gainBeforeTx = await treasuryExtender.getAllocatorPerformance(1);
        expect(gainBeforeTx[0]).to.equal(0);

        await tokeMakAllocator
            .connect(multisig)
            .updateClaimInfo(recipient, 0, ethers.constants.HashZero, ethers.constants.HashZero);
        await tokeMakAllocator.connect(multisig).update(1);

        const tokeBalanceAfterTx = await t_staking_token.balanceOf(tokeMakAllocator.address);
        assert.equal(Number(tokeBalanceAfterTx), bne(10, 20) * 2);

        const gainAfterTx = await treasuryExtender.getAllocatorPerformance(1);
        expect(gainAfterTx[0]).to.equal(bne(10, 20));
    });

    it("Should deactivate allocator", async () => {
        await setup(bne(10, 20));

        const t_StakingBalanceBeforeTx = await tokeMakAllocator.amountAllocated(0);
        const t_AlcxBalanceBeforeTx = await tokeMakAllocator.amountAllocated(1);
        const t_GohmBalanceBeforeTx = await tokeMakAllocator.amountAllocated(2);

        assert.equal(Number(t_StakingBalanceBeforeTx), bne(10, 20));
        assert.equal(Number(t_AlcxBalanceBeforeTx), bne(10, 20));
        assert.equal(Number(t_GohmBalanceBeforeTx), bne(10, 20));

        const tokeTreasuryBalanceBeforeTx = await toke_token.balanceOf(olympus.treasury);
        const t_AlcxTreasuryBalanceBeforeTx = await t_alchemix_token.balanceOf(olympus.treasury);
        const t_GohmTreasuryBalanceBeforeTx = await t_gohm_token.balanceOf(olympus.treasury);

        assert.equal(Number(tokeTreasuryBalanceBeforeTx), 458029424101596200000);
        assert.equal(Number(t_AlcxTreasuryBalanceBeforeTx), 0);
        assert.equal(Number(t_GohmTreasuryBalanceBeforeTx), 0);
        assert.equal(await tokeMakAllocator.status(), 1);

        await tokeMakAllocator.connect(multisig).deactivate(true);
        await increaseCycle();
        await tokeMakAllocator.connect(multisig).deallocate([0]);
        await tokeMakAllocator.connect(multisig).withdrawToke();

        const t_StakingBalanceAfterTx = await tokeMakAllocator.amountAllocated(0);
        const t_AlcxBalanceAfterTx = await tokeMakAllocator.amountAllocated(1);
        const t_GohmBalanceAfterTx = await tokeMakAllocator.amountAllocated(2);

        assert.equal(Number(t_StakingBalanceAfterTx), 0);
        assert.equal(Number(t_AlcxBalanceAfterTx), 0);
        assert.equal(Number(t_GohmBalanceAfterTx), 0);

        const tokeTreasuryBalanceAfterTx = await toke_token.balanceOf(olympus.treasury);
        const t_AlcxTreasuryBalanceAfterTx = await t_alchemix_token.balanceOf(olympus.treasury);
        const t_GohmTreasuryBalanceAfterTx = await t_gohm_token.balanceOf(olympus.treasury);

        assert.equal(
            Number(tokeTreasuryBalanceAfterTx),
            458029424101596200000 + Number(bne(10, 20))
        );
        assert.equal(Number(t_AlcxTreasuryBalanceAfterTx), bne(10, 20));
        assert.equal(Number(t_GohmTreasuryBalanceAfterTx), bne(10, 20));
        assert.equal(await tokeMakAllocator.status(), 0);
    });

    it("Should fail to deallocate allocator", async () => {
        await setup(bne(10, 20));

        await tokeMakAllocator
            .connect(multisig)
            .deallocate([bne(10, 20), bne(10, 20), bne(10, 20)]);
        await expect(tokeMakAllocator.connect(multisig).deallocate([0])).to.revertedWith(
            "TokeMakAllocator_RequestedWithdrawCycleNotReachedYet()"
        );
    });

    it("Should deallocate allocator", async () => {
        await setup(bne(10, 20));

        const t_StakingAllocatedBalanceBeforeTx = await tokeMakAllocator.amountAllocated(0);
        const t_AlcxAllocatedBalanceBeforeTx = await tokeMakAllocator.amountAllocated(1);
        const t_GohmAllocatedBalanceBeforeTx = await tokeMakAllocator.amountAllocated(2);

        assert.equal(Number(t_StakingAllocatedBalanceBeforeTx), bne(10, 20));
        assert.equal(Number(t_AlcxAllocatedBalanceBeforeTx), bne(10, 20));
        assert.equal(Number(t_GohmAllocatedBalanceBeforeTx), bne(10, 20));

        const t_stakingBalanceBeforeTx = await t_staking_token.balanceOf(tokeMakAllocator.address);
        const t_alcxBalanceBeforeTx = await t_alchemix_token.balanceOf(tokeMakAllocator.address);
        const t_gohmBalanceBeforeTx = await t_gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(Number(t_stakingBalanceBeforeTx), bne(10, 20));
        assert.equal(Number(t_alcxBalanceBeforeTx), bne(10, 20));
        assert.equal(Number(t_gohmBalanceBeforeTx), bne(10, 20));

        const tokeBalanceBeforeTx = await toke_token.balanceOf(tokeMakAllocator.address);
        const alcxBalanceBeforeTx = await alchemix_token.balanceOf(tokeMakAllocator.address);
        const gohmBalanceBeforeTx = await gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(Number(tokeBalanceBeforeTx), 0);
        assert.equal(Number(alcxBalanceBeforeTx), 0);
        assert.equal(Number(gohmBalanceBeforeTx), 0);

        const stake = await tokeMakAllocator.amountAllocated(0);
        const stake1 = await tokeMakAllocator.amountAllocated(1);
        const stake2 = await tokeMakAllocator.amountAllocated(2);

        await tokeMakAllocator.connect(multisig).deallocate([stake, stake1, stake2]);
        await increaseCycle();
        await tokeMakAllocator.connect(multisig).deallocate([0, 0, 0]);

        const t_stakingBalanceAfterTx = await t_staking_token.balanceOf(tokeMakAllocator.address);
        const t_alcxBalanceAfterTx = await t_alchemix_token.balanceOf(tokeMakAllocator.address);
        const t_gohmBalanceAfterTx = await t_gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(t_stakingBalanceAfterTx, 0);
        assert.equal(t_alcxBalanceAfterTx, 0);
        assert.equal(t_gohmBalanceAfterTx, 0);

        const tokeBalanceAfterTx = await toke_token.balanceOf(tokeMakAllocator.address);
        const alcxBalanceAfterTx = await alchemix_token.balanceOf(tokeMakAllocator.address);
        const gohmBalanceAfterTx = await gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(Number(tokeBalanceAfterTx), bne(10, 20));
        assert.equal(Number(alcxBalanceAfterTx), bne(10, 20));
        assert.equal(Number(gohmBalanceAfterTx), bne(10, 20));

        const t_StakingAllocatedBalanceAfterTx = await tokeMakAllocator.amountAllocated(0);
        const t_AlcxAllocatedBalanceAfterTx = await tokeMakAllocator.amountAllocated(1);
        const t_GohmAllocatedBalanceAfterTx = await tokeMakAllocator.amountAllocated(2);

        assert.equal(Number(t_StakingAllocatedBalanceAfterTx), 0);
        assert.equal(Number(t_AlcxAllocatedBalanceAfterTx), 0);
        assert.equal(Number(t_GohmAllocatedBalanceAfterTx), 0);
    });

    it("Should fail to prepareMigration for allocator", async () => {
        await setup(bne(10, 20));
        await expect(tokeMakAllocator.connect(multisig).prepareMigration()).to.revertedWith(
            "TokeMakAllocator_StakingDepositedCallDeallocate()"
        );
    });

    it("prepareMigration should work for allocator", async () => {
        await setup(bne(10, 20));

        const tokeBalanceBeforeTx = await toke_token.balanceOf(tokeMakAllocator.address);
        const alcxBalanceBeforeTx = await alchemix_token.balanceOf(tokeMakAllocator.address);
        const gohmBalanceBeforeTx = await gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(Number(tokeBalanceBeforeTx), 0);
        assert.equal(Number(alcxBalanceBeforeTx), 0);
        assert.equal(Number(gohmBalanceBeforeTx), 0);

        const stake = await tokeMakAllocator.amountAllocated(0);
        const stake1 = await tokeMakAllocator.amountAllocated(1);
        const stake2 = await tokeMakAllocator.amountAllocated(2);

        await tokeMakAllocator.connect(multisig).deallocate([stake, stake1, stake2]);
        await increaseCycle();
        await tokeMakAllocator.connect(multisig).prepareMigration();

        const tokeBalanceAfterTx = await toke_token.balanceOf(tokeMakAllocator.address);
        const alcxBalanceAfterTx = await alchemix_token.balanceOf(tokeMakAllocator.address);
        const gohmBalanceAfterTx = await gohm_token.balanceOf(tokeMakAllocator.address);

        assert.equal(Number(tokeBalanceAfterTx), bne(10, 20));
        assert.equal(Number(alcxBalanceAfterTx), bne(10, 20));
        assert.equal(Number(gohmBalanceAfterTx), bne(10, 20));
    });

    it("Should fail to migrate allocator", async () => {
        await setup(bne(10, 20));

        await expect(tokeMakAllocator.connect(multisig).migrate()).to.revertedWith(
            "BaseAllocator_NotMigrating()"
        );
    });

    it("Should migrate allocator", async () => {
        await setup(bne(10, 20));

        const TokeMakAllocator2 = await ethers.getContractFactory("TokeMakAllocator");

        const tokeMakAllocator2 = await TokeMakAllocator2.deploy(
            tokemak.core.ldVoteL1,
            tokemak.core.staking,
            mockTokemakReward.address,
            tokemak.core.manager,
            olympus.treasury,
            {
                authority: olympus.authority,
                tokens: [coins.toke],
                extender: treasuryExtender.address,
            }
        );

        await treasuryExtender.connect(multisig).registerDeposit(tokeMakAllocator2.address);
        await treasuryExtender.connect(multisig).setAllocatorLimits(4, {
            allocated: bne(10, 23),
            loss: bne(10, 19),
        });

        await tokeMakAllocator2.connect(multisig).activate();

        const tokeBalanceBeforeTx = await toke_token.balanceOf(tokeMakAllocator2.address);
        const alcxBalanceBeforeTx = await alchemix_token.balanceOf(tokeMakAllocator2.address);
        const gohmBalanceBeforeTx = await gohm_token.balanceOf(tokeMakAllocator2.address);

        assert.equal(Number(tokeBalanceBeforeTx), 0);
        assert.equal(Number(alcxBalanceBeforeTx), 0);
        assert.equal(Number(gohmBalanceBeforeTx), 0);

        const stake = await tokeMakAllocator.amountAllocated(0);
        const stake1 = await tokeMakAllocator.amountAllocated(1);
        const stake2 = await tokeMakAllocator.amountAllocated(2);

        await tokeMakAllocator.connect(multisig).deallocate([stake, stake1, stake2]);
        await increaseCycle();

        await tokeMakAllocator.connect(multisig).prepareMigration();
        await tokeMakAllocator.connect(multisig).migrate();

        const tokeBalanceAfterTx = await toke_token.balanceOf(tokeMakAllocator2.address);
        const alcxBalanceAfterTx = await alchemix_token.balanceOf(tokeMakAllocator2.address);
        const gohmBalanceAfterTx = await gohm_token.balanceOf(tokeMakAllocator2.address);

        assert.equal(Number(tokeBalanceAfterTx), bne(10, 20));
        assert.equal(Number(alcxBalanceAfterTx), bne(10, 20));
        assert.equal(Number(gohmBalanceAfterTx), bne(10, 20));
    });
});
