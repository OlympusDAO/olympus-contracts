import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, INITIAL_MINT, INITIAL_MINT_PROFIT } from "../../constants";
import { OlympusERC20Token__factory, OlympusTreasury__factory, DAI__factory } from "../../../types";
import { waitFor } from "../../txHelper";

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
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const daiDeployment = await deployments.get(CONTRACTS.DAI);

    const ohm = OlympusERC20Token__factory.connect(ohmDeployment.address, signer);
    const mockDai = DAI__factory.connect(daiDeployment.address, signer);
    const treasury = OlympusTreasury__factory.connect(treasuryDeployment.address, signer);

    // Deploy Faucuet
    await deploy(faucetContract, {
        from: deployer,
        args: [ohmDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    const faucetDeployment = await deployments.get(faucetContract);

    let faucetBalance = await ohm.balanceOf(faucetDeployment.address);
    const minOhm = ethers.BigNumber.from(10000 * 1e9);
    if (faucetBalance.gt(minOhm)) {
        // short circuit if faucet balance is above 10k ohm
        console.log("Sufficient faucet balance");
        console.log("Faucet Balance: ", faucetBalance.toString());
        return;
    }
    // Mint Dai
    const daiAmount = INITIAL_MINT;
    await waitFor(mockDai.mint(deployer, daiAmount));
    const daiBalance = await mockDai.balanceOf(deployer);
    console.log("Dai minted: ", daiBalance.toString());

    // Treasury Actions
    await waitFor(treasury.enable(0, deployer, ethers.constants.AddressZero)); // Enable the deployer to deposit reserve tokens
    await waitFor(treasury.enable(2, daiDeployment.address, ethers.constants.AddressZero)); // Enable Dai as a reserve Token

    // Deposit and mint ohm
    await waitFor(mockDai.approve(treasury.address, daiAmount)); // Approve treasury to use the dai
    await waitFor(treasury.deposit(daiAmount, daiDeployment.address, INITIAL_MINT_PROFIT)); // Deposit Dai into treasury, with a profit set, so that we have reserves for staking
    const ohmMinted = await ohm.balanceOf(deployer);
    console.log("Ohm minted: ", ohmMinted.toString());

    // Fund faucet w/ newly minted dai.
    await waitFor(ohm.approve(faucetDeployment.address, ohmMinted));
    await waitFor(ohm.transfer(faucetDeployment.address, ohmMinted));

    faucetBalance = await ohm.balanceOf(faucetDeployment.address);
    console.log("Faucet balance:", faucetBalance.toString());
};

func.tags = ["faucet", "testnet"];
func.dependencies = [CONTRACTS.ohm, CONTRACTS.DAI, CONTRACTS.treasury];
func.runAtTheEnd = true;

export default func;
