import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    console.log("deployed succesfully with: ", deployer);

    //Can log out all the other  contracts
};

func.tags = ["post deployment"];
func.dependencies = Object.values(CONTRACTS);

export default func;
