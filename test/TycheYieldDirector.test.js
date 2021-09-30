const { ethers, waffle } = require("hardhat")
const chai = require("chai");
const { FakeContract, smock } = require("@defi-wonderland/smock");

const { provider, deployContract, loadFixture } = waffle;
const { expect } = chai;

chai.use(smock.matchers);

describe('TycheYieldDirector', async () => {

    async function mineBlocks(blockNumber) {
        while (blockNumber > 0) {
          blockNumber--;
          await hre.network.provider.request({
            method: "evm_mine",
            params: [],
          });
        }
    }

    const initialRewardRate = "1000";
    const largeApproval = '100000000000000000000000000000000';
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';


    before(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();
        
        //owner = await ethers.getSigner("0x763a641383007870ae96067818f1649e5586f6de")

        //erc20Factory = await ethers.getContractFactory('MockERC20');
        // TODO use dai as erc20 for now
        erc20Factory = await ethers.getContractFactory('DAI');

        stakingFactory = await ethers.getContractFactory('OlympusStaking');
        ohmFactory = await ethers.getContractFactory('OlympusERC20Token');
        sOhmFactory = await ethers.getContractFactory('sOlympus');
        //stakingHelperFactory = await ethers.getContractFactory('StakingHelper');
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
        staking = await stakingFactory.deploy(ohm.address, sOhm.address, "10", "1", "9");
        //stakingHelper = await stakingHelperFactory.deploy(staking.address, ohm.address);
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
        await dai.approve(treasury.address, largeApproval );

        // Needed to spend deployer's OHM
        await ohm.approve(staking.address, largeApproval);

        // To get past OHM contract guards
        await ohm.setVault(treasury.address)

        // Initialization for sOHM contract. Set index to 1.
        await sOhm.initialize(staking.address);
        await sOhm.setIndex("10");

        // Set treasury, distributor, warmup, and locker for staking contract
        await staking.setContract("0", distributor.address);
        await staking.setContract("1", warmup.address);

        // queue and toggle reward manager
        await treasury.queue('8', distributor.address, zeroAddress);
        await treasury.execute('0');
        // queue and toggle deployer reserve depositor
        await treasury.queue('0', deployer.address, zeroAddress);
        await treasury.execute('1');
        // queue and toggle liquidity depositor
        await treasury.queue('4', deployer.address, zeroAddress);
        await treasury.execute('2');

        // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer
        // and 8,400,000 are in treasury as excesss reserves
        await treasury.deposit(deployer.address, '9000000000000000000000000', dai.address, '8400000000000000');

        // Add staking as recipient of distributor with a test reward rate
        await distributor.addRecipient(staking.address, initialRewardRate);
    });

    beforeEach(async () => {

    })

    it('should set token addresses correctly', async () => {
        await tyche.deployed();

        expect(await tyche.OHM()).to.equal(ohm.address);
        expect(await tyche.sOHM()).to.equal(sOhm.address);
    });

    it('should deposit tokens to recipient correctly', async () => {
        expect(await ohm.balanceOf(deployer.address)).to.equal("600000000000000");

        // Get sOHM in deployer wallet
        const sohmAmount = "1000"
        await ohm.approve(staking.address, sohmAmount);
        await staking.stake(sohmAmount, deployer.address, true);

        expect(await sOhm.balanceOf(deployer.address)).to.equal(sohmAmount);

        // Deposit sOHM into Tyche and donate to Bob
        const principal = "100.1";
        await sOhm.approve(tyche.address, largeApproval);
        await tyche.deposit(principal, bob.address);

        // Verify donor info
        const donationInfo = await tyche.donationInfo(deployer.address, "0");
        await expect(donationInfo.recipient).is.equal(bob.address);
        await expect(donationInfo.amount).is.equal(principal);

        // Verify recipient data
        const recipientInfo = await tyche.recipientInfo(bob.address);

        await expect(recipientInfo.totalDebt).is.equal(principal);

        const index = await sOhm.index();
        console.log("INDEX IS " + index);
        await expect(recipientInfo.agnosticAmount).is.equal(principal / index);
        //await expect(recipientInfo.indexAtLastRedeem).is.equal("0");
    });
 
    it('should properly donate yield', async () => {

    });
});
