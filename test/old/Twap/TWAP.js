// const { ethers } = require("hardhat");
// const { Contract, Wallet } = require('ethers');
// const { solidity, MockProvider, createFixtureLoader } = require('ethereum-waffle');
// const PairABI = [
//     {
//       "inputs": [],
//       "stateMutability": "nonpayable",
//       "type": "constructor"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "owner",
//           "type": "address"
//         },
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "spender",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "value",
//           "type": "uint256"
//         }
//       ],
//       "name": "Approval",
//       "type": "event"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "sender",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount0",
//           "type": "uint256"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount1",
//           "type": "uint256"
//         },
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         }
//       ],
//       "name": "Burn",
//       "type": "event"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "sender",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount0",
//           "type": "uint256"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount1",
//           "type": "uint256"
//         }
//       ],
//       "name": "Mint",
//       "type": "event"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "sender",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount0In",
//           "type": "uint256"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount1In",
//           "type": "uint256"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount0Out",
//           "type": "uint256"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "amount1Out",
//           "type": "uint256"
//         },
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         }
//       ],
//       "name": "Swap",
//       "type": "event"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": false,
//           "internalType": "uint112",
//           "name": "reserve0",
//           "type": "uint112"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint112",
//           "name": "reserve1",
//           "type": "uint112"
//         }
//       ],
//       "name": "Sync",
//       "type": "event"
//     },
//     {
//       "anonymous": false,
//       "inputs": [
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "from",
//           "type": "address"
//         },
//         {
//           "indexed": true,
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         },
//         {
//           "indexed": false,
//           "internalType": "uint256",
//           "name": "value",
//           "type": "uint256"
//         }
//       ],
//       "name": "Transfer",
//       "type": "event"
//     },
//     {
//       "inputs": [],
//       "name": "DOMAIN_SEPARATOR",
//       "outputs": [
//         {
//           "internalType": "bytes32",
//           "name": "",
//           "type": "bytes32"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "MINIMUM_LIQUIDITY",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "pure",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "PERMIT_TYPEHASH",
//       "outputs": [
//         {
//           "internalType": "bytes32",
//           "name": "",
//           "type": "bytes32"
//         }
//       ],
//       "stateMutability": "pure",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "owner",
//           "type": "address"
//         },
//         {
//           "internalType": "address",
//           "name": "spender",
//           "type": "address"
//         }
//       ],
//       "name": "allowance",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "spender",
//           "type": "address"
//         },
//         {
//           "internalType": "uint256",
//           "name": "value",
//           "type": "uint256"
//         }
//       ],
//       "name": "approve",
//       "outputs": [
//         {
//           "internalType": "bool",
//           "name": "",
//           "type": "bool"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "owner",
//           "type": "address"
//         }
//       ],
//       "name": "balanceOf",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         }
//       ],
//       "name": "burn",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "amount0",
//           "type": "uint256"
//         },
//         {
//           "internalType": "uint256",
//           "name": "amount1",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "decimals",
//       "outputs": [
//         {
//           "internalType": "uint8",
//           "name": "",
//           "type": "uint8"
//         }
//       ],
//       "stateMutability": "pure",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "factory",
//       "outputs": [
//         {
//           "internalType": "address",
//           "name": "",
//           "type": "address"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "getReserves",
//       "outputs": [
//         {
//           "internalType": "uint112",
//           "name": "_reserve0",
//           "type": "uint112"
//         },
//         {
//           "internalType": "uint112",
//           "name": "_reserve1",
//           "type": "uint112"
//         },
//         {
//           "internalType": "uint32",
//           "name": "_blockTimestampLast",
//           "type": "uint32"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "token0_",
//           "type": "address"
//         },
//         {
//           "internalType": "address",
//           "name": "token1_",
//           "type": "address"
//         }
//       ],
//       "name": "initialize",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "kLast",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         }
//       ],
//       "name": "mint",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "liquidity",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "name",
//       "outputs": [
//         {
//           "internalType": "string",
//           "name": "",
//           "type": "string"
//         }
//       ],
//       "stateMutability": "pure",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "owner",
//           "type": "address"
//         }
//       ],
//       "name": "nonces",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "owner",
//           "type": "address"
//         },
//         {
//           "internalType": "address",
//           "name": "spender",
//           "type": "address"
//         },
//         {
//           "internalType": "uint256",
//           "name": "value",
//           "type": "uint256"
//         },
//         {
//           "internalType": "uint256",
//           "name": "deadline",
//           "type": "uint256"
//         },
//         {
//           "internalType": "uint8",
//           "name": "v",
//           "type": "uint8"
//         },
//         {
//           "internalType": "bytes32",
//           "name": "r",
//           "type": "bytes32"
//         },
//         {
//           "internalType": "bytes32",
//           "name": "s",
//           "type": "bytes32"
//         }
//       ],
//       "name": "permit",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "price0CumulativeLast",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "price1CumulativeLast",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         }
//       ],
//       "name": "skim",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "uint256",
//           "name": "amount0Out",
//           "type": "uint256"
//         },
//         {
//           "internalType": "uint256",
//           "name": "amount1Out",
//           "type": "uint256"
//         },
//         {
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         },
//         {
//           "internalType": "bytes",
//           "name": "data",
//           "type": "bytes"
//         }
//       ],
//       "name": "swap",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "symbol",
//       "outputs": [
//         {
//           "internalType": "string",
//           "name": "",
//           "type": "string"
//         }
//       ],
//       "stateMutability": "pure",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "sync",
//       "outputs": [],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "token0",
//       "outputs": [
//         {
//           "internalType": "address",
//           "name": "",
//           "type": "address"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "token1",
//       "outputs": [
//         {
//           "internalType": "address",
//           "name": "",
//           "type": "address"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "totalSupply",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         },
//         {
//           "internalType": "uint256",
//           "name": "value",
//           "type": "uint256"
//         }
//       ],
//       "name": "transfer",
//       "outputs": [
//         {
//           "internalType": "bool",
//           "name": "",
//           "type": "bool"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "from",
//           "type": "address"
//         },
//         {
//           "internalType": "address",
//           "name": "to",
//           "type": "address"
//         },
//         {
//           "internalType": "uint256",
//           "name": "value",
//           "type": "uint256"
//         }
//       ],
//       "name": "transferFrom",
//       "outputs": [
//         {
//           "internalType": "bool",
//           "name": "",
//           "type": "bool"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     }
//   ]




//   describe('Uniswap', () => {
//     let Weth, weth, Facotry, factory, Router, router, Token, token, Dai, dai, Oracle, oracle, pairAddress, pair, owner, addr1;

//     const provider = new MockProvider({
//         hardfork: 'istanbul',
//         mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
//         gasLimit: 9999999
//       })

//     beforeEach(async () => {
//         [owner, addr1, _] = await ethers.getSigners();

//         Weth = await ethers.getContractFactory('WETH9');
//         weth = await Weth.deploy();
    
//         Factory = await ethers.getContractFactory('UniswapV2Factory');
//         factory = await Factory.deploy( owner.address ); 
    
//         Router = await ethers.getContractFactory('UniswapV2Router02');
//         router = await Router.deploy( factory.address, weth.address );
    
//         Token = await ethers.getContractFactory('TestToken');
//         token = await Token.deploy();
    
//         Dai = await ethers.getContractFactory('DAI');
//         dai = await Dai.deploy(99);      
//         await dai.mint(owner.address, 10000000);
//         await dai.mint(addr1.address, 10000000);

//         Oracle = await ethers.getContractFactory('ExampleSlidingWindowOracle');
//         oracle = await Oracle.deploy(factory.address, 24, 2);
    
//         await factory.createPair(token.address, dai.address);
        
//         pairAddress = await factory.getPair(dai.address, token.address);
//         pair = new Contract(pairAddress, PairABI, provider).connect(owner);
        
//     });
    
//     describe('Testing', () => {
//         it('Should give balances to users', async () => {
//             console.log((await dai.balanceOf(owner.address)).toString());
//             console.log((await token.balanceOf(owner.address)).toString());

//         });

//         it('Should get the pair', async () => {
            
//             // Still not working, does not pair as contract
//             await router.addLiquidity(dai.address, token.address, 2000, 2000, 0, 0, owner.address, 9999999999);

//             console.log(pair);            
//             console.log(await pair.token1());       
//             console.log(await pair.token0()); 
//             console.log(token.address);
//             console.log(dai.address);  
            
//             console.log((await pair.getReserves()).toString());

//             console.log(await pair.factory());

//             console.log(await router.factory());

//             //await router.addLiquidity(dai.address, token.address, 2000, 2000, 0, 0, owner.address, 9999999999);

//             //await oracle.update(token.address, dai.address);
//             //await dai.transfer(pairAddress, 1001);
//             //await token.transfer(pairAddress, 1001);    

//             //await pair.mint(owner.address);
            
//             //console.log('Account balance: ' + (await pair.balanceOf(owner.address)).toString());

//             //await dai.connect(addr1).transfer(pairAddress, 10000);
//             //wait token.connect(addr1).transfer(pairAddress, 10000);

//             //await pair.connect(addr1).mint(addr1.address);

//             //console.log('Account balance: ' + (await pair.balanceOf(addr1.address)).toString());

//             //await pair.connect(addr1).burn(addr1.address);
//         });

//     });

//   });