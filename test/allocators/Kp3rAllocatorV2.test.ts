import { ethers, config } from "hardhat";
import { expect, util } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  OlympusTreasury,
  TreasuryExtender,
  TreasuryExtender__factory,
  OlympusAuthority,
  ERC20,
  Kp3rAllocatorV2,
  Kp3rAllocatorV2__factory,
} from "../../types";

import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { join } from "path/posix";
import { gaugeAbi, kp3rVaultAbi, rkp3rAbi, rkp3rDistributorAbi } from "../utils/abi";
import { protocols } from "../utils/protocols";
import { wlContractAbi } from "../utils/fxsAllocatorAbis";

const bne = helpers.bne;

describe("Kp3rAllocatorV2", () => {
  // signers
  let owner: SignerWithAddress;
  let governor: SignerWithAddress;
  let guardian: SignerWithAddress;
  let kp3rAdmin: SignerWithAddress;
  let whitelistAdmin: SignerWithAddress;
  
  // contracts
  let extender: TreasuryExtender;
  let treasury: OlympusTreasury;
  let authority: OlympusAuthority;
  let allocator: Kp3rAllocatorV2;
  let factory: Kp3rAllocatorV2__factory;

  //tokens
  let usdc: ERC20;
  let kp3r: ERC20;
  let veKp3r: any;
  let tokens: ERC20[];
  let utilTokens: any[];

  // other util contracts
  let gauge: any;
  let distributor: any;
  let rkp3r: any;
  let whitelist: any;

  // network
  let url: string = config.networks.hardhat.forking!.url;

  // variables
  let snapshotId: number = 0;
  let localSnapId: number = 0;
  let amount: BigNumber;

  before(async () => {
    await helpers.pinBlock(14475495, url);

    amount = bne(10, 19);

    usdc = await helpers.getCoin(coins.usdc);
    kp3r = await helpers.getCoin(coins.kp3r);
    tokens = [kp3r, usdc];

    veKp3r = await ethers.getContractAt(kp3rVaultAbi, protocols.keep3r.kp3rVault);
    utilTokens = [veKp3r];

    gauge = await ethers.getContractAt(gaugeAbi, protocols.keep3r.gauge);
    distributor = await ethers.getContractAt(rkp3rDistributorAbi, protocols.keep3r.rkp3rDistributor);
    rkp3r = await ethers.getContractAt(rkp3rAbi, protocols.keep3r.rkp3r);

    treasury = (await ethers.getContractAt(
      "OlympusTreasury",
      olympus.treasury
    )) as OlympusTreasury;

    authority = (await ethers.getContractAt(
      "OlympusAuthority",
      olympus.authority
    )) as OlympusAuthority;

    const extenderFactory: TreasuryExtender__factory = (await ethers.getContractFactory(
      "TreasuryExtender"
    )) as TreasuryExtender__factory;

    extender = await extenderFactory.deploy(treasury.address, authority.address);

    owner = (await ethers.getSigners())[0];

    guardian = await helpers.impersonate(await authority.guardian());
    governor = await helpers.impersonate(await authority.governor());

    kp3rAdmin = await helpers.impersonate(protocols.keep3r.admin);
    whitelistAdmin = await helpers.impersonate(protocols.frax.whitelistAdmin)

    extender = extender.connect(guardian);
    treasury = treasury.connect(governor);

    treasury.enable(3, extender.address, helpers.constants.addressZero);
    treasury.enable(0, extender.address, helpers.constants.addressZero);

    factory = (await ethers.getContractFactory("Kp3rAllocatorV2")) as Kp3rAllocatorV2__factory;
    factory = factory.connect(guardian);

    allocator = await factory.deploy(
      {
        authority: authority.address,
        tokens: [kp3r.address, usdc.address],
        extender: extender.address,
      },
      olympus.treasury,
      veKp3r.address,
      gauge.address,
      distributor.address,
      rkp3r.address,
    );

    whitelist = await ethers.getContractAt(
      wlContractAbi,
      protocols.frax.contractWhitelist,
    );
    whitelist = whitelist.connect(whitelistAdmin);
    await whitelist.approveWallet(allocator.address);

    await veKp3r.connect(kp3rAdmin).commit_smart_wallet_checker(whitelist.address);
    await veKp3r.connect(kp3rAdmin).apply_smart_wallet_checker();
  });

  beforeEach(async () => {
    snapshotId = await helpers.snapshot();
  });

  afterEach(async () => {
    await helpers.revert(snapshotId);
  });

  describe("initialization", () => {
    it("should deploy single token with correct info", async () => {
      expect(await allocator.treasury()).to.equal(olympus.treasury);
      expect(await allocator.kp3rVault()).to.equal(veKp3r.address);
      expect(await allocator.gauge()).to.equal(gauge.address);
      expect(await allocator.distributor()).to.equal(distributor.address);
      expect(await allocator.rKp3r()).to.equal(rkp3r.address);
      expect((await allocator.tokens())[0]).to.equal(kp3r.address);
      expect((await allocator.tokens())[1]).to.equal(usdc.address);
    });

    it("should registerDeposit()",async () => {
      await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
    });
  });

  describe("updates correctly", () => {
    beforeEach(async () => {
      await extender.registerDeposit(allocator.address);
      await extender.registerDeposit(allocator.address);

      await extender.setAllocatorLimits(1, {
        allocated: bne(10, 23),
        loss: bne(10, 19),
      });

      await extender.setAllocatorLimits(2, {
        allocated: bne(10, 12),
        loss: bne(10, 9),
      });

      await allocator.activate();

      await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
        kp3r,
        allocator,
        amount
      );
    });

    it("should revert if not guardian", async () => {
      await expect(allocator.connect(owner).update(1)).to.be.reverted;
      await expect(allocator.connect(owner).update(2)).to.be.reverted;
    });

    it("should revert if not third token", async () => {
      await expect(extender.registerDeposit(allocator.address)).to.be.reverted;
    });

    it("should update for kp3r", async () => {
      expect((await utilTokens[0].locked(allocator.address))[0]).to.equal(0);
      await expect(() => allocator.update(1)).to.changeTokenBalance(
        tokens[0],
        allocator,
        BigNumber.from(0).sub(amount)
      );

      expect((await utilTokens[0].locked(allocator.address))[0]).to.equal(amount);
      
      expect(await extender.getAllocatorAllocated(1)).to.equal(amount);
    });

    it("should deposit more", async () => {
      expect((await utilTokens[0].locked(allocator.address))[0]).to.equal(0);
      await expect(() => allocator.update(1)).to.changeTokenBalance(
        tokens[0],
        allocator,
        BigNumber.from(0).sub(amount)
      );
      expect((await utilTokens[0].locked(allocator.address))[0]).to.be.gt(0);
      expect(await extender.getAllocatorAllocated(1)).to.equal(amount);

      await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
        tokens[0],
        allocator,
        amount
      );

      const balance: BigNumber = (await utilTokens[0].locked(allocator.address))[0];
      await expect(() => allocator.update(1)).to.changeTokenBalance(
        tokens[0],
        allocator,
        BigNumber.from(0).sub(amount)
      );
      expect((await utilTokens[0].locked(allocator.address))[0]).to.be.gt(balance);
      expect(await extender.getAllocatorAllocated(1)).to.equal(amount.mul(2));
    });
  })
})
