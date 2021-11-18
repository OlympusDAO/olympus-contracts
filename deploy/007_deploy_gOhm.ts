import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "./constants";
import { OlympusTokenMigrator__factory, SOlympus__factory } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const migratorDeployment = await deployments.get(CONTRACTS.migrator);

    const gOhmDeployment = await deploy(CONTRACTS.gOhm, {
        from: deployer,
        args: [migratorDeployment.address, sOhmDeployment.address],
    });

    // TODO set index (doesn't need to happen now -> do init later)
    // await sOhm.setIndex(INITIAL_INDEX);
    // await sOhm.setgOHM(gOhmDeployment.address);
};

func.tags = [CONTRACTS.gohm, "gohm"];
func.dependencies = [CONTRACTS.migrator];

export default func;
