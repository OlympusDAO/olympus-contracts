import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";
import { epochLength, firstBlockNumber, firstEpochNumber } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const sohmDeployment = await deployments.get(CONTRACTS.sOhmV1);

    await deploy(CONTRACTS.stakingV1, {
        from: deployer,
        args: [ohmDeployment.address, sohmDeployment.address, epochLength, firstEpochNumber, firstBlockNumber],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.stakingV1, "staking"];
func.dependencies = [CONTRACTS.testnetOHMv1, CONTRACTS.sOhmV1];

export default func;
