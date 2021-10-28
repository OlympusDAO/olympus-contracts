import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { OlympusERC20Token, OlympusERC20Token__factory } from '../../types'

describe.skip("OlympusTest", () => {
  let deployer: SignerWithAddress;
  let vault: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  let ohm: OlympusERC20Token;

  beforeEach(async () => {
    [deployer, vault, bob, alice] = await ethers.getSigners();

    ohm = await (new OlympusERC20Token__factory(deployer)).deploy();
    await ohm.setVault(vault.address);
  });

  it("correctly constructs an ERC20", async () => {
    expect(await ohm.name()).to.equal("Olympus");
    expect(await ohm.symbol()).to.equal("OHM");
    expect(await ohm.decimals()).to.equal(9);
  });

  describe("mint", () => {
    it("must be done by vault", async () => {
      await expect(ohm.connect(deployer).mint(bob.address, 100)).
        to.be.revertedWith("VaultOwned: caller is not the Vault");
    });

    it("increases total supply", async () => {
      let supplyBefore = await ohm.totalSupply();
      await ohm.connect(vault).mint(bob.address, 100);
      expect(supplyBefore.add(100)).to.equal(await ohm.totalSupply());
    });
  });

  describe("burn", () => {
    beforeEach(async () => {
      await ohm.connect(vault).mint(bob.address, 100);
    });

    it("reduces the total supply", async () => {
      let supplyBefore = await ohm.totalSupply();
      await ohm.connect(bob).burn(10);
      expect(supplyBefore.sub(10)).to.equal(await ohm.totalSupply());
    });

    it("cannot exceed total supply", async () => {
      let supply = await ohm.totalSupply();
      await expect(ohm.connect(bob).burn(supply.add(1))).
        to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("cannot exceed bob's balance", async () => {
      await ohm.connect(vault).mint(alice.address, 15);
      await expect(ohm.connect(alice).burn(16)).
        to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });
});
