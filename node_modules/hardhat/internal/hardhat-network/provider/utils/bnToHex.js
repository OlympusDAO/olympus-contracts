"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bnToHex = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
function bnToHex(bn) {
    return ethereumjs_util_1.bufferToHex(ethereumjs_util_1.toBuffer(bn));
}
exports.bnToHex = bnToHex;
//# sourceMappingURL=bnToHex.js.map