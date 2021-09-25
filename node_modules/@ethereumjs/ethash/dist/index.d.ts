/// <reference types="node" />
import type { LevelUp } from 'levelup';
import type { Block, BlockHeader } from '@ethereumjs/block';
export default class Ethash {
    dbOpts: Object;
    cacheDB?: LevelUp;
    cache: Buffer[];
    epoc?: number;
    fullSize?: number;
    cacheSize?: number;
    seed?: Buffer;
    constructor(cacheDB?: LevelUp);
    mkcache(cacheSize: number, seed: Buffer): Buffer[];
    calcDatasetItem(i: number): Buffer;
    run(val: Buffer, nonce: Buffer, fullSize?: number): {
        mix: Buffer;
        hash: Buffer;
    };
    cacheHash(): Buffer;
    headerHash(rawHeader: Buffer[]): Buffer;
    /**
     * Loads the seed and cache given a block number.
     */
    loadEpoc(number: number): Promise<void>;
    _verifyPOW(header: BlockHeader): Promise<boolean>;
    verifyPOW(block: Block): Promise<boolean>;
}
