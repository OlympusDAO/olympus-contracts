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
        depository = await depositoryFactory.deploy(ohm.address, treasury.address);
        teller = await tellerFactory.deploy(depository.address, staking.address, treasury.address, ohm.address, sOhm.address, carol.address, auth.address);
        oracle = await oracleFactory.deploy();

        // Setup for each component

        // Needed for treasury deposit
        //await gOhm.migrate(staking.address, sOhm.address);
        await dai.mint(deployer.address, initialMint);
        await dai.approve(treasury.address, LARGE_APPROVAL);
        // test coins
        await dai.mint(alice.address, "1000000000000000000000000");

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
        await depository.setTeller(teller.address);
        await depository.setGlobal("500000", "10000000");
        await depository.setFeed(oracle.address);

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

    describe('addBond()', () => {
        it("should add a bond", async () => {
            expect(await depository.ids(0)).to.equal(dai.address);
        });
    });

    describe("enableBond()", () => {
        it("should enable a bond", async () => {
            await depository.enableBond(0);
        });
    });

    describe("deposit()", () => {
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
            )).to.be.revertedWith("Slippage limit: more than max price");
            
        });

        it("should set capacity to zero after falling below min debt", async () => {
            await depository.enableBond(0);
            await moveTimestamp(1000000000);
            await dai.connect(alice).approve(depository.address, "100000000000000000000");
            
            await expect(depository.connect(alice).deposit(
                alice.address,
                0,
                "100000000000000000000",
                "1000000000000",
                bob.address
            )).to.be.revertedWith("Bond concluded");
        });

        it("should set capacity to zero after rising above max debt", async () => {
            await depository.addBond(
                dai.address,
                oracle.address,
                "10000000000",
                false,
                1000000,
                true,
                700000
            );
    
            await depository.enableBond(1);
            let infoBefore = await depository.bonds('1');
    
            expect(infoBefore.capacity.toString()).to.equal('10000000000');
    
                await dai.connect(alice).approve(depository.address, "100000000000000000000000");
                await depository.connect(alice).deposit(
                    alice.address,
                    1,
                    "700000000000000000000",
                    "1000000000000",
                    bob.address
                );
    
                let infoAfter = await depository.bonds('1');
    
                expect(infoAfter.capacity.toString()).to.equal('0');
        });

        it("should NOT let user purhcase bond above max payout", async () => {
            await depository.enableBond(0);
            await depository.setGlobal("500000", "1");
            let amount = "1000000000000000000";
            await dai.connect(alice).approve(depository.address, amount);
            await expect(depository.connect(alice).deposit(
                alice.address,
                0,
                amount,
                "1000000000000",
                bob.address
            )).to.be.revertedWith("Bond too large");
        });
    });


    describe("redeem()", () => {

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
    
            await expect(teller.redeem(alice.address, [0])).to.be. revertedWith('Zero redemption error');
        });

        it("should allow redemption after vested", async () => {
            await depository.enableBond(0);
            let amount = "100000000000000000000";
    
            await dai.connect(alice).approve(depository.address, amount);
            let deposit = await depository.connect(alice).deposit(
                alice.address,
                0,
                amount,
                "1000000000000",
                bob.address
            );
    
            // GETTING AN EVENT ARGUMENT
            let receipt = await ethers.provider.getTransactionReceipt(deposit.hash);
            const interface = new ethers.utils.Interface(["event CreateBond(uint256 index, uint256 payout, uint256 expires)"]);
            let data = receipt.logs[1].data;
            let topics = receipt.logs[1].topics;
            let event = interface.decodeEventLog("CreateBond", data, topics);
            let payout = event[1].toString();
            //
    
            let balanceBefore = await sOhm.balanceOf(alice.address);
            await moveTimestamp(1000000000);
            await teller.redeem(alice.address, [0]);
    
            let balanceAfter = await sOhm.balanceOf(alice.address);
    
            expect(balanceBefore).to.equal(balanceAfter - payout);
        });
    
        it("should redeem multiple after vested", async () => {
            await depository.enableBond(0);
            let amount = "100000000000000000000";

            let balanceBefore = await sOhm.balanceOf(alice.address);

            await dai.connect(alice).approve(depository.address, amount);
            let deposit1 = await depository.connect(alice).deposit(
                alice.address,
                0,
                amount,
                "1000000000000",
                bob.address
            );
            
            await dai.connect(alice).approve(depository.address, amount);
            let deposit2 = await depository.connect(alice).deposit(
                alice.address,
                0,
                amount,
                "1000000000000",
                bob.address
            );

            // GETTING AN EVENT ARGUMENT
            const interface = new ethers.utils.Interface(["event CreateBond(uint256 index, uint256 payout, uint256 expires)"]);
    
            let receipt1 = await ethers.provider.getTransactionReceipt(deposit1.hash);
            let receipt2 = await ethers.provider.getTransactionReceipt(deposit2.hash);
    
            let data1 = receipt1.logs[1].data;
            let data2 = receipt2.logs[1].data;
    
            let topics1 = receipt1.logs[1].topics;
            let topics2 = receipt2.logs[1].topics;
            
            let event1 = interface.decodeEventLog("CreateBond", data1, topics1);
            let event2 = interface.decodeEventLog("CreateBond", data2, topics2);
    
            let payout1 = event1[1].toString();
            let payout2 = event2[1].toString();
            //

            let expectedBalanceAfter = +balanceBefore + +payout1 + +payout2;

            await moveTimestamp(1000000000);
            await teller.redeem(alice.address, [0, 1]);
            
            let balanceAfter = await sOhm.balanceOf(alice.address);
            expect(expectedBalanceAfter.toString()).to.equal(balanceAfter.toString());
        });
    });

    describe("getReward()", () => {
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
    });

    describe("deprecateBond()", () => {
        it("should let controller deprecate bond", async () => {
            await depository.enableBond(0);
            await depository.deprecateBond(0);
        });
    
        it("should NOT let non controller deprecate bond", async () => {
            await depository.enableBond(0);
            await expect(depository.connect(alice).deprecateBond('0')).to.be.revertedWith('Only controller');
        });
    })

    describe("redeemAll()", () => {
        it("should let user redeem all", async () => {

            let amount = "1000000000000000000";
            let approve = "10000000000000000000";
            await dai.connect(alice).approve(depository.address, approve);
    
            await depository.addBond(
                dai.address,
                oracle.address,
                "100000000000",
                false,
                1000000,
                true,
                700000
            );
    
            await depository.enableBond(0);
            await depository.enableBond(1);
    
            expect(await sOhm.balanceOf(alice.address)).to.equal('100000000000');
            let balanceBefore = await sOhm.balanceOf(alice.address);
    
            const deposit1 = await depository.connect(alice).deposit(
                alice.address,
                0,
                amount,
                "1000000000000",
                alice.address
            );
    
            const deposit2 = await depository.connect(alice).deposit(
                alice.address,
                1,
                amount,
                "1000000000000",
                alice.address
            );
    
            // GETTING AN EVENT ARGUMENT
            const interface = new ethers.utils.Interface(["event CreateBond(uint256 index, uint256 payout, uint256 expires)"]);
    
            let receipt1 = await ethers.provider.getTransactionReceipt(deposit1.hash);
            let receipt2 = await ethers.provider.getTransactionReceipt(deposit2.hash);
    
            let data1 = receipt1.logs[1].data;
            let data2 = receipt2.logs[1].data;
    
            let topics1 = receipt1.logs[1].topics;
            let topics2 = receipt2.logs[1].topics;
            
            let event1 = interface.decodeEventLog("CreateBond", data1, topics1);
            let event2 = interface.decodeEventLog("CreateBond", data2, topics2);
    
            let payout1 = event1[1].toString();
            let payout2 = event2[1].toString();
            //
    
            let expectedBalanceAfter = +balanceBefore + +payout1 + +payout2;
    
            await moveTimestamp(1000000000);
    
            await teller.redeemAll(alice.address);
    
            let balanceAfter = await sOhm.balanceOf(alice.address);
            expect(expectedBalanceAfter.toString()).to.equal(balanceAfter.toString());
    
        });

    });
    
    // test deprecation - done
    // test going above max payout - done
    // test redeemAll() - done
    // test that bond concludes on time if price remains flat and discount is 2% for each bond
        // compute time interval between each so that decay takes price to 2% discount
        // deposit on each interval and see when capacity is breached (or if bond offering expires first)
});