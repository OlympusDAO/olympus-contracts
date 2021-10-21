// const { ethers } = require("hardhat");
// const { solidity } = require("ethereum-waffle");
// const { expect } = require("chai");
// const {advanceBlock, latestBlock} = require("./utils");
// const UniswapV2Pair = require("../../artifacts/contracts/dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/core/UniswapV2Pair.sol/UniswapV2Pair.json")


// describe('OlympusBondingCalculator', 
//     () => {

//     let
//       // Used as default deployer for contracts, asks as owner of contracts.
//     deployer,
//     // Used as the default user for deposits and trade. Intended to be the default regular user.
//     depositor,
//     TestToken1Contract,
//     tt1,
//     TestToken2Contract,
//     tt2,
//     UniswapV2FactoryContract,
//     uniFactory,
//     pairAddress,
//     pair,
//     OlyUniV2CompatiableLPTokenBonding,
//     olyUniV2CompatiableLPTokenBonding,
//     OlympusBondingCalculator,
//     olympusBondingCalculator


//     beforeEach(
//       async function() {
//         [
//           deployer,
//           depositor
//         ] = await ethers.getSigners();

//         TestToken1Contract = await ethers.getContractFactory('TestToken1Old');
//         tt1 = await TestToken1Contract.deploy();

//         TestToken2Contract = await ethers.getContractFactory('TestToken2Old');
//         tt2 = await TestToken2Contract.deploy();

//         UniswapV2FactoryContract = await ethers.getContractFactory('UniswapV2Factory');
//         uniFactory = await UniswapV2FactoryContract.deploy( deployer.address );

//         OlympusTreasury = await ethers.getContractFactory('OlympusTreasury');
//         olympusTreasury = await OlympusTreasury.deploy();

//         OlympusBondingCalculator = await ethers.getContractFactory('OlympusBondingCalculator');
//         olympusBondingCalculator = await OlympusBondingCalculator.deploy();

//         OlyUniV2CompatiableLPTokenBonding = await ethers.getContractFactory('OlyUniV2CompatiableLPTokenBonding');
//         olyUniV2CompatiableLPTokenBonding = await OlyUniV2CompatiableLPTokenBonding.deploy();

//         await uniFactory.createPair( tt1.address, tt2.address );
//         pairAddress = await uniFactory.getPair(tt1.address, tt2.address);

//         pair = await ethers.getContractAt( UniswapV2Pair.abi, pairAddress );

//         await tt1.transfer( pair.address, ethers.utils.parseUnits( String( 10000 ) ) );
//         await tt2.transfer( pair.address, ethers.utils.parseUnits( String( 5000 ) ) );
//         await pair.mint( deployer.address );

//         await olympusTreasury.setOlmypusTokenAddress(tt1.address);
//         await olympusTreasury.setBondingContractAddress(olyUniV2CompatiableLPTokenBonding.address);
//         await olympusTreasury.setBondingCalcContract(olympusBondingCalculator.address);
//     })
      
        
//     describe(
//       'Deployment', 
//       () => {
//         it(
//           'should revert if call is not from owner',
//           async () => {
//             await expect(olyUniV2CompatiableLPTokenBonding.connect(depositor).initialize(tt1.address,olympusTreasury.address))
//             .to.be.revertedWith( "Ownable: caller is not the owner" );
//           }
//         );

//         it(
//             'should pass if call is from owner',
//             async () => {
//                 await olyUniV2CompatiableLPTokenBonding.initialize(tt1.address,olympusTreasury.address);
//                 expect( await olyUniV2CompatiableLPTokenBonding.initialized()).to.equal(true);
//             }
//         );

//         it(
//             'should revert if function is already initialized from owner',
//             async () => {
//                 await olyUniV2CompatiableLPTokenBonding.initialize(tt1.address,olympusTreasury.address);
//                 await expect(olyUniV2CompatiableLPTokenBonding.initialize(tt1.address,olympusTreasury.address))
//                 .to.be.revertedWith( "already initialized");
//             }
//         );
//       }
//     );

//     describe(
//         'addBondTerm', 
//         () => {
//             let bondingPeriodInBlocks_, bondSaclingFactor_;
//             beforeEach(
//                 async function() {
//                     bondingPeriodInBlocks_ = 10;
//                     bondSaclingFactor_ = 1;
//                     await olyUniV2CompatiableLPTokenBonding.initialize(tt1.address,olympusTreasury.address);
//                 }
//             );

//             it(
//                 'should revert if call is not from owner',
//                 async () => {
//                     await expect(olyUniV2CompatiableLPTokenBonding.connect(depositor).addBondTerm(
//                         pair.address,bondSaclingFactor_,bondingPeriodInBlocks_,olympusBondingCalculator.address))
//                     .to.be.revertedWith( "Ownable: caller is not the owner" );
//                 }
//             );

//             it(
//                 'should pass if call is from owner',
//                 async () => {
//                     await olyUniV2CompatiableLPTokenBonding.addBondTerm(
//                         pair.address,bondSaclingFactor_,bondingPeriodInBlocks_,olympusBondingCalculator.address
//                     )

//                     let bondScalingFactor;
//                     let bondingPeriodInBlocks;

//                     await olyUniV2CompatiableLPTokenBonding.uniV2CompatPairForBondingTerm(pair.address)
//                     .then(result => {
//                         bondScalingFactor =  Number(BigInt(result.bondScalingFactor));
//                         bondingPeriodInBlocks = Number(BigInt(result.bondingPeriodInBlocks));
//                     })
                    
//                     expect(await olyUniV2CompatiableLPTokenBonding.isPrincipleAccepted(pair.address)).to.be.equal(true);
//                     expect(await olyUniV2CompatiableLPTokenBonding.principleValuationCalculator(pair.address)).to.be.equal(olympusBondingCalculator.address);
//                     expect(await bondScalingFactor).to.be.equal(bondSaclingFactor_);
//                     expect(await bondingPeriodInBlocks).to.be.equal(bondingPeriodInBlocks_);
//                 }
//             );
//         }
//     )

//     describe(
//         'removeBondTerm', 
//         () => {
//             beforeEach(
//                 async function() {
//                     const bondingPeriodInBlocks_ = 10;
//                     const bondSaclingFactor_ = 1;
//                     await olyUniV2CompatiableLPTokenBonding.addBondTerm(
//                         pair.address,bondSaclingFactor_,bondingPeriodInBlocks_,olympusBondingCalculator.address
//                     )
//                 }
//             );

//             it(
//                 'should revert if call is not from owner',
//                 async () => {
//                     await expect(olyUniV2CompatiableLPTokenBonding.connect(depositor).removeBondTerm(pair.address))
//                     .to.be.revertedWith( "Ownable: caller is not the owner" );
//                 }
//             );

//             it(
//                 'should pass if call is from owner',
//                 async () => {
//                     await olyUniV2CompatiableLPTokenBonding.removeBondTerm(pair.address);
//                     expect(await olyUniV2CompatiableLPTokenBonding.isPrincipleAccepted(pair.address)).to.be.equal(false);
//                 }
//             );
//         }
//     )

//     describe(
//         'depositBondPrinciple', 
//         () => {
//             let amountToDeposit_, bondingPeriodInBlocks_;
//             beforeEach(
//                 async function() {
//                     bondingPeriodInBlocks_ = 10;
//                     const bondSaclingFactor_ = 1;

//                     amountToDeposit_ = ethers.utils.parseUnits( String( 100 ) );
//                     await olyUniV2CompatiableLPTokenBonding.initialize(pair.address,olympusTreasury.address);
//                     await olyUniV2CompatiableLPTokenBonding.addBondTerm(
//                         pair.address,bondSaclingFactor_,bondingPeriodInBlocks_,olympusBondingCalculator.address
//                     )

//                     await tt1.mint( depositor.address, ethers.utils.parseUnits( String( 5000 ) ) );
//                     await tt2.mint( depositor.address, ethers.utils.parseUnits( String( 5000 ) ) );

//                     await tt1.connect(depositor).transfer( pair.address, ethers.utils.parseUnits( String( 5000 ) ) );
//                     await tt2.connect(depositor).transfer( pair.address, ethers.utils.parseUnits( String( 5000 ) ) );

//                     await pair.mint( depositor.address );
//                     await pair.connect(depositor).approve(olyUniV2CompatiableLPTokenBonding.address,amountToDeposit_);
//                 }
//             );

//             it(
//                 'should revert if Bond Principle does not exist',
//                 async () => {
//                     await expect(olyUniV2CompatiableLPTokenBonding.connect(depositor).depositBondPrinciple(tt1.address,amountToDeposit_))
//                     .to.be.revertedWith( 'Principle bond does not exist');
//                 }
//             );

//             it(
//                 'should pass if Bond Principle exist',
//                 async () => {
//                     const userInitialBal = Number(BigInt(await pair.balanceOf(depositor.address)));
//                     const userBalAfterDeposit = userInitialBal - amountToDeposit_;
//                     const contractBalBefore = BigInt(await pair.balanceOf(olyUniV2CompatiableLPTokenBonding.address)).toString();
//                     await olyUniV2CompatiableLPTokenBonding.connect(depositor).depositBondPrinciple(pair.address, amountToDeposit_);

//                     const userBalAfterD = Number(BigInt(await pair.balanceOf(depositor.address)));

//                     let principleAmount;
//                     let interestDue;
//                     let bondingPeriodInBlocks;
                    
//                     await olyUniV2CompatiableLPTokenBonding.depositorAddressForPrincipleForDepositInfo(depositor.address,pair.address)
//                     .then(result => {
//                         principleAmount =  BigInt(result.principleAmount).toString();
//                         interestDue = Number(BigInt(result.interestDue))
//                         bondingPeriodInBlocks =  Number(BigInt(result.bondMaturationBlock));
//                     })
                    
//                     const interest  = Number(BigInt(await olympusBondingCalculator.principleValuation(pair.address,amountToDeposit_)));
//                     const blockNumber =  Number(BigInt(await latestBlock())) + bondingPeriodInBlocks_;
//                     const contractBalAfter = BigInt(await pair.balanceOf(olyUniV2CompatiableLPTokenBonding.address)).toString();

//                     expect(interestDue).to.be.equal(interest);
//                     expect(contractBalBefore).to.be.equal('0');
//                     expect(principleAmount).to.be.equal(amountToDeposit_);
//                     expect(contractBalAfter).to.be.equal(amountToDeposit_);
//                     expect(userBalAfterD).to.be.equal(userBalAfterDeposit);
//                     expect(bondingPeriodInBlocks).to.be.equal(blockNumber);

//                 }
//             );
//         }
//     );

//     describe(
//         'withdrawPrincipleAndForfeitInterest', 
//         () => {
//             it(
//                 'should revert if user has no principle amount to withdraw',
//                 async () => {
                    
//                     await expect(olyUniV2CompatiableLPTokenBonding.connect(depositor).withdrawPrincipleAndForfeitInterest(pair.address))
//                     .to.be.revertedWith( 'user has no principle amount to withdraw' );
//                 }
//             );

//             it(
//                 'should pass if user has principle amount to withdraw',
//                 async () => {
//                     const bondingPeriodInBlocks_ = 10;
//                     const bondSaclingFactor_ = 1;
//                     const amountToDeposit_ = ethers.utils.parseUnits( String( 100 ) );
//                     const userInitialBal = Number(BigInt(await pair.balanceOf(deployer.address)));
                    
//                     await olyUniV2CompatiableLPTokenBonding.addBondTerm(
//                         pair.address,bondSaclingFactor_,bondingPeriodInBlocks_,olympusBondingCalculator.address
//                     )
//                     await pair.approve(olyUniV2CompatiableLPTokenBonding.address,amountToDeposit_);
//                     await olyUniV2CompatiableLPTokenBonding.depositBondPrinciple(pair.address, amountToDeposit_);

//                     const contractBalBefore = BigInt(await pair.balanceOf(olyUniV2CompatiableLPTokenBonding.address)).toString();
//                     const userBalBeforeWithdraw = Number(BigInt(await pair.balanceOf(deployer.address)));

//                     let principleAmountBeforeWithdraw;
                    
//                     await olyUniV2CompatiableLPTokenBonding.depositorAddressForPrincipleForDepositInfo(deployer.address,pair.address)
//                     .then(result => {
//                         principleAmountBeforeWithdraw =  BigInt(result.principleAmount).toString();
//                     })

//                     await olyUniV2CompatiableLPTokenBonding.withdrawPrincipleAndForfeitInterest(pair.address);

//                     let principleAmountAfterWithdraw;
                    
//                     await olyUniV2CompatiableLPTokenBonding.depositorAddressForPrincipleForDepositInfo(depositor.address,pair.address)
//                     .then(result => {
//                         principleAmountAfterWithdraw =  BigInt(result.principleAmount).toString();
//                     })
                    
//                     const contractBalAfter = BigInt(await pair.balanceOf(olyUniV2CompatiableLPTokenBonding.address)).toString();
//                     const userBalAfterWithdraw = Number(BigInt(await pair.balanceOf(deployer.address)));

//                     const balAfterDeposit = userInitialBal - amountToDeposit_;
//                     const balAfterWithdraw = userBalBeforeWithdraw + Number(amountToDeposit_);

//                     expect(contractBalAfter).to.be.equal('0');
//                     expect(principleAmountAfterWithdraw).to.be.equal('0');
//                     expect(contractBalBefore).to.be.equal(amountToDeposit_);
//                     expect(userBalBeforeWithdraw).to.be.equal(balAfterDeposit);
//                     expect(userBalAfterWithdraw).to.be.equal(balAfterWithdraw);
//                     expect(principleAmountBeforeWithdraw).to.be.equal(amountToDeposit_);
//                 }
//             );
//         }
//     )

//     describe(
//         'redeemBond', 
//         () => {
//             let amountToDeposit_, bondingPeriodInBlocks_;
//             beforeEach(
//                 async function() {
//                     bondingPeriodInBlocks_ = 10;
//                     const bondSaclingFactor_ = 1;

//                     amountToDeposit_ = ethers.utils.parseUnits( String( 100 ) );
//                     await olyUniV2CompatiableLPTokenBonding.initialize(pair.address,olympusTreasury.address);

//                     await olyUniV2CompatiableLPTokenBonding.addBondTerm(
//                         pair.address,bondSaclingFactor_,bondingPeriodInBlocks_,olympusBondingCalculator.address
//                     )

//                     await pair.approve(olyUniV2CompatiableLPTokenBonding.address,amountToDeposit_);
//                 }
//             );

//             it(
//                 'should revert Message Sender is not due any interest',
//                 async () => {
//                     await olyUniV2CompatiableLPTokenBonding.depositBondPrinciple(pair.address, amountToDeposit_);
//                     await expect(olyUniV2CompatiableLPTokenBonding.connect(depositor).redeemBond(pair.address))
//                     .to.be.revertedWith( "OlyUniV2CompatiableLPTokenBonding: Message Sender is not due any interest." );
//                 }
//             );

//             it(
//                 'should revert if user Bond has not matured',
//                 async () => {
//                     await olyUniV2CompatiableLPTokenBonding.depositBondPrinciple(pair.address, amountToDeposit_);
//                     await expect(olyUniV2CompatiableLPTokenBonding.redeemBond(pair.address))
//                     .to.be.revertedWith( "OlyUniV2CompatiableLPTokenBonding: Bond has not matured." );
//                 }
//             );

//             it(
//                 'should pass if call is from owner',
//                 async () => {
//                     await olyUniV2CompatiableLPTokenBonding.depositBondPrinciple(pair.address, amountToDeposit_);

//                     const contractBalAfterDeposit = BigInt(await pair.balanceOf(olyUniV2CompatiableLPTokenBonding.address)).toString();
//                     let interestDueBeforeRedeem;

//                     await olyUniV2CompatiableLPTokenBonding.depositorAddressForPrincipleForDepositInfo(deployer.address,pair.address)
//                     .then(result => {
//                         interestDueBeforeRedeem = Number(BigInt(result.interestDue))
//                     })

//                     const interest  = Number(BigInt(await olympusBondingCalculator.principleValuation(pair.address,amountToDeposit_)));

//                     const userTokenBalanceBeforeRedeem = BigInt(await tt1.balanceOf(deployer.address)).toString();
//                     const userTokenBalanceBeforeRedeemInNumber = Number(BigInt(await tt1.balanceOf(deployer.address)));

//                     const loop = bondingPeriodInBlocks_

//                     for(let i = 0; i < loop; i++){
//                         await advanceBlock()
//                     }
                    
//                     const treasuryContractBalBeforeUserRedeem = BigInt(await pair.balanceOf(olympusTreasury.address)).toString();
//                     await olyUniV2CompatiableLPTokenBonding.redeemBond(pair.address);
//                     const contractBalAfterUserRedeem = BigInt(await pair.balanceOf(olyUniV2CompatiableLPTokenBonding.address)).toString();
//                     const treasuryContractBalAfterUserRedeem = BigInt(await pair.balanceOf(olympusTreasury.address)).toString();

//                     let interestDueAfterRedeem;

//                     await olyUniV2CompatiableLPTokenBonding.depositorAddressForPrincipleForDepositInfo(deployer.address,pair.address)
//                     .then(result => {
//                         interestDueAfterRedeem = Number(BigInt(result.interestDue))
//                     })

//                     const userTokenBalanceAfterRedeem = Number(BigInt(await tt1.balanceOf(deployer.address)));
//                     const userTokenToGet = userTokenBalanceBeforeRedeemInNumber + interestDueBeforeRedeem;

//                     expect(interestDueAfterRedeem).to.equal(0);
//                     expect(contractBalAfterUserRedeem).to.equal('0');
//                     expect(contractBalAfterUserRedeem).to.equal('0');
//                     expect(interestDueBeforeRedeem).to.equal(interest);
//                     expect(treasuryContractBalBeforeUserRedeem).to.equal('0');
//                     expect(contractBalAfterDeposit).to.equal(amountToDeposit_);
//                     expect(userTokenBalanceAfterRedeem).to.equal(userTokenToGet);
//                     expect(treasuryContractBalAfterUserRedeem).to.equal(amountToDeposit_);
//                     expect(userTokenBalanceBeforeRedeem).to.equal('2000000000000000000000');

//                 }
//             );
//         }
//     )
// });
