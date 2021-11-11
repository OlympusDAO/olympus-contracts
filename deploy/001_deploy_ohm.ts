import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    OlympusERC20Token,
    OlympusERC20Token__factory
} from "../types"
import { CONTRACTS } from "./constants";

const func: DeployFunction = async ({ deployments, getNamedAccounts}: HardhatRuntimeEnvironment) => {

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy(CONTRACTS.ohm, {
        from: deployer,
        log: true
    });
};

export default func;
func.tags = [CONTRACTS.ohm, "treasury", "staking", "tokens"];