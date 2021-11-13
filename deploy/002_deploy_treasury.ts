import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, LARGE_APPROVAL, TREASURY_TIMELOCK } from "./constants";
//import { DAI, FRAX, OlympusERC20Token, OlympusTreasury } from "../types";
import { OlympusTreasury__factory, OlympusERC20Token__factory } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const ohm = await OlympusERC20Token__factory.connect(ohmDeployment.address, signer);

    // TODO: TIMELOCK SET TO 0 FOR NOW, CHANGE FOR ACTUAL DEPLOYMENT
    const treasuryDeployment = await deploy(CONTRACTS.treasury, {
        from: deployer,
        args: [
            ohmDeployment.address,
            TREASURY_TIMELOCK
        ],
    });

    const treasury = await OlympusTreasury__factory.connect(treasuryDeployment.address, signer);

    // Set treasury for OHM token
    await ohm.setVault(treasury.address);

    // TODO: These two functions are causing a revert
    // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    //await treasury.deposit("9000000000000000000000000", dai.address, "8400000000000000");

    // // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    // await treasuryContract.deposit("5000000000000000000000000", frax.address, "5000000000000000");
};

func.tags = [CONTRACTS.TREASURY, "staking"];
func.dependencies = [CONTRACTS.ohm];

export default func;