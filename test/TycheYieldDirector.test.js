const { ethers, waffle } = require("hardhat")
const chai = require("chai");
const { FakeContract, smock } = require("@defi-wonderland/smock");

const { provider, deployContract } = waffle;
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

    //await hre.network.provider.request({
    //  method: "hardhat_impersonateAccount",
    //  params: ["0x763a641383007870ae96067818f1649e5586f6de"],
    //});


    let
        // Used as default deployer for contracts, asks as owner of contracts.
        deployer,
        user,
        admin,
        addr3,
        alice,
        bob,
        carol
        //ohmFactory,
        //ohm,
        //sOhmFactory,
        //sOhm,
        //stakingFactory,
        //staking,
        //stakingHelperFactory,
        //stakingHelper,
        //treasuryFactory,
        //treasury,
        //distributorFactory,
        //distributor

    before(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();
        
        //owner = await ethers.getSigner("0x763a641383007870ae96067818f1649e5586f6de")

        erc20Factory = await ethers.getContractFactory('MockERC20');

        stakingFactory = await ethers.getContractFactory('OlympusStaking');
        ohmFactory = await ethers.getContractFactory('OlympusERC20Token');
        sOhmFactory = await ethers.getContractFactory('sOlympus');
        stakingHelperFactory = await ethers.getContractFactory('StakingHelper');
        warmupFactory = await ethers.getContractFactory('StakingWarmup');
        treasuryFactory = await ethers.getContractFactory('OlympusTreasury');
        distributorFactory = await ethers.getContractFactory('Distributor');
        tycheFactory = await ethers.getContractFactory('TycheYieldDirector');

    })

    beforeEach(async function() {
        mockDai = await smock.fake(erc20Factory);
        mockLp = await smock.fake(erc20Factory);

        ohm = await ohmFactory.deploy();
        //ohm = await ohmFactory.attach("0x383518188C0C6d7730D91b2c03a03C837814a899");
        //await ohm.transferOwnership(deployer);

        sOhm = await sOhmFactory.deploy();
        staking = await stakingFactory.deploy(ohm.address, sOhm.address, "2200", "0", "1");
        stakingHelper = await stakingHelperFactory.deploy(staking.address, ohm.address);
        treasury = await treasuryFactory.deploy(
          ohm.address,
          mockDai.address,
          mockLp.address,
          "1"
        );
        distributor = await distributorFactory.deploy(treasury.address, ohm.address, "2200", "1");
        warmup = warmupFactory.deploy();
        tyche = await tycheFactory.deploy(ohm.address, sOhm.address);

        // Setup for each component
        ohm.setVault(deployer.address)
        sOhm.initialize(staking.address);

        // Set distributor, warmup, and locker for staking contract
        //staking.setContract("0", distributor.address);
        staking.setContract("1", warmup.address);
    });

    it('should set token addresses correctly', async () => {
        await tyche.deployed();

        expect(await tyche.OHM()).to.equal(ohm.address);
        expect(await tyche.sOHM()).to.equal(sOhm.address);
    });

    it('should deposit tokens to recipient correctly', async () => {
        await ohm.mint(deployer.address, "1000");
        expect(await ohm.balanceOf(deployer.address)).to.equal(1000);

        await ohm.approve(stakingHelper.address, "2000");

        await stakingHelper.stake("1000");

        //await tyche.deposit("10", bob.address);

        //await expect(tyche.donationInfo[alice.address][0].recipient).is.equal(bob.address);
    });
 
});
