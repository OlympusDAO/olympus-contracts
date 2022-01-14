const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);

  // const DAI = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";
  // const FRAX = "0x2f7249cb599139e560f0c81c269ab9b04799e453";
  // const LUSD = "0x45754df05aa6305114004358ecf8d04ff3b84e26";

  const bondCapicity = "10000000000000000000000";
  const bondBCV = "369";
  const bondVestingLength = "23000";
  const bondExpiration = "100000000000000";
  const bondConclusion = "100000000000000";
  const minBondPrice = "1000";
  const maxBondPayout = "100";
  const maxBondDebt = "1000000000000000";
  const intialBondDebt = "0";

  //deploy mock stable token
  const DAI = await ethers.getContractFactory("DAI");
  const dai = await DAI.deploy(0);
  await dai.mint(deployer.address, "10000000000000000000000");
  console.log("dai deployed");

  const FRAX = await ethers.getContractFactory("FRAX");
  const frax = await FRAX.deploy(0);
  await frax.mint(deployer.address, "10000000000000000000000");
  console.log("frax deployed");

  const Authority = await ethers.getContractFactory("OlympusAuthority");
  const authority = await Authority.deploy(
    deployer.address,
    deployer.address,
    deployer.address,
    deployer.address
  );
  console.log("Authority deployed");
  const migrator = deployer.address;

  const firstEpochNumber = "550";
  const firstBlockNumber = "9505000";

  // const OHM = await ethers.getContractFactory("OlympusERC20Token");
  // const ohm = await OHM.deploy(authority.address);
  const VCASH = await ethers.getContractFactory("VCASH");
  const vcash = await VCASH.deploy(authority.address);
  console.log("vcash deployed");

  const SOHM = await ethers.getContractFactory("sOlympus");
  const sOHM = await SOHM.deploy();
  console.log("sohm deployed");

  const GOHM = await ethers.getContractFactory("gOHM");
  const gOHM = await GOHM.deploy(migrator, sOHM.address);
  console.log("gohm deployed");

  const OlympusTreasury = await ethers.getContractFactory("OlympusTreasury");
  const olympusTreasury = await OlympusTreasury.deploy(vcash.address, "0", authority.address);
  console.log("treasury deployed");

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
  console.log("staking deployed");

  const Distributor = await ethers.getContractFactory("Distributor");
  const distributor = await Distributor.deploy(
    olympusTreasury.address,
    vcash.address,
    staking.address,
    authority.address
  );
  console.log("distributor deployed");

  const OlympusBondDepository = await ethers.getContractFactory("OlympusBondDepository");
  const bondDepository = await OlympusBondDepository.deploy(vcash.address, olympusTreasury.address, authority.address);
  console.log("bond depository deployed");

  const OlympusBondingCalculator = await ethers.getContractFactory("OlympusBondingCalculator");
  const bondingCalculator = await OlympusBondingCalculator.deploy(vcash.address);
  console.log("bonding calculator deployed");

  const BondTeller = await ethers.getContractFactory("BondTeller");
  const bondTeller = await BondTeller.deploy(bondDepository.address, staking.address, olympusTreasury.address, vcash.address, sOHM.address, authority.address);
  console.log("DAI: " + dai.address);
  console.log("FRAX: " + frax.address);
  console.log("Olympus Authority: ", authority.address);
  console.log("VCASH: " + vcash.address);
  console.log("sOhm: " + sOHM.address);
  console.log("gOHM: " + gOHM.address);
  console.log("Olympus Treasury: " + olympusTreasury.address);
  console.log("Staking Contract: " + staking.address);
  console.log("Distributor: " + distributor.address);
  console.log("BondDepository: " + bondDepository.address);
  console.log("BondingCalculator: " + bondingCalculator.address);
  console.log("BondTeller: " + bondTeller.address);

  await authority.deployed()
  console.log("authority deploy verified");
  await vcash.deployed()
  console.log("vcash deploy verified");
  await sOHM.deployed()
  console.log("vcash deploy verified");
  await gOHM.deployed()
  console.log("gohm deploy verified");
  await olympusTreasury.deployed()
  console.log("treasury deploy verified");
  await staking.deployed()
  console.log("staking deploy verified");
  await distributor.deployed()
  console.log("distributor deploy verified");
  await bondDepository.deployed()
  console.log("depository deploy verified");
  await bondingCalculator.deployed()
  console.log("calculator deploy verified");
  await bondTeller.deployed()
  console.log("teller deploy verified");

  await authority.pushVault(olympusTreasury.address, true); // replaces ohm.setVault(treasury.address)
  // Initialize sohm
  await sOHM.setIndex("7675210820");
  await sOHM.setgOHM(gOHM.address);
  await sOHM.initialize(staking.address, olympusTreasury.address);
  await staking.setDistributor(distributor.address);
  await staking.setDistributor(distributor.address);
  console.log("initial setting performed");

  await bondDepository.setTeller(bondTeller.address);
  console.log("set bondTeller")

  //bond depository setting
  await bondDepository.addBond(dai.address, bondingCalculator.address, bondCapicity, false);
  await bondDepository.addBond(frax.address, bondingCalculator.address, bondCapicity, false);
  console.log("tokens added to bond depository");
  await bondDepository.setTerms(0, bondBCV, true, bondVestingLength, bondExpiration, bondConclusion, minBondPrice, maxBondPayout, maxBondDebt, intialBondDebt);
  await bondDepository.setTerms(1, bondBCV, true, bondVestingLength, bondExpiration, bondConclusion, minBondPrice, maxBondPayout, maxBondDebt, intialBondDebt);
  console.log("deploy finished");

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
    console.log("authority verify success");
  } catch (e) {
    console.log("authority verify error");
  }

  try {
    await hre.run("verify:verify", {
      address: vcash.address,
      constructorArguments: [
        authority.address
      ],
    });
    console.log("vcash verify success");
  } catch (e) {
    console.log("vcash verify error");
  }

  try {
    await hre.run("verify:verify", {
      address: sOHM.address,
      constructorArguments: [
      ],
    })
  } catch (e) {
    console.log(e);
  }

  try {
    await hre.run("verify:verify", {
      address: gOHM.address,
      constructorArguments: [
        migrator,
        sOHM.address
      ],
    })
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    console.log(e)
  }

  try {
    await hre.run("verify:verify", {
      address: bondDepository.address,
      constructorArguments: [
        vcash.address,
        olympusTreasury.address,
        authority.address
      ],
    })
  } catch (e) {
    console.log(e)
  }

  try {
    await hre.run("verify:verify", {
      address: bondingCalculator.address,
      constructorArguments: [
        vcash.address,
      ],
    })
  } catch (e) {
    console.log(e)
  }

  try {
    await hre.run("verify:verify", {
      address: bondTeller.address,
      constructorArguments: [
        bondDepository.address,
        staking.address,
        olympusTreasury.address,
        vcash.address,
        sOHM.address,
        authority.address
      ],
    })
  } catch (e) {
    console.log(e)
  }

  try {
    await hre.run("verify:verify", {
      address: dai.address,
      constructorArguments: [
        0
      ],
    })
  } catch (e) {
    console.log(e)
  }

  try {
    await hre.run("verify:verify", {
      address: frax.address,
      constructorArguments: [
        0
      ],
    })
  } catch (e) {
    console.log(e)
  }
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
