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
//     let PreOlympusTokenContract;
//     let poly;

//     beforeEach(
//       async function () {
//         [
//           deployer,
//           buyer1,
//           buyer2
//         ] = await ethers.getSigners();

//         PreOlympusTokenContract = await ethers.getContractFactory("PreOlympusToken");
//         //Add check for events
//         poly = await PreOlympusTokenContract.connect( deployer ).deploy();
//         await poly.deployed();
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
            
//             console.log("Test::PreOlympusTokenOwnership::Minting:01 Confirm minting enabled.");
//             expect( await poly.connect( deployer ).allowMinting() )
//               .to.equal( true );

//             console.log("Test::PreOlympusTokenOwnership::Minting:02 buyer1 can't mint.");
//             await expect( poly.connect(buyer1).mint( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.be.revertedWith("Ownable: caller is not the owner");
            
//             console.log("Test::PreOlympusTokenOwnership::Minting:03 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympusTokenOwnership::Minting:04 only owner can mint.");
//             await expect( () => poly.connect(deployer).mint( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, deployer, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::PreOlympusTokenOwnership::Minting:05 totalSupply.");
//             expect( await poly.totalSupply() )
//               .to.equal( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) );

//             console.log("Test::PreOlympusTokenOwnership::Minting:06 owner balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) ) );

//             console.log("Test::PreOlympusTokenOwnership::Minting:07 Disable minting.");
//             await poly.connect( deployer ).disableMinting();
            
//             console.log("Test::PreOlympusTokenOwnership::Minting:08 Disabled minting.");
//             expect( await poly.connect( deployer ).allowMinting() ).to.equal( false );

//             console.log("Test::PreOlympusTokenOwnership::Minting:09 owner can't mint.");
//             await expect( poly.connect( deployer ).mint( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Minting has been disabled." );

//             console.log("Test::PreOlympusTokenOwnership::Minting:10 totalSupply.");
//             expect( await poly.totalSupply() )
//               .to.equal( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) );

//             console.log("Test::PreOlympusTokenOwnership::Minting:11 owner balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 2000000000 ), "ether" ) ) );

//             console.log("Test::PreOlympusTokenOwnership::Minting:12 buyer1 can't mint.");
//             await expect( poly.connect(buyer1).mint(ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Ownable: caller is not the owner" );
            
//             console.log("Test::PreOlympusTokenOwnership::Minting:13 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
//           }
//         );
//       }
//     );

//     describe(
//       "Ownership",
//       function () {

//         it( 
//           "OwnerTransfer", 
//           async function() {

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:01 owner is approvedSeller.");
//             expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:02 poly is approvedSeller.");
//             expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:03 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:04 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:05 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:06 totalSupply.");
//             expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:07 owner balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:08 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:09 buyer2 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:10 Confirm seller approval required.");
//             expect( await poly.requireSellerApproval() ).to.equal( true );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:11 Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//             await expect( poly.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:12 Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//             await expect( poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:13 Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//             await expect( poly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:14 Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//             await expect( poly.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:15 Confirming deployer can transfer to buyer1.");
//             await expect( () => poly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:16 Confirming deployer can transfer to buyer1.");
//             await expect( () => poly.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:17 deployer balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:18 buyer1 balanceOf.");
//             expect( await poly.connect(buyer1).balanceOf(buyer1.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OwnerTransfer:19 buyer2 balanceOf.");
//             expect( await poly.connect(buyer2).balanceOf(buyer2.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );
//           }
//         );

//         it( 
//           "ApprovedSellerTransfer", 
//           async function() {

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:01 owner is approvedSeller.");
//             expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:02 poly is approvedSeller.");
//             expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:03 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:04 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:05 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:06 totalSupply.");
//             expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:07 owner balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:08 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:09 buyer2 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:10 Approve buyer1 to sell.");
//             expect( await poly.connect(deployer).addApprovedSeller(buyer1.address) );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:11 Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//             await expect( poly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:12 Confirming deployer can transfer to buyer1.");
//             await expect( () => poly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//               console.log("Test::PreOlympus::Ownership::ApprovedSellerTransfer:13 Confirming deployer can transfer to buyer1.");
//             await expect( () => poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
//           }
//         );

//         it( 
//           "OpenTransfer", 
//           async function() {

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:01 owner is approvedSeller.");
//             expect( await poly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:02 poly is approvedSeller.");
//             expect( await poly.isApprovedSeller(poly.address) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:03 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:04 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:05 address(0) is approvedSeller.");
//             expect( await poly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:06 totalSupply.");
//             expect( await poly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:07 owner balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:08 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:09 buyer2 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:10 Confirm seller approval required.");
//             expect( await poly.requireSellerApproval() ).to.equal( true );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:11 Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//             await expect( poly.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:12 Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//             await expect( poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:13 Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//             await expect( poly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:14 Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//             await expect( poly.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.be.revertedWith( "Account not approved to transfer pOLY." );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:15 Confirming deployer can transfer to buyer1.");
//             await expect( () => poly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:16 Confirming deployer can transfer to buyer1.");
//             await expect( () => poly.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//               .to.changeTokenBalance( poly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:17 deployer balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(deployer.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:18 buyer1 balanceOf.");
//             expect( await poly.connect(buyer1).balanceOf(buyer1.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:19 buyer2 balanceOf.");
//             expect( await poly.connect(buyer2).balanceOf(buyer2.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:20 Enable open trading of pOLY.");
//             await poly.connect( deployer ).allowOpenTrading();

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:21 Confirm seller approval required.");
//             expect( await poly.requireSellerApproval() ).to.equal( false );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:22 only owner can mint.");

//             expect( await poly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );
            
//             console.log("Test::PreOlympus::Ownership::OpenTransfer:23 buyer1 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::PreOlympus::Ownership::OpenTransfer:24 buyer2 balanceOf.");
//             expect( await poly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
//           }
//         );
//       }
//     );
//   }
// );