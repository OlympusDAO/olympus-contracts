import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    OlympusTreasury__factory,
    OlympusERC20Token__factory,
    OlympusBondingCalculator__factory
} from "../types";
import { CONTRACTS, EPOCH_LENGTH_IN_BLOCKS, FIRST_EPOCH_BLOCK } from "./constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const bondingCalcDeployment = await deployments.get(CONTRACTS.bondingCalculator);

    const treasury = await OlympusTreasury__factory.connect(treasuryDeployment.address, signer);

    // TODO: firstEpochBlock is passed in but contract constructor param is called _nextEpochBlock
    const distributor = await deploy(CONTRACTS.distributor, {
        from: deployer,
        args: [treasuryDeployment.address, ohmDeployment.address, EPOCH_LENGTH_IN_BLOCKS, FIRST_EPOCH_BLOCK],
    });

    // queue and toggle reward manager
    await treasury.queueTimelock("8", distributor.address, bondingCalcDeployment.address);

    // queue and toggle deployer reserve depositor
    await treasury.queueTimelock("0", deployer, bondingCalcDeployment.address);

    // queue and toggle liquidity depositor
    await treasury.queueTimelock("4", deployer, bondingCalcDeployment.address);
};

func.tags = [CONTRACTS.distributor, "staking"];
func.dependencies = [CONTRACTS.treasury, CONTRACTS.ohm, CONTRACTS.bondingCalculator];

export default func;