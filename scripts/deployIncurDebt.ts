import { ethers } from "hardhat";
import { IncurDebt__factory } from "../types/factories/IncurDebt__factory";
import { CurveStrategy__factory } from "../types/factories/CurveStrategy__factory";
import { UniSwapStrategy__factory } from "../types/factories/UniSwapStrategy__factory";
import { BalancerStrategy__factory } from "../types";

async function main() {
    // Mainnet
    const ohm = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
    const treasury = "0x9A315BdF513367C0377FB36545857d12e85813Ef";
    const sohm = "0x04906695D6D12CF5459975d7C3C03356E4Ccd460";
    const gohm = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
    const staking = "0xB63cac384247597756545b500253ff8E607a8020";
    const authority = "0x1c21f8ea7e39e2ba00bc12d2968d63f4acb38b7a";
    const curvePoolFactory = "0xB9fC157394Af804a3578134A6585C0dc9cc990d4";
    const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const uniswapFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const sushiRouter = "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f";
    const sushiFactory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
    const balancerVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

    // Testnet
    // const ohm = "0x10b27a31AA4d7544F89898ccAf3Faf776F5671C4"
    // const treasury = "0x0b28Da6b497c984ed48b0d69f1DF4010071fC78e"
    // const sohm = "0xebED323CEbe4FfF65F7D7612Ea04313F718E5A75"
    // const gohm = "0xcF2D6893A1CB459fD6B48dC9C41c6110B968611E"
    // const staking = "0x06984c3A9EB8e3A8df02A4C09770D5886185792D"
    // const authority = "0x4208befd8f546282ab43a30085774513227b656c"
    // const curvePoolFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    // const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    // const uniswapFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    // const sushiRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    // const sushiFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

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
