"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSolcOutputSelection = exports.defaultMochaOptions = exports.defaultHttpNetworkParams = exports.defaultHardhatNetworkParams = exports.DEFAULT_GAS_MULTIPLIER = exports.defaultHardhatNetworkHdAccountsConfigParams = exports.defaultHdAccountsConfigParams = exports.defaultLocalhostNetworkParams = exports.defaultDefaultNetwork = exports.DEFAULT_HARDHAT_NETWORK_BALANCE = exports.HARDHAT_NETWORK_DEFAULT_INITIAL_BASE_FEE_PER_GAS = exports.HARDHAT_NETWORK_DEFAULT_MAX_PRIORITY_FEE_PER_GAS = exports.HARDHAT_NETWORK_DEFAULT_GAS_PRICE = exports.DEFAULT_SOLC_VERSION = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const constants_1 = require("../../constants");
exports.DEFAULT_SOLC_VERSION = "0.7.3";
exports.HARDHAT_NETWORK_DEFAULT_GAS_PRICE = "auto";
exports.HARDHAT_NETWORK_DEFAULT_MAX_PRIORITY_FEE_PER_GAS = 1e9;
exports.HARDHAT_NETWORK_DEFAULT_INITIAL_BASE_FEE_PER_GAS = 1e9;
const HARDHAT_NETWORK_MNEMONIC = "test test test test test test test test test test test junk";
exports.DEFAULT_HARDHAT_NETWORK_BALANCE = "10000000000000000000000";
exports.defaultDefaultNetwork = constants_1.HARDHAT_NETWORK_NAME;
exports.defaultLocalhostNetworkParams = {
    url: "http://127.0.0.1:8545",
};
exports.defaultHdAccountsConfigParams = {
    initialIndex: 0,
    count: 20,
    path: "m/44'/60'/0'/0",
};
exports.defaultHardhatNetworkHdAccountsConfigParams = Object.assign(Object.assign({}, exports.defaultHdAccountsConfigParams), { mnemonic: HARDHAT_NETWORK_MNEMONIC, accountsBalance: exports.DEFAULT_HARDHAT_NETWORK_BALANCE });
exports.DEFAULT_GAS_MULTIPLIER = 1;
exports.defaultHardhatNetworkParams = {
    hardfork: "london",
    blockGasLimit: 30000000,
    gasPrice: exports.HARDHAT_NETWORK_DEFAULT_GAS_PRICE,
    chainId: 31337,
    throwOnTransactionFailures: true,
    throwOnCallFailures: true,
    allowUnlimitedContractSize: false,
    mining: { auto: true, interval: 0 },
    accounts: exports.defaultHardhatNetworkHdAccountsConfigParams,
    loggingEnabled: false,
    gasMultiplier: exports.DEFAULT_GAS_MULTIPLIER,
    minGasPrice: new ethereumjs_util_1.BN(0),
};
exports.defaultHttpNetworkParams = {
    accounts: "remote",
    gas: "auto",
    gasPrice: "auto",
    gasMultiplier: exports.DEFAULT_GAS_MULTIPLIER,
    httpHeaders: {},
    timeout: 20000,
};
exports.defaultMochaOptions = {
    timeout: 20000,
};
exports.defaultSolcOutputSelection = {
    "*": {
        "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "evm.methodIdentifiers",
        ],
        "": ["ast"],
    },
};
//# sourceMappingURL=default-config.js.map