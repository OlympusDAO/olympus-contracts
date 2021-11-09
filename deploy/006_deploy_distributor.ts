import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts, epochLengthInBlocks, firstEpochBlock } from "../constants";
import { OlympusTreasury } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const treasury = await deployments.get(Contracts.TREASURY);
    const ohm = await deployments.get(Contracts.OHM);
    const ohmBondingCalculator = await deployments.get(Contracts.OHM_BONDING_CALCULATOR);
    const treasuryContract = await hre.ethers.getContractAt<OlympusTreasury>(
        Contracts.TREASURY,
        treasury.address,
        deployer
    );
    // TODO: firstEpochBlock is passed in but contract constructor param is called
    // _nextEpochBlock
    const distributor = await deploy(Contracts.DISTRIBUTOR, {
        from: deployer.address,
        args: [treasury.address, ohm.address, epochLengthInBlocks, firstEpochBlock],
    });

    // queue and toggle reward manager
    await treasuryContract.queueTimelock("8", distributor.address, ohmBondingCalculator.address);

    // queue and toggle deployer reserve depositor
    await treasuryContract.queueTimelock("0", deployer.address, ohmBondingCalculator.address);

    // queue and toggle liquidity depositor
    await treasuryContract.queueTimelock("4", deployer.address, ohmBondingCalculator.address);
};

export default func;
func.tags = [Contracts.DISTRIBUTOR];
func.dependencies = [Contracts.TREASURY, Contracts.OHM, Contracts.OHM_BONDING_CALCULATOR];
