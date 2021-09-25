"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpcTransactionRequest = void 0;
const t = __importStar(require("io-ts"));
const io_ts_1 = require("../../../../util/io-ts");
const access_list_1 = require("../access-list");
const base_types_1 = require("../base-types");
// Type used by eth_sendTransaction
exports.rpcTransactionRequest = t.type({
    from: base_types_1.rpcAddress,
    to: io_ts_1.optionalOrNullable(base_types_1.rpcAddress),
    gas: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
    gasPrice: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
    value: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
    nonce: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
    data: io_ts_1.optionalOrNullable(base_types_1.rpcData),
    accessList: io_ts_1.optionalOrNullable(access_list_1.rpcAccessList),
    chainId: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
    maxFeePerGas: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
    maxPriorityFeePerGas: io_ts_1.optionalOrNullable(base_types_1.rpcQuantity),
}, "RpcTransactionRequest");
//# sourceMappingURL=transactionRequest.js.map