import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, TREASURY_TIMELOCK } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const daiDeployment = await deployments.get(CONTRACTS.DAI);

    await deploy(CONTRACTS.treasuryV1, {
        from: deployer,
        args: [ohmDeployment.address, daiDeployment.address, TREASURY_TIMELOCK],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.treasuryV1, "treasury"];
func.dependencies = [CONTRACTS.testnetOHMv1, CONTRACTS.authority];

export default func;
