import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    CONTRACTS,
    LARGE_APPROVAL,
    EPOCH_LENGTH_IN_BLOCKS,
    FIRST_EPOCH_BLOCK,
    FIRST_EPOCH_NUMBER,
    INITIAL_REWARD_RATE,
    INITIAL_INDEX
} from "./constants";
import { OlympusStaking__factory, SOlympus__factory } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);

    const sOhm = SOlympus__factory.connect(sOhmDeployment.address, signer);

    const gOhmDeployment = await deploy(CONTRACTS.gOhm, {
        from: deployer,
        args: [
            stakingDeployment.address,
        ],
    });

    // TODO set index
    await sOhm.setIndex(INITIAL_INDEX);
    await sOhm.setgOHM(gOhmDeployment.address);
};

func.tags = ["staking"];
func.dependencies = [CONTRACTS.staking];

export default func;