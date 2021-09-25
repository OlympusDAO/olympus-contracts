"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomAddressBuffer = exports.randomAddressString = exports.randomAddress = exports.randomHashBuffer = exports.randomHash = void 0;
exports.randomHash = () => {
    const { bufferToHex } = require("ethereumjs-util");
    return bufferToHex(exports.randomHashBuffer());
};
let next;
exports.randomHashBuffer = () => {
    const { keccakFromString, keccak256 } = require("ethereumjs-util");
    if (next === undefined) {
        next = keccakFromString("seed");
    }
    const result = next;
    next = keccak256(next);
    return result;
};
exports.randomAddress = () => {
    const { Address } = require("ethereumjs-util");
    return new Address(exports.randomAddressBuffer());
};
exports.randomAddressString = () => {
    const { bufferToHex } = require("ethereumjs-util");
    return bufferToHex(exports.randomAddressBuffer());
};
exports.randomAddressBuffer = () => exports.randomHashBuffer().slice(0, 20);
//# sourceMappingURL=random.js.map