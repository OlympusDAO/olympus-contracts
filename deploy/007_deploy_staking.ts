import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    CONTRACTS,
    LARGE_APPROVAL,
    EPOCH_LENGTH_IN_BLOCKS,
    FIRST_EPOCH_BLOCK,
    FIRST_EPOCH_NUMBER,
    INITIAL_REWARD_RATE,
    INITIAL_INDEX
} from "./constants";
import {
    Distributor__factory,
    OlympusERC20Token__factory,
    OlympusStaking__factory,
    SOlympus__factory,
    GOHM__factory
} from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);

    const ohm = OlympusERC20Token__factory.connect(ohmDeployment.address, signer);
    const sOhm = SOlympus__factory.connect(sOhmDeployment.address, signer);
    const gOhm = GOHM__factory.connect(gOhmDeployment.address, signer);
    const distributor = Distributor__factory.connect(distributorDeployment.address, signer);

    const stakingDeployment = await deploy(CONTRACTS.staking, {
        from: deployer,
        args: [
            ohm.address,
            sOhm.address,
            gOhm.address,
            EPOCH_LENGTH_IN_BLOCKS,
            FIRST_EPOCH_NUMBER,
            FIRST_EPOCH_BLOCK
        ],
    });
    const staking = OlympusStaking__factory.connect(stakingDeployment.address, signer);

    // Set staking and sOhm contract as trusted
    await gOhm.migrate(staking.address, sOhm.address);

    // Initialize sOHM and set the index
    await sOhm.setIndex(INITIAL_INDEX); // TODO
    await sOhm.setgOHM(gOhm.address);
    await sOhm.initialize(staking.address, treasuryDeployment.address);

    // TODO: different than deployAll.js (uses initialIndex instead of 0)
    // doing this because the sohm contract has a require(index == 0)
    // TODO: this is leading to a revert
    // await sohmContract.setIndex(0);

    await staking.setDistributor(distributor.address);

    // Add staking contract as distributor recipient
    await distributor.addRecipient(staking.address, INITIAL_REWARD_RATE);

    // Approve staking contact to spend deployer's OHM
    await ohm.approve(staking.address, LARGE_APPROVAL);
};

func.tags = ["staking"];
func.dependencies = [CONTRACTS.ohm, CONTRACTS.sOhm, CONTRACTS.gOhm];

export default func;