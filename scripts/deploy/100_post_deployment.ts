import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { waitFor } from "../txHelper";
import { CONTRACTS, INITIAL_REWARD_RATE, INITIAL_INDEX, BOUNTY_AMOUNT } from "../constants";
import {
    OlympusAuthority__factory,
    Distributor__factory,
    OlympusERC20Token__factory,
    OlympusStaking__factory,
    SOlympus__factory,
    GOHM__factory,
    OlympusTreasury__factory,
    LUSDAllocator__factory,
} from "../../types";

// TODO: Shouldn't run setup methods if the contracts weren't redeployed.
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const lusdAllocatorDeployment = await deployments.get(CONTRACTS.lusdAllocator);

    const authorityContract = await OlympusAuthority__factory.connect(
        authorityDeployment.address,
        signer
    );
    const ohm = OlympusERC20Token__factory.connect(ohmDeployment.address, signer);
    const sOhm = SOlympus__factory.connect(sOhmDeployment.address, signer);
    const gOhm = GOHM__factory.connect(gOhmDeployment.address, signer);
    const distributor = Distributor__factory.connect(distributorDeployment.address, signer);
    const staking = OlympusStaking__factory.connect(stakingDeployment.address, signer);
    const treasury = OlympusTreasury__factory.connect(treasuryDeployment.address, signer);
    const lusdAllocator = LUSDAllocator__factory.connect(lusdAllocatorDeployment.address, signer);

    // Step 1: Set treasury as vault on authority
    await waitFor(authorityContract.pushVault(treasury.address, true));
    console.log("Setup -- authorityContract.pushVault: set vault on authority");

    // Step 2: Set distributor as minter on treasury
    await waitFor(treasury.enable(8, distributor.address, ethers.constants.AddressZero)); // Allows distributor to mint ohm.
    console.log("Setup -- treasury.enable(8):  distributor enabled to mint ohm on treasury");

    // Step 3: Set distributor on staking
    await waitFor(staking.setDistributor(distributor.address));
    console.log("Setup -- staking.setDistributor:  distributor set on staking");

    // Step 4: Initialize sOHM and set the index
    if ((await sOhm.gOHM()) == ethers.constants.AddressZero) {
        await waitFor(sOhm.setIndex(INITIAL_INDEX)); // TODO
        await waitFor(sOhm.setgOHM(gOhm.address));
        await waitFor(sOhm.initialize(staking.address, treasuryDeployment.address));
    }
    console.log("Setup -- sohm initialized (index, gohm)");

    // Step 5: Set up distributor with bounty and recipient
    await waitFor(distributor.setBounty(BOUNTY_AMOUNT));
    await waitFor(distributor.addRecipient(staking.address, INITIAL_REWARD_RATE));
    console.log("Setup -- distributor.setBounty && distributor.addRecipient");

    // Approve staking contact to spend deployer's OHM
    // TODO: Is this needed?
    // await ohm.approve(staking.address, LARGE_APPROVAL);
};

func.tags = ["setup"];
func.dependencies = [CONTRACTS.ohm, CONTRACTS.sOhm, CONTRACTS.gOhm];

export default func;
