import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../../constants";

const sushiRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ohmV1Deployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const sohmV1Deployment = await deployments.get(CONTRACTS.sOhmV1);
    const treasuryV1Deployment = await deployments.get(CONTRACTS.treasuryV1);
    const stakingV1Deployment = await deployments.get(CONTRACTS.stakingV1);
    const wsohmDeployment = await deployments.get(CONTRACTS.wsOHM);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.migrator, {
        from: deployer,
        args: [
            ohmV1Deployment.address,
            sohmV1Deployment.address,
            treasuryV1Deployment.address,
            stakingV1Deployment.address,
            wsohmDeployment.address,
            sushiRouter,
            uniRouter,
            "0",
            authorityDeployment.address,
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.migrator, "migration"];
func.dependencies = [CONTRACTS.testnetOHMv1, CONTRACTS.sOhmV1, CONTRACTS.treasuryV1, CONTRACTS.stakingV1, CONTRACTS.wsOHM, CONTRACTS.authority];

export default func;
