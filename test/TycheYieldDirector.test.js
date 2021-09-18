const { ethers } = require("hardhat")
const chai = require("chai");
const solidity = require("ethereum-waffle");

chai.use(solidity);
const { expect } = chai;

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

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x763a641383007870ae96067818f1649e5586f6de"],
    });


    let
      // Used as default deployer for contracts, asks as owner of contracts.
      deployer,
      user,
      admin,
      addr3,
      owner,
      ohmFactory,
      ohm,
      treasuryFactory,
      treasury,
      distributorFactory,
      distributor

    before(async () => {
        [deployer, user, admin, addr3] = await ethers.getSigners();
        //signers = await ethers.getSigners();
        //deployer = accounts[0];
        //user = accounts[1];
        //admin = accounts[2];
        //addr3 = accounts[3];
        
        owner = await ethers.getSigner("0x763a641383007870ae96067818f1649e5586f6de")


        stakingFactory = await ethers.getContractFactory('OlympusStaking');
        ohmFactory = await ethers.getContractFactory('OlympusERC20Token');
        sohmFactory = await ethers.getContractFactory('sOlympus');
        treasuryFactory = await ethers.getContractFactory('OlympusTreasury');
        distributorFactory = await ethers.getContractFactory('Distributor');
        tycheFactory = await ethers.getContractFactory('TycheYieldDirector');

    })

    beforeEach(async function() {
        ohm = await ohmFactory.deploy();
        //ohm = await ohmFactory.attach("0x383518188C0C6d7730D91b2c03a03C837814a899");
        //await ohm.transferOwnership(deployer);

        sohm = await sohmFactory.deploy();
        staking = await stakingFactory.deploy(ohm.address, sohm.address, "2200", "0", "1");
        treasury = await treasuryFactory.deploy(
          ohm.address,
          "0x6b175474e89094c44da98b954eedeac495271d0f",
          "0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c",
          "1"
        );
        distributor = await distributorFactory.deploy(treasury.address, ohm.address, "2200", "1");
        tyche = await tycheFactory.deploy(ohm.address, sohm.address);

        sohm.initialize(staking.address);
    });

    describe('constructor()', () => {
        it('should set initial owner address correctly', async () => {
            expect(await customBond.policy()).to.equal(admin.address);
        });
    });

    describe('something()', () => {
        it('should do something', async () => {

        });
        
    });

 
});
