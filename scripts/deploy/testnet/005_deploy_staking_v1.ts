import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";
import { epochLength, firstBlockNumber, firstEpochNumber } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const sohmDeployment = await deployments.get(CONTRACTS.testnetSOHMv1);

    await deploy(CONTRACTS.StakingV1, {
        from: deployer,
        args: [ohmDeployment.address, sohmDeployment.address, epochLength, firstEpochNumber, firstBlockNumber],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.StakingV1, "staking"];
func.dependencies = [CONTRACTS.testnetOHMv1, CONTRACTS.testnetSOHMv1];

export default func;
