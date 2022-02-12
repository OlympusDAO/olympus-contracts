require("@nomiclabs/hardhat-waffle");
let secret = require("./secret")

module.exports = {
  solidity: "0.7.5",
  networks: {
    fantom: {
      url: secret.url,
      accounts: [secret.key]
    }
  }
};
