import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { CONTRACTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy(CONTRACTS.DAI, {
        from: deployer,
        args: [0],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

export default func;
func.tags = [CONTRACTS.DAI, "testnet"];
