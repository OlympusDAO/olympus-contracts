import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, TREASURY_TIMELOCK } from "../constants";
//import { DAI, FRAX, OlympusERC20Token, OlympusTreasury } from "../types";
import { OlympusTreasury__factory } from "../../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    // TODO: TIMELOCK SET TO 0 FOR NOW, CHANGE FOR ACTUAL DEPLOYMENT
    const treasuryDeployment = await deploy(CONTRACTS.treasury, {
        from: deployer,
        args: [ohmDeployment.address, TREASURY_TIMELOCK, authorityDeployment.address],
        log: true,
    });

    await OlympusTreasury__factory.connect(treasuryDeployment.address, signer);

    // TODO: These two functions are causing a revert
    // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    //await treasury.deposit("9000000000000000000000000", dai.address, "8400000000000000");

    // // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    // await treasuryContract.deposit("5000000000000000000000000", frax.address, "5000000000000000");
};

func.tags = [CONTRACTS.treasury, "treasury"];
func.dependencies = [CONTRACTS.ohm];

export default func;
