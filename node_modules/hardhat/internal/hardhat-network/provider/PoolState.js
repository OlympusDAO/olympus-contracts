"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePoolState = exports.makeSerializedTransaction = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const immutable_1 = require("immutable");
const bnToHex_1 = require("./utils/bnToHex");
exports.makeSerializedTransaction = immutable_1.Record({
    orderId: 0,
    fakeFrom: undefined,
    data: "",
    txType: 0,
});
exports.makePoolState = immutable_1.Record({
    pendingTransactions: immutable_1.Map(),
    queuedTransactions: immutable_1.Map(),
    hashToTransaction: immutable_1.Map(),
    blockGasLimit: bnToHex_1.bnToHex(new ethereumjs_util_1.BN(9500000)),
});
//# sourceMappingURL=PoolState.js.map