const chai = require("chai");
const { assert, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { advanceBlock } = require("../utils/advancement");
const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const ALCHEMIST = process.env.ALCHEMIST;
const TOKEMAK_T_ALCX = process.env.TOKEMAK_T_ALCX;
const TOKEMAK_MANAGER = process.env.TOKEMAK_MANAGER;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
const ALCHEMIX_STAKING_POOL = process.env.ALCHEMIX_STAKING_POOL;

describe('Alchemist Allocator', async () => {
    let user,
        manager,
        deployer,
        treasury,
        alchemist_token,
        AlchemistAllocator,
        alchemistAllocator,
        treasury_alchemist_initial_balance

    before(async () => {
        await fork_network(13960643);
        [deployer, user] = await ethers.getSigners();

        AlchemistAllocator = await ethers.getContractFactory('AlchemistAllocator');
        alchemistAllocator = await AlchemistAllocator.deploy(TREASURY_ADDRESS, ALCHEMIST, TOKEMAK_T_ALCX, ALCHEMIX_STAKING_POOL);

        treasury = await ethers.getContractAt("OlympusTreasury", TREASURY_ADDRESS);
        alchemist_token = await ethers.getContractAt("IERC20", ALCHEMIST);
        manager = await ethers.getContractAt("IManager", TOKEMAK_MANAGER);

        await impersonateAccount(TREASURY_MANAGER);
        const owner = await ethers.getSigner(TREASURY_MANAGER);

        // Give migrator permissions for managing old treasury
        // 0 = RESERVEDEPOSITOR
        // 2 = RESERVETOKEN
        // 3 = RESERVEMANAGER

        await treasury.connect(owner).enable(3, alchemistAllocator.address, alchemistAllocator.address);
        await treasury.connect(owner).enable(0, alchemistAllocator.address, alchemistAllocator.address);
        await treasury.connect(owner).enable(2, ALCHEMIST, ALCHEMIST);

        treasury_alchemist_initial_balance = await alchemist_token.balanceOf(TREASURY_ADDRESS);
    });

    it('Should fail if caller is not owner address', async () => { 
        await expect(
            alchemistAllocator
                .connect(user)
                .deposit(ethers.utils.parseEther("400"), 8, false)
        ).to.revertedWith('Ownable: caller is not the owner');

        await expect(
            alchemistAllocator
                .connect(user)
                .compoundReward(5)
        ).to.revertedWith('Ownable: caller is not the owner');

        await expect(
            alchemistAllocator
                .connect(user)
                .requestWithdraw(8, 0, false)
        ).to.revertedWith('Ownable: caller is not the owner');

        await expect(
            alchemistAllocator
                .connect(user)
                .withdraw()
        ).to.revertedWith('Ownable: caller is not the owner');
    });

    it('Should fail to deposit if amount to deposit is higher than treasury Alchemist balance', async () => { 
        await expect(
            alchemistAllocator
                .connect(deployer)
                .deposit(ethers.utils.parseEther("3000"), 8, false)
        ).to.revertedWith('TRANSFER_FAILED');
    });

    it('Should fail to deposit if the pool id on alchemist is not tALCX', async () => { 
        await expect(
            alchemistAllocator
                .connect(deployer)
                .deposit(ethers.utils.parseEther("100"), 1, false)
        ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });

    it('Should deposit OHM treasury Alchemist funds to tokemak, stake received tALCX on Alchemist pool', async () => {   
        await alchemistAllocator.connect(deployer).deposit(treasury_alchemist_initial_balance, 8, false);
        let tAlcx_balance_in_alchemist_pool = await alchemistAllocator.total_tAlcxDeposited(8);

        assert.equal(Number(tAlcx_balance_in_alchemist_pool), Number(treasury_alchemist_initial_balance));
    });

    it('Should fail to claim rewards and compound it if pool id on alchemist is not tALCX', async () => {
        await expect(
            alchemistAllocator
                .connect(deployer)
                .compoundReward(5)
        ).to.revertedWith('contract has no alchemist token');
    });

    it('Should claim rewards and compound it', async () => {  
        const tAlcx_balance_in_alchemist_pool_before_tx = await alchemistAllocator.total_tAlcxDeposited(8); 
        await advance(172800); // 2 days in seconds

        let pending_rewards = await alchemistAllocator.alchemistToClaim(8)
        const total_tALCX_deposited = Number(tAlcx_balance_in_alchemist_pool_before_tx) + Number(pending_rewards);

        await alchemistAllocator.connect(deployer).compoundReward(8);
        const tAlcx_balance_in_alchemist_pool_after_tx = await alchemistAllocator.total_tAlcxDeposited(8); 

        assert.equal(
            Number(tAlcx_balance_in_alchemist_pool_after_tx).toString().slice(0, 5), 
            total_tALCX_deposited.toString().slice(0, 5)
        ); 

        // using .slice here because after total_tALCX_deposited has been recorded,
        // before/when compoundReward is called, block.number has increased, 
        // resulting to tAlcx_balance_in_alchemist_pool_after_tx to have a slightly increased tAlcx amount 
    });

    it('Should fail to request for withdrawal if amount is = 0', async () => {
        await expect(
            alchemistAllocator
                .connect(deployer)
                .requestWithdraw(8, 0, false)
        ).to.revertedWith('INVALID_AMOUNT');
    });

    it('Should fail to request for withdrawal if pool id on alchemist is not tALCX', async () => {
        await expect(
            alchemistAllocator
                .connect(deployer)
                .requestWithdraw(4, 100, false)
        ).to.revertedWith('SafeMath: subtraction overflow');
    });

    it('Should request for withdrawal', async () => {  
        const tAlcx_balance_in_alchemist_pool = await alchemistAllocator.total_tAlcxDeposited(8); 
        await alchemistAllocator.connect(deployer).requestWithdraw(8, 0, true); //using true coz i am withdrawing the entire funds

        let {1: requested_withdraw_amount} = await alchemistAllocator.getRequestedWithdrawalInfo()
        assert.equal(Number(tAlcx_balance_in_alchemist_pool), Number(requested_withdraw_amount));
    });

    it('Should fail to withdraw Alchemist funds if requested withdrawal cycle has not yet been reached', async () => {
        await expect(
            alchemistAllocator
                .connect(deployer)
                .withdraw()
        ).to.revertedWith('requested withdraw cycle not reached yet');
    });

    it('Should withdraw Alchemist funds from tokemak tALCX pool and send it back OHM treasury with accured profit', async () => {  
        await impersonateAccount('0x90b6C61B102eA260131aB48377E143D6EB3A9d4B');
        const onlyRollover = await ethers.getSigner('0x90b6C61B102eA260131aB48377E143D6EB3A9d4B');

        const fake_IpfsHash = 'QmZsREKTfcMuTU4qrE2GbaMLfxwKrHWrUoA3XKH1kycQ5C'
        await manager.connect(onlyRollover).completeRollover(fake_IpfsHash); // used to increase tokemak cycle

        await alchemistAllocator.connect(deployer).withdraw();
        const treasury_alchemist_balance_after_investment = await alchemist_token.balanceOf(TREASURY_ADDRESS);

        const profit_accured = Number(treasury_alchemist_balance_after_investment)
                                - Number(treasury_alchemist_initial_balance);
        console.log('treasury alchemist token accured profit after investment is','$',profit_accured/1e18);
    });
})

async function advance(count) {
    for (let i = 0; i < count; i++) {
        await advanceBlock();
    }
}



