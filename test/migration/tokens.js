const DAI_ADDRESS = process.env.DAI;
const FRAX_ADDRESS = process.env.FRAX;
const WETH_ADDRESS = process.env.WETH;
const LUSD_ADDRESS = process.env.LUSD;

const dai_abi = require("../../abis/dai");
const frax_abi = require("../../abis/frax");
const weth_abi = require("../../abis/weth");
const lusd_abi = require("../../abis/lusd");

const tokens = [
    {
        name: "dai",
        address: DAI_ADDRESS,
        abi: dai_abi,
        isReserve: true,
    },
    {
        name: "frax",
        address: FRAX_ADDRESS,
        abi: frax_abi,
        isReserve: true,
    },
    {
        name: "weth",
        address: WETH_ADDRESS,
        abi: weth_abi,
        isReserve: true,
    },
    {
        name: "lusd",
        address: LUSD_ADDRESS,
        abi: lusd_abi,
        isReserve: true,
    },
];

module.exports = { tokens };
