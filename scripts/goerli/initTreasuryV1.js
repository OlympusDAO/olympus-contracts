const { ethers } = require("hardhat");
const {
    zeroAddress,
    daiBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    initialBondDebt,
    initialIndex,
    initialRewardRate,
    largeApproval,
} = require("./constants");

async function main() {
    const [deployer] = await ethers.getSigners();

    const treasuryV1 = await ethers.getContractAt(
        "TestnetTreasuryV1",
        "0xd2D1be4AfeBb2aa1af67F173216552fBC1FD3D13"
    );
    const daiBond = await ethers.getContractAt(
        "TestnetBondDepoV1",
        "0x12aFfE67F879E6ed04D044F3885AC8D320EcC604"
    );
    const ohmV1 = await ethers.getContractAt(
        "TestnetOhmV1",
        "0x00F40a8a6Ec0892D651757F46a64B64fA41601d2"
    );
    const sohmV1 = await ethers.getContractAt(
        "TestnetSohmV1",
        "0x6BfbD5A8B09dd27fDDE73B014c664A5330C23Bfa"
    );
    const stakingV1 = await ethers.getContractAt(
        "TestnetStakingV1",
        "0x1c18053B3FD90FC5C4Af7267D3B4D49Aa63396C1"
    );
    const stakingWarmupV1 = await ethers.getContractAt(
        "TestnetStakingWarmupV1",
        "0x88E0d373E09AD5E34f5F349647D20022914EcE9B"
    );
    const stakingHelperV1 = await ethers.getContractAt(
        "TestnetStakingHelperV1",
        "0x21607BE08d64E5f6424982C656E5B88d5F6b83d8"
    );
    const dai = await ethers.getContractAt("DAI", "0x26Ea52226a108ba48b9343017A5D0dB1456D4474");
    const distributorV1 = await ethers.getContractAt(
        "TestnetDistributorV1",
        "0xB79b2F164c966ee1D0bd6eF3D4cc9e86567C8E07"
    );

    /* Already done
  /// Initialize DAI Bond for Treasury
  await treasuryV1.queue("0", daiBond.address);
  await treasuryV1.toggle("0", daiBond.address, zeroAddress);
  await daiBond.initializeBondTerms(
    daiBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    initialBondDebt
  );
  */

    /// Initialize Distributor as Treasury reward manager
    await (await treasuryV1.queue("8", distributorV1.address)).wait();
    await (await treasuryV1.toggle("8", distributorV1.address, zeroAddress)).wait();

    /// Initialize deployer as reserve depositor
    await (await treasuryV1.queue("0", deployer.address)).wait();
    await (await treasuryV1.toggle("0", deployer.address, zeroAddress)).wait();

    /// Initialize deployer as liquidity depositor
    await (await treasuryV1.queue("4", deployer.address)).wait();
    await (await treasuryV1.toggle("4", deployer.address, zeroAddress)).wait();

    /// Set treasury for OHM
    await (await ohmV1.setVault(treasuryV1.address)).wait();

    /// Initialize sOHM v1
    await (await sohmV1.setIndex(initialIndex)).wait();
    await (await sohmV1.initialize(stakingV1.address)).wait();

    /// Initialize Staking v1 with Distributor and Warmup
    await (await stakingV1.setContract("0", distributorV1.address)).wait();
    await (await stakingV1.setContract("1", stakingWarmupV1.address)).wait();

    /// Initialize Distributor with Staking as recipient
    await (await distributorV1.addRecipient(stakingV1.address, initialRewardRate)).wait();

    /// Approve the treasury to spend deployer's DAI
    await (await dai.approve(treasuryV1.address, largeApproval)).wait();

    /// Approve DAI bond to spend deployer's DAI
    await (await dai.approve(daiBond.address, largeApproval)).wait();

    /// Approve staking and staking helper to spend deployer's OHM
    await (await ohmV1.approve(stakingV1.address, largeApproval)).wait();
    await (await ohmV1.approve(stakingHelperV1.address, largeApproval)).wait();

    /// Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excess reserves
    await (
        await treasuryV1.deposit("9000000000000000000000000", dai.address, "8400000000000000")
    ).wait();

    /// Stake OHM through helper
    await (await stakingHelperV1.stake("100000000000")).wait();

    /// Bond 1,000 DAI in its bond
    await (await daiBond.deposit("1000000000000000000000", "60000", deployer.address)).wait();
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
