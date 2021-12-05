const { ethers, waffle, network } = require("hardhat")
const { expect } = require("chai");
//const { FakeContract, smock } = require("@defi-wonderland/smock");

const {
    utils,
} = require("ethers");
const { advanceBlock } = require("../utils/advancement");

async function moveTimestamp(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
}

describe.only('Bonds', async () => {

    const LARGE_APPROVAL = '100000000000000000000000000000000';
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';
    // Reward rate of .1%
    const initialRewardRate = "1000";

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
        mineBlock();
        await staking.rebase();

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
    let authFactory;
    let mockSOhmFactory;
    let depositoryFactory;
    let tellerFactory;
    let oracleFactory;

    let auth;
    let dai;
    let lpToken;
    let ohm;
    let sOhm;
    let staking;
    let gOhm;
    let treasury;
    let distributor;
    let depository;
    let teller;
    let oracle;

    before(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();
        
        //owner = await ethers.getSigner("0x763a641383007870ae96067818f1649e5586f6de")

        //erc20Factory = await ethers.getContractFactory('MockERC20');
        // TODO use dai as erc20 for now
        authFactory = await ethers.getContractFactory('OlympusAuthority');
        erc20Factory = await ethers.getContractFactory('DAI');

        stakingFactory = await ethers.getContractFactory('OlympusStaking');
        ohmFactory = await ethers.getContractFactory('OlympusERC20Token');
        sOhmFactory = await ethers.getContractFactory('sOlympus');
        gOhmFactory = await ethers.getContractFactory('gOHM');
        treasuryFactory = await ethers.getContractFactory('OlympusTreasury');
        distributorFactory = await ethers.getContractFactory('Distributor');

        depositoryFactory = await ethers.getContractFactory('OlympusBondDepository');
        tellerFactory = await ethers.getContractFactory('BondTeller');
        oracleFactory = await ethers.getContractFactory('Oracle');

    })

    beforeEach(async () => {
        //dai = await smock.fake(erc20Factory);
        //lpToken = await smock.fake(erc20Factory);
        dai = await erc20Factory.deploy(0);
        lpToken = await erc20Factory.deploy(0);

        // TODO use promise.all
        auth = await authFactory.deploy(deployer.address, deployer.address, deployer.address, deployer.address); // TODO
        ohm = await ohmFactory.deploy(auth.address);
        sOhm = await sOhmFactory.deploy();
        gOhm = await gOhmFactory.deploy(sOhm.address, sOhm.address); // Call migrate immediately
        staking = await stakingFactory.deploy(ohm.address, sOhm.address, gOhm.address, "10", "1", "9", auth.address);
        treasury = await treasuryFactory.deploy(ohm.address, "0", auth.address);
        distributor = await distributorFactory.deploy(treasury.address, ohm.address, staking.address, auth.address);
        depository = await depositoryFactory.deploy(ohm.address, treasury.address, auth.address);
        teller = await tellerFactory.deploy(depository.address, staking.address, treasury.address, ohm.address, sOhm.address, carol.address, auth.address);
        oracle = await oracleFactory.deploy();

        // Setup for each component

        // Needed for treasury deposit
        //await gOhm.migrate(staking.address, sOhm.address);
        await dai.mint(deployer.address, initialMint);
        await dai.approve(treasury.address, LARGE_APPROVAL);
        // test coins
        await dai.mint(alice.address, "1000000000000000000000");

        // Needed to spend deployer's OHM
        await ohm.approve(staking.address, LARGE_APPROVAL);

        // To get past OHM contract guards
        await auth.pushVault(treasury.address, true);

        // Initialization for sOHM contract.
        // Set index to 10
        await sOhm.setIndex("10000000000");
        await sOhm.setgOHM(gOhm.address);
        await sOhm.initialize(staking.address, treasury.address);

        // Set distributor staking contract
        await staking.setDistributor(distributor.address);

        // enable on chain governance to avoid queue
        await treasury.enableOnChainGovernance();
        await advanceBlock(1);
        await treasury.enableOnChainGovernance();

        // toggle reward manager
        await treasury.enable('8', teller.address, ZERO_ADDRESS);
        // toggle deployer reserve depositor
        await treasury.enable('0', deployer.address, ZERO_ADDRESS);
        // toggle DAI as reserve token
        await treasury.enable('2', dai.address, ZERO_ADDRESS);

        // Deposit 10,000 DAI to treasury, 1,000 OHM gets minted to deployer with 9000 as excess reserves (ready to be minted)
        await treasury.connect(deployer).deposit('10000000000000000000000', dai.address, '9000000000000');

        // Get sOHM in deployer wallet
        const sohmAmount = "1000000000000"
        await ohm.approve(staking.address, sohmAmount);
        await staking.stake(deployer.address, sohmAmount, true, true);

        // Transfer 100 sOHM to alice for testing
        await sOhm.transfer(alice.address, "100000000000");

        // initialize depository
        await depository.set(0, teller.address, 0);
        await depository.set(2, oracle.address, 0);
        await depository.set(3, ZERO_ADDRESS, "500000");
        await depository.set(4, ZERO_ADDRESS, "10000000");

        // set mock oracle price
        await oracle.setPrice("100000000000");

        await auth.pushPolicy(bob.address, true);

        // set operator/dao rewards
        await teller.connect(bob).setReward(true, "1000000");
        await teller.connect(bob).setReward(false, "10000000");

        // add bond
        await depository.addBond(
            dai.address,
            oracle.address,
            "100000000000",
            false,
            1000000,
            true,
            700000
        );
    });

    it("should add a bond", async () => {
        expect(await depository.ids(0)).to.equal(dai.address);
    });

    it("should enable a bond", async () => {
        await depository.enableBond(0);
    });

    it("should allow a deposit", async () => {
        await depository.enableBond(0);
        await dai.connect(alice).approve(depository.address, "100000000000000000000");
        await depository.connect(alice).deposit(
            alice.address,
            0,
            "100000000000000000000",
            "1000000000000",
            bob.address
        );
    });

    it("should not allow a deposit when price > maxPrice", async () => {
        await depository.enableBond(0);
        await dai.connect(alice).approve(depository.address, "100000000000000000000");
        await expect(depository.connect(alice).deposit(
            alice.address,
            0,
            "100000000000000000000",
            "10000000",
            bob.address
        )).to.be.revertedWith("Depository: more than max price");
    });

    it("should set capacity to zero after falling below min debt", async () => {
        await depository.enableBond(0);
        await moveTimestamp(360000);
        await dai.connect(alice).approve(depository.address, "1000000000000000000000");
        await depository.connect(alice).deposit(
            alice.address,
            0,
            "1000000000000000000",
            "1000000000000",
            bob.address
        );
        await expect(depository.connect(alice).deposit(
            alice.address,
            0,
            "100000000000000000000",
            "1000000000000",
            bob.address
        )).to.be.revertedWith("Depository: exceeds capacity");
    });

    it("should set capacity to zero after rising above max debt", async () => {
        // to do
    });

    it("should not allow redemption before vested", async () => {
        await depository.enableBond(0);
        await dai.connect(alice).approve(depository.address, "100000000000000000000");
        await depository.connect(alice).deposit(
            alice.address,
            0,
            "100000000000000000000",
            "1000000000000",
            bob.address
        );
        await expect(teller.redeem(alice.address, [0])).to.revertedWith("Zero redemption error");
    });

    it("should allow redemption after vested", async () => {
        await depository.enableBond(0);
        let amount = "100000000000000000000";
        let payout = await depository.payoutFor(amount, 0);
        await dai.connect(alice).approve(depository.address, amount);
        await depository.connect(alice).deposit(
            alice.address,
            0,
            amount,
            "1000000000000",
            bob.address
        );
        let balance = await sOhm.balanceOf(alice.address);
        await moveTimestamp(1000000000);
        // await expect(teller.redeem(alice.address, [0])).to.equal(String(payout));
    });

    it("should redeem multiple after vested", async () => {
        await depository.enableBond(0);
        let amount = "100000000000000000000";
        let payout = await depository.payoutFor(amount, 0);
        await dai.connect(alice).approve(depository.address, amount);
        await depository.connect(alice).deposit(
            alice.address,
            0,
            amount,
            "1000000000000",
            bob.address
        );
        payout += await depository.payoutFor(amount, 0);
        await dai.connect(alice).approve(depository.address, amount);
        await depository.connect(alice).deposit(
            alice.address,
            0,
            amount,
            "1000000000000",
            bob.address
        );
        await moveTimestamp(1000000000);
        let redeemed = await teller.redeem(alice.address, [0, 1]);
        // expect().to.equal(String(payout));
    });

    it("should pay front end operator and dao a reward", async () => {
        await depository.enableBond(0);
        let bobBalance = await ohm.balanceOf(bob.address);
        let daoBalance = await ohm.balanceOf(carol.address);
        await dai.connect(alice).approve(depository.address, "100000000000000000000");
        await depository.connect(alice).deposit(
            alice.address,
            0,
            "100000000000000000000",
            "1000000000000",
            bob.address
        );
        await teller.connect(bob).getReward();
        await teller.connect(carol).getReward();
        expect(await ohm.balanceOf(bob.address)).to.not.equal(bobBalance);
        expect(await ohm.balanceOf(carol.address)).to.not.equal(daoBalance);
    });

    // test deprecation
    // test going above max payout
    // test redeemAll()
    // test that bond concludes on time if price remains flat and discount is 2% for each bond
        // compute time interval between each so that decay takes price to 2% discount
        // deposit on each interval and see when capacity is breached (or if bond offering expires first)
});