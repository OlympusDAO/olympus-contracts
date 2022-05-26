import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const stakingDeployment = await deployments.get(CONTRACTS.stakingV1);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);

    await deploy(CONTRACTS.stakingV1Helper, {
        from: deployer,
        args: [stakingDeployment.address, ohmDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.stakingV1Helper, "staking"];
func.dependencies = [CONTRACTS.stakingV1, CONTRACTS.testnetOHMv1];

export default func;
