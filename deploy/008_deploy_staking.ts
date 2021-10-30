import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    Contracts,
    epochLengthInBlocks,
    firstEpochBlock,
    firstEpochNumber,
    initialRewardRate,
    largeApproval,
} from "../constants";
import { Distributor, OlympusERC20Token, OlympusStaking, SOlympus } from "../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments } = hre;
    const [deployer] = await hre.ethers.getSigners();
    const { deploy } = deployments;

    const ohm = await deployments.get(Contracts.OHM);
    const sohm = await deployments.get(Contracts.SOHM);
    const ohmContract = await hre.ethers.getContractAt<OlympusERC20Token>(
        Contracts.OHM,
        ohm.address,
        deployer
    );
    const distributor = await deployments.get(Contracts.DISTRIBUTOR);
    const distributorContract = await hre.ethers.getContractAt<Distributor>(
        Contracts.DISTRIBUTOR,
        distributor.address,
        deployer
    );
    const sohmContract = await hre.ethers.getContractAt<SOlympus>(
        Contracts.SOHM,
        sohm.address,
        deployer
    );

    // Deploy staking contract
    const staking = await deploy(Contracts.OHM_STAKING, {
        from: deployer.address,
        args: [ohm.address, sohm.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock],
    });
    const stakingContract = await hre.ethers.getContractAt<OlympusStaking>(
        Contracts.OHM_STAKING,
        staking.address,
        deployer
    );
    // Initialize sOHM and set the index
    await sohmContract.initialize(staking.address);

    // TODO: different than deployAll.js (uses initialIndex instead of 0)
    // doing this because the sohm contract has a require(index == 0)
    // TODO: this is leading to a revert
    // await sohmContract.setIndex(0);

    // TODO: set distributor contract and warmup (doesn't exist) contract
    await stakingContract.setContract("0", distributor.address);

    // Add staking contract as distributor recipient
    await distributorContract.addRecipient(staking.address, initialRewardRate);

    // TODO: Approve staking and staking helper (doesn't exist anymore) contact to spend deployer's OHM
    await ohmContract.approve(staking.address, largeApproval);
};

export default func;
func.tags = [Contracts.OHM_STAKING];
func.dependencies = [Contracts.OHM, Contracts.SOHM, Contracts.DISTRIBUTOR];
