// const { ethers } = require("hardhat");
// const { solidity } = require("ethereum-waffle");
// const { expect } = require("chai");
// const { time } = require("@openzeppelin/test-helpers");

// describe('Staking', () => {

//     let OLY, oly, sOLY, soly, Staking, staking, Treasury, treasury, owner, addr1, addr2, addr3, mockDAO, mockStakingDistr;

//     beforeEach(async () => {

//         [owner, addr1, addr2, addr3] = await ethers.getSigners();

//         OLY = await ethers.getContractFactory('TestToken1');
//         oly = await OLY.deploy();

//     });
        
//     describe('stakeOLY()', () => {
//         it('should transfer sOLY from staking contract to staker when stake is made', async () => {
//             await staking.stakeOLY(1000000000);

//             expect(await soly.balanceOf(owner.address)).to.equal(1000000000);
//         });

//     });

// });