import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    CONTRACTS,
    EPOCH_LENGTH_IN_BLOCKS,
    FIRST_EPOCH_TIME,
    FIRST_EPOCH_NUMBER,
} from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);

    await deploy(CONTRACTS.staking, {
        from: deployer,
        args: [
            ohmDeployment.address,
            sOhmDeployment.address,
            gOhmDeployment.address,
            EPOCH_LENGTH_IN_BLOCKS,
            FIRST_EPOCH_NUMBER,
            FIRST_EPOCH_TIME,
            authorityDeployment.address,
        ],
        log: true,
    });
};

func.tags = [CONTRACTS.staking, "staking"];
func.dependencies = [CONTRACTS.ohm, CONTRACTS.sOhm, CONTRACTS.gOhm];

export default func;
