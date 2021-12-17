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
  contractAddresses: {
    '250': {
      frax: '0xaf319E5789945197e365E7f7fbFc56B130523B33',
    },
    zero: '0x0000000000000000000000000000000000000000',
  },
};
