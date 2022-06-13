import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../../constants";
import { epochLength, firstBlockNumber, firstEpochNumber } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHM);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);

    await deploy(CONTRACTS.staking, {
        from: deployer,
        args: [
            ohmDeployment.address,
            sOhmDeployment.address,
            gOhmDeployment.address,
            epochLength,
            firstEpochNumber,
            1686339215,
            authorityDeployment.address,
        ],
        log: true,
    });
};

func.tags = [CONTRACTS.staking, "staking"];
func.dependencies = [CONTRACTS.authority, CONTRACTS.testnetOHM, CONTRACTS.sOhm, CONTRACTS.gOhm];

export default func;
