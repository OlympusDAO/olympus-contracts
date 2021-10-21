require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.5",
      },
      {
        version: "0.5.16"
      }, 
      {
        version: "0.8.0"
      },
      {
        version: "0.8.4",
      }
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"]
        }
      }
    }
  },
};
