import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts, largeApproval } from "../constants";
import { DAI, FRAX, OlympusERC20Token, OlympusTreasury } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);
    const ohmContract = await hre.ethers.getContractAt<OlympusERC20Token>(
        Contracts.OHM,
        ohm.address,
        deployer
    );
    const dai = await deployments.get(Contracts.DAI);
    const daiContract = await hre.ethers.getContractAt<DAI>(Contracts.DAI, dai.address, deployer);
    const frax = await deployments.get(Contracts.FRAX);
    const fraxContract = await hre.ethers.getContractAt<FRAX>(
        Contracts.FRAX,
        frax.address,
        deployer
    );
    // TODO: TIMELOCK SET TO 0 FOR NOW
    // CHANGE FOR ACTUAL DEPLOYMENT
    // Deploy treasury
    const treasury = await deploy(Contracts.TREASURY, {
        from: deployer.address,
        args: [ohm.address, 0],
    });
    const treasuryContract = await hre.ethers.getContractAt<OlympusTreasury>(
        Contracts.TREASURY,
        treasury.address,
        deployer
    );

    // Set treasury for OHM token
    await ohmContract.setVault(treasury.address);

    // Approve the treasury to spend DAI and Frax
    await daiContract.approve(treasury.address, largeApproval);
    await fraxContract.approve(treasury.address, largeApproval);

    // TODO: These two functions are causing a revert
    // // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    // await treasuryContract.deposit("9000000000000000000000000", dai.address, "8400000000000000");

    // // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    // await treasuryContract.deposit("5000000000000000000000000", frax.address, "5000000000000000");
};

export default func;
func.tags = [Contracts.TREASURY];
func.dependencies = [Contracts.OHM];
