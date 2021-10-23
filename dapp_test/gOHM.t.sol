// // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

// import "./utils/test.sol";
// import "../contracts/governace/gOHM.sol";

// contract gOHMTest is DSTest {
//     gOHM internal gohm;

//     function setUp() public {
//         gohm = new gOHM(address(this), address(this));
//     }

//     function test_erc20() public {
//         assertEq("Governance OHM", gohm.name());        
//         assertEq("gOHM", gohm.symbol());
//         assertEq(18, int(gohm.decimals()));        
//     }

//     function testCannot_mint() public {       
//         gOHM badPermgohm = new gOHM(address(0x1), address(0x2));
//         try badPermgohm.mint(address(this), 100) {
//             fail();
//         } catch Error(string memory error) {
//             // Assert revert error matches expected message
//             assertEq(error, "Only staking");
//         }
//     }

//     // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
//     function test_mint(uint256 amount) public {                      
//         uint256 supplyBefore = gohm.totalSupply();
//         gohm.mint(address(this), amount);
//         assertEq(supplyBefore + amount, gohm.totalSupply());
//     }

//     // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
//     function test_burn(uint256 mintAmount, uint256 burnAmount) public {                      
//         uint256 supplyBefore = gohm.totalSupply();
//         gohm.mint(address(this), mintAmount);
//         if (burnAmount <= mintAmount){
//             gohm.burn(address(this), burnAmount);
//             assertEq(supplyBefore + mintAmount - burnAmount, gohm.totalSupply());
//         } else {
//             try gohm.burn(address(this), burnAmount) {
//                 fail();
//             } catch Error(string memory error) {
//                 // Assert revert error matches expected message
//                 assertEq(error, "SafeMath: subtraction overflow");
//             }
//         }
//     }


// }
