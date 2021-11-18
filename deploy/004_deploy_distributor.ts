import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { OlympusTreasury__factory } from "../types";
import { CONTRACTS } from "./constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    const bondingCalcDeployment = await deployments.get(CONTRACTS.bondingCalculator);

    const treasury = await OlympusTreasury__factory.connect(treasuryDeployment.address, signer);

    // TODO: firstEpochBlock is passed in but contract constructor param is called _nextEpochBlock
    const distributor = await deploy(CONTRACTS.distributor, {
        from: deployer,
        args: [
            treasuryDeployment.address,
            ohmDeployment.address,
            stakingDeployment.address,
            authorityDeployment.address,
        ],
    });

    // Do we do this in a different way?
    // queue and toggle reward manager
    await treasury.queueTimelock("8", distributor.address, bondingCalcDeployment.address);

    // queue and toggle deployer reserve depositor
    await treasury.queueTimelock("0", deployer, bondingCalcDeployment.address);

    // queue and toggle liquidity depositor
    await treasury.queueTimelock("4", deployer, bondingCalcDeployment.address);
};

func.tags = [CONTRACTS.distributor, "staking"];
func.dependencies = [
    CONTRACTS.treasury,
    CONTRACTS.ohm,
    CONTRACTS.bondingCalculator,
    CONTRACTS.olympusAuthority,
];

export default func;
