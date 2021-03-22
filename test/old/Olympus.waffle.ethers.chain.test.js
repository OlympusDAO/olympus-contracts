// // const { utils } = require("ethers").utils;
// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");
// // const { waffle } = require("hardhat");
// // const { deployContract } = waffle;
// // const { expectRevert, time, BN } = require('@openzeppelin/test-helpers');
// // const { deployContract, loadFixture } = waffle;

// describe(
//   "OlympusERC20TOken",
//   function () {

//     // Wallets
//     let deployer;
//     let buyer1;
//     let buyer2;

//     let DAITokenContract;
//     let dai;

//     // Contracts
//     let OlympusERC20TOkenContract;
//     let oly;

//     beforeEach(
//       async function () {
//         [
//           deployer,
//           buyer1,
//           buyer2
//         ] = await ethers.getSigners();

//         console.log( "Test::OlympusERC20TOken::beforeEach:01 Loading DAI." );
//         DAITokenContract = await ethers.getContractFactory("DAI");
        
//         console.log( "Test::OlympusERC20TOken::beforeEach:02 Deploying DAI." );
//         dai = await DAITokenContract.connect( deployer ).deploy( 1 );
//         // await dai.deployed();
//         console.log( "Test::PreeOlympusSale:beforeEach:03 DAI address is %s,", dai.address );

//         console.log( "Test::OlympusERC20TOken::beforeEach:04 Loading OLY." );
//         OlympusERC20TOkenContract = await ethers.getContractFactory("OlympusERC20TOken");
        
//         console.log( "Test::OlympusERC20TOken::beforeEach:02 Deploying OLY." );
//         oly = await OlympusERC20TOkenContract.connect( deployer ).deploy();
//         // await oly.deployed();

//       }
//     );

//     describe(
//       "Deployment",
//       function () {
//         it( 
//           "Success", 
//           async function() {
//             console.log( "Test::OlympusERC20TOken::Deployment::Success:01 token name." );
//             expect( await oly.name() ).to.equal("Olympus");

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:02 token symbol." );
//             expect( await oly.symbol() ).to.equal("OLY");

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:03 token decimals." );
//             expect( await oly.decimals() ).to.equal(18);

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:04 owner." );
//             expect( await oly.owner() ).to.equal(deployer.address);

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:05 totalSupply." );
//             expect( await oly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 0 ), "ether" ) );

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:06 owner balanceOf." );
//             expect( await oly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:07 buyer1 balanceOf." );
//             expect( await oly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log( "Test::OlympusERC20TOken::Deployment::Success:08 buyer2 balanceOf." );
//             expect( await oly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
//           }
//         );
//       }
//     );

//     describe(
//       "Ownership",
//       function () {
//         it( 
//           "Minting", 
//           async function() {
//             console.log("Test::OlympusERC20TOken::Ownership::Minting:01 buyer1 can't mint.");
//             await expect( oly.connect(buyer1).mint( buyer1.address, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.be.revertedWith("Ownable: caller is not the owner");
            
//             console.log("Test::OlympusERC20TOken::Ownership::Minting:02 buyer1 balanceOf.");
//             expect( await oly.connect(deployer).balanceOf(buyer1.address) )
//               .to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//             console.log("Test::OlympusERC20TOken::Ownership::Minting:03 only owner can mint.");
//             await expect( () => oly.connect(deployer).mint( deployer.address, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) )
//               .to.changeTokenBalance( oly, deployer, ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//             console.log("Test::OlympusERC20TOken::Ownership::Minting:04 totalSupply.");
//             expect( await oly.totalSupply() )
//               .to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );
//           }
//         );
//       }
//     );

//     // describe(
//     //   "PreOlympusTokenOwnership",
//     //   function () {

//     //     it( 
//     //       "Post-Deployment Transfer", 
//     //       async function() {

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: oly is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller(oly.address) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await oly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await oly.requireSellerApproval() ).to.equal( true );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( oly.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnershi::Minting: Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( oly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( oly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( oly.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => oly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( oly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => oly.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( oly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: deployer balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await oly.connect(buyer1).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await oly.connect(buyer2).balanceOf(buyer2.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //       }
//     //     );

//     //     it( 
//     //       "Approved Seller Transfer", 
//     //       async function() {

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: oly is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller(oly.address) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await oly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: Approve buyer1 to sell.");
//     //         // expect( await oly.connect(deployer).addApprovedSeller(buyer1.address) );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( oly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => oly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( oly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         //   console.log("Test::PreOlympusTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => oly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( oly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
//     //       }
//     //     );

//     //     it( 
//     //       "Open Transfer", 
//     //       async function() {

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: owner is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller(deployer.address) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: oly is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller(oly.address) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( ethers.constants.AddressZero ) ).to.equal( true );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( buyer1.address ) ).to.equal( false );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: address(0) is approvedSeller.");
//     //         // expect( await oly.isApprovedSeller( buyer2.address ) ).to.equal( false );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: totalSupply.");
//     //         // expect( await oly.totalSupply() ).to.equal( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: owner balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(deployer.address) ).to.equal( String( ethers.utils.parseUnits( String( 1000000000 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await oly.requireSellerApproval() ).to.equal( true );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer1 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( oly.connect(buyer1).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnershi::Minting: Confirming buyer1 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( oly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer1 because they have no balance.");
//     //         // await expect( oly.connect(buyer2).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming buyer2 can't transfer to buyer2 because they have no balance.");
//     //         // await expect( oly.connect(buyer2).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.be.revertedWith( "Account not approved to transfer pOLY." );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => oly.connect(deployer).transfer( buyer1.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( oly, buyer1, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );
            
//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Confirming deployer can transfer to buyer1.");
//     //         // await expect( () => oly.connect(deployer).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) )
//     //         //   .to.changeTokenBalance( oly, buyer2, ethers.utils.parseUnits( String( 250000000 ), "ether" ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: deployer balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(deployer.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
              
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await oly.connect(buyer1).balanceOf(buyer1.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await oly.connect(buyer2).balanceOf(buyer2.address) )
//     //         //   .to.equal( String( ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: Enable open trading of pOLY.");
//     //         // await oly.connect( deployer ).allowOpenTrading();

            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: Confirm seller approval required.");
//     //         // expect( await oly.requireSellerApproval() ).to.equal( false );

//     //         // console.log("Test::PreOlympusTokenOwnership::Minting: only owner can mint.");

//     //         // expect( await oly.connect(buyer1).transfer( buyer2.address, ethers.utils.parseUnits( String( 250000000 ), "ether" ) ) );
            
//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer1 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer1.address) ).to.equal( String( ethers.utils.parseUnits( String( 0 ), "ether" ) ) );

//     //         // console.log("Test::OlympusERC20TOkenDeployment::DeploymentSuccess: buyer2 balanceOf.");
//     //         // expect( await oly.connect(deployer).balanceOf(buyer2.address) ).to.equal( String( ethers.utils.parseUnits( String( 500000000 ), "ether" ) ) );
//     //       }
//     //     );
//     //   }
//     // );
//   }
// );