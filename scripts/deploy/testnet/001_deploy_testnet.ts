import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../../constants";
import { OlympusERC20Token__factory, OlympusAuthority__factory } from "../../../types";

const faucetContract = "OhmFaucet";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre;

    if (network.name == "mainnet") {
        console.log("Faucet cannot be deployed to mainnet");
        return;
    }

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);

    const ohm = OlympusERC20Token__factory.connect(ohmDeployment.address, signer);
    const authorityContract = await OlympusAuthority__factory.connect(
        authorityDeployment.address,
        signer
    );

    await deploy(faucetContract, {
        from: deployer,
        args: [ohmDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    const faucetDeployment = await deployments.get(faucetContract);

    // temporary set deployer as vault
    await authorityContract.pushVault(deployer, true);
    ohm.mint(faucetDeployment.address, 10 ^ 9); // IDK if this works
    await authorityContract.pushVault(treasuryDeployment.address, true);

    // TODO
    // deploy mock dai
    // deposit mock dai into treasury to mint ohm
    // fund faucet with minted dai.
    // How do we make this reusable?
};

func.tags = ["faucet", "testnet"];
func.runAtTheEnd = true;

export default func;
