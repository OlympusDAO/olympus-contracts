import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const treasury = await deployments.get(CONTRACTS.treasury);
    const authority = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.treasuryExtender, {
        from: deployer,
        args: [treasury.address, authority.address],
        log: true,
    });
};

func.tags = [CONTRACTS.treasuryExtender, "treasuryExtender"];
func.dependencies = [CONTRACTS.treasury, CONTRACTS.authority];

export default func;
