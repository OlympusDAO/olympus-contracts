import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    bondVestingLength,
    Contracts,
    fraxBondBCV,
    intialBondDebt,
    largeApproval,
    maxBondDebt,
    maxBondPayout,
    minBondPrice,
} from "../constants";
import { FRAX, OlympusBondDepository, OlympusTreasury } from "../types";

// TODO: maximum call stack reached error caused from this 
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);
    // const frax = await deployments.get(Contracts.FRAX);
    // const fraxContract = await hre.ethers.getContractAt<FRAX>(
    //     Contracts.FRAX,
    //     frax.address,
    //     deployer
    // );
    const treasury = await deployments.get(Contracts.TREASURY);
    // const treasuryContract = await hre.ethers.getContractAt<OlympusTreasury>(
    //     Contracts.TREASURY,
    //     treasury.address,
    //     deployer
    // );
    // const ohmBondingCalculator = await deployments.get(Contracts.OHM_BONDING_CALCULATOR);

    // Deploy frax bond
    const fraxBond = await deploy(Contracts.BOND_DEPOSITORY, {
        from: deployer.address,
        args: [ohm.address, treasury.address],
    });
    // const fraxBondContract = await hre.ethers.getContractAt<OlympusBondDepository>(
    //     "FRAX_BOND",
    //     fraxBond.address,
    //     deployer
    // );

    // // TODO: queue and toggle (doesn't exist anymore) DAI and Frax bond reserve depositor
    // // TODO: unsure if this is the same as the previous treasury.queue function
    // // TODO: passing in ohmBondingCalculator address as this seems to be what the contract asks for
    // // instead of zeroAddress
    // await treasuryContract.queueTimelock("0", fraxBond.address, ohmBondingCalculator.address);

    // // TODO: ID, EXPIRATION, CONCLUSION ARBITRARILY SET TO 0
    // // FIXEDTERM ARBITRARILY SET TO TRUE
    // // Not sure what these should actually be.
    // await fraxBondContract.setTerms(
    //     0,
    //     fraxBondBCV,
    //     true,
    //     bondVestingLength,
    //     0,
    //     0,
    //     minBondPrice,
    //     maxBondPayout,
    //     maxBondDebt,
    //     intialBondDebt
    // );

    // // Approve dai and frax bonds to spend deployer's DAI and Frax
    // await fraxContract.approve(fraxBond.address, largeApproval);
};

func.tags = ["FRAX_BOND"];
func.dependencies = [
    Contracts.OHM,
    // Contracts.FRAX,
    Contracts.TREASURY,
    // Contracts.OHM_BONDING_CALCULATOR,
    "FRAX_BOND",
];

//export default func;