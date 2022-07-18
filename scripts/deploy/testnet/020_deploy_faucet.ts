import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const daiDeployment = await deployments.get(CONTRACTS.DAI);
    const ohmV1Deployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHM);
    const wsohmDeployment = await deployments.get(CONTRACTS.wsOHM);
    const stakingV1Deployment = await deployments.get(CONTRACTS.stakingV1);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.faucet, {
        from: deployer,
        args: [
            daiDeployment.address,
            ohmV1Deployment.address,
            ohmDeployment.address,
            wsohmDeployment.address,
            stakingV1Deployment.address,
            stakingDeployment.address,
            authorityDeployment.address,
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.faucet, "faucet"];
func.dependencies = [
    CONTRACTS.DAI,
    CONTRACTS.testnetOHMv1,
    CONTRACTS.testnetOHM,
    CONTRACTS.wsOHM,
    CONTRACTS.stakingV1,
    CONTRACTS.staking,
    CONTRACTS.authority,
];

export default func;
