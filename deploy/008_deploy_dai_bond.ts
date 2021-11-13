import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    bondVestingLength,
    Contracts,
    daiBondBCV,
    intialBondDebt,
    largeApproval,
    maxBondDebt,
    maxBondPayout,
    minBondPrice,
} from "../constants";
import { DAI, OlympusBondDepository, OlympusTreasury } from "../types";

// TODO: maximum call stack reached error caused from this 
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);
    const treasury = await deployments.get(Contracts.TREASURY);
    // const dai = await deployments.get(Contracts.DAI);
    // const daiContract = await hre.ethers.getContractAt<DAI>(Contracts.DAI, dai.address, deployer);
    // const treasuryContract = await hre.ethers.getContractAt<OlympusTreasury>(
    //     Contracts.TREASURY,
    //     treasury.address,
    //     deployer
    // );
    // const ohmBondingCalculator = await deployments.get(Contracts.OHM_BONDING_CALCULATOR);

    // Deploy dai bond
    const daiBond = await deploy(Contracts.BOND_DEPOSITORY, {
        from: deployer.address,
        args: [ohm.address, treasury.address],
    });
    // const daiBondContract = await hre.ethers.getContractAt<OlympusBondDepository>(
    //     "DAI_BOND",
    //     daiBond.address,
    //     deployer
    // );

    // // TODO: queue and toggle (doesn't exist anymore) DAI and Frax bond reserve depositor
    // // TODO: unsure if this is the same as the previous treasury.queue function
    // // TODO: passing in ohmBondingCalculator address as this seems to be what the contract asks for
    // // instead of zeroAddress
    // await treasuryContract.queueTimelock("0", daiBond.address, ohmBondingCalculator.address);

    // // TODO: ID, EXPIRATION, CONCLUSION ARBITRARILY SET TO 0
    // // FIXEDTERM ARBITRARILY SET TO TRUE
    // // Not sure what these should actually be.
    // await daiBondContract.setTerms(
    //     0,
    //     daiBondBCV,
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
    // await daiContract.approve(daiBond.address, largeApproval);
};

func.tags = ["DAI_BOND"];
func.dependencies = [
    Contracts.OHM,
    // Contracts.DAI,
    Contracts.TREASURY,
    // Contracts.OHM_BONDING_CALCULATOR,
    "DAI_BOND",
];

//export default func;