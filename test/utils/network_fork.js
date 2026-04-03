const { network } = require("hardhat");

async function fork_network(blockNumber = 13377190) {
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const rpcUrl = alchemyApiKey
        ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
        : "https://ethereum-rpc.publicnode.com";

    /// Use mainnet fork as provider
    return network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: rpcUrl,
                    blockNumber: blockNumber,
                },
            },
        ],
    });
}

async function fork_reset() {
    return await network.provider.request({
        method: "hardhat_reset",
        params: [],
    });
}

async function mine_blocks(numberOfBlocks) {
    for (let i = 0; i < numberOfBlocks; i++) {
        await network.provider.send("evm_mine");
    }
}

module.exports = {
    fork_network,
    fork_reset,
    mine_blocks,
};
