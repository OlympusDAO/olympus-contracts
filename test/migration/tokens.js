const DAI_ADDRESS = process.env.DAI;
const FRAX_ADDRESS = process.env.FRAX;
const WETH_ADDRESS = process.env.WETH;
const LUSD_ADDRESS = process.env.LUSD;
const OLD_WSOHM_ADDRESS = process.env.OLD_WSOHM_ADDRESS;
const OLD_SOHM_ADDRESS = process.env.OLD_SOHM_ADDRESS;
const OLD_OHM_ADDRESS = process.env.OLD_OHM_ADDRESS;
const OHM_DAI_LP = process.env.OHM_DAI_LP;
const OHM_FRAX_LP = process.env.OHM_FRAX_LP;
const OHM_LUSD_LP = process.env.OHM_LUSD_LP;
const UNI_FACTORY = process.env.UNI_FACTORY;
const SUSHI_FACTORY = process.env.SUSHI_FACTORY;

// TODO(zx): Simulate wallets with assets
const OHM_USER = process.env.OLD_OHM_HOLDER;
const SOHM_USER = process.env.OLD_SOHM_HOLDER;
const WSOHM_USER = process.env.OLD_WSOHM_HOLDER;
// TODO(zx): Simulate wallets with assets

const dai_abi = require("../../abis/dai");
const frax_abi = require("../../abis/frax");
const weth_abi = require("../../abis/weth");
const lusd_abi = require("../../abis/lusd");
const wsohm_abi = require("../../abis/wsohm");
const sohm_abi = require("../../abis/sohm");
const ohm_abi = require("../../abis/ohm");
const ohm_dai_lp_abi = require("../../abis/ohm_dai_lp");
const ohm_frax_lp_abi = require("../../abis/ohm_frax_lp");
const ohm_lusd_lp_abi = require("../../abis/ohm_lusd_lp");
const uni = require("../../abis/uni_factory");
const sushi = require("../../abis/sushi_factory");

const treasury_tokens = [
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
    {
        name: "dai",
        address: DAI_ADDRESS,
        abi: dai_abi,
        isReserve: true,
    },
];

const olympus_tokens = [
    {
        name: "wsohm",
        address: OLD_WSOHM_ADDRESS,
        abi: wsohm_abi,
        migrationType: 2, // WRAPPED
        wallet: WSOHM_USER,
    },
    {
        name: "sohm",
        address: OLD_SOHM_ADDRESS,
        abi: sohm_abi,
        migrationType: 1, // STAKED
        wallet: SOHM_USER,
    },
    {
        name: "ohm",
        address: OLD_OHM_ADDRESS,
        abi: ohm_abi,
        migrationType: 0, // UNSTAKED
        wallet: OHM_USER,
    },
];

const olympus_lp_tokens = [
    {
        name: "ohm_frax",
        address: OHM_FRAX_LP,
        token0: FRAX_ADDRESS,
        token1: OLD_OHM_ADDRESS,
        is_sushi: false,
        abi: ohm_frax_lp_abi,
    },
    {
        name: "ohm_lusd",
        address: OHM_LUSD_LP,
        token0: LUSD_ADDRESS,
        token1: OLD_OHM_ADDRESS,
        is_sushi: true,
        abi: ohm_lusd_lp_abi,
    },
    {
        name: "ohm_dai",
        address: OHM_DAI_LP,
        token0: DAI_ADDRESS,
        token1: OLD_OHM_ADDRESS,
        is_sushi: true,
        abi: ohm_dai_lp_abi,
    },
];

const swaps = [
    {
        name: "uni",
        address: UNI_FACTORY,
        abi: uni,
    },
    {
        name: "sushi",
        address: SUSHI_FACTORY,
        abi: sushi,
    },
];

module.exports = { treasury_tokens, olympus_tokens, olympus_lp_tokens, swaps };
