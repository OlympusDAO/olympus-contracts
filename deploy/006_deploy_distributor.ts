import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts, epochLengthInBlocks, firstEpochBlock } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const treasury = await deployments.get(Contracts.TREASURY);
    const ohm = await deployments.get(Contracts.OHM);

    // TODO: firstEpochBlock is passed in but contract constructor param is called
    // _nextEpochBlock
    await deploy(Contracts.DISTRIBUTOR, {
        from: deployer.address,
        args: [treasury.address, ohm.address, epochLengthInBlocks, firstEpochBlock],
    });
};

export default func;
func.tags = [Contracts.DISTRIBUTOR];
func.dependencies = [Contracts.TREASURY, Contracts.OHM];
