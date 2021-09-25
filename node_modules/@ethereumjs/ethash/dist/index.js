"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const util_1 = require("./util");
const xor = require('buffer-xor');
class Ethash {
    constructor(cacheDB) {
        this.dbOpts = {
            valueEncoding: 'json',
        };
        this.cacheDB = cacheDB;
        this.cache = [];
    }
    mkcache(cacheSize, seed) {
        // console.log('generating cache')
        // console.log('size: ' + cacheSize)
        // console.log('seed: ' + seed.toString('hex'))
        const n = Math.floor(cacheSize / util_1.params.HASH_BYTES);
        const o = [ethereumjs_util_1.keccak(seed, 512)];
        let i;
        for (i = 1; i < n; i++) {
            o.push(ethereumjs_util_1.keccak(o[o.length - 1], 512));
        }
        for (let _ = 0; _ < util_1.params.CACHE_ROUNDS; _++) {
            for (i = 0; i < n; i++) {
                const v = o[i].readUInt32LE(0) % n;
                o[i] = ethereumjs_util_1.keccak(xor(o[(i - 1 + n) % n], o[v]), 512);
            }
        }
        this.cache = o;
        return this.cache;
    }
    calcDatasetItem(i) {
        const n = this.cache.length;
        const r = Math.floor(util_1.params.HASH_BYTES / util_1.params.WORD_BYTES);
        let mix = Buffer.from(this.cache[i % n]);
        mix.writeInt32LE(mix.readUInt32LE(0) ^ i, 0);
        mix = ethereumjs_util_1.keccak(mix, 512);
        for (let j = 0; j < util_1.params.DATASET_PARENTS; j++) {
            const cacheIndex = util_1.fnv(i ^ j, mix.readUInt32LE((j % r) * 4));
            mix = util_1.fnvBuffer(mix, this.cache[cacheIndex % n]);
        }
        return ethereumjs_util_1.keccak(mix, 512);
    }
    run(val, nonce, fullSize) {
        if (!fullSize && this.fullSize) {
            fullSize = this.fullSize;
        }
        if (!fullSize) {
            throw new Error('fullSize needed');
        }
        const n = Math.floor(fullSize / util_1.params.HASH_BYTES);
        const w = Math.floor(util_1.params.MIX_BYTES / util_1.params.WORD_BYTES);
        const s = ethereumjs_util_1.keccak(Buffer.concat([val, util_1.bufReverse(nonce)]), 512);
        const mixhashes = Math.floor(util_1.params.MIX_BYTES / util_1.params.HASH_BYTES);
        let mix = Buffer.concat(Array(mixhashes).fill(s));
        let i;
        for (i = 0; i < util_1.params.ACCESSES; i++) {
            const p = (util_1.fnv(i ^ s.readUInt32LE(0), mix.readUInt32LE((i % w) * 4)) % Math.floor(n / mixhashes)) *
                mixhashes;
            const newdata = [];
            for (let j = 0; j < mixhashes; j++) {
                newdata.push(this.calcDatasetItem(p + j));
            }
            mix = util_1.fnvBuffer(mix, Buffer.concat(newdata));
        }
        const cmix = Buffer.alloc(mix.length / 4);
        for (i = 0; i < mix.length / 4; i = i + 4) {
            const a = util_1.fnv(mix.readUInt32LE(i * 4), mix.readUInt32LE((i + 1) * 4));
            const b = util_1.fnv(a, mix.readUInt32LE((i + 2) * 4));
            const c = util_1.fnv(b, mix.readUInt32LE((i + 3) * 4));
            cmix.writeUInt32LE(c, i);
        }
        return {
            mix: cmix,
            hash: ethereumjs_util_1.keccak256(Buffer.concat([s, cmix])),
        };
    }
    cacheHash() {
        return ethereumjs_util_1.keccak256(Buffer.concat(this.cache));
    }
    headerHash(rawHeader) {
        return ethereumjs_util_1.rlphash(rawHeader.slice(0, -2));
    }
    /**
     * Loads the seed and cache given a block number.
     */
    async loadEpoc(number) {
        const epoc = util_1.getEpoc(number);
        if (this.epoc === epoc) {
            return;
        }
        this.epoc = epoc;
        if (!this.cacheDB) {
            throw new Error('cacheDB needed');
        }
        // gives the seed the first epoc found
        const findLastSeed = async (epoc) => {
            if (epoc === 0) {
                return [ethereumjs_util_1.zeros(32), 0];
            }
            let data;
            try {
                data = await this.cacheDB.get(epoc, this.dbOpts);
            }
            catch (error) {
                if (error.type !== 'NotFoundError') {
                    throw error;
                }
            }
            if (data) {
                return [data.seed, epoc];
            }
            else {
                return findLastSeed(epoc - 1);
            }
        };
        let data;
        try {
            data = await this.cacheDB.get(epoc, this.dbOpts);
        }
        catch (error) {
            if (error.type !== 'NotFoundError') {
                throw error;
            }
        }
        if (!data) {
            this.cacheSize = util_1.getCacheSize(epoc);
            this.fullSize = util_1.getFullSize(epoc);
            const [seed, foundEpoc] = await findLastSeed(epoc);
            this.seed = util_1.getSeed(seed, foundEpoc, epoc);
            const cache = this.mkcache(this.cacheSize, this.seed);
            // store the generated cache
            await this.cacheDB.put(epoc, {
                cacheSize: this.cacheSize,
                fullSize: this.fullSize,
                seed: this.seed,
                cache: cache,
            }, this.dbOpts);
        }
        else {
            // Object.assign(this, data)
            this.cache = data.cache.map((a) => {
                return Buffer.from(a);
            });
            this.cacheSize = data.cacheSize;
            this.fullSize = data.fullSize;
            this.seed = Buffer.from(data.seed);
        }
    }
    async _verifyPOW(header) {
        const headerHash = this.headerHash(header.raw());
        const { number, difficulty, mixHash, nonce } = header;
        await this.loadEpoc(number.toNumber());
        const a = this.run(headerHash, nonce);
        const result = new ethereumjs_util_1.BN(a.hash);
        return a.mix.equals(mixHash) && ethereumjs_util_1.TWO_POW256.div(difficulty).cmp(result) === 1;
    }
    async verifyPOW(block) {
        // don't validate genesis blocks
        if (block.header.isGenesis()) {
            return true;
        }
        const valid = await this._verifyPOW(block.header);
        if (!valid) {
            return false;
        }
        for (let index = 0; index < block.uncleHeaders.length; index++) {
            const valid = await this._verifyPOW(block.uncleHeaders[index]);
            if (!valid) {
                return false;
            }
        }
        return true;
    }
}
exports.default = Ethash;
//# sourceMappingURL=index.js.map