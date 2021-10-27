import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts } from "../constants";
import { DAI, FRAX, OlympusERC20Token } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);
    const dai = await deployments.get(Contracts.DAI);
    const frax = await deployments.get(Contracts.FRAX);

    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = "10000000000000000000000000";

    // Deploy 10,000,000 mock DAI and mock Frax
    const daiContract = await hre.ethers.getContractAt<DAI>(Contracts.DAI, dai.address, deployer);
    await daiContract.mint(deployer.address, initialMint);
    const fraxContract = await hre.ethers.getContractAt<FRAX>(
        Contracts.FRAX,
        frax.address,
        deployer
    );
    await fraxContract.mint(deployer.address, initialMint);
    const ohmContract = await hre.ethers.getContractAt<OlympusERC20Token>(
        Contracts.OHM,
        ohm.address,
        deployer
    );

    // TODO: TIMELOCK SET TO 0 FOR NOW
    // CHANGE FOR ACTUAL DEPLOYMENT
    // Deploy treasury
    const treasury = await deploy(Contracts.TREASURY, {
        from: deployer.address,
        args: [ohm.address, 0],
    });

    // Set treasury for OHM token
    await ohmContract.setVault(treasury.address);
};

export default func;
func.tags = [Contracts.TREASURY];
func.dependencies = [Contracts.OHM, Contracts.DAI, Contracts.FRAX];
