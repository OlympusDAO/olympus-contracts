# 👷 Hardhat Testing Guide

## General Guidelines
- We write our tests preferably in Typescript using Typechain for Type Inference.
- We test against forked Mainnet state. It is preferable to pin a block but you can choose to fork against latest.
- We use the Smock library for faking contracts or making mock contracts as necessary.

## Testing Tips 
- Preferably isolate state for each test.
- Test functionally, use smocks to fake other contract state and easily test the function you require.
- Cover 100% of your code.

## Commands

```sh
# To test all contracts 
yarn test

# above will collapse to
yarn hardhat test

# Test a specific file
yarn test test/<your directory>/<your file name>
```

To get traces while testing, which may be required if traces are not being printed, enter [hardhat.config.ts](../../hardhat.config.ts), then find `networks` and change it to (but **don't commit this!**):

```ts
// lines 50 - 61
networks: {
    hardhat: {
        forking: {
            url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
        },
        chainId: chainIds.hardhat,
    },
    loggingEnabled: true // <--------------- this part here is what we add
    // Uncomment for testing. Commented due to CI issues
    // mainnet: getChainConfig("mainnet"),
    // rinkeby: getChainConfig("rinkeby"),
    // ropsten: getChainConfig("ropsten"),
},
```