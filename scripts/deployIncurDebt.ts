import { ethers } from "hardhat";
import { IncurDebt__factory } from "../types/factories/IncurDebt__factory";
import { CurveStrategy__factory } from "../types/factories/CurveStrategy__factory";
import { UniSwapStrategy__factory } from "../types/factories/UniSwapStrategy__factory";
import { BalancerStrategy__factory } from "../types";

async function main() {
    // Mainnet
    // const ohm = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
    // const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
    // const sohm = "0x04906695D6D12CF5459975d7C3C03356E4Ccd460";
    // const gohm = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
    // const staking = "0xB63cac384247597756545b500253ff8E607a8020";
    // const authority = "0x1c21f8ea7e39e2ba00bc12d2968d63f4acb38b7a";
    // const curvePoolFactory = "0xB9fC157394Af804a3578134A6585C0dc9cc990d4";
    // const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    // const uniswapFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    // const sushiRouter = "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f";
    // const sushiFactory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
    // const balancerVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

    // Testnet
    const ohm = "0x0595328847AF962F951a4f8F8eE9A3Bf261e4f6b";
    const treasury = "0xB3e1dF7951a62fFb5eF7D3b1C9D80CF09325580A";
    const sohm = "0x4EFe119F4949319f2Acb12efD615a7B63896482B";
    const gohm = "0xC1863141dc1861122d5410fB5973951c82871d98";
    const staking = "0x7263372b9ff6E619d8774aEB046cE313677E2Ec7";
    const authority = "0x4A8c9502A34962a2C6d73c5D181dAaeF3dcDc88D";
    const curvePoolFactory = "0x4d22B8446e68eD3BB425CFb35e2aBC2ddc24ae77"; // random curve pool (not sure if legit)
    const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const uniswapFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const sushiFactory = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    const balancerVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

    const incurDebtFactory = (await ethers.getContractFactory("IncurDebt")) as IncurDebt__factory;
    const incurDebt = await incurDebtFactory.deploy(ohm, gohm, sohm, staking, treasury, authority);
    console.log("INCURDEBT DEPLOYED AT", incurDebt.address);

    const curveStrategyFactory = (await ethers.getContractFactory(
        "CurveStrategy"
    )) as CurveStrategy__factory;
    const curveStrategy = await curveStrategyFactory.deploy(
        curvePoolFactory,
        ohm,
        incurDebt.address
    );
    console.log("CURVE STRATEGY DEPLOYED AT", curveStrategy.address);

    const uniswapStrategyFactory = (await ethers.getContractFactory(
        "UniSwapStrategy"
    )) as UniSwapStrategy__factory;
    const uniswapStrategy = await uniswapStrategyFactory.deploy(
        uniswapRouter,
        uniswapFactory,
        incurDebt.address,
        ohm
    );
    console.log("UNISWAP STRATEGY DEPLOYED AT", uniswapStrategy.address);

    const sushiStrategyFactory = (await ethers.getContractFactory(
        "UniSwapStrategy"
    )) as UniSwapStrategy__factory;
    const sushiStrategy = await sushiStrategyFactory.deploy(
        sushiRouter,
        sushiFactory,
        incurDebt.address,
        ohm
    );
    console.log("SUSHI STRATEGY DEPLOYED AT", sushiStrategy.address);

    const balancerStrategyFactory = (await ethers.getContractFactory(
        "BalancerStrategy"
    )) as BalancerStrategy__factory;
    const BalancerStrategy = await balancerStrategyFactory.deploy(
        balancerVault,
        incurDebt.address,
        ohm
    );
    console.log("BALACER STRATEGY DEPLOYED AT", BalancerStrategy.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
