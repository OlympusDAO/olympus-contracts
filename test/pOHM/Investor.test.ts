import { ethers } from "hardhat";
import { BigNumber, Wallet } from "ethers";
import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { DAI, DAI__factory, GOHM, GOHM__factory, InvestorClaimV2, InvestorClaimV2__factory, OlympusERC20Token, OlympusERC20Token__factory, OlympusTreasury, OlympusTreasury__factory, SOlympus, SOlympus__factory } from "../../types";
chai.use(smock.matchers);

const getWallets = () => {
  const alice = Wallet.fromMnemonic(
      "test test test test test test test test test test test junk",
      "m/44'/60'/0'/0/3"
  ).connect(ethers.provider);
  const bob = Wallet.fromMnemonic(
      "test test test test test test test test test test test junk",
      "m/44'/60'/0'/0/4"
  ).connect(ethers.provider);

  return {
    alice,
    bob
  }
};

const deployInvestor = async (index: number) => {
  const [owner] = await ethers.getSigners();
  const { alice, bob } = getWallets();
  // deploy Authority
  const Authority = await ethers.getContractFactory('OlympusAuthority');
  const authority = await Authority.deploy(owner.address, owner.address, owner.address, owner.address);
  await authority.deployed();

  // deploy OHM
  const OHM = await ethers.getContractFactory('OlympusERC20Token');
  const ohm = await OHM.deploy(authority.address);
  await ohm.deployed();

  // sohm
  const SOHM = await ethers.getContractFactory("sOlympus");
  const sOHM = await SOHM.deploy();

  // gohm
  const GOHM = await ethers.getContractFactory("gOHM");
  const gOHM = await GOHM.deploy(owner.address, sOHM.address);

  // // deploy Staking
  const firstEpochNumber = "550";
  const firstBlockNumber = "9505000";
  const Staking = await ethers.getContractFactory('OlympusStaking');
  const staking = await Staking.deploy(
    ohm.address,
    sOHM.address,
    gOHM.address,
    "2200",
    firstEpochNumber,
    firstBlockNumber,
    authority.address
  );
  await staking.deployed();

  // migrate gOHM
  await gOHM.migrate(staking.address, sOHM.address);

  // deploy DAI
  const DAI = await ethers.getContractFactory('DAI');
  const dai = await DAI.deploy(1337);
  await dai.deployed();
  // mint some DAI
  await dai.mint(alice.address, "1000000000000000000000");
  await dai.mint(bob.address, "1000000000000000000000");

  // deploy Treasury
  const Treasury = await ethers.getContractFactory('OlympusTreasury');
  const treasury = await Treasury.deploy(ohm.address, 0, authority.address);
  await treasury.deployed();

  // mint some OHM
  const mintAmount = "1000000000000";
  // some to dao
  await ohm.mint(owner.address, mintAmount);
  // some to a user
  await ohm.mint(bob.address, (Number(mintAmount)*3).toString());
  const circulatingSupply = Number(mintAmount)*3;

  await authority.pushVault(treasury.address, true);
  // // dao
  const daoAddress = owner.address;
  
  // // claim
  const claimAddress = owner.address;

  // // deploy Investor
  const Investor = await ethers.getContractFactory('InvestorClaimV2');
  const investor = await Investor.deploy(
    ohm.address,
    dai.address,
    treasury.address,
    staking.address,
    daoAddress,
    gOHM.address,
    claimAddress
  );
  await investor.deployed();

  // enable DAI as reserve
  await treasury.enable(2, dai.address, ethers.constants.AddressZero)
  await treasury.initialize()
  // queue investor as a reserveDepositor
  await treasury.queueTimelock(0, investor.address, ethers.constants.AddressZero)
  await treasury.execute(0);
  // set index for sOHM (required for gOHM calculation)
  await sOHM.setIndex(index);

  // approve dai to be spent on investor by alice
  await dai.connect(alice).approve(investor.address, "10000000000000000000000000000000000000");

  return {
    investorAddress: investor.address,
    ohmAddress: ohm.address,
    daiAddress: dai.address,
    treasuryAddress: treasury.address,
    stakingAddress: staking.address,
    daoAddress,
    gOHMaddress: gOHM.address,
    claimAddress,
    mintAmount,
    circulatingSupply,
    sOHMaddress: sOHM.address,
  };
};

describe("Investor", () => {

  describe("constructor", () => {
    it("can be constructed", async () => {
      const {investorAddress, circulatingSupply} = await deployInvestor(1);
      const Investor = await ethers.getContractFactory('InvestorClaimV2');
      const investor = Investor.attach(investorAddress);

      // circulating Supply = total OHM - DAO OHM
      expect(await investor.circulatingSupply()).to.equal(circulatingSupply);
    });
  });

  describe("functionality", () => {
    let investor: InvestorClaimV2;
    let treasury: OlympusTreasury;
    let circSupply: number;
    let dai: DAI;
    let ohm: OlympusERC20Token;
    let gohm: GOHM;

    beforeEach(async () => {
      const [owner] = await ethers.getSigners();
      const {investorAddress, circulatingSupply, daiAddress, ohmAddress, gOHMaddress, treasuryAddress} = await deployInvestor(156)
      circSupply = circulatingSupply;
      investor = new InvestorClaimV2__factory(owner).attach(investorAddress);
      treasury = new OlympusTreasury__factory(owner).attach(treasuryAddress);
      dai = new DAI__factory(owner).attach(daiAddress);
      ohm = new OlympusERC20Token__factory(owner).attach(ohmAddress);
      gohm = new GOHM__factory(owner).attach(gOHMaddress);
    });

    it("can set Terms", async () => {
      const { alice } = getWallets();
      const percent = 4200
      const claimed = "1000000000000000000" // 18 decimals quantity of gohm == 1 gohm
      const max = 13000000000 // ohm quantity
      await investor.setTerms(alice.address, percent, claimed, max);
      const claimedOhm = await investor.claimed(alice.address);
      const redeemable = (circSupply*percent*1000) - Number(claimedOhm.toString())*10**9;
      const returnedTerms = await investor.terms(alice.address);
      const index = await gohm.index();
      expect(returnedTerms.percent).to.equal(percent);
      expect(returnedTerms.gClaimed).to.equal(claimed);
      expect(returnedTerms.max).to.equal(max);
      expect(await investor.redeemableFor(alice.address)).to.equal(redeemable.toString());
      expect(claimedOhm).to.equal(Number(claimed)/(10**18)*Number(index.toString()));
    });

    it("cannot duplicate addresses when setting terms", async () => {
      const { alice } = getWallets();
      const percent = 4200
      const claimed = "3108666666666000000"
      const max = 13000000000
      await investor.setTerms(alice.address, percent, claimed, max);
      await expect(investor.setTerms(alice.address, percent, claimed, max))
        .to.be.revertedWith("address already exists");
    });

    it("cannot allocate more than 4% of supply", async () => {
      const { alice } = getWallets();
      const percent = 40001 // 4% = 40000
      const claimed = "3108666666666000000"
      const max = 13000000000
      await expect(investor.setTerms(alice.address, percent, claimed, max))
        .to.be.revertedWith("Cannot allocate more");
    });

    it("should return 0 redeemable as default", async () => {
      const { bob } = getWallets();
      const redeemable = await investor.redeemableFor(bob.address);
      expect(redeemable).to.equal(0);
    });

    it("cannot claim more than vested", async () => {
      const { alice } = getWallets();
      await investor.connect(alice).approve();
      // don't setTerms so 0 is vested
      await expect(investor.connect(alice).claim(alice.address, 10000000000))
        .to.be.revertedWith("Claim more than vested");
    });

    it("cannot claim more than max", async () => {
      const { alice } = getWallets();
      await investor.connect(alice).approve();
      // 1. setTerms for alice
      const percent = 4200
      const claimed = "0"
      const max = "4108666666" // ohm quantity == 4.1 ohm
      // dai quantity has 9 more decimals
      const claimableMax = (Number("4208666666")*10**9).toString();
      const beforeOhmBalance = await ohm.balanceOf(alice.address);
      await investor.setTerms(alice.address, percent, claimed, max);
      // would claim the max but decimal precision is not respected
      await expect(investor.connect(alice).claim(alice.address, claimableMax))
        .to.be.revertedWith("Claim more than vested");
      // await investor.connect(alice).claim(alice.address, claimableMax);
      const afterOhmBalance = await ohm.balanceOf(alice.address);
      expect(beforeOhmBalance).to.equal(afterOhmBalance);
    });

    it("can claim", async () => {
      const { alice } = getWallets();
      // 1. setTerms for alice
      const percent = 4200
      const claimed = "3108666666666000000"
      const max = 13000000000
      await investor.setTerms(alice.address, percent, claimed, max);
      const alreadyClaimed = await investor.claimed(alice.address);
      // 2. alice can now interact
      await investor.connect(alice).approve();
      const beforeDaiBalance = await dai.balanceOf(alice.address);
      const beforeOhmBalance = await ohm.balanceOf(alice.address);
      const claimAmount = "1000000000000000000"; // 1 DAI = 1 OHM
      await investor.connect(alice).claim(alice.address, String(claimAmount))
      const afterDaiBalance = await dai.balanceOf(alice.address);
      const afterOhmBalance = await ohm.balanceOf(alice.address);
      // after claim balance of OHM should equal deposited DAI/1e9
      // after claim balance of DAI should be decreased by claimAmount
      expect(await investor.claimed(alice.address)).to.equal(Number(alreadyClaimed) + (Number(claimAmount)/(10**9)));
      expect(Number(ethers.utils.formatUnits(afterOhmBalance, 9))).to.equal(
        Number(ethers.utils.formatUnits(claimAmount, 18)) +
          Number(ethers.utils.formatUnits(beforeOhmBalance, 9))
      );
      // expect(afterDaiBalance).to.equal(Number(beforeDaiBalance.toString())-claimAmount);
      expect(Number(ethers.utils.formatUnits(afterDaiBalance, 18))).to.equal(
        Number(ethers.utils.formatUnits(beforeDaiBalance, 18)) -
          Number(ethers.utils.formatUnits(claimAmount, 18))
      );
    });

    it("can calculate redeemableFor", async () => {
      const { alice } = getWallets();
      const percent = 4200
      const claimed = "100000000000000000" // 18 decimals quantity of gohm == 0.1 gohm
      const max = 13000000000 // ohm quantity
      const index = await gohm.index();
      await investor.setTerms(alice.address, percent, claimed, max);
      const claimedOhm = await investor.claimed(alice.address);
      const redeemableFor = await investor.redeemableFor(alice.address);
      const redeemable = (circSupply*percent*1000) - Number(claimedOhm.toString())*10**9;
      expect(redeemableFor).to.equal(redeemable.toString());
      expect(claimedOhm).to.equal(BigNumber.from(claimed).mul(index).div(String(10**18)));
    });

    it("can claim repeatedly with 9 decimals precision", async () => {
      const { alice } = getWallets();
      const percent = 4200
      const claimed = "100000000000000000" // 18 decimals quantity of gohm == 0.1 gohm
      const max = 13000000000 // ohm quantity
      const index = await gohm.index();
      await investor.setTerms(alice.address, percent, claimed, max);
      let claimedOhm = await investor.claimed(alice.address);
      // approve new claiming
      await investor.connect(alice).approve();

      const beforeDaiBalance = await dai.balanceOf(alice.address);
      const formattedBeforeDaiBalance = Number(ethers.utils.formatUnits(beforeDaiBalance, 18))      
      const beforeOhmBalance = await ohm.balanceOf(alice.address);
      const formattedBeforeOhmBalance = Number(ethers.utils.formatUnits(beforeOhmBalance, 9))

      // claim 0.000000001 OHM 10 times
      let actuallyClaimed = 0.1*Number(index);
      const smolClaim = 1000000000; // 0.000000001 DAI
      const claimTimes = 10
      for(let i = 0; i < claimTimes; i++){
        actuallyClaimed = actuallyClaimed + smolClaim/(10**9);
        await investor.connect(alice).claim(alice.address, smolClaim);
        claimedOhm = await investor.claimed(alice.address);
      }
      // have ohm & dai transferred???
      const afterDaiBalance = await dai.balanceOf(alice.address);
      const formattedAfterDaiBalance = Number(ethers.utils.formatUnits(afterDaiBalance, 18))
      const afterOhmBalance = await ohm.balanceOf(alice.address);
      const formattedAfterOhmBalance = Number(ethers.utils.formatUnits(afterOhmBalance, 9))
      expect(formattedAfterOhmBalance).to.equal(
        Number(ethers.utils.formatUnits(smolClaim*claimTimes, 18)) +
          formattedBeforeOhmBalance
      );
      expect(formattedAfterDaiBalance).to.equal(
        formattedBeforeDaiBalance -
          Number(ethers.utils.formatUnits(smolClaim*claimTimes, 18))
      );
    });
  });

  describe("high Index functionality", () => {
    let investor: InvestorClaimV2;
    let circSupply: number;
    let dai: DAI;
    let ohm: OlympusERC20Token;
    let gohm: GOHM;

    beforeEach(async () => {
      const [owner] = await ethers.getSigners();
      const {investorAddress, circulatingSupply, daiAddress, ohmAddress, gOHMaddress} = await deployInvestor(10000);
      circSupply = circulatingSupply;
      investor = new InvestorClaimV2__factory(owner).attach(investorAddress);
      dai = new DAI__factory(owner).attach(daiAddress);
      ohm = new OlympusERC20Token__factory(owner).attach(ohmAddress);
      gohm = new GOHM__factory(owner).attach(gOHMaddress);
    });

    it("can calculate redeemableFor", async () => {
      const { alice } = getWallets();
      const percent = 4200
      const claimed = "100000000000000000" // 18 decimals quantity of gohm == 0.1 gohm
      const max = 13000000000 // ohm quantity
      const index = await gohm.index();
      await investor.setTerms(alice.address, percent, claimed, max);
      const claimedOhm = await investor.claimed(alice.address);
      const redeemableFor = await investor.redeemableFor(alice.address);
      // NOTE (appleseed): there is a precision issue here... continued on line 177
      const redeemable = (circSupply*percent*1000) - Number(claimedOhm.toString())*10**9;
      expect(redeemableFor).to.equal(redeemable.toString());
      // NOTE (appleseed): continued logic flaw, all precision on claimed is lost
      expect(claimedOhm).to.equal(BigNumber.from(claimed).mul(index).div(String(10**18)));
    });

    it("can claim with 9 decimals precision", async () => {
      const { alice } = getWallets();
      const percent = 4200
      const claimed = "100000000000000000" // 18 decimals quantity of gohm == 0.1 gohm
      const max = 13000000000 // ohm quantity
      const index = await gohm.index();
      await investor.setTerms(alice.address, percent, claimed, max);

      // approve new claiming
      await investor.connect(alice).approve();

      const beforeDaiBalance = await dai.balanceOf(alice.address);
      const formattedBeforeDaiBalance = Number(ethers.utils.formatUnits(beforeDaiBalance, 18))      
      const beforeOhmBalance = await ohm.balanceOf(alice.address);
      const formattedBeforeOhmBalance = Number(ethers.utils.formatUnits(beforeOhmBalance, 9))

      // claim 0.000000001 OHM 10 times
      let actuallyClaimed = 0.1*Number(index);
      const smolClaim = 1000000000; // 0.000000001 DAI
      const claimTimes = 10;
      for(let i = 0; i < claimTimes; i++){
        actuallyClaimed = actuallyClaimed + smolClaim/(10**9);
        await investor.connect(alice).claim(alice.address, smolClaim);
      }
      // have ohm & dai transferred???
      const afterDaiBalance = await dai.balanceOf(alice.address);
      const formattedAfterDaiBalance = Number(ethers.utils.formatUnits(afterDaiBalance, 18))
      const afterOhmBalance = await ohm.balanceOf(alice.address);
      const formattedAfterOhmBalance = Number(ethers.utils.formatUnits(afterOhmBalance, 9))
      expect(formattedAfterOhmBalance).to.equal(
        Number(ethers.utils.formatUnits(smolClaim*claimTimes, 18)) +
          formattedBeforeOhmBalance
      );
      expect(formattedAfterDaiBalance).to.equal(
        formattedBeforeDaiBalance -
          Number(ethers.utils.formatUnits(smolClaim*claimTimes, 18))
      );
    });
  });
});
