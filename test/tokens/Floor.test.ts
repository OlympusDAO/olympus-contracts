import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  FloorERC20Token,
  FloorERC20Token__factory,
  FloorAuthority__factory
} from '../../types';

describe("FloorTest", () => {
  let deployer: SignerWithAddress;
  let vault: SignerWithAddress;
  let bob: SignerWithAddress;
  let alice: SignerWithAddress;
  let floor: FloorERC20Token;

  beforeEach(async () => {
    [deployer, vault, bob, alice] = await ethers.getSigners();

    const authority = await (new FloorAuthority__factory(deployer)).deploy(deployer.address, deployer.address, deployer.address, vault.address);
    await authority.deployed();

    floor = await (new FloorERC20Token__factory(deployer)).deploy(authority.address);

  });

  it("correctly constructs an ERC20", async () => {
    expect(await floor.name()).to.equal("Floor");
    expect(await floor.symbol()).to.equal("FLOOR");
    expect(await floor.decimals()).to.equal(9);
  });

  describe("mint", () => {
    it("must be done by vault", async () => {
      await expect(floor.connect(deployer).mint(bob.address, 100)).
        to.be.revertedWith("UNAUTHORIZED");
    });

    it("increases total supply", async () => {
      let supplyBefore = await floor.totalSupply();
      await floor.connect(vault).mint(bob.address, 100);
      expect(supplyBefore.add(100)).to.equal(await floor.totalSupply());
    });
  });

  describe("burn", () => {
    beforeEach(async () => {
      await floor.connect(vault).mint(bob.address, 100);
    });

    it("reduces the total supply", async () => {
      let supplyBefore = await floor.totalSupply();
      await floor.connect(bob).burn(10);
      expect(supplyBefore.sub(10)).to.equal(await floor.totalSupply());
    });

    it("cannot exceed total supply", async () => {
      let supply = await floor.totalSupply();
      await expect(floor.connect(bob).burn(supply.add(1))).
        to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("cannot exceed bob's balance", async () => {
      await floor.connect(vault).mint(alice.address, 15);
      await expect(floor.connect(alice).burn(16)).
        to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });
});