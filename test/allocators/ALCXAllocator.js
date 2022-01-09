const chai = require("chai");
const { assert, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { advanceBlock } = require("../utils/advancement");
const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const ALCHEMIX = process.env.ALCHEMIX;
const POLICY_ADDRESS = process.env.POLICY_ADDRESS;
const TOKEMAK_T_ALCX = process.env.TOKEMAK_T_ALCX;
const TOKEMAK_MANAGER = process.env.TOKEMAK_MANAGER;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
const ALCHEMIX_STAKING_POOL = process.env.ALCHEMIX_STAKING_POOL;

describe('Alchemix Allocator', async () => {
    let user,
        policy,
        manager,
        treasury,
        alchemix_token,
        AlchemixAllocator,
        alchemixAllocator,
        treasury_alchemix_initial_balance

    before(async () => {
        await fork_network(13960643);
        [user] = await ethers.getSigners();

        AlchemixAllocator = await ethers.getContractFactory('AlchemixAllocator');
        alchemixAllocator = await AlchemixAllocator.deploy(TREASURY_ADDRESS, ALCHEMIX, TOKEMAK_T_ALCX, ALCHEMIX_STAKING_POOL);

        treasury = await ethers.getContractAt("OlympusTreasury", TREASURY_ADDRESS);
        alchemix_token = await ethers.getContractAt("IERC20", ALCHEMIX);
        manager = await ethers.getContractAt("IManager", TOKEMAK_MANAGER);

        await impersonateAccount(TREASURY_MANAGER);
        const owner = await ethers.getSigner(TREASURY_MANAGER);

        // Give migrator permissions for managing old treasury
        // 0 = RESERVEDEPOSITOR
        // 2 = RESERVETOKEN
        // 3 = RESERVEMANAGER

        await treasury.connect(owner).enable(3, alchemixAllocator.address, alchemixAllocator.address);
        await treasury.connect(owner).enable(0, alchemixAllocator.address, alchemixAllocator.address);
        await treasury.connect(owner).enable(2, ALCHEMIX, ALCHEMIX);

        treasury_alchemix_initial_balance = await alchemix_token.balanceOf(TREASURY_ADDRESS);

        await impersonateAccount(POLICY_ADDRESS);
        policy = await ethers.getSigner(POLICY_ADDRESS);

        //sending ETH to Policy address
        await network.provider.send("hardhat_setBalance", [
            POLICY_ADDRESS, ethers.utils.parseEther("10").toHexString(),
        ]);
    });

    it('Should fail if caller is not owner address', async () => { 
        await expect(
            alchemixAllocator
                .connect(user)
                .deposit(ethers.utils.parseEther("400"), 8, false)
        ).to.revertedWith('UNAUTHORIZED');

        await expect(
            alchemixAllocator
                .connect(user)
                .compoundReward(5)
        ).to.revertedWith('UNAUTHORIZED');

        await expect(
            alchemixAllocator
                .connect(user)
                .requestWithdraw(8, 0, false)
        ).to.revertedWith('UNAUTHORIZED');

        await expect(
            alchemixAllocator
                .connect(user)
                .withdraw()
        ).to.revertedWith('UNAUTHORIZED');
    });

    it('Should fail to deposit if amount to deposit is higher than treasury Alchemix balance', async () => { 
        await expect(
            alchemixAllocator
                .connect(policy)
                .deposit(ethers.utils.parseEther("3000"), 8, false)
        ).to.revertedWith('TRANSFER_FAILED');
    });

    it('Should fail to deposit if the pool id on alchemix is not tALCX', async () => { 
        await expect(
            alchemixAllocator
                .connect(policy)
                .deposit(ethers.utils.parseEther("100"), 1, false)
        ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });

    it('Should deposit OHM treasury Alchemix funds to tokemak, stake received tALCX on Alchemix pool', async () => {   
        await alchemixAllocator.connect(policy).deposit(treasury_alchemix_initial_balance, 8, false);
        let tAlcx_balance_in_alchemix_pool = await alchemixAllocator.total_tAlcxDeposited(8);

        assert.equal(Number(tAlcx_balance_in_alchemix_pool), Number(treasury_alchemix_initial_balance));
    });

    it('Should fail to claim rewards and compound it if pool id on alchemix is not tALCX', async () => {
        await expect(
            alchemixAllocator
                .connect(policy)
                .compoundReward(5)
        ).to.revertedWith('contract has no alchemix token');
    });

    it('Should claim rewards and compound it', async () => {  
        const tAlcx_balance_in_alchemix_pool_before_tx = await alchemixAllocator.total_tAlcxDeposited(8); 
        await advance(172800); // 2 days in seconds

        let pending_rewards = await alchemixAllocator.alchemixToClaim(8)
        const total_tALCX_deposited = Number(tAlcx_balance_in_alchemix_pool_before_tx) + Number(pending_rewards);

        await alchemixAllocator.connect(policy).compoundReward(8);
        const tAlcx_balance_in_alchemix_pool_after_tx = await alchemixAllocator.total_tAlcxDeposited(8); 

        assert.equal(
            Number(tAlcx_balance_in_alchemix_pool_after_tx).toString().slice(0, 5), 
            total_tALCX_deposited.toString().slice(0, 5)
        ); 

        // using .slice here because after total_tALCX_deposited has been recorded,
        // before/when compoundReward is called, block.number has increased, 
        // resulting to tAlcx_balance_in_alchemix_pool_after_tx to have a slightly increased tAlcx amount 
    });

    it('Should fail to request for withdrawal if amount is = 0', async () => {
        await expect(
            alchemixAllocator
                .connect(policy)
                .requestWithdraw(8, 0, false)
        ).to.revertedWith('INVALID_AMOUNT');
    });

    it('Should fail to request for withdrawal if pool id on alchemix is not tALCX', async () => {
        await expect(
            alchemixAllocator
                .connect(policy)
                .requestWithdraw(4, 100, false)
        ).to.revertedWith('SafeMath: subtraction overflow');
    });

    it('Should request for withdrawal', async () => {  
        const tAlcx_balance_in_alchemix_pool = await alchemixAllocator.total_tAlcxDeposited(8); 
        await alchemixAllocator.connect(policy).requestWithdraw(8, 0, true); //using true coz i am withdrawing the entire funds

        let {1: requested_withdraw_amount} = await alchemixAllocator.getRequestedWithdrawalInfo()
        assert.equal(Number(tAlcx_balance_in_alchemix_pool), Number(requested_withdraw_amount));
    });

    it('Should fail to withdraw Alchemix funds if requested withdrawal cycle has not yet been reached', async () => {
        await expect(
            alchemixAllocator
                .connect(policy)
                .withdraw()
        ).to.revertedWith('requested withdraw cycle not reached yet');
    });

    it('Should withdraw Alchemix funds from tokemak tALCX pool and send it back OHM treasury with accrued profit', async () => {  
        await impersonateAccount('0x90b6C61B102eA260131aB48377E143D6EB3A9d4B');
        const onlyRollover = await ethers.getSigner('0x90b6C61B102eA260131aB48377E143D6EB3A9d4B');

        const fake_IpfsHash = 'QmZsREKTfcMuTU4qrE2GbaMLfxwKrHWrUoA3XKH1kycQ5C'
        await manager.connect(onlyRollover).completeRollover(fake_IpfsHash); // used to increase tokemak cycle

        await alchemixAllocator.connect(policy).withdraw();
        const treasury_alchemix_balance_after_investment = await alchemix_token.balanceOf(TREASURY_ADDRESS);

        const profit_accrued = Number(treasury_alchemix_balance_after_investment)
                                - Number(treasury_alchemix_initial_balance);
        console.log('treasury alchemix token accrued profit after investment is','$',profit_accrued/1e18);
    });
})

async function advance(count) {
    for (let i = 0; i < count; i++) {
        await advanceBlock();
    }
}


