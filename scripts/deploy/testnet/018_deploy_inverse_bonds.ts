import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";
import { zeroAddress } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.inverseBonds, {
        from: deployer,
        args: [authorityDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.inverseBonds, "bonding"];
func.dependencies = [CONTRACTS.authority];

export default func;
