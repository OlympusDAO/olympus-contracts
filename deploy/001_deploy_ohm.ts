import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    // Deploy OHM
    await deploy(Contracts.OHM, {
        from: deployer.address,
    });
};

export default func;
func.tags = [Contracts.OHM];
