import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const sohmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gohmDeployment = await deployments.get(CONTRACTS.gOhm);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.yieldDirector, {
        from: deployer,
        args: [
            sohmDeployment.address,
            gohmDeployment.address,
            stakingDeployment.address,
            authorityDeployment.address,
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.yieldDirector, "tyche"];
func.dependencies = [CONTRACTS.sOhm, CONTRACTS.gOhm, CONTRACTS.staking, CONTRACTS.authority];

export default func;
