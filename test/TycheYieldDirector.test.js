const { ethers } = require("hardhat")
const chai = require("chai");
//const { FakeContract, smock } = require("@defi-wonderland/smock");
const { expect } = chai;

const {
    utils,
} = require("ethers");

const { parseUnits } = utils;

//chai.use(smock.matchers);

describe('TycheYieldDirector', async () => {

    // Reward rate of .1%
    const initialRewardRate = "1000";
    const largeApproval = '100000000000000000000000000000000';
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';

    // TODO remove
    const mineBlocks = async (blockNumber_) => {
        while (blockNumber_ > 0) {
          blockNumber_--;
          await hre.network.provider.request({
            method: "evm_mine",
            params: [],
          });
        }
    }

    const mineBlock = async () => {
        await hre.network.provider.request({
          method: "evm_mine",
          params: [],
        });
    }

    // TODO needs cleanup. use Bignumber.
    const triggerRebase = async (rewardRate_) => {
        const currentIndex = await sOhm.index() / 10 ** 9;
        //const rewardRate = BigNumber.from(rewardRate_);//.toNumber() / 10 ** 9;
        const rewardRate = rewardRate_ / 10 ** 6;
        //const nextIndex = currentIndex.add(currentIndex.mul(rewardRate))
        const nextIndex = currentIndex + (currentIndex * rewardRate)

        mineBlock();
        await staking.rebase();
        await expect(await sOhm.index()).is.equal(nextIndex * 10 ** 9);
    }


    before(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();
        
        //owner = await ethers.getSigner("0x763a641383007870ae96067818f1649e5586f6de")

        //erc20Factory = await ethers.getContractFactory('MockERC20');
        // TODO use dai as erc20 for now
        erc20Factory = await ethers.getContractFactory('DAI');

        stakingFactory = await ethers.getContractFactory('OlympusStaking');
        ohmFactory = await ethers.getContractFactory('OlympusERC20Token');
        sOhmFactory = await ethers.getContractFactory('sOlympus');
        stakingHelperFactory = await ethers.getContractFactory('StakingHelper');
        warmupFactory = await ethers.getContractFactory('StakingWarmup');
        // NOTE: Using mock because `valueOf` causes conflict in JS. Mock has different function name.
        treasuryFactory = await ethers.getContractFactory('MockOlympusTreasury');
        distributorFactory = await ethers.getContractFactory('Distributor');
        tycheFactory = await ethers.getContractFactory('TycheYieldDirector');

    })

    beforeEach(async function() {
        //dai = await smock.fake(erc20Factory);
        //lpToken = await smock.fake(erc20Factory);
        dai = await erc20Factory.deploy(0);
        lpToken = await erc20Factory.deploy(0);

        // TODO use promise.all
        ohm = await ohmFactory.deploy();
        sOhm = await sOhmFactory.deploy();
        // Set epoch length at 1 block
        staking = await stakingFactory.deploy(ohm.address, sOhm.address, "1", "1", "9");
        stakingHelper = await stakingHelperFactory.deploy(staking.address, ohm.address);
        //treasury = await smock.fake(treasuryFactory);
        treasury = await treasuryFactory.deploy(
          ohm.address,
          dai.address,
          lpToken.address,
          "0"
        );
        distributor = await distributorFactory.deploy(treasury.address, ohm.address, "10", "1");
        warmup = await warmupFactory.deploy(staking.address, sOhm.address);
        tyche = await tycheFactory.deploy(ohm.address, sOhm.address);

        // TODO use promise.all

        // Setup for each component

        // Needed for treasury deposit
        await dai.mint(deployer.address, initialMint);
        await dai.approve(treasury.address, largeApproval);

        // Needed to spend deployer's OHM
        await ohm.approve(staking.address, largeApproval);

        // To get past OHM contract guards
        await ohm.setVault(treasury.address)

        // Initialization for sOHM contract. Set index to 1.
        await sOhm.initialize(staking.address);
        // Set index to 10
        await sOhm.setIndex("10000000000");

        // Set treasury, distributor, warmup, and locker for staking contract
        await staking.setContract("0", distributor.address);
        await staking.setContract("1", warmup.address);
        // TODO set locker

        // queue and toggle reward manager
        await treasury.queue('8', distributor.address);
        await treasury.toggle('8', distributor.address, zeroAddress);
        // queue and toggle deployer reserve depositor
        await treasury.queue('0', deployer.address);
        await treasury.toggle('0', deployer.address, zeroAddress);
        // queue and toggle liquidity depositor
        await treasury.queue('4', deployer.address);
        await treasury.toggle('4', deployer.address, zeroAddress);

        // TODO
        // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer
        // and 8,400,000 are in treasury as excesss reserves

        // Deposit 10,000 DAI to treasury, 1,000 OHM gets minted to deployer with 9000 as excess reserves (ready to be minted)
        await treasury.deposit('10000000000000000000000', dai.address, '9000000000000');

        // Add staking as recipient of distributor with a test reward rate
        await distributor.addRecipient(staking.address, initialRewardRate);

        // Get sOHM in deployer wallet
        const sohmAmount = "1000000000000"
        await ohm.approve(stakingHelper.address, sohmAmount);
        await stakingHelper.stake(sohmAmount);
        //await staking.stake(sohmAmount, deployer.address, true);

        // Approve sOHM to be deposited to Tyche
        await sOhm.approve(tyche.address, largeApproval);
    });

    it('should set token addresses correctly', async () => {
        await tyche.deployed();

        expect(await tyche.OHM()).to.equal(ohm.address);
        expect(await tyche.sOHM()).to.equal(sOhm.address);
    });

    it('should deposit tokens to recipient correctly', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        // TODO test with floating point number
        const principal = "100000000000";
        await tyche.deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.amount).is.equal("100000000000"); // 10 * 10 ** 9
        //await expect(donationInfo.amount).is.equal(principal);

        // Verify recipient data
        const recipientInfo = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo.totalDebt).is.equal("100000000000");

        const index = await sOhm.index();
        await expect(recipientInfo.agnosticAmount).is.equal((principal / index) * 10 ** 9 );
        await expect(recipientInfo.indexAtLastRedeem).is.equal("0");

        // TODO rebase and test again
    });
 
    it('should properly donate yield', async () => {
        console.log("TEST REBASING");

        //triggerRebase(initialRewardRate);

        // Deposit sOHM into Tyche and donate to Bob
        // TODO test with floating point number
        const principal = "100";
        await tyche.deposit(principal, bob.address);

        await expect(await sOhm.index()).is.equal("10000000000");

        mineBlocks(1);
        await staking.rebase();
        await expect(await sOhm.index()).is.equal("10010000000");

        mineBlocks(1);
        await staking.rebase();
        await expect(await sOhm.index()).is.equal("10020010000");

        triggerRebase(initialRewardRate);
        triggerRebase(initialRewardRate);
        triggerRebase(initialRewardRate);
        console.log("DONE")
    });
});