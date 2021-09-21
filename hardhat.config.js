require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.5",
        metadata: {
          bytecodeHash: "none",
        },
      },
      {
        version: "0.8.4",
        metadata: {
          bytecodeHash: "none",
        },
      }
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"]
        }
      }
    }
  }
};
