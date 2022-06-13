import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";
import { epochLength, firstBlockNumber } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const treasuryDeployment = await deployments.get(CONTRACTS.treasuryV1);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);

    await deploy(CONTRACTS.distributorV1, {
        from: deployer,
        args: [treasuryDeployment.address, ohmDeployment.address, epochLength, firstBlockNumber],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.distributorV1, "staking"];
func.dependencies = [CONTRACTS.treasuryV1, CONTRACTS.testnetOHMv1];

export default func;
