require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");

module.exports = {
  solidity: "0.7.5",
  namedAccounts: {
    deployer: {
      default: 0,
      // TODO: Fantom testnet and mainnet
    },
  },
  protocolParameters: {
    '250': {
      epochLength: 28800, // seconds
    },
    '4002': {
      epochLength: 28800, // seconds
    },
    '31337': {
      epochLength: 28800, // seconds
    },
  },
  contractAddresses: {
    '250': {
      // TODO: This is our multi-sig (for now).
      dao: '0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8',
      frax: '0xaf319E5789945197e365E7f7fbFc56B130523B33',
      wrappedToken: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
      ftmPriceFeed: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
    '4002': {
      dao: '0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8',
      ftmPriceFeed: '0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D',
    },
    '31337': {
      dao: '0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8',
      ftmPriceFeed: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
    zero: '0x0000000000000000000000000000000000000000',
  },
};
