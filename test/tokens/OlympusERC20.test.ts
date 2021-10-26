import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";

const { expect } = require("chai");
const { ethers } = require("hardhat");

import { OlympusERC20Token } from '../../types'

describe("OlympusERC20Token", () => {
  let deployer: SignerWithAddress;
  let vault: SignerWithAddress;
  let user: SignerWithAddress;
  let OHMContract;
  let OHM: OlympusERC20Token;

  beforeEach(async () => {
    [deployer, vault, user] = await ethers.getSigners();

    OHMContract = await ethers.getContractFactory("OlympusERC20Token");
    OHM = await OHMContract.connect(deployer).deploy();
    await OHM.setVault(vault.address);
  });

  it("correctly constructs an ERC20", async () => {
    expect(await OHM.name()).to.equal("Olympus");
    expect(await OHM.symbol()).to.equal("OHM");
    expect(await OHM.decimals()).to.equal(9);
  });

  describe("mint", () => {
    it("must be done by vault", async () => {
      await expect(OHM.connect(deployer).mint(user.address, 100)).
        to.be.revertedWith("VaultOwned: caller is not the Vault");
    });

    it("increases total supply", async () => {
      let supplyBefore = await OHM.totalSupply();
      await OHM.connect(vault).mint(user.address, 100);
      expect(supplyBefore.add(100)).to.equal(await OHM.totalSupply());
    });
  });

  describe("burn", () => {
    beforeEach(async () => {
      await OHM.connect(vault).mint(user.address, 100);
    });

    it("reduces the total supply", async () => {
      let supplyBefore = await OHM.totalSupply();
      await OHM.connect(user).burn(10);
      expect(supplyBefore.sub(10)).to.equal(await OHM.totalSupply());
    });

    it("cannot exceed total supply", async () => {
      let supply = await OHM.totalSupply();
      await expect(OHM.connect(user).burn(supply.add(1))).
        to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("cannot exceed user's balance", async () => {
      let otherUser = await ethers.getSigner();
      await OHM.connect(vault).mint(otherUser.address, 15);
      await expect(OHM.connect(otherUser).burn(16)).
        to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });
});
