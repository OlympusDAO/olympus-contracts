import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    bondVestingLength,
    Contracts,
    fraxBondBCV,
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
    const fraxBond = await deploy(Contracts.BOND_DEPOSITORY, {
        from: deployer.address,
        args: [ohm.address, treasury.address],
    });

    const fraxContract = await hre.ethers.getContractAt<IERC20>(
        Contracts.BOND_DEPOSITORY,
        fraxBond.address,
        deployer
    );

    const fraxBondContract = await hre.ethers.getContractAt<OlympusBondDepository>(
        Contracts.BOND_DEPOSITORY,
        fraxBond.address,
        deployer
    );

    // TODO: ID, EXPIRATION, CONCLUSION ARBITRARILY SET TO 0
    // FIXEDTERM ARBITRARILY SET TO TRUE
    // Not sure what these should actually be.
    await fraxBondContract.setTerms(
        0,
        fraxBondBCV,
        true,
        bondVestingLength,
        0,
        0,
        minBondPrice,
        maxBondDebt,
        maxBondDebt,
        intialBondDebt
    );

    // TODO: setStaking no longer exists on the bond contract

    await fraxContract.approve(treasury.address, largeApproval);
    await fraxContract.approve(fraxBond.address, largeApproval);
};

export default func;
func.tags = ["FRAX_BOND"];
func.dependencies = [Contracts.OHM, Contracts.FRAX, Contracts.TREASURY];
