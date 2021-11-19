import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DAI } from "../../../types";

import { CONTRACTS, INITIAL_MINT } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const dai = await deploy(CONTRACTS.DAI, {
        from: deployer,
        args: [0],
    });
    const daiContract = await hre.ethers.getContractAt<DAI>(CONTRACTS.DAI, dai.address, deployer);
    // Deploy 10,000,000 mock DAI and mock Frax
    await daiContract.mint(deployer, INITIAL_MINT);
};

export default func;
func.tags = [CONTRACTS.DAI, "testing"];
func.skip = async () => {
    return true; // skip for now
};
