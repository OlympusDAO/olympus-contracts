"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardhatStateManager = void 0;
const state_1 = require("@ethereumjs/vm/dist/state");
const ethereumjs_util_1 = require("ethereumjs-util");
const immutable_1 = require("immutable");
const errors_1 = require("../../core/providers/errors");
const AccountState_1 = require("./fork/AccountState");
const random_1 = require("./fork/random");
const makeAccount_1 = require("./utils/makeAccount");
const encodeStorageKey = (address, position) => {
    return `${address.toString("hex")}${ethereumjs_util_1.unpadBuffer(position).toString("hex")}`;
};
const checkpointedError = (method) => new Error(`${method} called when checkpointed`);
const notCheckpointedError = (method) => new Error(`${method} called when not checkpointed`);
const notSupportedError = (method) => new Error(`${method} is not supported when forking from remote network`);
class HardhatStateManager {
    constructor() {
        this._state = immutable_1.Map();
        this._initialStateRoot = random_1.randomHash();
        this._stateRoot = this._initialStateRoot;
        this._stateRootToState = new Map();
        this._originalStorageCache = new Map();
        this._stateCheckpoints = [];
        this._contextChanged = false;
        // used by the DefaultStateManager calls
        this._accessedStorage = [new Map()];
        this._accessedStorageReverted = [
            new Map(),
        ];
        this._state = immutable_1.Map();
        this._stateRootToState.set(this._initialStateRoot, this._state);
    }
    async initializeGenesisAccounts(genesisAccounts) {
        for (const ga of genesisAccounts) {
            const { address, account } = makeAccount_1.makeAccount(ga);
            this._putAccount(address, account);
        }
        this._stateRootToState.set(this._initialStateRoot, this._state);
    }
    copy() {
        const hsm = new HardhatStateManager();
        hsm._state = this._state;
        hsm._stateRoot = this._stateRoot;
        // because this map is append-only we don't need to copy it
        hsm._stateRootToState = this._stateRootToState;
        return hsm;
    }
    async getAccount(address) {
        const localAccount = this._state.get(address.toString());
        const localNonce = localAccount === null || localAccount === void 0 ? void 0 : localAccount.get("nonce");
        const localBalance = localAccount === null || localAccount === void 0 ? void 0 : localAccount.get("balance");
        const localCode = localAccount === null || localAccount === void 0 ? void 0 : localAccount.get("code");
        const nonce = localNonce !== undefined ? ethereumjs_util_1.toBuffer(localNonce) : new ethereumjs_util_1.BN(0);
        const balance = localBalance !== undefined ? ethereumjs_util_1.toBuffer(localBalance) : new ethereumjs_util_1.BN(0);
        const code = localCode !== undefined ? ethereumjs_util_1.toBuffer(localCode) : ethereumjs_util_1.toBuffer([]);
        const codeHash = ethereumjs_util_1.keccak256(code);
        // We ignore stateRoot since we found that it is not used anywhere of interest to us
        return ethereumjs_util_1.Account.fromAccountData({ nonce, balance, codeHash });
    }
    async putAccount(address, account) {
        this._putAccount(address, account);
    }
    touchAccount(_address) {
        // We don't do anything here. See cleanupTouchedAccounts for explanation
    }
    async putContractCode(address, value) {
        var _a;
        const hexAddress = address.toString();
        const account = ((_a = this._state.get(hexAddress)) !== null && _a !== void 0 ? _a : AccountState_1.makeAccountState()).set("code", ethereumjs_util_1.bufferToHex(value));
        this._state = this._state.set(hexAddress, account);
    }
    async getContractCode(address) {
        var _a;
        const localCode = (_a = this._state.get(address.toString())) === null || _a === void 0 ? void 0 : _a.get("code");
        if (localCode !== undefined) {
            return ethereumjs_util_1.toBuffer(localCode);
        }
        return ethereumjs_util_1.toBuffer([]);
    }
    async getContractStorage(address, key) {
        if (key.length !== 32) {
            throw new Error("Storage key must be 32 bytes long");
        }
        const account = this._state.get(address.toString());
        const localValue = account === null || account === void 0 ? void 0 : account.get("storage").get(ethereumjs_util_1.bufferToHex(key));
        if (localValue !== undefined) {
            return ethereumjs_util_1.toBuffer(localValue);
        }
        return ethereumjs_util_1.toBuffer([]);
    }
    async putContractStorage(address, key, value) {
        var _a;
        if (key.length !== 32) {
            throw new Error("Storage key must be 32 bytes long");
        }
        if (value.length > 32) {
            throw new Error("Storage value cannot be longer than 32 bytes");
        }
        const unpaddedValue = ethereumjs_util_1.unpadBuffer(value);
        const hexAddress = address.toString();
        let account = (_a = this._state.get(hexAddress)) !== null && _a !== void 0 ? _a : AccountState_1.makeAccountState();
        const currentStorage = account.get("storage");
        let newValue;
        if (unpaddedValue.length === 0) {
            // if the value is an empty array or only zeros, the storage is deleted
            newValue = null;
        }
        else {
            newValue = ethereumjs_util_1.bufferToHex(unpaddedValue);
        }
        const newStorage = currentStorage.set(ethereumjs_util_1.bufferToHex(key), newValue);
        account = account.set("storage", newStorage);
        this._state = this._state.set(hexAddress, account);
    }
    async clearContractStorage(address) {
        var _a;
        const hexAddress = address.toString();
        let account = (_a = this._state.get(hexAddress)) !== null && _a !== void 0 ? _a : AccountState_1.makeAccountState();
        account = account
            .set("storageCleared", true)
            .set("storage", immutable_1.Map());
        this._state = this._state.set(hexAddress, account);
    }
    async checkpoint() {
        const stateRoot = await this.getStateRoot();
        this._stateCheckpoints.push(ethereumjs_util_1.bufferToHex(stateRoot));
    }
    async commit() {
        if (this._stateCheckpoints.length === 0) {
            throw notCheckpointedError("commit");
        }
        this._stateCheckpoints.pop();
    }
    async revert() {
        const checkpointedRoot = this._stateCheckpoints.pop();
        if (checkpointedRoot === undefined) {
            throw notCheckpointedError("revert");
        }
        await this.setStateRoot(ethereumjs_util_1.toBuffer(checkpointedRoot));
    }
    async getStateRoot() {
        if (this._stateRootToState.get(this._stateRoot) !== this._state) {
            this._stateRoot = random_1.randomHash();
            this._stateRootToState.set(this._stateRoot, this._state);
        }
        return ethereumjs_util_1.toBuffer(this._stateRoot);
    }
    async setStateRoot(stateRoot) {
        this._setStateRoot(stateRoot);
    }
    async dumpStorage(_address) {
        throw notSupportedError("dumpStorage");
    }
    async hasGenesisState() {
        throw notSupportedError("hasGenesisState");
    }
    async generateCanonicalGenesis() {
        throw notSupportedError("generateCanonicalGenesis");
    }
    async generateGenesis(_initState) {
        throw notSupportedError("generateGenesis");
    }
    async accountIsEmpty(address) {
        const account = await this.getAccount(address);
        // From https://eips.ethereum.org/EIPS/eip-161
        // An account is considered empty when it has no code and zero nonce and zero balance.
        return (new ethereumjs_util_1.BN(account.nonce).eqn(0) &&
            new ethereumjs_util_1.BN(account.balance).eqn(0) &&
            account.codeHash.equals(ethereumjs_util_1.KECCAK256_NULL));
    }
    async cleanupTouchedAccounts() {
        // We do not do anything here, because cleaning accounts only affects the
        // stateRoot. Since the stateRoot is fake anyway there is no need to
        // perform this operation.
    }
    restoreForkBlockContext(stateRoot) {
        if (this._stateCheckpoints.length !== 0) {
            throw checkpointedError("restoreForkBlockContext");
        }
        this._setStateRoot(stateRoot);
        if (this._contextChanged) {
            this._contextChanged = false;
        }
    }
    accountExists(_address) {
        throw new errors_1.InternalError("Hardhat Network can't fork from networks running a hardfork older than Spurious Dragon");
    }
    async deleteAccount(address) {
        this._state = this._state.delete(address.toString());
    }
    clearOriginalStorageCache() {
        this._originalStorageCache = new Map();
    }
    async getOriginalContractStorage(address, key) {
        const storageKey = encodeStorageKey(address.toBuffer(), key);
        const cachedValue = this._originalStorageCache.get(storageKey);
        if (cachedValue !== undefined) {
            return cachedValue;
        }
        const value = await this.getContractStorage(address, key);
        this._originalStorageCache.set(storageKey, value);
        return value;
    }
    // the following methods are copied verbatim from
    // DefaultStateManager
    isWarmedAddress(address) {
        return state_1.DefaultStateManager.prototype.isWarmedAddress.call(this, address);
    }
    addWarmedAddress(address) {
        return state_1.DefaultStateManager.prototype.addWarmedAddress.call(this, address);
    }
    isWarmedStorage(address, slot) {
        return state_1.DefaultStateManager.prototype.isWarmedStorage.call(this, address, slot);
    }
    addWarmedStorage(address, slot) {
        return state_1.DefaultStateManager.prototype.addWarmedStorage.call(this, address, slot);
    }
    clearWarmedAccounts() {
        return state_1.DefaultStateManager.prototype.clearWarmedAccounts.call(this);
    }
    _putAccount(address, account) {
        var _a;
        // Because the vm only ever modifies the nonce, balance and codeHash using this
        // method we ignore the stateRoot property
        const hexAddress = address.toString();
        let localAccount = (_a = this._state.get(hexAddress)) !== null && _a !== void 0 ? _a : AccountState_1.makeAccountState();
        localAccount = localAccount
            .set("nonce", ethereumjs_util_1.bufferToHex(account.nonce.toBuffer()))
            .set("balance", ethereumjs_util_1.bufferToHex(account.balance.toBuffer()));
        // Code is set to empty string here to prevent unnecessary
        // JsonRpcClient.getCode calls in getAccount method
        if (account.codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
            localAccount = localAccount.set("code", "0x");
        }
        this._state = this._state.set(hexAddress, localAccount);
    }
    _setStateRoot(stateRoot) {
        const newRoot = ethereumjs_util_1.bufferToHex(stateRoot);
        const state = this._stateRootToState.get(newRoot);
        if (state === undefined) {
            throw new Error("Unknown state root");
        }
        this._stateRoot = newRoot;
        this._state = state;
    }
}
exports.HardhatStateManager = HardhatStateManager;
//# sourceMappingURL=HardhatStateManager.js.map