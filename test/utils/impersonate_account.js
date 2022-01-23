const { network } = require("hardhat");

module.exports = async (address) => {
    return network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
    });
};
