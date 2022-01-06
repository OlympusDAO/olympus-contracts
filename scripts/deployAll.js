const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    // const DAI = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";
    // const FRAX = "0x2f7249cb599139e560f0c81c269ab9b04799e453";
    // const LUSD = "0x45754df05aa6305114004358ecf8d04ff3b84e26";

    const Authority = await ethers.getContractFactory("OlympusAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );
    const migrator = deployer.address;

    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    // const OHM = await ethers.getContractFactory("OlympusERC20Token");
    // const ohm = await OHM.deploy(authority.address);
    const VCASH = await ethers.getContractFactory("VCASH");
    const vcash = await VCASH.deploy(authority.address);

    const SOHM = await ethers.getContractFactory("sOlympus");
    const sOHM = await SOHM.deploy();

    const GOHM = await ethers.getContractFactory("gOHM");
    const gOHM = await GOHM.deploy(migrator, sOHM.address);

    const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
    const olympusTreasury = await OlympusTreasury.deploy(vcash.address, "0", authority.address);

    const OlympusStaking = await ethers.getContractFactory("OlympusStaking");
    const staking = await OlympusStaking.deploy( 
        vcash.address,
        sOHM.address,
        gOHM.address,
        "2200",
        firstEpochNumber,
        firstBlockNumber,
        authority.address
    );

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        olympusTreasury.address,
        vcash.address,
        staking.address,
        authority.address
    );

    console.log("Olympus Authority: ", authority.address);
    console.log("VCASH: " + vcash.address);
    console.log("sOhm: " + sOHM.address);
    console.log("gOHM: " + gOHM.address);
    console.log("Olympus Treasury: " + olympusTreasury.address);
    console.log("Staking Contract: " + staking.address);
    console.log("Distributor: " + distributor.address);
    
    await authority.deployed()
    await vcash.deployed()
    await sOHM.deployed()
    await gOHM.deployed()
    await olympusTreasury.deployed()
    await staking.deployed()
    await distributor.deployed()

    await authority.pushVault(olympusTreasury.address, true); // replaces ohm.setVault(treasury.address)
    // Initialize sohm
    await sOHM.setIndex("7675210820");
    await sOHM.setgOHM(gOHM.address);
    await sOHM.initialize(staking.address, olympusTreasury.address);
    await staking.setDistributor(distributor.address);
    
    try {
        await hre.run("verify:verify", {
            address: authority.address,
            constructorArguments: [
                deployer.address,
                deployer.address,
                deployer.address,
                deployer.address
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: vcash.address,
            constructorArguments: [
                authority.address
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: sOHM.address,
            constructorArguments: [
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: gOHM.address,
            constructorArguments: [
                migrator,
                sOHM.address
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
            address: olympusTreasury.address,
            constructorArguments: [
                vcash.address,
                '0',
                authority.address
            ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
        address: staking.address,
        constructorArguments: [
            vcash.address,
            sOHM.address,
            gOHM.address,
            "2200",
            firstEpochNumber,
            firstBlockNumber,
            authority.address
        ],
        })
    } catch(e) {
        console.log(e)
    }

    try {
        await hre.run("verify:verify", {
        address: distributor.address,
        constructorArguments: [
            olympusTreasury.address,
            vcash.address,
            staking.address,
            authority.address
        ],
        })
    } catch(e) {
        console.log(e)
    }
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
