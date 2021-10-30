import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contracts, initialMint } from "../constants";
import { FRAX } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    // Deploy FRAX
    const frax = await deploy(Contracts.FRAX, {
        from: deployer.address,
        args: [0],
    });

    const fraxContract = await hre.ethers.getContractAt<FRAX>(
        Contracts.FRAX,
        frax.address,
        deployer
    );
    await fraxContract.mint(deployer.address, initialMint);
};

export default func;
func.tags = [Contracts.FRAX];
