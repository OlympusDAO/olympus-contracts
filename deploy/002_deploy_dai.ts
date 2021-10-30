import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts, initialMint } from "../constants";
import { DAI } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    // Deploy DAI
    const dai = await deploy(Contracts.DAI, {
        from: deployer.address,
        args: [0],
    });
    const daiContract = await hre.ethers.getContractAt<DAI>(Contracts.DAI, dai.address, deployer);
    // Deploy 10,000,000 mock DAI and mock Frax
    await daiContract.mint(deployer.address, initialMint);
};

export default func;
func.tags = [Contracts.DAI];
