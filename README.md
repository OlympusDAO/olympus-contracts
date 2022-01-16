# Ω Olympus Smart Contracts

##  🔧 Setting up local development

Requirements:
- [Node v14](https://nodejs.org/download/release/latest-v14.x/)  
- [Git](https://git-scm.com/downloads)


Local Setup Steps:
1. ``git clone https://github.com/OlympusDAO/olympus-contracts.git ``
1. Install dependencies: `npm install` 
    - Installs [Hardhat](https://hardhat.org/getting-started/) and [OpenZepplin](https://docs.openzeppelin.com/contracts/4.x/) dependencies
1. Compile Solidity: ``npm run compile``
1. **_TODO_**: How to do local deployments of the contracts


## 🤨 How it all works
![High Level Contract Interactions](./docs/box-diagram.png)

## Contract addresses

### Mainnet
#### Core
- OHM V2: `0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5`
- sOHM V2: `0x04906695D6D12CF5459975d7C3C03356E4Ccd460`
- gOHM: `0x0ab87046fBb341D058F17CBC4c1133F25a20a52f` 
- Treasury V2: `0x9A315BdF513367C0377FB36545857d12e85813Ef`
- Staking: `0xB63cac384247597756545b500253ff8E607a8020` 
- Distributor: `0xeeeb97A127a342656191E0313DF33D58D06B2E05` 
- BondDepositoryV2: `0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6`
- Authority: `0x1c21F8EA7e39E2BA00BC12d2968D63F4acb38b7A`

#### Multisigs:
- DAO: `0x245cc372C84B3645Bf0Ffe6538620B04a217988B`
- Policy: `0x0cf30dc0d48604A301dF8010cdc028C055336b2E`

### Testnet addresses

Network: `Rinkeby`
- OHM: `0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932`
- DAI: `0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C` 
- Frax: `0x2F7249cb599139e560f0c81c269Ab9b04799E453`
- Treasury: `0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7`
- OHM/DAI Pair: `0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2`
- OHM/Frax Pair: `0x11BE404d7853BDE29A3e73237c952EcDCbBA031E`
- Calc: `0xaDBE4FA3c2fcf36412D618AfCfC519C869400CEB` 
- Staking: `0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2` 
- sOHM: `0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084` 
- Distributor `0x0626D5aD2a230E05Fb94DF035Abbd97F2f839C3a` 
- Staking Warmup `0x43B18Ad2624DBEf474aA8E0c8d8404a0A42b7aC4` 
- Staking Helper `0xf73f23Bb0edCf4719b12ccEa8638355BF33604A1`


## Allocator Guide

The following is a guide for interacting with the treasury as a reserve allocator.

A reserve allocator is a contract that deploys funds into external strategies, such as Aave, Curve, etc.

Treasury Address: `0x31F8Cc382c9898b273eff4e0b7626a6987C846E8`

### Managing
The first step is withdraw funds from the treasury via the "manage" function. "Manage" allows an approved address to withdraw excess reserves from the treasury.

**NOTE**: This contract must have the "reserve manager" permission, and that withdrawn reserves decrease the treasury's ability to mint new OHM (since backing has been removed).

Pass in the token address and the amount to manage. The token will be sent to the contract calling the function.

```
function manage( address _token, uint _amount ) external;
```

Managing treasury assets should look something like this:
```
treasury.manage( DAI, amountToManage );
```

### Returning
The second step is to return funds after the strategy has been closed.
We utilize the `deposit` function to do this. Deposit allows an approved contract to deposit reserve assets into the treasury, and mint OHM against them. In this case however, we will NOT mint any OHM. This will be explained shortly.

**NOTE**: The contract must have the "reserve depositor" permission, and that deposited reserves increase the treasury's ability to mint new OHM (since backing has been added).


Pass in the address sending the funds (most likely the allocator contract), the amount to deposit, and the address of the token. The final parameter, profit, dictates how much OHM to send. send_, the amount of OHM to send, equals the value of amount minus profit.
```
function deposit( address _from, uint _amount, address _token, uint _profit ) external returns ( uint send_ );
```

To ensure no OHM is minted, we first get the value of the asset, and pass that in as profit.
Pass in the token address and amount to get the treasury value.
```
function valueOf( address _token, uint _amount ) public view returns ( uint value_ );
```

All together, returning funds should look something like this:
```
treasury.deposit( address(this), amountToReturn, DAI, treasury.valueOf( DAI, amountToReturn ) );
```

## Dapptools testing

1. Install dapptools (see [here](https://github.com/dapphub/dapptools))
2. Pull the contract dependencies: ``git submodule update --init --recursive``
2. Run ``dapp test``

