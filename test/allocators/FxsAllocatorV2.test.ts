import { ethers, waffle, network, config } from "hardhat";
import chai, { expect, util } from "chai";
import { smock } from "@defi-wonderland/smock";
import { BigNumber, BaseContract, ContractFactory, Contract} from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FakeContract, MockContract, MockContractFactory } from "@defi-wonderland/smock";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    OlympusAuthority,
    MockERC20,
    FxsAllocatorV2,
    FxsAllocatorV2__factory,
} from "../../types";

import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import {
    impersonate,
    snapshot,
    revert,
    getCoin,
    bne,
    bnn,
    pinBlock,
    addressZero,
    setStorage,
    addEth,
    tmine,
} from "../utils/scripts";
import { ExecFileException } from "child_process";
import { Sign } from "crypto";

describe("FxsAllocatorV2", () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;
    let wlOwner: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: FxsAllocatorV2;
    let factory: FxsAllocatorV2__factory;

    // tokens
    let fxs: MockERC20;
    let vefxs: any;
    let tokens: MockERC20[];
    let utilTokens: any[];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;
    let localSnapId: number = 0;

    before(async () => {
        await pinBlock(14314860, url);

        fxs = await getCoin(coins.fxs);
        tokens = [fxs];

        vefxs = (await ethers.getContractAt(
            [{"name":"CommitOwnership","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyOwnership","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"Deposit","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256","name":"value","indexed":false},{"type":"uint256","name":"locktime","indexed":true},{"type":"int128","name":"type","indexed":false},{"type":"uint256","name":"ts","indexed":false}],"anonymous":false,"type":"event"},{"name":"Withdraw","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256","name":"value","indexed":false},{"type":"uint256","name":"ts","indexed":false}],"anonymous":false,"type":"event"},{"name":"Supply","inputs":[{"type":"uint256","name":"prevSupply","indexed":false},{"type":"uint256","name":"supply","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"address","name":"token_addr"},{"type":"string","name":"_name"},{"type":"string","name":"_symbol"},{"type":"string","name":"_version"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"commit_transfer_ownership","outputs":[],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"nonpayable","type":"function","gas":37568},{"name":"apply_transfer_ownership","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":38407},{"name":"commit_smart_wallet_checker","outputs":[],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"nonpayable","type":"function","gas":36278},{"name":"apply_smart_wallet_checker","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":37005},{"name":"toggleEmergencyUnlock","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":37038},{"name":"recoverERC20","outputs":[],"inputs":[{"type":"address","name":"token_addr"},{"type":"uint256","name":"amount"}],"stateMutability":"nonpayable","type":"function","gas":4045},{"name":"get_last_user_slope","outputs":[{"type":"int128","name":""}],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"view","type":"function","gas":2600},{"name":"user_point_history__ts","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_addr"},{"type":"uint256","name":"_idx"}],"stateMutability":"view","type":"function","gas":1703},{"name":"locked__end","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_addr"}],"stateMutability":"view","type":"function","gas":1624},{"name":"checkpoint","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":46119699},{"name":"deposit_for","outputs":[],"inputs":[{"type":"address","name":"_addr"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":92414024},{"name":"create_lock","outputs":[],"inputs":[{"type":"uint256","name":"_value"},{"type":"uint256","name":"_unlock_time"}],"stateMutability":"nonpayable","type":"function","gas":92415425},{"name":"increase_amount","outputs":[],"inputs":[{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":92414846},{"name":"increase_unlock_time","outputs":[],"inputs":[{"type":"uint256","name":"_unlock_time"}],"stateMutability":"nonpayable","type":"function","gas":92415493},{"name":"withdraw","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":46291332},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"view","type":"function"},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"addr"},{"type":"uint256","name":"_t"}],"stateMutability":"view","type":"function"},{"name":"balanceOfAt","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"addr"},{"type":"uint256","name":"_block"}],"stateMutability":"view","type":"function","gas":512868},{"name":"totalSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function"},{"name":"totalSupply","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"t"}],"stateMutability":"view","type":"function"},{"name":"totalSupplyAt","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_block"}],"stateMutability":"view","type":"function","gas":882020},{"name":"totalFXSSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2116},{"name":"totalFXSSupplyAt","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_block"}],"stateMutability":"view","type":"function","gas":252170},{"name":"changeController","outputs":[],"inputs":[{"type":"address","name":"_newController"}],"stateMutability":"nonpayable","type":"function","gas":36998},{"name":"token","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1871},{"name":"supply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1901},{"name":"locked","outputs":[{"type":"int128","name":"amount"},{"type":"uint256","name":"end"}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":3380},{"name":"epoch","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1961},{"name":"point_history","outputs":[{"type":"int128","name":"bias"},{"type":"int128","name":"slope"},{"type":"uint256","name":"ts"},{"type":"uint256","name":"blk"},{"type":"uint256","name":"fxs_amt"}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":6280},{"name":"user_point_history","outputs":[{"type":"int128","name":"bias"},{"type":"int128","name":"slope"},{"type":"uint256","name":"ts"},{"type":"uint256","name":"blk"},{"type":"uint256","name":"fxs_amt"}],"inputs":[{"type":"address","name":"arg0"},{"type":"uint256","name":"arg1"}],"stateMutability":"view","type":"function","gas":6525},{"name":"user_point_epoch","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2266},{"name":"slope_changes","outputs":[{"type":"int128","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2196},{"name":"controller","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2111},{"name":"transfersEnabled","outputs":[{"type":"bool","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2141},{"name":"emergencyUnlockActive","outputs":[{"type":"bool","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2171},{"name":"name","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":8603},{"name":"symbol","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":7656},{"name":"version","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":7686},{"name":"decimals","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2291},{"name":"future_smart_wallet_checker","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2321},{"name":"smart_wallet_checker","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2351},{"name":"admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2381},{"name":"future_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2411}],
            "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0"
        ));
        utilTokens = [vefxs];

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

        guardian = await impersonate(await authority.guardian());
        governor = await impersonate(await authority.governor());
        wlOwner = await impersonate("0xb1748c79709f4ba2dd82834b8c82d4a505003f27");

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        treasury.enable(3, extender.address, addressZero);
        treasury.enable(0, extender.address, addressZero);

        factory = (await ethers.getContractFactory("FxsAllocatorV2")) as FxsAllocatorV2__factory;

        factory = factory.connect(guardian);

        allocator = await factory.deploy(
            {
                authority: authority.address,
                tokens: [fxs.address],
                extender: extender.address,
            },
            olympus.treasury,
            vefxs.address,
            "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
        );
    });

    beforeEach(async () => {
        snapshotId = await snapshot();
    });

    afterEach(async () => {
        await revert(snapshotId);
    });

    describe("initialization", () => {
        it("should deploy single token allocator with correct info", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
            );
            
            expect(await allocator.treasury()).to.equal(olympus.treasury);
            expect(await allocator.veFXS()).to.equal("0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0");
            expect(await allocator.veFXSYieldDistributorV4()).to.equal("0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872");

            expect(await allocator.lockEnd()).to.equal("0");
        });

        it("should registerDeposit()", async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
            );

            await expect(extender.registerDeposit(allocator.address)).to.not.be.reverted;
        });
    });

    describe("updates correctly", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
            );

            let walletWhitelist = (await ethers.getContractAt(
                [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"ApproveWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerNominated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"RevokeWallet","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"applySetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"approveWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"check","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_checker","type":"address"}],"name":"commitSetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"future_checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"nominateNewOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nominatedOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"revokeWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}],
                "0x53c13BA8834a1567474b19822aAD85c6F90D9f9F",
            ));

            walletWhitelist = walletWhitelist.connect(wlOwner);

            walletWhitelist.approveWallet(allocator.address);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 20);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                fxs,
                allocator,
                amount
            );
        });

        it("should revert if not guardian", async () => {
            await expect(allocator.connect(owner).update(1)).to.be.reverted;
        });

        it("should update", async () => {
            const amount: BigNumber = bne(10, 20);

            expect((await utilTokens[0].locked(allocator.address))[0]).to.be.equal("0");
            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount),
            );

            expect((await utilTokens[0].locked(allocator.address))[0]).to.be.gt("0");
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);
        });

        it("should deposit more", async () => {
            const amount: BigNumber = bne(10, 20);

            expect((await utilTokens[0].locked(allocator.address))[0]).to.be.equal("0");
            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount),
            );

            expect((await utilTokens[0].locked(allocator.address))[0]).to.be.gt("0");
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                fxs,
                allocator,
                amount
            );
            
            const balance: BigNumber = (await utilTokens[0].locked(allocator.address))[0];
            await expect(() => allocator.update(1)).to.changeTokenBalance(
                tokens[0],
                allocator,
                BigNumber.from("0").sub(amount)
            );

            expect((await utilTokens[0].locked(allocator.address))[0]).to.be.gt(balance);
            expect(await extender.getAllocatorAllocated(1)).to.equal(amount.mul("2"));
        });

        context("with deposits", () => {
            beforeEach(async () => {
                const amount: BigNumber = bne(10, 20);

                await allocator.update(1);
            });

            it("should gain over time", async () => {
                const balance = (await utilTokens[0].locked(allocator.address))[0];

                await tmine(1552000);
                await allocator.update(1);

                const balanceAfter = (await utilTokens[0].locked(allocator.address))[0];

                expect(balanceAfter).to.be.gt(balance);
                expect(await allocator.amountAllocated(1)).to.equal(balanceAfter);
            });

            it("should report gain on increase", async () => {
                await tmine(1552000);
                await allocator.update(1);

                expect(
                    (await extender.getAllocatorAllocated(1)).add(
                        (await extender.getAllocatorPerformance(1))[0]
                    )
                ).to.equal((await utilTokens[0].locked(allocator.address))[0]);
            });

            // Passes when you implement a setLockEnd function in the contract
            // This is largely an unrealistic scenario and a public setLockEnd
            // function does not belong in the allocator, so this is commented out
            /*
            it("should panic return in case of loss above limit", async () => {
                await tmine(4 * 365 * 86400 + 2);

                const wallocator: SignerWithAddress = await impersonate(allocator.address);

                const tempVeFXS = utilTokens[0].connect(wallocator);

                await addEth(allocator.address, bne(10, 23));

                await tempVeFXS.withdraw();
                await fxs.connect(wallocator).transfer(
                    owner.address,
                    (await fxs.balanceOf(allocator.address)).div(2)
                );

                const currBlock = await ethers.provider.getBlock("latest");

                await tempVeFXS.create_lock((await (await fxs.balanceOf(allocator.address)).div(2)), currBlock.timestamp + (4 * 365 * 86400 + 1));
                await allocator.setLockEnd(currBlock.timestamp + (4 * 365 * 86400 + 1));

                await allocator.update(1);

                expect(await allocator.status()).to.equal(0);
                expect(await fxs.balanceOf(allocator.address)).to.equal("0");
            });
            */
        });
    });

    describe("deallocate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
            );

            let walletWhitelist = (await ethers.getContractAt(
                [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"ApproveWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerNominated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"RevokeWallet","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"applySetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"approveWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"check","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_checker","type":"address"}],"name":"commitSetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"future_checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"nominateNewOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nominatedOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"revokeWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}],
                "0x53c13BA8834a1567474b19822aAD85c6F90D9f9F",
            ));

            walletWhitelist = walletWhitelist.connect(wlOwner);

            walletWhitelist.approveWallet(allocator.address);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 20);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                fxs,
                allocator,
                amount
            ); 

            await allocator.update(1);
        });

        it("should fail if sender is not guardian", async () => {
            await expect(allocator.connect(owner).deallocate([1])).to.be.reverted;
        });

        it("should get yield on deallocate", async () => {
            const utilBalance: BigNumber = (await utilTokens[0].locked(allocator.address))[0];
            const fxsBalance: BigNumber = await fxs.balanceOf(allocator.address);

            expect(fxsBalance).to.equal("0");

            let input: BigNumber[] = new Array(1).fill(bne(10,20));
            await allocator.deallocate(input);

            expect((await utilTokens[0].locked(allocator.address))[0]).to.equal(utilBalance);
            expect(await fxs.balanceOf(allocator.address)).to.be.gt(fxsBalance);
        });

        it("should withdraw veFXS if lock has ended", async () => {
            const amount: BigNumber = bne(10, 20);

            await tmine(4 * 365 * 86400 + 2);

            let input: BigNumber[] = new Array(1).fill(bne(10,20));
            await allocator.deallocate(input);

            expect((await utilTokens[0].locked(allocator.address))[0]).to.equal("0");
            expect(await fxs.balanceOf(allocator.address)).to.be.gt(amount);
        });
    });

    describe("migrate()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
            );

            let walletWhitelist = (await ethers.getContractAt(
                [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"ApproveWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerNominated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"}],"name":"RevokeWallet","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"applySetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"approveWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"check","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_checker","type":"address"}],"name":"commitSetChecker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"future_checker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"nominateNewOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nominatedOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"revokeWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}],
                "0x53c13BA8834a1567474b19822aAD85c6F90D9f9F",
            ));

            walletWhitelist = walletWhitelist.connect(wlOwner);

            walletWhitelist.approveWallet(allocator.address);

            await extender.registerDeposit(allocator.address);

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await allocator.activate();

            const amount: BigNumber = bne(10, 20);

            await expect(() => extender.requestFundsFromTreasury(1, amount)).to.changeTokenBalance(
                fxs,
                allocator,
                amount
            ); 

            await allocator.update(1);
            
            const mAllocator: FxsAllocatorV2 = await factory.deploy(
                {
                    authority: authority.address,
                    tokens: [fxs.address],
                    extender: extender.address,
                },
                olympus.treasury,
                vefxs.address,
                "0xc6764e58b36e26b08Fd1d2AeD4538c02171fA872",
            );

            walletWhitelist = walletWhitelist.connect(wlOwner);

            walletWhitelist.approveWallet(mAllocator.address);

            await extender.registerDeposit(mAllocator.address);

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 23),
                loss: bne(10, 19),
            });

            await mAllocator.activate();
        });

        it("should successfully migrate when lock is up", async () => {
            await tmine(4 * 365 * 86400 + 2);

            await allocator.prepareMigration();

            expect((await utilTokens[0].locked(allocator.address))[0]).to.equal("0");
            expect(await fxs.balanceOf(allocator.address)).to.be.gt("0");
            expect(await allocator.status()).to.equal(2);

            await allocator.migrate();

            const mAddress: string = await extender.allocators(2);

            expect(await fxs.balanceOf(mAddress)).to.be.gte("0");
            expect(await fxs.balanceOf(allocator.address)).to.equal("0");

            expect(await allocator.status()).to.equal(0);
        });
    });
});