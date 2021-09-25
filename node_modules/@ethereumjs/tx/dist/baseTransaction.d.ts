/// <reference types="bn.js" />
/// <reference types="node" />
import Common from '@ethereumjs/common';
import { Address, BN, BNLike } from 'ethereumjs-util';
import { TxData, JsonTx, AccessListEIP2930ValuesArray, AccessListEIP2930TxData, FeeMarketEIP1559ValuesArray, FeeMarketEIP1559TxData, TxValuesArray, Capability } from './types';
/**
 * This base class will likely be subject to further
 * refactoring along the introduction of additional tx types
 * on the Ethereum network.
 *
 * It is therefore not recommended to use directly.
 */
export declare abstract class BaseTransaction<TransactionObject> {
    private readonly _type;
    readonly nonce: BN;
    readonly gasLimit: BN;
    readonly to?: Address;
    readonly value: BN;
    readonly data: Buffer;
    readonly v?: BN;
    readonly r?: BN;
    readonly s?: BN;
    readonly common: Common;
    /**
     * List of tx type defining EIPs,
     * e.g. 1559 (fee market) and 2930 (access lists)
     * for FeeMarketEIP1559Transaction objects
     */
    protected activeCapabilities: number[];
    /**
     * The default chain the tx falls back to if no Common
     * is provided and if the chain can't be derived from
     * a passed in chainId (only EIP-2718 typed txs) or
     * EIP-155 signature (legacy txs).
     *
     * @hidden
     */
    protected DEFAULT_CHAIN: string;
    /**
     * The default HF if the tx type is active on that HF
     * or the first greater HF where the tx is active.
     *
     * @hidden
     */
    protected DEFAULT_HARDFORK: string;
    constructor(txData: TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData);
    /**
     * Alias for {@link BaseTransaction.type}
     *
     * @deprecated Use `type` instead
     */
    get transactionType(): number;
    /**
     * Returns the transaction type.
     *
     * Note: legacy txs will return tx type `0`.
     */
    get type(): number;
    /**
     * Checks if a tx type defining capability is active
     * on a tx, for example the EIP-1559 fee market mechanism
     * or the EIP-2930 access list feature.
     *
     * Note that this is different from the tx type itself,
     * so EIP-2930 access lists can very well be active
     * on an EIP-1559 tx for example.
     *
     * This method can be useful for feature checks if the
     * tx type is unknown (e.g. when instantiated with
     * the tx factory).
     *
     * See `Capabilites` in the `types` module for a reference
     * on all supported capabilities.
     */
    supports(capability: Capability): boolean;
    /**
     * Checks if the transaction has the minimum amount of gas required
     * (DataFee + TxFee + Creation Fee).
     */
    validate(): boolean;
    validate(stringError: false): boolean;
    validate(stringError: true): string[];
    /**
     * The minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
     */
    getBaseFee(): BN;
    /**
     * The amount of gas paid for the data in this tx
     */
    getDataFee(): BN;
    /**
     * The up front amount that an account must have for this transaction to be valid
     */
    abstract getUpfrontCost(): BN;
    /**
     * If the tx's `to` is to the creation address
     */
    toCreationAddress(): boolean;
    /**
     * Returns a Buffer Array of the raw Buffers of this transaction, in order.
     */
    abstract raw(): TxValuesArray | AccessListEIP2930ValuesArray | FeeMarketEIP1559ValuesArray;
    /**
     * Returns the encoding of the transaction.
     */
    abstract serialize(): Buffer;
    abstract getMessageToSign(hashMessage: false): Buffer | Buffer[];
    abstract getMessageToSign(hashMessage?: true): Buffer;
    abstract hash(): Buffer;
    abstract getMessageToVerifySignature(): Buffer;
    isSigned(): boolean;
    /**
     * Determines if the signature is valid
     */
    verifySignature(): boolean;
    /**
     * Returns the sender's address
     */
    getSenderAddress(): Address;
    /**
     * Returns the public key of the sender
     */
    abstract getSenderPublicKey(): Buffer;
    /**
     * Signs a transaction.
     *
     * Note that the signed tx is returned as a new object,
     * use as follows:
     * ```javascript
     * const signedTx = tx.sign(privateKey)
     * ```
     */
    sign(privateKey: Buffer): TransactionObject;
    /**
     * Returns an object with the JSON representation of the transaction
     */
    abstract toJSON(): JsonTx;
    protected abstract _processSignature(v: number, r: Buffer, s: Buffer): TransactionObject;
    /**
     * Does chain ID checks on common and returns a common
     * to be used on instantiation
     * @hidden
     *
     * @param common - {@link Common} instance from tx options
     * @param chainId - Chain ID from tx options (typed txs) or signature (legacy tx)
     */
    protected _getCommon(common?: Common, chainId?: BNLike): Common;
    protected _validateCannotExceedMaxInteger(values: {
        [key: string]: BN | undefined;
    }, bits?: number): void;
}
