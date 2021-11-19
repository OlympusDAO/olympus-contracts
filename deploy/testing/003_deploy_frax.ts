import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, INITIAL_MINT } from "../constants";
import { FRAX } from "../../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    // Deploy FRAX
    const frax = await deploy(CONTRACTS.FRAX, {
        from: deployer.address,
        args: [0],
    });

    const fraxContract = await hre.ethers.getContractAt<FRAX>(
        CONTRACTS.FRAX,
        frax.address,
        deployer
    );
    await fraxContract.mint(deployer.address, INITIAL_MINT);
};

export default func;
func.tags = [CONTRACTS.FRAX];
func.skip = async () => {
    return true; // skip for now
};
