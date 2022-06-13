import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../../constants";
import { OlympusTreasury__factory, DAI__factory, OlympusAuthority__factory, TestnetOhmV1__factory, TestnetOhm__factory, SohmV1__factory, SOlympus__factory, WsOHM__factory, GOHM__factory, OlympusTreasuryV1__factory, StakingV1__factory, OlympusStaking__factory, StakingV1Warmup__factory, StakingV1Helper__factory, DistributorV1__factory, DistributorV2__factory, OlympusTokenMigrator__factory, YieldDirector__factory, OlympusBondDepositoryV2__factory, TestnetOPBondDepo__factory, DevFaucet__factory } from "../../../types";
import { waitFor } from "../../txHelper";
import { initialIndex, initialMint, initialRewardRate, largeApproval, zeroAddress } from "../../goerli/constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre;

    if (network.name == "mainnet") {
        console.log("This should not be used on mainnet");
        return;
    }
    
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    /// Define deployments
    const daiDeployment = await deployments.get(CONTRACTS.DAI);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    const ohmV1Deployment = await deployments.get(CONTRACTS.testnetOHMv1);
    const ohmDeployment = await deployments.get(CONTRACTS.testnetOHM);

    const sohmV1Deployment = await deployments.get(CONTRACTS.sOhmV1);
    const sohmDeployment = await deployments.get(CONTRACTS.sOhm);

    const wsohmDeployment = await deployments.get(CONTRACTS.wsOHM);
    const gohmDeployment = await deployments.get(CONTRACTS.gOhm);

    const treasuryV1Deployment = await deployments.get(CONTRACTS.treasuryV1);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);

    const stakingV1Deployment = await deployments.get(CONTRACTS.stakingV1);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);

    const stakingV1HelperDeployment = await deployments.get(CONTRACTS.stakingV1Helper);
    const stakingV1WarmupDeployment = await deployments.get(CONTRACTS.stakingV1Warmup);

    const distributorV1Deployment = await deployments.get(CONTRACTS.distributorV1);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);

    const migratorDeployment = await deployments.get(CONTRACTS.migrator);

    const yieldDirectorDeployment = await deployments.get(CONTRACTS.yieldDirector);
    
    const bondsDeployment = await deployments.get(CONTRACTS.bondDepositoryV2);
    const inverseBondsDeployment = await deployments.get(CONTRACTS.inverseBonds);

    const faucetDeployment = await deployments.get(CONTRACTS.faucet);

    /// Connect to deployed contracts
    const dai = await DAI__factory.connect(daiDeployment.address, signer);

    const authority = await OlympusAuthority__factory.connect(authorityDeployment.address, signer);

    const ohmV1 = await TestnetOhmV1__factory.connect(ohmV1Deployment.address, signer);
    const ohm = await TestnetOhm__factory.connect(ohmDeployment.address, signer);

    const sohmV1 = await SohmV1__factory.connect(sohmV1Deployment.address, signer);
    const sohm = await SOlympus__factory.connect(sohmDeployment.address, signer);

    const wsohm = await WsOHM__factory.connect(wsohmDeployment.address, signer);
    const gohm = await GOHM__factory.connect(gohmDeployment.address, signer);

    const treasuryV1 = await OlympusTreasuryV1__factory.connect(treasuryV1Deployment.address, signer);
    const treasury = await OlympusTreasury__factory.connect(treasuryDeployment.address, signer);

    const stakingV1 = await StakingV1__factory.connect(stakingV1Deployment.address, signer);
    const staking = await OlympusStaking__factory.connect(stakingDeployment.address, signer);

    const stakingV1Warmup = await StakingV1Warmup__factory.connect(stakingV1WarmupDeployment.address, signer);
    const stakingV1Helper = await StakingV1Helper__factory.connect(stakingV1HelperDeployment.address, signer);

    const distributorV1 = await DistributorV1__factory.connect(distributorV1Deployment.address, signer);
    const distributor = await DistributorV2__factory.connect(distributorDeployment.address, signer);

    const migrator = await OlympusTokenMigrator__factory.connect(migratorDeployment.address, signer);

    const yieldDirector = await YieldDirector__factory.connect(yieldDirectorDeployment.address, signer);

    const bonds = await OlympusBondDepositoryV2__factory.connect(bondsDeployment.address, signer);
    const inverseBonds = await TestnetOPBondDepo__factory.connect(inverseBondsDeployment.address, signer);

    const faucet = await DevFaucet__factory.connect(faucetDeployment.address, signer);

    
    /// Mint DAI
    const daiAmount = initialMint;
    await waitFor(dai.mint(deployer, daiAmount));

    /// Bonds Depo Treasury Permissions
    await waitFor(treasuryV1.queue("0", bonds.address));
    await waitFor(treasuryV1.toggle("0", bonds.address, zeroAddress));

    /// Initialize DAI Bond
    await waitFor(bonds.create(
        dai.address,
        [
            "10000000000000000000000000",
            "60000000000",
            "1000000"
        ],
        [
            true,
            true
        ],
        [
            "100",
            "1686339215"
        ],
        [
            "14400",
            "86400"
        ]
    ));

    /// Set Treasury for OHM V1
    await waitFor(ohmV1.setVault(treasuryV1.address));

    /// Initialize sOHM V1
    await waitFor(sohmV1.setIndex(initialIndex));
    await waitFor(sohmV1.initialize(stakingV1.address));

    /// Initialize Staking V1 with Distributor V1 and Warmup
    await waitFor(stakingV1.setContract("0", distributorV1.address));
    await waitFor(stakingV1.setContract("1", stakingV1Warmup.address));

    /// Initialize Distributor V1 with Staking V1 as recipient
    await waitFor(distributorV1.addRecipient(stakingV1.address, initialRewardRate));

    /// Initialize Distributor V1 as Treasury V1 reward manager
    await waitFor(treasuryV1.queue("8", distributorV1.address));
    await waitFor(treasuryV1.toggle("8", distributorV1.address, zeroAddress));

    /// Initialize deployer as reserve depositor for Treasury V1
    await waitFor(treasuryV1.queue("0", deployer));
    await waitFor(treasuryV1.toggle("0", deployer, zeroAddress));

    /// Initialize deployer as liquidity depositor for Treasury V1
    await waitFor(treasuryV1.queue("4", deployer));
    await waitFor(treasuryV1.toggle("4", deployer, zeroAddress));

    /// Approve Treasury V1 to spend deployer's DAI
    await waitFor(dai.approve(treasuryV1.address, largeApproval));

    /// Approve bonds to spend deployer's DAI
    await waitFor(dai.approve(bonds.address, largeApproval));

    /// Approve Staking V1 and Staking V1 Helper to spend deployer's OHM
    await waitFor(ohmV1.approve(stakingV1.address, largeApproval));
    await waitFor(ohmV1.approve(stakingV1Helper.address, largeApproval));

    /// Deposit 9,000,000 DAI to Treasury V1, 600,000 OHM V1 gets minted to deployer and 8,400,000 are in Treasury V1 as excess reserves
    await waitFor(treasuryV1.deposit("9000000000000000000000000", dai.address, "8400000000000000"));

    /// Stake OHM V1 through helper
    await waitFor(stakingV1Helper.stake("100000000000"));

    
    /// Set gOHM in Migrator
    await waitFor(migrator.setgOHM(gohm.address));

    /// Initialize Treasury V1
    await waitFor(treasury.enable("0", migrator.address, zeroAddress));
    await waitFor(treasury.enable("1", migrator.address, zeroAddress));
    await waitFor(treasury.enable("3", migrator.address, zeroAddress));
    await waitFor(treasury.enable("6", migrator.address, zeroAddress));
    await waitFor(treasury.enable("8", migrator.address, zeroAddress));
    await waitFor(treasury.enable("2", dai.address, zeroAddress));
    await waitFor(treasury.enable("0", bonds.address, zeroAddress));
    await waitFor(treasury.enable("0", deployer, zeroAddress));
    await waitFor(treasury.enable("4", deployer, zeroAddress));

    /// Set Migrator permissions on Treasury V1
    await waitFor(treasuryV1.queue("0", migrator.address));
    await waitFor(treasuryV1.toggle("0", migrator.address, zeroAddress));
    await waitFor(treasuryV1.queue("1", migrator.address));
    await waitFor(treasuryV1.toggle("1", migrator.address, zeroAddress));
    await waitFor(treasuryV1.queue("3", migrator.address));
    await waitFor(treasuryV1.toggle("3", migrator.address, zeroAddress));
    await waitFor(treasuryV1.queue("6", migrator.address));
    await waitFor(treasuryV1.toggle("6", migrator.address, zeroAddress));
    await waitFor(treasuryV1.queue("8", migrator.address));
    await waitFor(treasuryV1.toggle("8", migrator.address, zeroAddress));

    /// Set vault for OHM
    await waitFor(authority.pushVault(treasury.address, true));

    /// Approve the treasury to spend deployer's DAI
    await waitFor(dai.approve(treasury.address, largeApproval));

    /// Deposit 9,000,000 DAI to Treasury V2, 600,000 OHM V2 gets minted to deployer and 8,400,000 are in Treasury V2 as excess reserves
    await waitFor(treasury.deposit("9000000000000000000000000", dai.address, "8400000000000000"));

    /// Set Distributor V2 Treasury Perms
    await waitFor(treasury.enable("8", distributor.address, zeroAddress));

    /// Initialize sOHM V2
    await waitFor(sohm.setIndex(initialIndex));
    await waitFor(sohm.setgOHM(gohm.address));
    await waitFor(sohm.initialize(staking.address, treasury.address));

    /// Initialize Staking V2 with Distributor V2
    await waitFor(staking.setDistributor(distributor.address));

    /// Bond 1,000 DAI
    /// await waitFor(bonds.deposit(0, "1000000000000000000000", "47954242660", deployer, "0xee1520f94f304e8D551Cbf310Fe214212e3cA34a"));

    /// Migrate contracts so Staking V2 can mint gOHM
    await waitFor(migrator.migrateContracts(
        treasury.address,
        staking.address,
        ohm.address,
        sohm.address,
        dai.address
    ));

    /// Deposit 100,000 DAI to Faucet
    await waitFor(dai.transfer(faucet.address, "100000000000000000000000"));

    /// Deposit 100,000 OHM V1 to Faucet
    await waitFor(ohmV1.transfer(faucet.address, "100000000000000"));

    /// Deposit 100,000 OHM V2 to Faucet
    await waitFor(ohm.transfer(faucet.address, "100000000000000"));

    /// Contract Addresses
    console.log("OHM V1: " + ohmV1.address);
    console.log("OHM V2: " + ohm.address);
    console.log("sOHM V1: " + sohmV1.address);
    console.log("sOHM V2: " + sohm.address);
    console.log("wsOHM: " + wsohm.address);
    console.log("gOHM: " + gohm.address);
    console.log("DAI: " + dai.address);
    console.log("Treasury V1: " + treasuryV1.address);
    console.log("Treasury V2: " + treasury.address);
    console.log("Staking V1: " + stakingV1.address);
    console.log("Staking V1 Warmup: " + stakingV1Warmup.address);
    console.log("Staking V1 Helper: " + stakingV1Helper.address);
    console.log("Staking V2: " + staking.address);
    console.log("Distributor V1: " + distributorV1.address);
    console.log("Distributor V2: " + distributor.address);
    console.log("Migrator: " + migrator.address);
    console.log("Bonds Address: " + bonds.address);
    console.log("Inverse Bonds Address: " + inverseBonds.address);
    console.log("Yield Director: " + yieldDirector.address);
    console.log("Faucet: " + faucet.address);
};

func.tags = ["faucet", "testnet"];
func.dependencies = [
    CONTRACTS.DAI,
    CONTRACTS.testnetOHMv1,
    CONTRACTS.testnetOHM,
    CONTRACTS.sOhm,
    CONTRACTS.sOhmV1,
    CONTRACTS.gOhm,
    CONTRACTS.wsOHM,
    CONTRACTS.stakingV1,
    CONTRACTS.stakingV1Warmup,
    CONTRACTS.stakingV1Helper,
    CONTRACTS.staking,
    CONTRACTS.distributorV1,
    CONTRACTS.distributor,
    CONTRACTS.treasuryV1,
    CONTRACTS.treasury,
    CONTRACTS.authority,
    CONTRACTS.migrator,
    CONTRACTS.bondDepositoryV2,
    CONTRACTS.inverseBonds,
    CONTRACTS.yieldDirector,
    CONTRACTS.faucet,
];
func.runAtTheEnd = true;

export default func;
