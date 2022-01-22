import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

// Mainnet Addresses addresses
const authority = "0xA9d07221774DD784281AE88FBC6036DD46EC0f5D";
const ohm = "0x47aeA0D053A08b444c60a35348c7D679559b897b";
const gohm = "0xb4F9a5c00E7106ec4Bd55a84aed1D545808e704E";
const staking = "0x5e9E95d2006C06675f10C4a76d988306403b0568";
const treasury = "0x4fbdfFfAF688ccB2d6a9fd1a4fF51b4Ba9C5a48f";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy(CONTRACTS.bonDepo2, {
        from: deployer,
        args: [
            authority,
            ohm,
            gohm,
            staking,
            treasury
        ],
        log: true,
        skipIfAlreadyDeployed: true
    });
};

func.tags = [CONTRACTS.bonDepo2, "migration"];

export default func;