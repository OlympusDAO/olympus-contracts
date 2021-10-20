require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

module.exports = {
  networks: {
    rinkeby: {
      url: process.env.NODE_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10,
        path: "m/44'/60'/0'/0",
      },
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.7.5",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          // You should disable the optimizer when debugging
          // https://hardhat.org/hardhat-network/#solidity-optimizer-support
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
    ]
  },
};
