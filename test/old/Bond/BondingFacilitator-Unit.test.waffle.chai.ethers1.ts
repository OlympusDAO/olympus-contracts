
// const { ethers } = require("hardhat");
// const { solidity } = require("ethereum-waffle");
// const { expect } = require("chai");

// describe('BondingFacilitator', () => {


//     let
//       // Used as default deployer for contracts, asks as owner of contracts.
//       deployer,
//       addr1,
//       Treasury,
//       treasury,
//       BondingFacilitator,
//       bondingFacilitator,
//       BondingCalcContract,
//       bondingCalcContract,
//       MockPair,
//       mockPair,
//       MockBonding,
//       mockBonding,
//       OLY,
//       oly,
//       DAI,
//       dai

//     beforeEach(async () => {

//         [deployer, addr1] = await ethers.getSigners();

//         OLY = await ethers.getContractFactory('OlympusERC20TOken');
//         oly = await OLY.deploy();

//         MockBonding = await ethers.getContractFactory('MockBonding');
//         mockBonding = await MockBonding.deploy();

//         MockPair = await ethers.getContractFactory('TestToken1');
//         mockPair = await MockPair.deploy();

//         BondingCalcContract = await ethers.getContractFactory('OlympusBondingCalculator');
//         bondingCalcContract = await BondingCalcContract.deploy();

//         Treasury = await ethers.getContractFactory('MockTreasury');
//         treasury = await Treasury.deploy();

//         BondingFacilitator = await ethers.getContractFactory('BondingFacilitator');
//         bondingFacilitator = await BondingFacilitator.deploy();

//         await mockBonding.initialize(bondingFacilitator.address);
//         await bondingFacilitator.initialize(bondingCalcContract.address, oly.address, mockBonding.address, treasury.address);

//         await mockPair.approve(mockBonding.address, '10000000000000000');
//         await mockPair.connect(addr1).approve(mockBonding.address, '10000000000000000');

//         await oly.transferOwnership(bondingFacilitator.address);

//     });

//     describe('transferLPsToTreasury()', () => {
//       it('should transfe LPs to treasury', async () => {
//         expect(await mockPair.balanceOf(treasury.address)).to.equal(0);
        
//         await mockBonding.depositLPs('1000000', mockPair.address, '1000');
//         expect(await mockPair.balanceOf(treasury.address)).to.equal('1000000');
//       });

//       it('should update the user\'s LP balance after transfer', async () => {
//         let balanceBefore = await mockPair.balanceOf(deployer.address);
//         await mockBonding.depositLPs('1000000', mockPair.address, '1000');
//         let balanceAfter = await mockPair.balanceOf(deployer.address);

//         expect(balanceAfter.toString()).to.equal((balanceBefore - 1000000).toString());
//       });

//       it('should mint interest to the proper accounts', async () => {
//         await mockPair.transfer(addr1.address, '10000000000000000');
//         expect(await oly.balanceOf(addr1.address)).to.equal('0');

//         await mockBonding.connect(addr1).depositLPs('1000000', mockPair.address, '1000');
//         expect(await oly.balanceOf(addr1.address)).to.equal('1000');
//       });

//       it('should add to the total supply when interest gets minted', async () => {
//         let totalSupplyBefore = await oly.totalSupply();
//         await mockBonding.depositLPs('1000000', mockPair.address, '1000');
//         let totalSupplyAfter = await oly.totalSupply();

//         expect(totalSupplyAfter).to.equal(totalSupplyBefore.toNumber() + 1000);
//       });

//       it('should NOT let a user directly call transferLPsToTreasury', async () => {
//         //await mockPair.approve(bondingFacilitator.address, '10000000000000000');
//         //await bondingFacilitator.transferLPsToTreasury(deployer.address, mockPair.addresss, '1000', '100000' );
//         //await expect(bondingFacilitator.transferLPsToTreasury(deployer.address, mockPair.addresss, '1000', '100000' )).to.be.revertedWith("Not bonding contract");
//       });

//       it('should add principle valuation', async () => {
//         await mockBonding.depositLPs('55000000', mockPair.address, '1000');
//       });
//     });

// });