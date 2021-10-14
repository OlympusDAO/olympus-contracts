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

    const LARGE_APPROVAL = '100000000000000000000000000000000';
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';
    // Reward rate of .1%
    const initialRewardRate = "1000";

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

    // Calculate index after some number of epochs. Takes principal and rebase rate.
    // TODO verify this works
    const calcIndex = (principal, rate, epochs) => principal * (1 + rate) ** epochs;

    // TODO needs cleanup. use Bignumber.
    // Mine block and rebase. Returns the new index.
    const triggerRebase = async () => {
        //const currentIndex = await sOhm.index() / 10 ** 9;
        //const rewardRate = initialRewardRate / 10 ** 6;
        //const nextIndex = currentIndex + (currentIndex * rewardRate)

        mineBlock();
        await staking.rebase();

        return await sOhm.index();
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
        await dai.approve(treasury.address, LARGE_APPROVAL);

        // Needed to spend deployer's OHM
        await ohm.approve(staking.address, LARGE_APPROVAL);

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
        await treasury.toggle('8', distributor.address, ZERO_ADDRESS);
        // queue and toggle deployer reserve depositor
        await treasury.queue('0', deployer.address);
        await treasury.toggle('0', deployer.address, ZERO_ADDRESS);
        // queue and toggle liquidity depositor
        await treasury.queue('4', deployer.address);
        await treasury.toggle('4', deployer.address, ZERO_ADDRESS);

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
        await sOhm.approve(tyche.address, LARGE_APPROVAL);
    });

    it('should rebase properly', async () => {
        await expect(await sOhm.index()).is.equal("10000000000");

        await triggerRebase();
        await expect(await sOhm.index()).is.equal("10010000000");

        await triggerRebase();
        await expect(await sOhm.index()).is.equal("10020010000");

        await triggerRebase();
        await expect(await sOhm.index()).is.equal("10030030010");
    });

    it('should set token addresses correctly', async () => {
        await tyche.deployed();

        expect(await tyche.OHM()).to.equal(ohm.address);
        expect(await tyche.sOHM()).to.equal(sOhm.address);
    });

    it('should deposit tokens to recipient correctly', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000";
        await tyche.deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.amount).is.equal(principal); // 10 * 10 ** 9
        //await expect(donationInfo.amount).is.equal(principal);

        // Verify recipient data
        const recipientInfo = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo.totalDebt).is.equal(principal);

        const index = await sOhm.index();
        await expect(recipientInfo.agnosticAmount).is.equal((principal / index) * 10 ** 9 );
        await expect(recipientInfo.indexAtLastRedeem).is.equal("0");

        //const newIndex = await triggerRebase();
        //await expect(recipientInfo.agnosticAmount).is.equal((principal / newIndex) * 10 ** 9 );
    });

    it.skip('should withdraw tokens', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);

        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.amount).is.equal(principal); // 100 * 10 ** 9

        const index0 = await sOhm.index();
        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        const originalAgnosticAmount = principal / index0 * 10 ** 9;

        await expect(recipientInfo0.agnosticAmount).is.equal(originalAgnosticAmount);
        await expect(recipientInfo0.indexAtLastRedeem).is.equal("0");

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");

        // First rebase
        await triggerRebase();

        const index1 = await sOhm.index();
        await expect(index1).is.equal("10010000000"); // 10.01

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo1.agnosticAmount).is.equal(originalAgnosticAmount);
        await expect(recipientInfo1.totalDebt).is.equal(principal);
        await expect(recipientInfo1.indexAtLastRedeem).is.equal("0");

        console.log("AGNOSTIC SHOULD BE ")
        console.log(originalAgnosticAmount.toString())

        const donatedAmount = "100000000"; // .1
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        await tyche.withdraw(principal, bob.address);

        // Verify donor and recipient data is properly updated
        const donationInfo1 = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo1.recipient).is.equal(ZERO_ADDRESS);
        await expect(donationInfo1.amount).is.equal("0");

        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo2.agnosticAmount).is.equal("9990009"); // .009~
        await expect(recipientInfo2.totalDebt).is.equal("0");
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("99999990"); // TODO verify this
    });

    // TODO
    it.skip('should redeem tokens', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);
        await triggerRebase();
        await tyche.connect(bob).redeem();
    });

    it.skip('should withdraw tokens before recipient redeems', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);
        await triggerRebase();

        const donatedAmount = "100000000"; // .1
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        await expect(await recipientInfo0.agnosticAmount).is.equal("10000000000"); // 10

        await tyche.withdraw(principal, bob.address);

        // Redeemable amount should be unchanged
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        //await expect(await recipientInfo1.agnosticAmount).is.equal("9990010");
        await expect(await recipientInfo1.agnosticAmount).is.equal("9990009");

        // Second rebase
        await triggerRebase();

        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        //await expect(await recipientInfo2.agnosticAmount).is.equal("9990010"); // .009~
        await expect(await recipientInfo2.agnosticAmount).is.equal("9990009"); // .009~
        const redeemable = "100099990";
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(redeemable); // .1001

        // Trigger a few rebases
        await triggerRebase();
        await triggerRebase();
        await triggerRebase();

        await tyche.connect(bob).redeem();

        //await expect(await sOhm.balanceOf(bob.address)).is.equal(redeemable);
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");
   });


    it('should withdraw tokens after recipient redeems', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);

        const index0 = await sOhm.index();
        const originalAgnosticAmount = (principal / index0) * 10 ** 9;

        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo0.agnosticAmount).is.equal(originalAgnosticAmount);

        await triggerRebase();

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo1.agnosticAmount).is.equal(originalAgnosticAmount);
        await expect(recipientInfo1.totalDebt).is.equal(principal);

        const redeemablePerRebase = await tyche.redeemableBalance(bob.address);
        //console.log("REDEEMABLE")
        //console.log(redeemablePerRebase.toString())

        await tyche.connect(bob).redeem();

        await expect(await sOhm.balanceOf(bob.address)).is.equal(redeemablePerRebase);
        
        // Debt should be cleared and agnostic value should be slightly less
        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        //await expect(recipientInfo2.agnosticAmount).is.closeTo(originalAgnosticAmount);
        await expect(recipientInfo2.agnosticAmount).is.equal("9990009991"); // 9.990~
        await expect(recipientInfo2.totalDebt).is.equal("0");

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");

        // Second rebase
        await triggerRebase();
        
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(redeemablePerRebase);

        await tyche.withdraw(principal, bob.address);

        // This amount should be the exact same as before withdrawal.
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(redeemablePerRebase);

        // Redeem and make sure correct amount is present
        const prevBalance = await sOhm.balanceOf(bob.address);
        await tyche.connect(bob).redeem();
        await expect(await sOhm.balanceOf(bob.address)).is.equal(prevBalance.add(redeemablePerRebase));
    });

    // TODO test depositing to multiple addresses, then withdrawAll
    //it('should redeem proper amount after multiple deposit and withdrawals', async () => {
    //    // TODO
    //});

});