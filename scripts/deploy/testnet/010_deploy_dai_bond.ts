import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";
import { zeroAddress } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const daiDeployment = await deployments.get(CONTRACTS.DAI);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasuryV1);

    await deploy(CONTRACTS.daiBond, {
        from: deployer,
        args: [ohmDeployment.address, daiDeployment.address, treasuryDeployment.address, deployer, zeroAddress],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.daiBond, "bonding"];
func.dependencies = [CONTRACTS.testnetOHMv1, CONTRACTS.DAI, CONTRACTS.treasuryV1];

export default func;
