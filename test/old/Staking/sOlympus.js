// const { ethers } = require("hardhat");
// const { solidity } = require("ethereum-waffle");
// const { expect } = require("chai");


// describe('Staking', () => {

//     let OLY, oly, sOLY, soly, Staking, staking, Treasury, treasury, owner, addr1, addr2, addr3, mockDAO, mockStakingDistr;

//     beforeEach(async () => {

//         [owner, addr1, addr2, addr3] = await ethers.getSigners();

//         OLY = await ethers.getContractFactory('TestToken1');
//         oly = await OLY.deploy();

//         Staking = await ethers.getContractFactory('DepositorProfitSharing');
//         staking = await Staking.deploy(oly.address);

//         Treasury = await ethers.getContractFactory('MockTreasury');
//         treasury = await Treasury.deploy();

//         await treasury.setStakingAndOLY(staking.address, oly.address);

//         await oly.mint(treasury.address, 9000000000000000);

//         sOLY = await ethers.getContractFactory('sOlympus');
//         soly = await sOLY.deploy('sOlympus', 'sOLY', staking.address);
    
//         await staking.setSOLY(soly.address);
//         await staking.setOwner(treasury.address)
//         await soly.setMonetaryPolicy(staking.address);

//         await oly.mint(addr1.address, 1000000000000000);
//         await oly.mint(addr2.address, 1000000000);
//         await oly.mint(addr3.address, 1000000000000000);
//         await oly.approve(staking.address, 1000000000000000);
//         await soly.approve(staking.address, 1000000000000000);
//         await oly.connect(addr1).approve(staking.address, 1000000000000000);
//         await oly.connect(addr2).approve(staking.address, 1000000000000000);
//         await oly.connect(addr3).approve(staking.address, 1000000000000000);

//     });

//     describe('setMonetaryPolicy()', () => {
//         it('should NOT let a non-owner address call', async () => {
//             await expect(soly.connect(addr1).setMonetaryPolicy(addr1.address)).to.be.revertedWith("caller is not the owner");
//         });
 
//         it('should let an owner address call', async () => {
//             await soly.setMonetaryPolicy(owner.address);
//         });
//     });

//     describe('rebase()', () => {
//         it('should NOT let a non monetaryPolicy address call a rebase', async () => {
//             await expect(soly.connect(owner).rebase(10000)).to.be.revertedWith("");
//         });

//         it('should monetaryPolicy address call a rebase', async () => {
//             await soly.setMonetaryPolicy(owner.address);
//             await soly.rebase(10000000);
//         });
//     });

//     describe('transfer()', () => {
//         it('should allow the staking contract to transfer sOLY', async () => {
//             await expect(await soly.balanceOf(owner.address)).to.equal(0);
//             await staking.stakeOLY(1000000000);
//             await expect(await soly.balanceOf(owner.address)).to.equal(1000000000);


//         });

//         it('should NOT allow users to transfer sOLY', async () => {
//             await expect(await soly.balanceOf(owner.address)).to.equal(0);
//             await staking.stakeOLY(1000000000);
//             await expect(await soly.balanceOf(owner.address)).to.equal(1000000000);

//             await expect(soly.transfer(addr1.address, 500000000)).to.be.revertedWith('transfer not from staking contract');

//         });
//     });

//     describe('transferFrom()', () => {
//         it('should allow transferFrom to be to staking ocontract', async () => {
//             await staking.stakeOLY(1000000000);

//             await soly.approve(owner.address, 500000000);

//             await soly.transferFrom(owner.address, staking.address, 500000000 );

//             await expect(await soly.balanceOf(owner.address)).to.equal(500000000);
//         });

//         it('should allow unstake to transfer sOLY back to staking', async () => {
//             await staking.stakeOLY(1000000000);

//             await staking.unstakeOLY(500000000);

//             await expect(await soly.balanceOf(owner.address)).to.equal(500000000);

//         });

//         it('should NOT allow transferFrom to be to a user address', async () => {
//             await staking.stakeOLY(1000000000);

//             await soly.approve(owner.address, 500000000);

//             await expect(soly.transferFrom(owner.address, addr1.address, 500000000 )).to.be.revertedWith('transfer from not to staking contract');

//             await expect(await soly.balanceOf(owner.address)).to.equal(1000000000);
//         });
//     });


// });