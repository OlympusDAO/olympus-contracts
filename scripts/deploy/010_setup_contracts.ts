import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    CONTRACTS,
    LARGE_APPROVAL,
    INITIAL_REWARD_RATE,
    INITIAL_INDEX,
    BOUNTY_AMOUNT,
} from "../constants";
import {
    OlympusAuthority__factory,
    Distributor__factory,
    OlympusERC20Token__factory,
    OlympusStaking__factory,
    SOlympus__factory,
    GOHM__factory,
    OlympusTreasury__factory,
} from "../../types";

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

    // Step 1: Set treasury as vault on authority
    await authorityContract.pushVault(treasury.address, true);

    // Step 2: Set distributor as minter on treasury
    await treasury.enable(8, distributor.address, ethers.constants.AddressZero); // Allows distributor to mint ohm.

    // Step 3: Set distributor on staking
    await staking.setDistributor(distributor.address);

    // Step 4: Initialize sOHM and set the index
    await sOhm.setIndex(INITIAL_INDEX); // TODO
    await sOhm.setgOHM(gOhm.address);
    await sOhm.initialize(staking.address, treasuryDeployment.address);

    // Step 5: Set up distributor with bounty and recipient
    await distributor.setBounty(BOUNTY_AMOUNT);
    await distributor.addRecipient(staking.address, INITIAL_REWARD_RATE);

    // Approve staking contact to spend deployer's OHM
    // TODO: Is this needed?
    await ohm.approve(staking.address, LARGE_APPROVAL);

    console.log(
        ohm.address,
        sOhm.address,
        gOhm.address,
        distributor.address,
        staking.address,
        treasury.address
    );
};

func.tags = ["setup"];
func.dependencies = [CONTRACTS.ohm, CONTRACTS.sOhm, CONTRACTS.gOhm];

export default func;
