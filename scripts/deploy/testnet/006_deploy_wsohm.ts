import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const stakingDeployment = await deployments.get(CONTRACTS.stakingV1);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const sohmDeployment = await deployments.get(CONTRACTS.testnetSOHMv1);

    await deploy(CONTRACTS.wsOHM, {
        from: deployer,
        args: [stakingDeployment.address, ohmDeployment.address, sohmDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.wsOHM, "staking", "tokens"];
func.dependencies = [CONTRACTS.stakingDeployment, CONTRACTS.testnetOHMv1, CONTRACTS.testnetSOHMv1];

export default func;
