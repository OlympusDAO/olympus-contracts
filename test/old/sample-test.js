// // Import helper functions
// const { expectRevertOrFail, bn } = require('../Olympus2_token/helpers/helpers');

// // We import Chai to use its asserting functions here.
// const { expect } = require("chai");

// require("@nomiclabs/hardhat-ethers");


// describe("$OLY Token ERC-20 Standard Test Cases", function () {

//     const tokenInfo = {
//       // token info to test
//       name: 'Olympus',
//       symbol: 'OLY',
//       decimals: 18,
//       supply: 100000000, // 100 Million $OLY
//     }

//     const initialSupply = bn(tokenInfo.supply, 0).mul(bn(10).pow(bn(tokenInfo.decimals))); // 100 Million Tokens

//     // Define configuration initial
//     let initialBalances;
//     let initialAllowances;
//     let create;

//     let Token;
//     let tokens;
//     let uintMax;

//     let contract;
//     let decimals;

//     let options;

//     let owner;
//     let alice;
//     let bob;
//     let charles;

//     // `beforeEach` will run before each test, re-deploying the contract every
//     // time. It receives from callback, which can be async.
//     before(async function () {
//       [owner, alice, bob, charles] = await ethers.getSigners();

//       // Define Options
//       options = {
//         // factory method to create new token contract
//         create: async function () {
//           Token = await ethers.getContractFactory("Olympus");
//           return Token.deploy();
//         },

//         // token info to test
//         name: tokenInfo.name,
//         symbol: tokenInfo.symbol,
//         decimals: tokenInfo.decimals,

//         // initial state to test
//         initialBalances: [
//           [owner, initialSupply]
//         ],
//         initialAllowances: [
//           [owner, alice, 0]
//         ]
//       };

//       // configure
//       initialBalances = options.initialBalances || []
//       initialAllowances = options.initialAllowances || []
//       create = options.create

//       // setup
//       tokens = function (amount) { return bn(amount).mul(bn(10).pow(decimals)) }
//       uintMax = bn(2).pow(bn(256)).sub(1)

//       contract = null
//       decimals = 0
//     });

//     beforeEach(async function () {
//       contract = await create()
//       decimals = (contract.decimals ? await contract.decimals() : 0)

//       if (options.beforeEach) {
//         await options.beforeEach(contract)
//       }
//     })

//     afterEach(async function () {
//       if (options.afterEach) {
//         await options.afterEach(contract)
//       }
//       contract = null
//       decimals = 0
//     })

//     describe('ERC-20 Standard Calls', function () {
//       describe('totalSupply()', function () {
//         it(`should have initial supply of ${initialSupply.toString()}`, async function () {
//           expect(await contract.totalSupply()).to.equal(initialSupply)
//         })

//         it('should return the correct supply', async function () {
//           await contract.transfer(alice.address, tokens(1))
//           expect(await contract.totalSupply()).to.equal(initialSupply)

//           await contract.transfer(alice.address, tokens(2))
//           expect(await contract.totalSupply()).to.equal(initialSupply)

//           await contract.transfer(bob.address, tokens(3))
//           expect(await contract.totalSupply()).to.equal(initialSupply)
//         })
//       })

//       describe('balanceOf(_owner)', function () {
//         it('should have correct initial balances', async function () {
//           for (let i = 0; i < initialBalances.length; i++) {
//             let address = initialBalances[i][0].address
//             let balance = initialBalances[i][1]
//             expect(await contract.balanceOf(address)).to.equal(balance)
//           }
//         })

//         it('should return the correct balances', async function () {
//           await contract.transfer(alice.address, tokens(1))
//           expect(await contract.balanceOf(alice.address)).to.equal(tokens(1))

//           await contract.transfer(alice.address, tokens(2))
//           expect(await contract.balanceOf(alice.address)).to.equal(tokens(3))

//           await contract.transfer(bob.address, tokens(3))
//           expect(await contract.balanceOf(bob.address)).to.equal(tokens(3))
//         })
//       })
//   })

//   describe('allowance(_owner, _spender)', function () {
//     // Sub section
//     describe(when('_owner != _spender'), function() {
//       it('should return the correct allowance', async function () {
//         await contract.connect(alice).approve(bob.address, tokens(1))
//         expect(await contract.allowance(alice.address, bob.address)).to.equal(tokens(1))
//       })
//     })

//     // Sub section
//     describe(when('_owner == _spender'), function() {
//       it('should return the correct allowance', async function () {
//         await contract.connect(alice).approve(alice.address, tokens(1))
//         expect(await contract.allowance(alice.address, alice.address)).to.equal(tokens(1))
//       })
//     })

//     it('should have correct initial allowance', async function () {
//       for (let i = 0; i < initialAllowances.length; i++) {
//         let owner = initialAllowances[i][0]
//         let spender = initialAllowances[i][1]
//         let expectedAllowance = initialAllowances[i][2]
//         expect(await contract.allowance(owner.address, spender.address)).to.equal(expectedAllowance)
//       }
//     })

//     it('should return the correct allowance', async function () {
//       await contract.connect(alice).approve(bob.address, tokens(1))
//       await contract.connect(alice).approve(charles.address, tokens(2))
//       await contract.connect(bob).approve(charles.address, tokens(3))
//       await contract.connect(bob).approve(alice.address, tokens(4))
//       await contract.connect(charles).approve(alice.address, tokens(5))
//       await contract.connect(charles).approve(bob.address, tokens(6))

//       expect(await contract.allowance(alice.address, bob.address)).to.equal(tokens(1))
//       expect(await contract.allowance(alice.address, charles.address)).to.equal(tokens(2))
//       expect(await contract.allowance(bob.address, charles.address)).to.equal(tokens(3))
//       expect(await contract.allowance(bob.address, alice.address)).to.equal(tokens(4))
//       expect(await contract.allowance(charles.address, alice.address)).to.equal(tokens(5))
//       expect(await contract.allowance(charles.address, bob.address)).to.equal(tokens(6))
//     })
//   })

//   describe('approve(_spender, _value)', function () {
//     describe(when('_spender != sender'), function () {
//       let from;
//       let to;

//       before(async function () {
//         from = alice;
//         to = bob;
//       });

//       it('should execute when approving 0', async function () {
//         expect(await contract.connect(from).approve(to.address, 0));
//       })

//       it('should execute when approving', async function () {
//         expect(await contract.connect(from).approve(to.address, tokens(3)));
//       })

//       it('should execute when updating approval', async function () {
//         expect(await contract.connect(from).approve(to.address, tokens(2)));
//         await contract.connect(from).approve(to.address, tokens(2))

//         // test decreasing approval
//         expect(await contract.connect(from).approve(to.address, tokens(1)));

//         // test not-updating approval
//         expect(await contract.connect(from).approve(to.address, tokens(2)));

//         // test increasing approval
//         expect(await contract.connect(from).approve(to.address, tokens(3)));
//       })

//       it('should execute when revoking approval', async function () {
//         await contract.connect(from).approve(to.address, tokens(3))
//         expect(await contract.connect(from).approve(to.address, tokens(0)));
//       })

//       it('should update allowance accordingly', async function () {
//         await contract.connect(from).approve(to.address, tokens(1))
//         expect(await contract.connect(from).allowance(from.address, to.address)).to.equal(tokens(1))

//         await contract.connect(from).approve(to.address, tokens(3))
//         expect(await contract.connect(from).allowance(from.address, to.address)).to.equal(tokens(3))

//         await contract.connect(from).approve(to.address, 0)
//         expect(await contract.connect(from).allowance(from.address, to.address)).to.equal(tokens(0))
//       })

//       it('should fire Approval when allowance was set to 0', async function () {
//         await expect(contract.connect(from).approve(to.address, tokens(3)))
//           .to.emit(contract, 'Approval')
//           .withArgs(from.address, to.address, tokens(3));
//       })

//       it(`should fire Approval when allowance didn't change`, async function () {
//         await contract.connect(from).approve(to.address, tokens(3));
//         await expect(contract.connect(from).approve(to.address, tokens(3)))
//           .to.emit(contract, 'Approval')
//           .withArgs(from.address, to.address, tokens(3));
//       })

//       describe('Randomized Repeating tests', function () {
//         const retries = 5;

//         for (var i=0; i < retries; i++) {
//           const random = Math.floor(Math.random() * Math.floor(tokenInfo.supply));

//           it(`should fire Approval event correctly: (${random} tokens approval)`, async function () {
//             await expect(contract.connect(from).approve(to.address, tokens(random)))
//               .to.emit(contract, 'Approval')
//               .withArgs(from.address, to.address, tokens(random));
//           })
//         }
//       })
//     })

//     describe(when('testing _spender == sender'), function () {
//       let from;
//       let to;

//       before(async function () {
//         from = alice;
//         to = alice;
//       });

//       it('should execute when approving 0', async function () {
//         expect(await contract.connect(from).approve(to.address, 0));
//       })

//       it('should execute when approving', async function () {
//         expect(await contract.connect(from).approve(to.address, tokens(3)));
//       })

//       it('should execute when updating approval', async function () {
//         expect(await contract.connect(from).approve(to.address, tokens(2)));
//         await contract.connect(from).approve(to.address, tokens(2))

//         // test decreasing approval
//         expect(await contract.connect(from).approve(to.address, tokens(1)));

//         // test not-updating approval
//         expect(await contract.connect(from).approve(to.address, tokens(2)));

//         // test increasing approval
//         expect(await contract.connect(from).approve(to.address, tokens(3)));
//       })

//       it('should execute when revoking approval', async function () {
//         await contract.connect(from).approve(to.address, tokens(3))
//         expect(await contract.connect(from).approve(to.address, tokens(0)));
//       })

//       it('should update allowance accordingly', async function () {
//         await contract.connect(from).approve(to.address, tokens(1))
//         expect(await contract.connect(from).allowance(from.address, to.address)).to.equal(tokens(1))

//         await contract.connect(from).approve(to.address, tokens(3))
//         expect(await contract.connect(from).allowance(from.address, to.address)).to.equal(tokens(3))

//         await contract.connect(from).approve(to.address, 0)
//         expect(await contract.connect(from).allowance(from.address, to.address)).to.equal(tokens(0))
//       })

//       it('should fire Approval when allowance was set to 0', async function () {
//         await expect(contract.connect(from).approve(to.address, tokens(3)))
//           .to.emit(contract, 'Approval')
//           .withArgs(from.address, to.address, tokens(3));
//       })

//       it(`should fire Approval when allowance didn't change`, async function () {
//         await contract.connect(from).approve(to.address, tokens(3));
//         await expect(contract.connect(from).approve(to.address, tokens(3)))
//           .to.emit(contract, 'Approval')
//           .withArgs(from.address, to.address, tokens(3));
//       })

//       describe('Randomized Repeating tests', function () {
//         const retries = 5;

//         for (var i=0; i < retries; i++) {
//           const random = Math.floor(Math.random() * Math.floor(tokenInfo.supply));

//           it(`should fire Approval event correctly: (${random} tokens approval)`, async function () {
//             await expect(contract.connect(from).approve(to.address, tokens(random)))
//               .to.emit(contract, 'Approval')
//               .withArgs(from.address, to.address, tokens(random));
//           })
//         }
//       })
//     })
//   })

//   describe('transfer(_to, _value)', function () {
//     describe(when('_spender != sender'), function () {
//       let from;
//       let to;

//       before(async function () {
//         from = alice;
//         to = bob;
//       });

//       it('should execute when called with amount of 0', async function () {
//         expect(await contract.connect(from).transfer(to.address, 0));
//       })

//       it('should return true when transfer can be made, false otherwise', async function () {
//         expect(await contract.connect(from).transfer(to.address, tokens(0)))

//         await contract.transfer(from.address, tokens(3))

//         expect(await contract.connect(from).transfer(to.address, tokens(1)))
//         expect(await contract.connect(from).transfer(to.address, tokens(2)))

//         await expect(contract.connect(from).transfer(to.address, tokens(10))).to.be.reverted;
//         expect(await contract.connect(to).transfer(from.address, tokens(3)))
//       })

//       it('should revert when trying to transfer something while having nothing', async function () {
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;
//       })

//       it('should revert when trying to transfer more than balance', async function () {
//         await contract.transfer(from.address, tokens(3))
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;

//         await contract.connect(from).transfer('0x0000000000000000000000000000000000000001', tokens(1))
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;
//       })

//       it('should revert when trying to transfer something while having nothing', async function () {
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;
//       })

//       it('should not affect totalSupply', async function () {
//         await contract.transfer(from.address, tokens(3))

//         let supply1 = await contract.totalSupply()
//         await contract.connect(from).transfer(to.address, tokens(3))

//         let supply2 = await contract.totalSupply()
//         expect(supply2).to.be.equal(supply1)
//       })

//       it('should update balances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let fromBalance1 = await contract.balanceOf(from.address)
//           let toBalance1 = await contract.balanceOf(to.address)

//           await contract.connect(from).transfer(to.address, tokens(1))
//           let fromBalance2 = await contract.balanceOf(from.address)
//           let toBalance2 = await contract.balanceOf(to.address)

//           if (from == to) {
//             expect(fromBalance2).to.equal(fromBalance1)
//           }
//           else {
//             expect(fromBalance2).to.equal(fromBalance1.sub(tokens(1)))
//             expect(toBalance2).to.equal(toBalance1.add(tokens(1)))
//           }

//           await contract.connect(from).transfer(to.address, tokens(2))
//           let fromBalance3 = await contract.balanceOf(from.address)
//           let toBalance3 = await contract.balanceOf(to.address)

//           if (from == to) {
//             expect(fromBalance3).to.equal(fromBalance2)
//           }
//           else {
//             expect(fromBalance3).to.equal(fromBalance2.sub(tokens(2)))
//             expect(toBalance3).to.equal(toBalance2.add(tokens(2)))
//           }
//         })

//         it('should fire Transfer event', async function () {
//           await contract.transfer(from.address, tokens(3))

//           await expect(contract.connect(from).transfer(to.address, tokens(3)))
//             .to.emit(contract, 'Transfer')
//             .withArgs(from.address, to.address, tokens(3));
//         })

//         it('should fire Transfer event when transferring amount of 0', async function () {
//           await expect(contract.connect(from).transfer(to.address, tokens(0)))
//             .to.emit(contract, 'Transfer')
//             .withArgs(from.address, to.address, tokens(0));
//         })
//     })

//     describe(when('_spender == sender'), function () {
//       let from;
//       let to;

//       before(async function () {
//         from = alice;
//         to = alice;
//       });

//       it('should execute when called with amount of 0', async function () {
//         expect(await contract.connect(from).transfer(to.address, 0));
//       })

//       it('should return true when transfer can be made, false otherwise', async function () {
//         expect(await contract.connect(from).transfer(to.address, tokens(0)))

//         await contract.transfer(from.address, tokens(3))

//         expect(await contract.connect(from).transfer(to.address, tokens(1)))
//         expect(await contract.connect(from).transfer(to.address, tokens(2)))

//         await expect(contract.connect(from).transfer(to.address, tokens(100))).to.be.reverted;
//         expect(await contract.connect(to).transfer(from.address, tokens(3)))
//       })

//       it('should revert when trying to transfer something while having nothing', async function () {
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;
//       })

//       it('should revert when trying to transfer from 0x0', async function () {
//         await expect(contract.connect(from).transfer('0x0000000000000000000000000000000000000000', tokens(10)))
//           .to.be.reverted;
//       })

//       it('should revert when trying to transfer more than balance', async function () {
//         await contract.transfer(from.address, tokens(3))
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;

//         await contract.connect(from).transfer('0x0000000000000000000000000000000000000001', tokens(1))
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;
//       })

//       it('should revert when trying to transfer something while having nothing', async function () {
//         await expect(contract.connect(from).transfer(to.address, tokens(10)))
//           .to.be.reverted;
//       })

//       it('should not affect totalSupply', async function () {
//         await contract.transfer(from.address, tokens(3))

//         let supply1 = await contract.totalSupply()
//         await contract.connect(from).transfer(to.address, tokens(3))

//         let supply2 = await contract.totalSupply()
//         expect(supply2).to.be.equal(supply1)
//       })

//       it('should update balances accordingly', async function () {
//         await contract.transfer(from.address, tokens(3))

//         let fromBalance1 = await contract.balanceOf(from.address)
//         let toBalance1 = await contract.balanceOf(to.address)

//         await contract.connect(from).transfer(to.address, tokens(1))
//         let fromBalance2 = await contract.balanceOf(from.address)
//         let toBalance2 = await contract.balanceOf(to.address)

//         if (from == to) {
//           expect(fromBalance2).to.equal(fromBalance1)
//         }
//         else {
//           expect(fromBalance2).to.equal(fromBalance1.sub(tokens(1)))
//           expect(toBalance2).to.equal(toBalance1.add(tokens(1)))
//         }

//         await contract.connect(from).transfer(to.address, tokens(2))
//         let fromBalance3 = await contract.balanceOf(from.address)
//         let toBalance3 = await contract.balanceOf(to.address)

//         if (from == to) {
//           expect(fromBalance3).to.equal(fromBalance2)
//         }
//         else {
//           expect(fromBalance3).to.equal(fromBalance2.sub(tokens(2)))
//           expect(toBalance3).to.equal(toBalance2.add(tokens(2)))
//         }
//       })

//       it('should fire Transfer event', async function () {
//         await contract.transfer(from.address, tokens(3))

//         await expect(contract.connect(from).transfer(to.address, tokens(3)))
//           .to.emit(contract, 'Transfer')
//           .withArgs(from.address, to.address, tokens(3));
//       })

//       it('should fire Transfer event when transferring amount of 0', async function () {
//         await expect(contract.connect(from).transfer(to.address, tokens(0)))
//           .to.emit(contract, 'Transfer')
//           .withArgs(from.address, to.address, tokens(0));
//       })
//     })
//   })


//   describe('transferFrom(_to, _value)', function () {
//     describe(when('_from != _to and _to != sender'), function () {
//       let from;
//       let via;
//       let to;

//       beforeEach(async function () {
//         from = alice;
//         via = bob;
//         to = charles;
//       });

//       afterEach(async function () {
//         from = null;
//         via = null;
//         to = null;
//       });

//       it('should revert when trying to transfer while not allowed at all', async function () {
//         await contract.transfer(from.address, tokens(3))

//         if (from.address == via.address) {
//           via = owner; //transferFrom allows transfer if sender and src is same
//         }

//         await expect(contract.connect(via).transferFrom(from.address, via.address, tokens(1)))
//           .to.be.reverted;

//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           .to.be.reverted;
//       })

//       it('should fire Transfer event when transferring amount of 0 and sender is not approved', async function () {
//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//           .to.emit(contract, 'Transfer')
//           .withArgs(from.address, to.address, tokens(0))
//       })

//       describe('Always approved sender', function () {
//         beforeEach(async function () {
//           await contract.connect(from).approve(via.address, tokens(3))
//         });

//         it('should return true when called with amount of 0 and sender is approved', async function () {
//           expect(await contract.connect(via).transferFrom(from.address, to.address, 0))
//         })

//         it('should return true when called with amount of 0 and sender is not approved', async function () {
//           expect(await contract.connect(via).transferFrom(to.address, from.address, 0))
//         })

//         it('should revert when amount is non-zero and sender is not approved', async function () {
//           await contract.transfer(to.address, tokens(1))

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should return true when transfer can be made, fail otherwise', async function () {
//           await contract.transfer(from.address, tokens(3))

//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(2)))

//           if (from.address == via.address) {
//             via = owner; //transferFrom allows transfer if sender and src is same
//           }

//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//             .to.be.reverted

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted

//           if (via.address == owner.address) {
//             via = bob;
//           }

//           await contract.connect(to).approve(via.address, tokens(3));
//           expect(await contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(to.address, from.address, tokens(2)))

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should revert when trying to transfer something while sender having nothing', async function () {
//           await expect(contract.connect(from).transferFrom(via.address, to.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should revert when trying to transfer more than balance of _from', async function () {
//           await contract.transfer(from.address, tokens(2))
//           await expect(contract.connect(from).transferFrom(from.address, via.address, tokens(3)))
//             .to.be.reverted;
//         })

//         it('should revert when trying to transfer more than allowed', async function () {
//           await contract.transfer(from.address, tokens(4))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(3)))

//           await contract.connect(to).transfer(from.address, tokens(3))
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(4)))
//             .to.be.reverted;

//           await contract.connect(from).approve(via.address, tokens(3))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//             .to.be.reverted;
//         })

//         it('should not affect totalSupply', async function () {
//           await contract.transfer(from.address, tokens(3))
//           let supply1 = await contract.totalSupply()

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(3))
//           let supply2 = await contract.totalSupply()

//           expect(supply2).to.be.equal(supply1)
//         })

//         it('should update balances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let aBalance1 = await contract.balanceOf(from.address)
//           let bBalance1 = await contract.balanceOf(via.address)
//           let cBalance1 = await contract.balanceOf(to.address)

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(1))
//           let aBalance2 = await contract.balanceOf(from.address)
//           let bBalance2 = await contract.balanceOf(via.address)
//           let cBalance2 = await contract.balanceOf(to.address)

//           if (from.address == to.address) {
//             expect(aBalance2).to.equal(aBalance1)
//           }
//           else {
//             expect(aBalance2).to.equal(aBalance1.sub(tokens(1)))
//             expect(cBalance2).to.equal(cBalance1.add(tokens(1)))
//           }

//           if (via.address != from.address && via.address != to.address) {
//             expect(bBalance2).to.equal(bBalance1)
//           }

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(2))
//           let fromBalance3 = await contract.balanceOf(from.address)
//           let viaBalance3 = await contract.balanceOf(via.address)
//           let toBalance3 = await contract.balanceOf(to.address)

//           if (from.address == to.address) {
//             expect(fromBalance3).to.equal(aBalance2)
//           }
//           else {
//             expect(fromBalance3).to.equal(aBalance2.sub(tokens(2)))
//             expect(toBalance3).to.equal(cBalance2.add(tokens(2)))
//           }

//           if (via.address != from.address && via.address != to.address) {
//             expect(viaBalance3).to.equal(bBalance2)
//           }
//         })

//         it('should update allowances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let viaAllowance1 = await contract.allowance(from.address, via.address)
//           let toAllowance1 = await contract.allowance(from.address, to.address)

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(2))
//           let viaAllowance2 = await contract.allowance(from.address, via.address)
//           let toAllowance2 = await contract.allowance(from.address, to.address)

//           if (from.address == via.address) {
//             expect(viaAllowance2).to.equal(viaAllowance1)
//           }
//           else {
//             expect(viaAllowance2).to.equal(viaAllowance1.sub(tokens(2)))
//           }

//           if (to.address != from.address && via.address != to.address) {
//             expect(toAllowance2).to.equal(toAllowance1)
//           }

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(1))
//           let viaAllowance3 = await contract.allowance(from.address, via.address)
//           let toAllowance3 = await contract.allowance(from.address, to.address)

//           if (from.address == via.address) {
//             expect(viaAllowance3).to.equal(viaAllowance2)
//           }
//           else {
//             expect(viaAllowance3).to.equal(viaAllowance2.sub(tokens(1)))
//           }

//           if (to.address != from.address && via.address != to.address) {
//             expect(toAllowance3).to.equal(toAllowance1)
//           }
//         })

//         describe('Randomized Repeating tests', function () {
//           const retries = 5;
//           for (var i=0; i < retries; i++) {
//             const random = Math.floor(Math.random() * Math.floor(tokenInfo.supply));

//             it(`should fire Transfer event for ${random} tokens`, async function () {
//               await contract.transfer(from.address, tokens(random))
//               await contract.connect(from).approve(via.address, tokens(random))

//               await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(random)))
//                 .to.emit(contract, 'Transfer')
//                 .withArgs(from.address, to.address, tokens(random))
//             })
//           }
//         })

//         it('should fire Transfer event when transferring amount of 0', async function () {
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//             .to.emit(contract, 'Transfer')
//             .withArgs(from.address, to.address, tokens(0))
//         })
//       })
//     })

//     describe(when('_from != _to and _to == sender'), function () {
//       let from;
//       let via;
//       let to;

//       beforeEach(async function () {
//         from = alice;
//         via = bob;
//         to = bob;
//       });

//       afterEach(async function () {
//         from = null;
//         via = null;
//         to = null;
//       });

//       it('should revert when trying to transfer while not allowed at all', async function () {
//         await contract.transfer(from.address, tokens(3))

//         if (from.address == via.address) {
//           via = owner; //transferFrom allows transfer if sender and src is same
//         }

//         await expect(contract.connect(via).transferFrom(from.address, via.address, tokens(1)))
//           .to.be.reverted;

//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           .to.be.reverted;
//       })

//       it('should fire Transfer event when transferring amount of 0 and sender is not approved', async function () {
//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//           .to.emit(contract, 'Transfer')
//           .withArgs(from.address, to.address, tokens(0))
//       })

//       describe('Always approved sender', function () {
//         beforeEach(async function () {
//           await contract.connect(from).approve(via.address, tokens(3))
//         });

//         it('should return true when called with amount of 0 and sender is approved', async function () {
//           expect(await contract.connect(via).transferFrom(from.address, to.address, 0))
//         })

//         it('should return true when called with amount of 0 and sender is not approved', async function () {
//           expect(await contract.connect(via).transferFrom(to.address, from.address, 0))
//         })

//         it('should revert when amount is non-zero and sender is not approved', async function () {
//           await contract.transfer(to.address, tokens(1))

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should return true when transfer can be made, fail otherwise', async function () {
//           await contract.transfer(from.address, tokens(3))

//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(2)))

//           if (from.address == via.address) {
//             via = owner; //transferFrom allows transfer if sender and src is same
//           }

//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//             .to.be.reverted

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted

//           if (via.address == owner.address) {
//             via = bob;
//           }

//           await contract.connect(to).approve(via.address, tokens(3));
//           expect(await contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(to.address, from.address, tokens(2)))

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should revert when trying to transfer something while sender having nothing', async function () {
//           await expect(contract.connect(from).transferFrom(via.address, to.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should revert when trying to transfer more than balance of _from', async function () {
//           await contract.transfer(from.address, tokens(2))
//           await expect(contract.connect(from).transferFrom(from.address, via.address, tokens(3)))
//             .to.be.reverted;
//         })

//         it('should revert when trying to transfer more than allowed', async function () {
//           await contract.transfer(from.address, tokens(4))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(3)))

//           await contract.connect(to).transfer(from.address, tokens(3))
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(4)))
//             .to.be.reverted

//           await contract.connect(from).approve(via.address, tokens(3))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should not affect totalSupply', async function () {
//           await contract.transfer(from.address, tokens(3))
//           let supply1 = await contract.totalSupply()

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(3))
//           let supply2 = await contract.totalSupply()

//           expect(supply2).to.be.equal(supply1)
//         })

//         it('should update balances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let aBalance1 = await contract.balanceOf(from.address)
//           let bBalance1 = await contract.balanceOf(via.address)
//           let cBalance1 = await contract.balanceOf(to.address)

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(1))
//           let aBalance2 = await contract.balanceOf(from.address)
//           let bBalance2 = await contract.balanceOf(via.address)
//           let cBalance2 = await contract.balanceOf(to.address)

//           if (from.address == to.address) {
//             expect(aBalance2).to.equal(aBalance1)
//           }
//           else {
//             expect(aBalance2).to.equal(aBalance1.sub(tokens(1)))
//             expect(cBalance2).to.equal(cBalance1.add(tokens(1)))
//           }

//           if (via.address != from.address && via.address != to.address) {
//             expect(bBalance2).to.equal(bBalance1)
//           }

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(2))
//           let fromBalance3 = await contract.balanceOf(from.address)
//           let viaBalance3 = await contract.balanceOf(via.address)
//           let toBalance3 = await contract.balanceOf(to.address)

//           if (from.address == to.address) {
//             expect(fromBalance3).to.equal(aBalance2)
//           }
//           else {
//             expect(fromBalance3).to.equal(aBalance2.sub(tokens(2)))
//             expect(toBalance3).to.equal(cBalance2.add(tokens(2)))
//           }

//           if (via.address != from.address && via.address != to.address) {
//             expect(viaBalance3).to.equal(bBalance2)
//           }
//         })

//         it('should update allowances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let viaAllowance1 = await contract.allowance(from.address, via.address)
//           let toAllowance1 = await contract.allowance(from.address, to.address)

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(2))
//           let viaAllowance2 = await contract.allowance(from.address, via.address)
//           let toAllowance2 = await contract.allowance(from.address, to.address)

//           if (from.address == via.address) {
//             expect(viaAllowance2).to.equal(viaAllowance1)
//           }
//           else {
//             expect(viaAllowance2).to.equal(viaAllowance1.sub(tokens(2)))
//           }

//           if (to.address != from.address && via.address != to.address) {
//             expect(toAllowance2).to.equal(toAllowance1)
//           }

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(1))
//           let viaAllowance3 = await contract.allowance(from.address, via.address)
//           let toAllowance3 = await contract.allowance(from.address, to.address)

//           if (from.address == via.address) {
//             expect(viaAllowance3).to.equal(viaAllowance2)
//           }
//           else {
//             expect(viaAllowance3).to.equal(viaAllowance2.sub(tokens(1)))
//           }

//           if (to.address != from.address && via.address != to.address) {
//             expect(toAllowance3).to.equal(toAllowance1)
//           }
//         })

//         describe('Randomized Repeating tests', function () {
//           const retries = 5;
//           for (var i=0; i < retries; i++) {
//             const random = Math.floor(Math.random() * Math.floor(tokenInfo.supply));

//             it(`should fire Transfer event for ${random} tokens`, async function () {
//               await contract.transfer(from.address, tokens(random))
//               await contract.connect(from).approve(via.address, tokens(random))

//               await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(random)))
//                 .to.emit(contract, 'Transfer')
//                 .withArgs(from.address, to.address, tokens(random))
//             })
//           }
//         })

//         it('should fire Transfer event when transferring amount of 0', async function () {
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//             .to.emit(contract, 'Transfer')
//             .withArgs(from.address, to.address, tokens(0))
//         })
//       })
//     })

//     describe(when('_from == _to and _to != sender'), function () {
//       let from;
//       let via;
//       let to;

//       beforeEach(async function () {
//         from = alice;
//         via = bob;
//         to = alice;
//       });

//       afterEach(async function () {
//         from = null;
//         via = null;
//         to = null;
//       });

//       it('should revert when trying to transfer while not allowed at all', async function () {
//         await contract.transfer(from.address, tokens(3))

//         if (from.address == via.address) {
//           via = owner; //transferFrom allows transfer if sender and src is same
//         }

//         await expect(contract.connect(via).transferFrom(from.address, via.address, tokens(1)))
//           .to.be.reverted;

//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           .to.be.reverted;
//       })

//       it('should fire Transfer event when transferring amount of 0 and sender is not approved', async function () {
//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//           .to.emit(contract, 'Transfer')
//           .withArgs(from.address, to.address, tokens(0))
//       })

//       describe('Always approved sender', function () {
//         beforeEach(async function () {
//           await contract.connect(from).approve(via.address, tokens(3))
//         });

//         it('should return true when called with amount of 0 and sender is approved', async function () {
//           expect(await contract.connect(via).transferFrom(from.address, to.address, 0))
//         })

//         it('should return true when called with amount of 0 and sender is not approved', async function () {
//           expect(await contract.connect(via).transferFrom(to.address, from.address, 0))
//         })

//         it('should revert when amount is non-zero and sender is not approved', async function () {
//           await contract.transfer(from.address, tokens(1))

//           if (via.address == from.address) {
//             via = owner;
//           }

//           if (from.address == to.address) {
//             to = owner;
//           }

//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(10)))
//             .to.be.reverted
//         })

//         it('should return true when transfer can be made, fail otherwise', async function () {
//           await contract.transfer(from.address, tokens(3))

//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(2)))

//           if (from.address == via.address) {
//             via = owner; //transferFrom allows transfer if sender and src is same
//           }

//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//             .to.be.reverted

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted

//           if (via.address == owner.address) {
//             via = bob;
//           }

//           await contract.connect(to).approve(via.address, tokens(3));
//           expect(await contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//           expect(await contract.connect(via).transferFrom(to.address, from.address, tokens(2)))

//           if (via.address == to.address) {
//             via = owner;
//           }

//           await expect(contract.connect(via).transferFrom(to.address, from.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should revert when trying to transfer something while sender having nothing', async function () {
//           if (from.address == via.address) {
//             from = owner; //sender should be different than _to, special case different from others
//           }

//           await expect(contract.connect(from).transferFrom(via.address, to.address, tokens(1)))
//             .to.be.reverted
//         })

//         it('should revert when trying to transfer more than balance of _from', async function () {
//           await contract.transfer(from.address, tokens(2))
//           await expect(contract.connect(from).transferFrom(from.address, via.address, tokens(3)))
//             .to.be.reverted;
//         })

//         it('should revert when trying to transfer more than allowed', async function () {
//           await contract.transfer(from.address, tokens(4))
//           expect(await contract.connect(via).transferFrom(from.address, to.address, tokens(3)))

//           await contract.connect(to).transfer(from.address, tokens(3))

//           if (from.address == via.address) {
//             await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(5)))
//               .to.be.reverted;
//           }
//           else {
//             await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(5)))
//               .to.be.reverted
//           }
//         })

//         it('should not affect totalSupply', async function () {
//           await contract.transfer(from.address, tokens(3))
//           let supply1 = await contract.totalSupply()

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(3))
//           let supply2 = await contract.totalSupply()

//           expect(supply2).to.be.equal(supply1)
//         })

//         it('should update balances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let aBalance1 = await contract.balanceOf(from.address)
//           let bBalance1 = await contract.balanceOf(via.address)
//           let cBalance1 = await contract.balanceOf(to.address)

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(1))
//           let aBalance2 = await contract.balanceOf(from.address)
//           let bBalance2 = await contract.balanceOf(via.address)
//           let cBalance2 = await contract.balanceOf(to.address)

//           if (from.address == to.address) {
//             expect(aBalance2).to.equal(aBalance1)
//           }
//           else {
//             expect(aBalance2).to.equal(aBalance1.sub(tokens(1)))
//             expect(cBalance2).to.equal(cBalance1.add(tokens(1)))
//           }

//           if (via.address != from.address && via.address != to.address) {
//             expect(bBalance2).to.equal(bBalance1)
//           }

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(2))
//           let fromBalance3 = await contract.balanceOf(from.address)
//           let viaBalance3 = await contract.balanceOf(via.address)
//           let toBalance3 = await contract.balanceOf(to.address)

//           if (from.address == to.address) {
//             expect(fromBalance3).to.equal(aBalance2)
//           }
//           else {
//             expect(fromBalance3).to.equal(aBalance2.sub(tokens(2)))
//             expect(toBalance3).to.equal(cBalance2.add(tokens(2)))
//           }

//           if (via.address != from.address && via.address != to.address) {
//             expect(viaBalance3).to.equal(bBalance2)
//           }
//         })

//         it('should update allowances accordingly', async function () {
//           await contract.transfer(from.address, tokens(3))

//           let viaAllowance1 = await contract.allowance(from.address, via.address)
//           let toAllowance1 = await contract.allowance(from.address, to.address)

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(2))
//           let viaAllowance2 = await contract.allowance(from.address, via.address)
//           let toAllowance2 = await contract.allowance(from.address, to.address)

//           if (from.address == via.address) {
//             expect(viaAllowance2).to.equal(viaAllowance1)
//           }
//           else {
//             expect(viaAllowance2).to.equal(viaAllowance1.sub(tokens(2)))
//           }

//           if (to.address != from.address && via.address != to.address) {
//             expect(toAllowance2).to.equal(toAllowance1)
//           }

//           await contract.connect(via).transferFrom(from.address, to.address, tokens(1))
//           let viaAllowance3 = await contract.allowance(from.address, via.address)
//           let toAllowance3 = await contract.allowance(from.address, to.address)

//           if (from.address == via.address) {
//             expect(viaAllowance3).to.equal(viaAllowance2)
//           }
//           else {
//             expect(viaAllowance3).to.equal(viaAllowance2.sub(tokens(1)))
//           }

//           if (to.address != from.address && via.address != to.address) {
//             expect(toAllowance3).to.equal(toAllowance1)
//           }
//         })

//         describe('Randomized Repeating tests', function () {
//           const retries = 5;
//           for (var i=0; i < retries; i++) {
//             const random = Math.floor(Math.random() * Math.floor(tokenInfo.supply));

//             it(`should fire Transfer event for ${random} tokens`, async function () {
//               await contract.transfer(from.address, tokens(random))
//               await contract.connect(from).approve(via.address, tokens(random))

//               await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(random)))
//                 .to.emit(contract, 'Transfer')
//                 .withArgs(from.address, to.address, tokens(random))
//             })
//           }
//         })

//         it('should fire Transfer event when transferring amount of 0', async function () {
//           await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//             .to.emit(contract, 'Transfer')
//             .withArgs(from.address, to.address, tokens(0))
//         })
//       })
//     })

//     describe(when('_from == _to and _to == sender'), function () {
//       let from;
//       let via;
//       let to;

//       beforeEach(async function () {
//         from = alice;
//         via = alice;
//         to = alice;
//       });

//       afterEach(async function () {
//         from = null;
//         via = null;
//         to = null;
//       });

//       it('should revert when trying to transfer while not allowed at all', async function () {
//         await contract.transfer(from.address, tokens(3))

//         if (from.address == via.address) {
//           via = owner; //transferFrom allows transfer if sender and src is same
//         }

//         await expect(contract.connect(via).transferFrom(from.address, via.address, tokens(1)))
//           .to.be.reverted;

//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(1)))
//           .to.be.reverted;
//       })

//       it('should fire Transfer event when transferring amount of 0 and sender is not approved', async function () {
//         await expect(contract.connect(via).transferFrom(from.address, to.address, tokens(0)))
//           .to.emit(contract, 'Transfer')
//           .withArgs(from.address, to.address, tokens(0))
//       })
//     })
//   })


//   // Helpers
//   function when(name) {
//     return 'when (' + name + ')'
//   }

//   describe('permit()', function () {
//     let contractName
//     let spender
//     let transmitter
//     let tokenAmount
//     let nonce
//     let deadline

//     let domain
//     let types
//     let val

//     beforeEach(async function () {
//       contract = await create()
//       decimals = (contract.decimals ? await contract.decimals() : 0)

//       if (options.beforeEach) {
//         await options.beforeEach(contract)
//       }

//       contractName = await contract.name()

//       spender = alice
//       transmitter = bob
//       tokenAmount = tokens(232)
//       nonce = await contract.nonces(owner.address)
//       deadline = ethers.constants.MaxUint256

//       domain = {
//         name: contractName,
//         chainId: owner.provider._network.chainId,
//         verifyingContract: contract.address.toString()
//       }

//       types = {
//         Permit: [
//           {name: "owner", type: "address"},
//           {name: "spender", type: "address"},
//           {name: "value", type: "uint256"},
//           {name: "nonce", type: "uint256"},
//           {name: "deadline", type: "uint256"},
//         ]
//       }

//       val = {
//         'owner': owner.address.toString(),
//         'spender': spender.address.toString(),
//         'value': tokenAmount.toString(),
//         'nonce': nonce.toString(),
//         'deadline': deadline.toString()
//       }
//     })
//     afterEach(async function () {
//       if (options.afterEach) {
//         await options.afterEach(contract)
//       }
//       contract = null
//       decimals = 0
//     })

//     it('should abort on unauthorized request', async function () {
//       const signer = ethers.provider.getSigner(1) // owner is 0 and should be the signer
//       const signature = await signer._signTypedData(domain, types, val)
//       let sig = ethers.utils.splitSignature(signature)

//       await expect(contract.connect(transmitter).permit(owner.address, spender.address, tokenAmount, deadline, sig.v, sig.r, sig.s))
//         .to.be.reverted
//     })

//     it('should abort on invalid nonce', async function () {
//       nonce = await contract.nonces(owner.address) + 1
//       val['nonce'] = nonce.toString()

//       const signer = ethers.provider.getSigner(0) // owner is 0 and should be the signer
//       const signature = await signer._signTypedData(domain, types, val)
//       let sig = ethers.utils.splitSignature(signature)

//       await expect(contract.connect(transmitter).permit(owner.address, spender.address, tokenAmount, deadline, sig.v, sig.r, sig.s))
//         .to.be.reverted;
//     })

//     it('should abort on deadline expiry', async function () {
//       const now = new Date()
//       const secondsSinceEpoch = Math.round(now.getTime() / 1000)

//       deadline = secondsSinceEpoch - 10000
//       val['deadline'] = deadline.toString()

//       const signer = ethers.provider.getSigner(0)
//       const signature = await signer._signTypedData(domain, types, val)
//       let sig = ethers.utils.splitSignature(signature)

//       await expect(contract.connect(transmitter).permit(owner.address, spender.address, tokenAmount, deadline, sig.v, sig.r, sig.s))
//         .to.be.reverted
//     })

//     it('should permit if within deadline', async function () {
//       const now = new Date()
//       const secondsSinceEpoch = Math.round(now.getTime() / 1000)

//       deadline = secondsSinceEpoch + 10000;
//       val['deadline'] = deadline.toString()

//       const signer = ethers.provider.getSigner()
//       const signature = await signer._signTypedData(domain, types, val)
//       let sig = ethers.utils.splitSignature(signature)

//       expect(await contract.connect(owner).permit(owner.address, spender.address, tokenAmount, deadline, sig.v, sig.r, sig.s))
//     })

//     it('should permit and transfer', async function () {
//       const signer = ethers.provider.getSigner(0)
//       const signature = await signer._signTypedData(domain, types, val)
//       let sig = ethers.utils.splitSignature(signature)

//       await expect(contract.connect(spender).transferFrom(owner.address, transmitter.address, tokenAmount))
//         .to.be.reverted;

//       await expect(contract.connect(transmitter).permit(owner.address, spender.address, tokenAmount, deadline, sig.v, sig.r, sig.s))
//         .to.emit(contract, 'Approval')
//         .withArgs(owner.address, spender.address, tokenAmount)

//       expect(await contract.allowance(owner.address, spender.address)).to.be.equal(tokenAmount)
//       expect(await contract.nonces(owner.address)).to.be.equal(1)

//       await contract.connect(spender).transferFrom(owner.address, transmitter.address, tokenAmount)
//     })
//   })
// })



