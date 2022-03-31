export enum AllocatorStatus {
    OFFLINE = 0,
    ACTIVATED = 1,
    MIGRATING = 2,
}

export interface AllocatorInitData {
    authority: string;
    extender: string;
    tokens: string[];
}

export const allocators = {
    AaveAllocatorV2: "0x0D33c811D0fcC711BcB388DFB3a152DE445bE66F",
    AlchemixAllocatorV2: "0x51563d61f8a5869B24EDdFb2705308Bae539BF56",
    LUSDAllocatorV2: "0x97b3Ef4C558Ec456D59Cb95c65BFB79046E31fCA",
    BTRFLYAllocatorV2: "0xC8431fEb345B46c30A4576c1b5faF080fdc54e2f",
    FXSAllocatorV2: "0x0f953D861347414698F34B75dbFd6e7dF1A73493",
    RariFuseAllocator: "0x061c8610a784b8a1599de5b1157631e35180d818",
    CVXAllocatorV2: "0x88de0a7E6fEe94131FFA6E52ce5a90b61F7E9584",
};
