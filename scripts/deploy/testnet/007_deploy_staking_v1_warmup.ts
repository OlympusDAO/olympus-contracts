import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const stakingDeployment = await deployments.get(CONTRACTS.stakingV1);
    const sohmDeployment = await deployments.get(CONTRACTS.sOhmV1);

    await deploy(CONTRACTS.stakingV1Warmup, {
        from: deployer,
        args: [stakingDeployment.address, sohmDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.stakingV1Warmup, "staking"];
func.dependencies = [CONTRACTS.stakingV1, CONTRACTS.sOhmV1];

export default func;
