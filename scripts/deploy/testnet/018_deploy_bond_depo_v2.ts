import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";
import { zeroAddress } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHM);
    const gohmDeployment = await deployments.get(CONTRACTS.gOhm);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);

    await deploy(CONTRACTS.bondDepositoryV2, {
        from: deployer,
        args: [authorityDeployment.address, ohmDeployment.address, gohmDeployment.address, stakingDeployment.address, treasuryDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.bondDepositoryV2, "bonding"];
func.dependencies = [CONTRACTS.authority, CONTRACTS.testnetOHM, CONTRACTS.gOhm, CONTRACTS.staking, CONTRACTS.treasury];

export default func;
