// const { ethers } = require("hardhat");
// const { solidity } = require("ethereum-waffle");
// const { expect } = require("chai");
// const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");


// describe('Staking', () => {

//     let Oracle, oracle, Token0, token0, Token1, token1, MockPair, mockPair, HOURS8;

//     before(async () => {
//         HOURS8 = 28800;
//     });

//     beforeEach(async () => {

//         [owner, addr1, addr2, addr3] = await ethers.getSigners();

//         Token0 = await ethers.getContractFactory('TestToken1');
//         token0 = await Token0.deploy();

//         Token1 = await ethers.getContractFactory('TestToken2');
//         token1 = await Token1.deploy();

//         MockPair = await ethers.getContractFactory('MockPair');
//         mockPair = await MockPair.deploy(token0.address, token1.address);

//         Oracle = await ethers.getContractFactory('UniV2CompatiableTWAPOracle');
//         oracle = await Oracle.deploy();

//         await mockPair.setVars(1000000000, 1000000000, 5000000000, 5000000000);

//     });

//     describe('getTwap()', () => {

//     });

//     describe('getPreviousEpochTWAP()', () => {
//         it('should get previous epoch TWAP', async () => {
//             //console.log(await oracle.getPreviousEpochTWAP(token0.address, token1.addres, 1));
//             //expect(await oracle.getPreviousEpochTWAP(token0.address, token1.addres, 1)).to.equal(0);
//         });
//     });

//     describe('getTWAPRange()', () => {

//     });

//     describe('updateTwap()', () => {
//         it('should updateTWAP', async () => {
//             await oracle.updateTWAP(mockPair.address, HOURS8);
//             await mockPair.add8Hours();
//             await mockPair.add8Hours();
//             await oracle.updateTWAP(mockPair.address, HOURS8);
//             await mockPair.setVars(20000000000, 20000000000, 6000000000, 6000000000);
//             await mockPair.add8Hours();
//             await mockPair.add8Hours();
//             await oracle.updateTWAP(mockPair.address, HOURS8);
//             await mockPair.add8Hours();

//             let TWAP = await oracle.getTWAP(token0.address, token1.address, HOURS8);
//             console.log(TWAP.toString());


//         });
//     });



    



// });