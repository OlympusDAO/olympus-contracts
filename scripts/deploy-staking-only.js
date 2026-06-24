// scripts/deploy-staking-only.js
// Deploys only sOHM, gOHM, and Staking contracts (no other legacy contracts)
const { ethers } = require("hardhat");

async function main() {
    const INDEX = 269238508004; // Exact mainnet index
    const EPOCH_LENGTH = 28800; // 8 hours
    const OHM = "0x784cA0C006b8651BAB183829A99fA46BeCe50dBc";
    const TREASURY = "0x7D7406e4E5Fdb636C888cF17aBb42B5edE8B3722";
    const AUTHORITY = "0x81057Bef097462957B9388D8DCB7D4AB0699cADB";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    console.log("Network:", network.name);

    // Deploy sOHM
    console.log("\n--- Deploying sOHM ---");
    const SOHM = await ethers.getContractFactory("sOlympus");
    const sOHM = await SOHM.deploy();
    await sOHM.deployed();
    console.log("sOHM deployed:", sOHM.address);

    // Set index
    console.log("\n--- Setting Index ---");
    await sOHM.setIndex(INDEX);
    console.log("Index set to:", INDEX);

    // Deploy gOHM
    console.log("\n--- Deploying gOHM ---");
    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(deployer.address, sOHM.address);
    await gOHM.deployed();
    console.log("gOHM deployed:", gOHM.address);

    // Deploy Staking
    console.log("\n--- Deploying Staking ---");
    const Staking = await ethers.getContractFactory("OlympusStaking");
    const staking = await Staking.deploy(
        OHM,
        sOHM.address,
        gOHM.address,
        EPOCH_LENGTH,
        0,
        Math.floor(Date.now() / 1000),
        AUTHORITY
    );
    await staking.deployed();
    console.log("Staking deployed:", staking.address);

    // Set gOHM on sOHM
    console.log("\n--- Configuring Contracts ---");
    await sOHM.setgOHM(gOHM.address);
    console.log("gOHM set on sOHM");

    // Initialize sOHM
    await sOHM.initialize(staking.address, TREASURY);
    console.log("sOHM initialized");

    // Migrate gOHM
    await gOHM.migrate(staking.address, sOHM.address);
    console.log("gOHM migrated");

    console.log("\n========================================");
    console.log("         DEPLOYMENT SUMMARY");
    console.log("========================================");
    console.log("sOHM:    ", sOHM.address);
    console.log("gOHM:    ", gOHM.address);
    console.log("Staking: ", staking.address);
    console.log("Index:   ", INDEX);
    console.log("========================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
