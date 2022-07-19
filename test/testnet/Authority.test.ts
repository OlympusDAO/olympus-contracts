import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
    OlympusAuthority,
    OlympusAuthority__factory,
    TestnetOhm,
    TestnetOhm__factory,
} from "../../types";
import { addressZero } from "../utils/scripts";

describe("TestnetAuthority", () => {
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let authority: OlympusAuthority;
    let otherAddress = "0x544f54c5F38D6D6b96331f7E75CB202B5ea72eca";
    let mintAmount = "100000000000";

    beforeEach(async () => {
        [owner, alice] = await ethers.getSigners();
        authority = await new OlympusAuthority__factory(owner).deploy(
            owner.address,
            owner.address,
            owner.address,
            owner.address
        );
    });

    describe("constructor", () => {
        it("is constructed properly", async () => {
            expect(await authority.governor()).to.equal(owner.address);
            expect(await authority.guardian()).to.equal(owner.address);
            expect(await authority.policy()).to.equal(owner.address);

            const vault = await authority.getVault();
            expect(vault.length).to.equal(1);
            expect(vault[0]).to.equal(owner.address);
        });
    });

    describe("vault", () => {
        it("can push vault effective immediately", async () => {
            const vaultBefore = await authority.getVault();
            expect(vaultBefore.length).to.equal(1);
            expect(vaultBefore[0]).to.equal(owner.address);

            await authority.pushVault(otherAddress, true);

            const vaultAfter = await authority.getVault();
            expect(vaultAfter.length).to.equal(2);
            expect(vaultAfter[0]).to.equal(owner.address);
            expect(vaultAfter[1]).to.equal(otherAddress);
        });

        it("can push vault effective later", async () => {
            const newVaultBefore = await authority.newVault();
            expect(newVaultBefore).to.equal(addressZero);

            await authority.pushVault(otherAddress, false);

            const newVaultAfter = await authority.newVault();
            expect(newVaultAfter).to.equal(otherAddress);
        });

        it("can pull queued vault into array", async () => {
            const vaultBeforeOne = await authority.getVault();
            expect(vaultBeforeOne.length).to.equal(1);
            expect(vaultBeforeOne[0]).to.equal(owner.address);

            await authority.pushVault(alice.address, false);

            const vaultBeforeTwo = await authority.getVault();
            expect(vaultBeforeTwo.length).to.equal(1);
            expect(vaultBeforeTwo[0]).to.equal(owner.address);

            await authority.connect(alice).pullVault();

            const vaultAfter = await authority.getVault();
            expect(vaultAfter.length).to.equal(2);
            expect(vaultAfter[0]).to.equal(owner.address);
            expect(vaultAfter[1]).to.equal(alice.address);
        });

        it("can remove address from vault", async () => {
            const vaultBefore = await authority.getVault();
            expect(vaultBefore.length).to.equal(1);
            expect(vaultBefore[0]).to.equal(owner.address);

            await authority.pushVault(otherAddress, true);

            const vaultAfter = await authority.getVault();
            expect(vaultAfter.length).to.equal(2);
            expect(vaultAfter[0]).to.equal(owner.address);
            expect(vaultAfter[1]).to.equal(otherAddress);

            await authority.removeVault(0);

            const vaultAfterRemoval = await authority.getVault();
            expect(vaultAfterRemoval.length).to.equal(1);
            expect(vaultAfterRemoval[0]).to.equal(otherAddress);
        });
    });

    describe("modifiers", () => {
        let testOHM: TestnetOhm;

        beforeEach(async () => {
            testOHM = await new TestnetOhm__factory(owner).deploy(authority.address);
        });

        it("onlyVault works with one address", async () => {
            await expect(testOHM.connect(owner).mint(owner.address, mintAmount)).to.not.be.reverted;
            await expect(testOHM.connect(alice).mint(owner.address, mintAmount)).to.be.reverted;
        });

        it("onlyVault works with multiple addresses", async () => {
            await expect(testOHM.connect(owner).mint(owner.address, mintAmount)).to.not.be.reverted;
            await expect(testOHM.connect(alice).mint(owner.address, mintAmount)).to.be.reverted;

            await authority.pushVault(alice.address, true);

            await expect(testOHM.connect(alice).mint(owner.address, mintAmount)).to.not.be.reverted;
        });
    });
});
