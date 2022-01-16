const chai = require("chai");
const { assert, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { advanceBlock } = require("../utils/advancement");
const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const ALCHEMIX = "0xdbdb4d16eda451d0503b854cf79d55697f90c8df";
const TOKEMAK_T_ALCX = "0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84";
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
        alchemix_token,
        AlchemixAllocator,
        alchemixAllocator,
        treasury_alchemix_initial_balance;

    before(async () => {
        await fork_network(13960643);
        [user] = await ethers.getSigners();

        AlchemixAllocator = await ethers.getContractFactory("AlchemixAllocator");
        alchemixAllocator = await AlchemixAllocator.deploy(
            TREASURY_ADDRESS,
            ALCHEMIX,
            TOKEMAK_T_ALCX,
            ALCHEMIX_STAKING_POOL,
            OLYMPUS_AUTHORITY_ADDRESS
        );

        treasury = await ethers.getContractAt("OlympusTreasury", TREASURY_ADDRESS);
        alchemix_token = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            ALCHEMIX
        );
        manager = await ethers.getContractAt("IManager", TOKEMAK_MANAGER);

        await impersonateAccount(TREASURY_MANAGER);
        const owner = await ethers.getSigner(TREASURY_MANAGER);

        // Give migrator permissions for managing old treasury
        // 0 = RESERVEDEPOSITOR
        // 2 = RESERVETOKEN
        // 3 = RESERVEMANAGER

        await treasury
            .connect(owner)
            .enable(3, alchemixAllocator.address, alchemixAllocator.address);
        await treasury
            .connect(owner)
            .enable(0, alchemixAllocator.address, alchemixAllocator.address);
        await treasury.connect(owner).enable(2, ALCHEMIX, ALCHEMIX);

        treasury_alchemix_initial_balance = await alchemix_token.balanceOf(TREASURY_ADDRESS);

        await impersonateAccount(GUARDIAN_ADDRESS);
        guardian = await ethers.getSigner(GUARDIAN_ADDRESS);
    });

    it("Should fail if caller is not guardian address", async () => {
        await expect(
            alchemixAllocator.connect(user).deposit(ethers.utils.parseEther("400"), 8, false)
        ).to.revertedWith("UNAUTHORIZED");

        await expect(alchemixAllocator.connect(user).compoundReward(5)).to.revertedWith(
            "UNAUTHORIZED"
        );

        await expect(alchemixAllocator.connect(user).requestWithdraw(8, 0, false)).to.revertedWith(
            "UNAUTHORIZED"
        );

        await expect(alchemixAllocator.connect(user).withdraw()).to.revertedWith("UNAUTHORIZED");
    });

    it("Should fail to deposit if amount to deposit is higher than treasury Alchemix balance", async () => {
        await expect(
            alchemixAllocator.connect(guardian).deposit(ethers.utils.parseEther("3000"), 8, false)
        ).to.revertedWith("TRANSFER_FAILED");
    });

    it("Should fail to deposit if the pool id on alchemix is not tALCX", async () => {
        await expect(
            alchemixAllocator.connect(guardian).deposit(ethers.utils.parseEther("100"), 1, false)
        ).to.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should deposit OHM treasury Alchemix funds to tokemak, stake received tALCX on Alchemix pool", async () => {
        await alchemixAllocator
            .connect(guardian)
            .deposit(treasury_alchemix_initial_balance, 8, false);
        let tAlcx_balance_in_alchemix_pool = await alchemixAllocator.totaltAlcxDeposited(8);

        assert.equal(
            Number(tAlcx_balance_in_alchemix_pool),
            Number(treasury_alchemix_initial_balance)
        );
    });

    it("Should fail to claim rewards and compound it if pool id on alchemix is not tALCX", async () => {
        await expect(alchemixAllocator.connect(guardian).compoundReward(5)).to.revertedWith(
            "contract has no alchemix token"
        );
    });

    it("Should claim rewards and compound it", async () => {
        const tAlcx_balance_in_alchemix_pool_before_tx =
            await alchemixAllocator.totaltAlcxDeposited(8);
        await advance(43200); // 2 days in seconds

        let pending_rewards = await alchemixAllocator.alchemixToClaim(8);
        const total_tALCX_deposited =
            Number(tAlcx_balance_in_alchemix_pool_before_tx) + Number(pending_rewards);

        await alchemixAllocator.connect(guardian).compoundReward(8);
        const tAlcx_balance_in_alchemix_pool_after_tx = await alchemixAllocator.totaltAlcxDeposited(
            8
        );

        assert.equal(
            Number(tAlcx_balance_in_alchemix_pool_after_tx).toString().slice(0, 5),
            total_tALCX_deposited.toString().slice(0, 5)
        );

        // using .slice here because after total_tALCX_deposited has been recorded,
        // before/when compoundReward is called, block.number has increased,
        // resulting to tAlcx_balance_in_alchemix_pool_after_tx to have a slightly increased tAlcx amount
    });

    it("Should fail to request for withdrawal if amount is = 0", async () => {
        await expect(
            alchemixAllocator.connect(guardian).requestWithdraw(8, 0, false)
        ).to.revertedWith("INVALID_AMOUNT");
    });

    it("Should fail to request for withdrawal if pool id on alchemix is not tALCX", async () => {
        await expect(
            alchemixAllocator.connect(guardian).requestWithdraw(4, 100, false)
        ).to.revertedWith("SafeMath: subtraction overflow");
    });

    it("Should request for withdrawal", async () => {
        const tAlcx_balance_in_alchemix_pool = await alchemixAllocator.totaltAlcxDeposited(8);
        await alchemixAllocator.connect(guardian).requestWithdraw(8, 0, true); //using true coz i am withdrawing the entire funds

        let { 1: requested_withdraw_amount } = await alchemixAllocator.getRequestedWithdrawalInfo();
        assert.equal(Number(tAlcx_balance_in_alchemix_pool), Number(requested_withdraw_amount));
    });

    it("Should fail to withdraw Alchemix funds if requested withdrawal cycle has not yet been reached", async () => {
        await expect(alchemixAllocator.connect(guardian).withdraw()).to.revertedWith(
            "requested withdraw cycle not reached yet"
        );
    });

    it("Should withdraw Alchemix funds from tokemak tALCX pool and send it back OHM treasury with accrued profit", async () => {
        await impersonateAccount("0x90b6C61B102eA260131aB48377E143D6EB3A9d4B");
        const onlyRollover = await ethers.getSigner("0x90b6C61B102eA260131aB48377E143D6EB3A9d4B");

        const fake_IpfsHash = "QmZsREKTfcMuTU4qrE2GbaMLfxwKrHWrUoA3XKH1kycQ5C";
        await manager.connect(onlyRollover).completeRollover(fake_IpfsHash); // used to increase tokemak cycle

        await alchemixAllocator.connect(guardian).withdraw();
        const treasury_alchemix_balance_after_investment = await alchemix_token.balanceOf(
            TREASURY_ADDRESS
        );

        const profit_accrued =
            Number(treasury_alchemix_balance_after_investment) -
            Number(treasury_alchemix_initial_balance);
        console.log(
            "treasury alchemix token accrued profit after investment is",
            "$",
            profit_accrued / 1e18
        );
    });
});

async function advance(count) {
    for (let i = 0; i < count; i++) {
        await advanceBlock();
    }
}
