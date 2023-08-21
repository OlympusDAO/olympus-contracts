import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { ethers, upgrades, config } from "hardhat";
import { BigNumber } from "ethers";
import {
    ITreasury,
    IveFXS,
    FraxSharesAllocatorVoting,
    OlympusTreasury,
    ERC20,
    FraxSharesAllocatorVoting__factory
} from "../../types";
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";
import { vefxsAbi, wlContractAbi } from "../utils/fxsAllocatorAbis";
import { proxyAdminAbi, transparentUpgradeableProxyAbi } from "../utils/abi";

const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
const MAX_TIME = 4 * 365 * 86400 + 1;

describe("FraxSharesAllocatorVotingV2", () => {
    describe("Integration Tests", () => {
        // signers
        let owner: SignerWithAddress;
        let other: SignerWithAddress;
        let newOwner: SignerWithAddress;
        let fxsWallet: SignerWithAddress;
        let wlOwner: SignerWithAddress;

        // contracts
        let treasury: OlympusTreasury;
        let factory: FraxSharesAllocatorVoting__factory;
        let proxyAdmin: any;
        let proxy: any;
        let allocator: FraxSharesAllocatorVoting;

        // tokens
        let fxs: ERC20;
        let veFXS: any;

        // network
        let url: string = config.networks.hardhat.forking!.url;

        // variables
        let snapshotId: number = 0;

        before(async () => {
            await helpers.pinBlock(17935468, url);

            [other, newOwner] = await ethers.getSigners();

            owner = await helpers.impersonate("0x245cc372C84B3645Bf0Ffe6538620B04a217988B");
            fxsWallet = await helpers.impersonate("0xF977814e90dA44bFA03b6295A0616a897441aceC");
            wlOwner = await helpers.impersonate("0xb1748c79709f4ba2dd82834b8c82d4a505003f27");

            fxs = await helpers.getCoin(coins.fxs);
            veFXS = await ethers.getContractAt(vefxsAbi, "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0");

            treasury = (await ethers.getContractAt(
                "OlympusTreasury",
                olympus.treasury
            )) as OlympusTreasury;

            factory = (await ethers.getContractFactory("FraxSharesAllocatorVoting")) as FraxSharesAllocatorVoting__factory;
            factory = factory.connect(owner);
            proxyAdmin = (await ethers.getContractAt(
                proxyAdminAbi,
                "0xC8D6043061Bc0A13587E92d762386F4EC29Deb8F"
            )) as any;
            proxy = (await ethers.getContractAt(
                transparentUpgradeableProxyAbi,
                "0xde7b85f52577B113181921A7aa8Fc0C22e309475"
            )) as any;
            allocator = (await upgrades.deployProxy(factory, [
                treasury.address,
                fxs.address,
                veFXS.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872"
            ])) as FraxSharesAllocatorVoting;
        });

        beforeEach(async () => {
            snapshotId = await helpers.snapshot();
        });
    
        afterEach(async () => {
            await helpers.revert(snapshotId);
        });

        describe("upgrade", () => {
            it("should upgrade", async () => {
                await proxyAdmin.connect(owner).upgrade(proxy.address, allocator.address);
                expect(await proxyAdmin.getProxyImplementation(proxy.address)).to.eq(allocator.address);
                expect(await proxy.implementation()).to.eq(allocator.address);
            });
        });

        describe("deposit", () => {
            it("should do nothing on deposit", async () => {
                const fxsTreasuryBalanceBefore = await fxs.balanceOf(treasury.address);
                const fxsAllocatorBalanceBefore = await fxs.balanceOf(allocator.address);

                allocator.connect(owner).deposit(1);

                const fxsTreasuryBalanceAfter = await fxs.balanceOf(treasury.address);
                const fxsAllocatorBalanceAfter = await fxs.balanceOf(allocator.address);

                expect(fxsTreasuryBalanceAfter).to.eq(fxsTreasuryBalanceBefore);
                expect(fxsAllocatorBalanceAfter).to.eq(fxsAllocatorBalanceBefore);
            });
        });

        describe("setTreasury", () => {
            it("should do nothing on setTreasury", async () => {
                const treasuryBefore = await allocator.treasury();
                allocator.connect(owner).setTreasury(ZERO_ADDRESS);
                const treasuryAfter = await allocator.treasury();

                expect(treasuryBefore).to.eq(treasuryAfter);
            });
        });

        describe("withdrawToken", () => {
            it("should send tokens to owner on withdraw", async () => {
                // transfer fxs in
                await fxs.connect(fxsWallet).transfer(allocator.address, 1000);

                const fxsBalanceBefore = await fxs.balanceOf(owner.address);
                const fxsAllocatorBalanceBefore = await fxs.balanceOf(allocator.address);

                await allocator.connect(owner).withdrawToken(fxs.address, 1000);

                const fxsBalanceAfter = await fxs.balanceOf(owner.address);
                const fxsAllocatorBalanceAfter = await fxs.balanceOf(allocator.address);

                expect(fxsBalanceAfter).to.eq(fxsBalanceBefore.add(1000));
                expect(fxsAllocatorBalanceAfter).to.eq(fxsAllocatorBalanceBefore.sub(1000));
            });
        });
    });
});
