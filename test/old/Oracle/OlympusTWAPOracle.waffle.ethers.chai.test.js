// // const { utils } = require("ethers").utils;
// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");
// // const { waffle } = require("hardhat");
// // const { deployContract } = waffle;
// // const { expectRevert, time, BN } = require('@openzeppelin/test-helpers');
// // const { deployContract, loadFixture } = waffle;

// describe(
//   "PreOlympus",
//   function () {

//     // Wallets
//     let deployer;
//     let buyer1;
//     let buyer2;

//     // Contracts
//     let TestToken1Contract;
//     let tt1;
    
//     let TestToken2Contract;
//     let tt2;

//     beforeEach(
//       async function () {
//         [
//           deployer,
//           buyer1,
//           buyer2
//         ] = await ethers.getSigners();

//         TestToken1Contract = await ethers.getContractFactory("TestToken1");
//         //Add check for events
//         tt1 = await TestToken1Contract.connect( deployer ).deploy();
//         await tt1.deployed();

//         TestToken2Contract = await ethers.getContractFactory("TestToken2");
//         //Add check for events
//         tt2 = await TestToken2Contract.connect( deployer ).deploy();
//         await tt2.deployed();
//       }
//     );

//     describe(
//       "Deployment",
//       function () {
//         it( 
//           "Success", 
//           async function() {
//             console.log("Test::PreOlympus::Deployment::Success:01 token name.");
//             expect( await poly.name() ).to.equal("PreOlympus");

//             console.log("Test::PreOlympus::Deployment::Success:02 token symbol.");
//             expect( await poly.symbol() ).to.equal("pOLY");

//             console.log("Test::PreOlympus::Deployment::Success:03 token decimals.");
//             expect( await poly.decimals() ).to.equal(18);

//             console.log("Test::PreOlympus::Deployment::Success:04 owner.");
//             expect( await poly.owner() ).to.equal(deployer.address);
            
//             console.log("Test::PreOlympus::Deployment::Success:05 Confirm minting enabled.");
//             expect( await poly.connect( deployer ).allowMinting() ).to.equal( true );

//             console.log("Test::PreOlympus::Deployment::Success:06 Confirm seller approval enabled.");
//             expect( await poly.connect( deployer ).requireSellerApproval() ).to.equal( true );

//             console.log("Test::PreOlympus::Deployment::Success:07 owner is approvedSeller.");
//             expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Deployment::Success:08 poly is approvedSeller.");
//             expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Deployment::Success:09 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Deployment::Success:10 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//             console.log("Test::PreOlympus::Deployment::Success:11 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//             console.log("Test::PreOlympus::Deployment::Success:12 totalSupply.");
//             expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::PreOlympus::Deployment::Success:13 owner balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Deployment::Success:14 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Deployment::Success:15 buyer2 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
//           }
//         );
//       }
//     );

//     describe(
//       "PreOlympusTokenOwnership",
//       function () {
//         it( 
//           "Minting", 
//           async function() {
//           }
//         );
//       }
//     );

//   }
// );