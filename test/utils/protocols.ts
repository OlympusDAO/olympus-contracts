// our imports
import { coins } from "./coins";

// alchemix
const alchemix = {
    alcx: coins.alcx,
    talcx_staking: "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa",
};

// tokemak
const tokemak = {
    core: {
        defi: "0xc803737D3E12CC4034Dde0B2457684322100Ac38",
        manager: "0xA86e412109f77c45a3BC1c5870b880492Fb86A14",
        staking: "0x96F98Ed74639689C3A11daf38ef86E59F43417D3",
        rewards: "0x79dD22579112d8a5F7347c5ED7E609e60da713C5",
        coordinator: "0x90b6C61B102eA260131aB48377E143D6EB3A9d4B",
        treasury: "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B",
        rewardHash: "0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6",
        coreVoteL1: "0xc6807BB6F498337e0DC388D6507666aF7566E0BB",
        ldVoteL1: "0x43094eD6D6d214e43C31C38dA91231D2296Ca511",
        registry: "0x28cB0DE9c70ba1B5116Df57D0c421770B5f44D45",
    },
    reactors: {
        weth: "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36",
        usdc: "0x04bDA0CF6Ad025948Af830E75228ED420b0e860d",
        toke: "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930",
        uniLp: "0x1b429e75369ea5cd84421c1cc182cee5f3192fd3",
        sushiLp: "0x8858A739eA1dd3D80FE577EF4e0D03E88561FaA3",
        fxs: "0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655",
        frax: "0x94671A3ceE8C7A12Ea72602978D1Bb84E920eFB2",
        dai: "0x0CE34F4c26bA69158BC2eB8Bf513221e44FDfB75",
        susd: "0x8d2254f3AE37201EFe9Dfd9131924FE0bDd97832",
        lusd: "0x9eEe9eE0CBD35014e12E1283d9388a40f69797A3",
        ust: "0x482258099De8De2d0bda84215864800EA7e6B03D",
        fei: "0x03DccCd17CC36eE61f9004BCfD7a85F58B2D360D",
        snx: "0xeff721Eae19885e17f5B80187d6527aad3fFc8DE",
        mim: "0x2e9F9bECF5229379825D0D3C1299759943BD4fED",
        alusd: "0x7211508D283353e77b9A7ed2f22334C219AD4b4C",
        gohm: "0x41f6a95Bacf9bC43704c4A4902BA5473A8B00263",
        talcx: "0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84",
    },
};

// rari
const rari = {
    fuse: {
        directory: "0x835482FE0532f169024d5E9410199369aAD5C77E",
        primaryLens: "0x6Dc585Ad66A10214Ef0502492B0CC02F0e836eec",
        tribeRewards: "0x73F16f0c0Cd1A078A54894974C5C054D8dC1A3d7",
    },
};

// export
export const protocols = { alchemix, tokemak, rari };
