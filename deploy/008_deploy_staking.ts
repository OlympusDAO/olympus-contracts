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
    const distributor = await deployments.get(Contracts.DISTRIBUTOR);

    // Deploy bonding calc
    const staking = await deploy(Contracts.OHM_STAKING, {
        from: deployer.address,
        args: [ohm.address, sohm.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock],
    });

    const ohmContract = await hre.ethers.getContractAt<OlympusERC20Token>(
        Contracts.OHM,
        ohm.address,
        deployer
    );

    const sohmContract = await hre.ethers.getContractAt<SOlympus>(
        Contracts.SOHM,
        sohm.address,
        deployer
    );

    const stakingContract = await hre.ethers.getContractAt<OlympusStaking>(
        Contracts.OHM_STAKING,
        staking.address,
        deployer
    );

    const distributorContract = await hre.ethers.getContractAt<Distributor>(
        Contracts.DISTRIBUTOR,
        distributor.address,
        deployer
    );
    // // Initialize sOHM and set the index
    await sohmContract.initialize(staking.address);
    await sohmContract.setIndex(0);

    // // set distributor contract and (warmup contract doesn't exist anymore)
    await stakingContract.setContract("0", distributor.address);

    // Add staking contract as distributor recipient
    await distributorContract.addRecipient(staking.address, initialRewardRate);

    // Approve staking to spend deployer's OHM (TODO: staking helper contact doesn't exist anymore)
    await ohmContract.approve(staking.address, largeApproval);
};

export default func;
func.tags = [Contracts.OHM_STAKING];
func.dependencies = [Contracts.OHM, Contracts.SOHM, Contracts.DISTRIBUTOR];
