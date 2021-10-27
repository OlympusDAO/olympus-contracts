import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    bondVestingLength,
    Contracts,
    daiBondBCV,
    intialBondDebt,
    largeApproval,
    maxBondDebt,
    minBondPrice,
} from "../constants";
import { IERC20, OlympusBondDepository } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);
    const treasury = await deployments.get(Contracts.TREASURY);

    // Deploy bonding calc
    const daiBond = await deploy(Contracts.BOND_DEPOSITORY, {
        from: deployer.address,
        args: [ohm.address, treasury.address],
    });

    const daiContract = await hre.ethers.getContractAt<IERC20>(
        Contracts.BOND_DEPOSITORY,
        daiBond.address,
        deployer
    );
    const daiBondContract = await hre.ethers.getContractAt<OlympusBondDepository>(
        Contracts.BOND_DEPOSITORY,
        daiBond.address,
        deployer
    );

    // TODO: ID, EXPIRATION, CONCLUSION ARBITRARILY SET TO 0
    // FIXEDTERM ARBITRARILY SET TO TRUE
    // Not sure what these should actually be.
    await daiBondContract.setTerms(
        0,
        daiBondBCV,
        true,
        bondVestingLength,
        0,
        0,
        minBondPrice,
        maxBondDebt,
        maxBondDebt,
        intialBondDebt
    );

    await daiContract.approve(treasury.address, largeApproval);
    await daiContract.approve(daiBond.address, largeApproval);
};

export default func;
func.tags = ["DAI_BOND"];
func.dependencies = [Contracts.OHM, Contracts.DAI, Contracts.TREASURY];
