const { ethers, waffle, network } = require("hardhat")
const { expect } = require("chai");
//const { FakeContract, smock } = require("@defi-wonderland/smock");

const {
    utils,
} = require("ethers");

describe('YieldDirector', async () => {

    const LARGE_APPROVAL = '100000000000000000000000000000000';
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    // Initial mint for Frax and DAI (10,000,000)
    const INITIAL_MINT = '10000000000000000000000000';
    // Reward rate of .1%
    const initialRewardRate = "1000";
    const INITIAL_INDEX = "10000000000";
    const INITIAL_REBASE_PCT = "1000000";

    const mineBlock = async () => {
        await network.provider.request({
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
        //mineBlock();
        //await staking.rebase();
        await sOhm.rebase();
        return await sOhm.index();
    }

    let deployer, alice, bob, carol;
    let erc20Factory;
    let stakingFactory;
    let ohmFactory;
    let sOhmFactory;
    let gOhmFactory;
    let treasuryFactory;
    let distributorFactory;

    let mockSOhmFactory;
    let tycheFactory;

    let sOhm;
    let tyche;

    before(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();
        
        mockSOhmFactory = await ethers.getContractFactory('MockSOHM');
        tycheFactory = await ethers.getContractFactory('YieldDirector');
    })

    beforeEach(async () => {
        sOhm = await mockSOhmFactory.deploy(INITIAL_INDEX, INITIAL_REBASE_PCT);
        tyche = await tycheFactory.deploy(sOhm.address);

        // Mint 1000 sOhm to intialier
        await sOhm.mint(deployer.address, "1000000000000");
        await sOhm.approve(tyche.address, LARGE_APPROVAL);
        // Mint 100 sOhm to alice 
        await sOhm.connect(alice).drip();
        await sOhm.connect(alice).approve(tyche.address, LARGE_APPROVAL);
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

        expect(await tyche.sOHM()).to.equal(sOhm.address);
    });

    it('should deposit tokens to recipient correctly', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000";
        await tyche.deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.deposit).is.equal(principal); // 10 * 10 ** 9
        //await expect(donationInfo.amount).is.equal(principal);

        // Verify recipient data
        const recipientInfo = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo.totalDebt).is.equal(principal);

        const index = await sOhm.index();
        await expect(recipientInfo.agnosticAmount).is.equal((principal / index) * 10 ** 9 );
    });

    it('should withdraw tokens', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);

        const index0 = await sOhm.index();
        const recipientInfo0 = await tyche.recipientInfo(bob.address);
        const originalAgnosticAmount = principal / index0 * 10 ** 9;

        await expect(recipientInfo0.agnosticAmount).is.equal(originalAgnosticAmount);
        await expect(recipientInfo0.indexAtLastChange).is.equal("10000000000");

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");

        // First rebase
        await triggerRebase();

        const recipientInfo1 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo1.agnosticAmount).is.equal(originalAgnosticAmount);
        await expect(recipientInfo1.totalDebt).is.equal(principal);
        await expect(recipientInfo1.indexAtLastChange).is.equal("10000000000");

        const donatedAmount = "100000000"; // .1
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);

        await tyche.withdraw(principal, bob.address);

        // Verify donor and recipient data is properly updated
        const donationInfo1 = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo1.recipient).is.equal(ZERO_ADDRESS);
        await expect(donationInfo1.deposit).is.equal("0");

        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo2.agnosticAmount).is.equal("9990009"); // .009~
        await expect(recipientInfo2.carry).is.equal(donatedAmount);
        await expect(recipientInfo2.totalDebt).is.equal("0");
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donatedAmount);
    });

    // TODO
    it('should redeem tokens', async () => {
        // Deposit 100 sOHM into Tyche and donate to Bob
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);
        await triggerRebase();
        await tyche.connect(bob).redeem();
    });

    it('should withdraw tokens before recipient redeems', async () => {
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
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100100000"); // .1001

        // Trigger a few rebases
        await triggerRebase();
        await triggerRebase();
        await triggerRebase();
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100400600"); // .1004~

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

        await tyche.connect(bob).redeem();

        //await expect(await sOhm.balanceOf(bob.address)).is.equal(redeemablePerRebase);
        await expect(await sOhm.balanceOf(bob.address)).is.equal("99999990");
        
        const recipientInfo2 = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo2.agnosticAmount).is.equal("9990009990"); // 9.990~
        await expect(recipientInfo2.totalDebt).is.equal(principal);

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
        await expect(await sOhm.balanceOf(bob.address)).is.equal("200099980"); // should be redeemablePerRebase, precision error
    });

    it('should deposit from multiple sources', async () => {
        // Both deployer and alice deposit 100 sOHM and donate to Bob
        const principal = "100000000000";

        // Deposit from 2 accounts at different indexes
        await tyche.deposit(principal, bob.address);
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("0");
        await triggerRebase();
        await tyche.connect(alice).deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.deposit).is.equal(principal); // 100
        //await expect(donationInfo.amount).is.equal(principal);

        const donationInfoAlice = await tyche.donationInfo(alice.address, "0");
        await expect(donationInfoAlice.recipient).is.equal(bob.address);
        await expect(donationInfoAlice.deposit).is.equal(principal); // 100

        // Verify recipient data
        const donated = "200000000000";
        const recipientInfo = await tyche.recipientInfo(bob.address);
        await expect(recipientInfo.totalDebt).is.equal(donated);
        await expect(recipientInfo.agnosticAmount).is.equal("19990009990");
        await expect(recipientInfo.indexAtLastChange).is.equal("10010000000");

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100000000");
        await triggerRebase();
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("300100000");
        await triggerRebase();
        await expect(await tyche.redeemableBalance(bob.address)).is.equal("500400100");
    });

    it('should withdraw to multiple sources', async () => {
        // Both deployer and alice deposit 100 sOHM and donate to Bob
        const principal = "100000000000";

        // Deposit from 2 accounts
        await tyche.deposit(principal, bob.address);
        await tyche.connect(alice).deposit(principal, bob.address);

        // Wait for some rebases
        await triggerRebase();

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("200000000");

        // Verify withdrawal
        const balanceBefore = await sOhm.balanceOf(deployer.address);
        await expect(await tyche.withdraw(principal, bob.address));
        const balanceAfter = await sOhm.balanceOf(deployer.address);
        await expect(balanceAfter.sub(balanceBefore)).is.equal("99999999999"); // precision error

        await triggerRebase();
        
        const donated = "300200000";
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donated);

        // Verify withdrawal
        const balanceBefore1 = await sOhm.balanceOf(alice.address);
        await expect(await tyche.connect(alice).withdraw(principal, bob.address));
        const balanceAfter1 = await sOhm.balanceOf(alice.address);
        await expect(balanceAfter1.sub(balanceBefore1)).is.equal("99999999999"); // precision error

        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donated);
    });


    // TODO test depositing to multiple addresses, then withdrawAll
    it('should withdrawAll after donating to multiple sources', async () => {
        // Both deployer and alice deposit 100 sOHM and donate to Bob
        const principal = "100000000000";

        // Deposit from 2 accounts
        await tyche.deposit(principal, bob.address);
        await tyche.deposit(principal, alice.address);

        // Wait for some rebases
        await triggerRebase();

        await expect(await tyche.redeemableBalance(bob.address)).is.equal("100000000");
        await expect(await tyche.redeemableBalance(alice.address)).is.equal("100000000");

        // Verify withdrawal
        const balanceBefore = await sOhm.balanceOf(deployer.address);
        await expect(await tyche.withdrawAll());
        const balanceAfter = await sOhm.balanceOf(deployer.address);

        await expect(balanceAfter.sub(balanceBefore)).is.equal("199999999999");
    });

    // TODO test multiple redeems in same epoch
    it('should allow redeem only once per epoch', async () => {
        const principal = "100000000000"; // 100
        await tyche.deposit(principal, bob.address);

        await triggerRebase();

        const donated = "100000000";
        await expect(await tyche.redeemableBalance(bob.address)).is.equal(donated);
        await tyche.connect(bob).redeem();
        await expect(await sOhm.balanceOf(bob.address)).is.equal("99999990"); // precision error

        //await expect(await tyche.connect(bob).redeem()).to.be.reverted(); // TODO revert check doesnt work
    });
});