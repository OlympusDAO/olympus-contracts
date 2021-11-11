import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DAI } from "../../types";

import { Contracts, initialMint } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const dai = await deploy(Contracts.DAI, {
        from: deployer,
        args: [0],
    });
    const daiContract = await hre.ethers.getContractAt<DAI>(Contracts.DAI, dai.address, deployer);
    // Deploy 10,000,000 mock DAI and mock Frax
    await daiContract.mint(deployer, initialMint);
};

export default func;
func.tags = [Contracts.DAI, "testing"];
