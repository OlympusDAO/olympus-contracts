import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    // Deploy DAI
    await deploy(Contracts.DAI, {
        from: deployer.address,
        args: [0],
    });
};

export default func;
func.tags = [Contracts.DAI];
