import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const migratorDeployment = await deployments.get(CONTRACTS.migrator);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);

    await deploy(CONTRACTS.gOhm, {
        from: deployer,
        args: [migratorDeployment.address, sOhmDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.gOhm, "migration", "tokens"];
func.dependencies = [CONTRACTS.migrator, CONTRACTS.sOhm];

export default func;
