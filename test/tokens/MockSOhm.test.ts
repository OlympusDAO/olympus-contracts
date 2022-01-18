import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MockSOHM__factory, MockSOHM } from "../../types";

describe("Mock sOhm Tests", () => {
    // 100 sOHM
    const INITIAL_AMOUNT = "100000000000";

    let initializer: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let sOhm: MockSOHM;

    beforeEach(async () => {
        [initializer, alice, bob] = await ethers.getSigners();

        // Initialize to index of 1 and rebase percentage of 1%
        sOhm = await new MockSOHM__factory(initializer).deploy("1000000000", "10000000");

        // Mint 100 sOHM for intializer account
        await sOhm.mint(initializer.address, INITIAL_AMOUNT);
    });

    it("should rebase properly", async () => {
        expect(await sOhm.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("100000000000");
        expect(await sOhm.index()).to.equal("1000000000");

        await sOhm.rebase();
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("100000000000");
        expect(await sOhm.balanceOf(initializer.address)).to.equal("101000000000");
        expect(await sOhm.index()).to.equal("1010000000");
    });

    it("should transfer properly", async () => {
        expect(await sOhm.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("100000000000");

        //await sOhm.approve(bob.address, INITIAL_AMOUNT);
        await sOhm.transfer(bob.address, INITIAL_AMOUNT);

        expect(await sOhm.balanceOf(initializer.address)).to.equal("0");
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("0");

        expect(await sOhm.balanceOf(bob.address)).to.equal(INITIAL_AMOUNT);
        expect(await sOhm._agnosticBalance(bob.address)).to.equal("100000000000");
    });

    it("should transfer properly after rebase", async () => {
        const afterRebase = "101000000000";

        expect(await sOhm.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("100000000000");

        await sOhm.rebase();
        expect(await sOhm.balanceOf(initializer.address)).to.equal(afterRebase);
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("100000000000");

        const rebasedAmount = "1000000000";
        await sOhm.transfer(bob.address, rebasedAmount); // Transfer rebased amount

        expect(await sOhm.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);
        expect(await sOhm._agnosticBalance(initializer.address)).to.equal("99009900991");

        expect(await sOhm.balanceOf(bob.address)).to.equal(Number(rebasedAmount) - 1); // Precision error ;(
        expect(await sOhm._agnosticBalance(bob.address)).to.equal("990099009");
    });

    it("should drip funds to users", async () => {
        expect(await sOhm.balanceOf(initializer.address)).to.equal(INITIAL_AMOUNT);

        await sOhm.drip();

        expect(await sOhm.balanceOf(initializer.address)).to.equal("200000000000");
    });
});
