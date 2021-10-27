import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);

    await deploy(Contracts.OHM_BONDING_CALCULATOR, {
        from: deployer.address,
        args: [ohm.address],
    });
};

export default func;
func.tags = [Contracts.OHM_BONDING_CALCULATOR];
func.dependencies = [Contracts.OHM];
