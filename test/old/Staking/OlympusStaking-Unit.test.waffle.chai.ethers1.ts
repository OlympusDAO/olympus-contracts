
// const { ethers } = require("hardhat");
// const { solidity } = require("ethereum-waffle");
// const { expect } = require("chai");

// // @ts-ignore
// import { PERMIT_TYPEHASH, getPermitDigest, getDomainSeparator, sign } from './utils/signatures'

// type Contract = any

// describe('Staking', () => {

//     // this is the first account that buidler creates
//     // https://github.com/nomiclabs/buidler/blob/d399a60452f80a6e88d974b2b9205f4894a60d29/packages/buidler-core/src/internal/core/config/default-config.ts#L41
//     const ownerPrivateKey = Buffer.from('c5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122', 'hex')
//     const chainId = 31337 // buidlerevm chain id

//     let token: Contract
//     let name: string

//     let
//       // Used as default deployer for contracts, asks as owner of contracts.
//       deployer,
//       addr1,
//       Treasury,
//       treasury,
//       Staking,
//       staking,
//       OLY,
//       oly,
//       sOLY,
//       soly,
//       addr2,
//       addr3,
//       v, 
//       r, 
//       s

//     beforeEach(async () => {

//         [deployer, addr1, addr2, addr3] = await ethers.getSigners();

//         OLY = await ethers.getContractFactory('OlympusERC20TOken');
//         oly = await OLY.deploy();

//         Staking = await ethers.getContractFactory('OlympusStaking');
//         staking = await Staking.deploy();

//         Treasury = await ethers.getContractFactory('MockTreasury');
//         treasury = await Treasury.deploy();

//         await treasury.setStakingAndOLY(staking.address, oly.address);

//         await oly.mint(treasury.address, 9000000000000000);

//         sOLY = await ethers.getContractFactory('sOlympus');
//         soly = await sOLY.deploy();

//         await staking.initialize( oly.address, soly.address, treasury.address);
//         await staking.transferOwnership(treasury.address)
//         await soly.setMonetaryPolicy(staking.address);

//         await oly.mint(addr1.address, 1000000000000000);
//         await oly.mint(addr2.address, 1000000000);
//         await oly.mint(addr3.address, 1000000000000000);
//         await oly.approve(staking.address, 1000000000000000);
//         await soly.approve(staking.address, 1000000000000000);
//         await oly.connect(addr1).approve(staking.address, 1000000000000000);
//         await oly.connect(addr2).approve(staking.address, 1000000000000000);
//         await oly.connect(addr3).approve(staking.address, 1000000000000000);

//         // Create the approval request
//         const approve = {
//             owner: deployer,
//             spender: addr1,
//             value: 100,
//         }

//         // deadline as much as you want in the future
//         let deadline = 100000000000000;
    
//         // Get the user's nonce
//         const nonce = await token.nonces(deployer);
    
//         // Get the EIP712 digest
//         const digest = getPermitDigest(name, token.address, chainId, approve, nonce, deadline);

//         // Sign it
//         // NOTE: Using web3.eth.sign will hash the message internally again which
//         // we do not want, so we're manually signing here
//         let { v, r, s } = sign(digest, ownerPrivateKey);

//     });
        
//     describe('stakeOLY()', () => {
//         it('should transfer sOLY from staking contract to staker when stake is made', async () => {
//             await staking.stakeOLY(1000000000, 100000000000000,  v, r, s);

//             expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);
//         });

//         it('should not let a user stake more than they have', async () => {
//             await expect(staking.connect(addr2).stakeOLY(1000000001)).to.be.revertedWith("Not enough to stake");
//             expect(await soly.balanceOf(addr2.address)).to.equal(0);
//             expect(await oly.balanceOf(addr2.address)).to.equal(1000000000);
//         });

//         it('should not distribute profits after the first epoch', async () => {
//             await staking.stakeOLY(1000000000);

//             await treasury.sendOLYProfits(2000000000);
//             expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);
//         });

//         it('should distirbute profits correctly if someone stakes after epoch', async () => {
//             await staking.stakeOLY(1000000000);

//             await treasury.sendOLYProfits(2000000000);
//             await staking.connect(addr1).stakeOLY(3000000000);
//             expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);
//             expect(await soly.balanceOf(addr1.address)).to.equal(3000000000);

//             await treasury.sendOLYProfits(1000000000);

//             expect(await soly.balanceOf(deployer.address)).to.equal(1500000000);
//             expect(await soly.balanceOf(addr1.address)).to.equal(4500000000);
//         });

//         it('should transfer OLY from staker to staking contract when stake is made', async () => {
//             const balanceBefore = await oly.balanceOf(deployer.address);

//             await staking.stakeOLY(1000000000);

//             const balanceAfter = await oly.balanceOf(deployer.address);

//             expect(balanceAfter).to.equal(balanceBefore - 1000000000);
//         });

//         it('should add sOLY to circulating supply when stake is made', async () => {            
//             expect(await soly.circulatingSupply()).to.equal(0);

//             await staking.stakeOLY(1000000000);
//             expect(await soly.circulatingSupply()).to.equal(1000000000);
//         });

//         it('should rebase a single user correctly when profits are distributed', async () => {
//             await staking.stakeOLY(1000000000);

//             await treasury.sendOLYProfits(2000000000);
//             await treasury.sendOLYProfits(1000000000);
//             expect(await soly.balanceOf(deployer.address)).to.equal(3000000000);
//         });

//         it('should add circulating supply correctly when a rebase is made to distribute profits', async () => {
//             await staking.stakeOLY(1000000000);

//             await treasury.sendOLYProfits(2000000000);
//             await treasury.sendOLYProfits(1000000000);
//             expect(await soly.circulatingSupply()).to.equal(3000000000);
//         });

//         it('should rebase multiple users correctly when profits are distributed', async () => {
//             await staking.stakeOLY(1000000000);
//             await staking.connect(addr1).stakeOLY(2000000000);

//             await treasury.sendOLYProfits(3000000000);
//             await treasury.sendOLYProfits(1000000000);  
//             expect(await soly.balanceOf(deployer.address)).to.equal(2000000000);
//             expect(await soly.balanceOf(addr1.address)).to.equal(4000000000);
//         });

//         it('should add circualting supply correctly when multiple users are distributed profits', async () => {
//             await staking.stakeOLY(1000000000);
//             await staking.connect(addr1).stakeOLY(2000000000)

//             await treasury.sendOLYProfits(3000000000);
//             await treasury.sendOLYProfits(1000000000);
//             expect(await soly.circulatingSupply()).to.equal(6000000000);
//         });

//         it('should pass if there is profit and no staker', async () => {
//             const totalSupplyBefore = await soly.totalSupply();
//             await treasury.sendOLYProfits(3000000000);

//             const totalSupplyAfter1 = await soly.totalSupply();  
//             expect(totalSupplyBefore).to.equal(totalSupplyAfter1);

//             await treasury.sendOLYProfits(3000000000);

//             const totalSupplyAfter2 = await soly.totalSupply();  
//             expect(totalSupplyAfter2).to.equal(totalSupplyBefore.toNumber() + 3000000000);
//         });

//         it('should NOT add to circulating supply if there is profit and no stakers', async () => {
//             const circulatingSupplyBefore = await soly.circulatingSupply();
//             expect(circulatingSupplyBefore).to.equal(0);

//             await treasury.sendOLYProfits(3000000000);
//             const circulatingSupplyAfter1 = await soly.circulatingSupply(); 
//             expect(circulatingSupplyAfter1).to.equal(0);

//             await treasury.sendOLYProfits(3000000000);
//             const circulatingSupplyAfter2 = await soly.circulatingSupply(); 
//             expect(circulatingSupplyAfter2).to.equal(0);
//         });

//         it('should work properly if profit is over 10000000000000000', async () => {
//             await staking.stakeOLY("1000000000");
//             await treasury.sendOLYProfits("19000000000000000");
//             await treasury.sendOLYProfits("19000000000000000");

//             expect(await soly.balanceOf(deployer.address)).to.equal("19000001000000000");
//         });
    
//     });

//     // describe('unstakeOLY()', () => {
//     //     it('should transfer sOLY from unstaker to staking contract when user unstakes', async () => {
//     //         await staking.stakeOLY(1000000000);
//     //         expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);

//     //         await staking.unstakeOLY(500000000);
//     //         expect(await soly.balanceOf(deployer.address)).to.equal(500000000);

//     //         await staking.unstakeOLY(500000000);
//     //         expect(await soly.balanceOf(deployer.address)).to.equal(0);
//     //     });

//     //     it('should transfer OLY back to user when they unstake', async () => {
//     //         await staking.stakeOLY(1000000000);

//     //         const balanceAfter = await oly.balanceOf(deployer.address);

//     //         await staking.unstakeOLY(500000000);
//     //         expect(await oly.balanceOf(deployer.address)).to.equal(balanceAfter.toNumber() + 500000000);

//     //         await staking.unstakeOLY(500000000);
//     //         expect(await oly.balanceOf(deployer.address)).to.equal(balanceAfter.toNumber() + 1000000000);
//     //     });

//     //     it('should remove sOLY from circulating supply when unstake is made', async () => {            
//     //         expect(await soly.circulatingSupply()).to.equal(0);

//     //         await staking.stakeOLY(1000000000);
//     //         expect(await soly.circulatingSupply()).to.equal(1000000000);

//     //         await staking.unstakeOLY(500000000);
//     //         expect(await soly.circulatingSupply()).to.equal(500000000);

//     //         await staking.unstakeOLY(500000000);

//     //         expect(await soly.circulatingSupply()).to.equal(0);
//     //     });

//     //     it('shoud NOT let a user unstake more than they have', async () => {
//     //         await staking.stakeOLY(1000000000);
            
//     //         await expect(staking.unstakeOLY(1000000001)).to.be.revertedWith("Not enough to unstake");
//     //     });

//     // });

//     // describe('distributeOLYProfits()', () => {
//     //     it('should NOT let non owner distribute', async () => {
//     //         await expect(staking.distributeOLYProfits()).to.be.revertedWith("caller is not the owner");
//     //     });

//     // });


// });