// libraries, functionality...
import { ethers, config } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

// types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    OlympusTreasury,
    TreasuryExtender,
    TreasuryExtender__factory,
    OlympusAuthority,
    MockERC20,
    CurveConvexAllocator,
    CurveConvexAllocator__factory,
} from "../../types";

// data
import { coins } from "../utils/coins";
import { olympus } from "../utils/olympus";
import { helpers } from "../utils/helpers";

const bne = helpers.bne;
const bnn = helpers.bnn;

// @ts-ignore
import * as convex from "convex-enjoyooor-pack";

// interfaces
interface ConvexTargetData {
    pool: string;
    lp: string;
    pid: BigNumber;
}

interface CurveTargetData {
    lp: string;
    cid: BigNumber;
}

interface AllocatorTargetData {
    convex: ConvexTargetData;
    curve: CurveTargetData;
}

interface NewDepositData {
    targets: AllocatorTargetData;
    tokens: string[];
}

describe("CurveConvexAllocator", () => {
    // signers
    let owner: SignerWithAddress;
    let governor: SignerWithAddress;
    let guardian: SignerWithAddress;

    // contracts
    let extender: TreasuryExtender;
    let treasury: OlympusTreasury;
    let authority: OlympusAuthority;
    let allocator: CurveConvexAllocator;
    let factory: CurveConvexAllocator__factory;

    // tokens
    // 3pool
    let usdc: MockERC20;
    let usdt: MockERC20;
    let dai: MockERC20;

    // metapools
    let lusd: MockERC20;
    let frax: MockERC20;
    let agEUR: MockERC20;

    // rewards
    let crv: MockERC20;
    let cvx: MockERC20;
    let angle: MockERC20;

    let triStables: MockERC20[] = [];
    let mpoolStables: MockERC20[] = [];
    let rewards: MockERC20[] = [];
    let crvLpTokens: MockERC20[] = [];
    let cvxLpTokens: MockERC20[] = [];

    // network
    let url: string = config.networks.hardhat.forking!.url;

    // variables
    let snapshotId: number = 0;
    let deposits: NewDepositData[] = [];

    before(async () => {
        // network
        await helpers.pinBlock(14026252, url);

        // accounts
        owner = (await ethers.getSigners())[0];

        // tokens
        usdc = await helpers.getCoin(coins.usdc);
        usdt = await helpers.getCoin(coins.usdt);
        dai = await helpers.getCoin(coins.dai);

        lusd = await helpers.getCoin(coins.lusd);
        frax = await helpers.getCoin(coins.frax);
        agEUR = await helpers.getCoin(coins.agEUR);

        crv = await helpers.getCoin(coins.crv);
        cvx = await helpers.getCoin(coins.cvx);
        angle = await helpers.getCoin(coins.angle);

        triStables = [usdc, usdt, dai];
        mpoolStables = [lusd, frax, agEUR];
        rewards = [cvx, crv, angle];

        // contracts
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

        guardian = await helpers.impersonate(await authority.guardian());
        governor = await helpers.impersonate(await authority.governor());

        extender = extender.connect(guardian);

        treasury = treasury.connect(governor);

        treasury.enable(3, extender.address, helpers.constants.addressZero);
        treasury.enable(0, extender.address, helpers.constants.addressZero);

        factory = (await ethers.getContractFactory(
            "CurveConvexAllocator"
        )) as CurveConvexAllocator__factory;

        factory = factory.connect(guardian);

        // data
        const datas: any = [
            convex.utils.findPool("lusd"),
            convex.utils.findPool("frax"),
            convex.utils.findPool("3eur"),
        ];
        const curveLp: any = [
            "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
            "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
            "0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571",
        ];
        const cids: any = [1, 1, 0];
        const ttokens: any = [[coins.dai], [coins.dai], [coins.agEUR]];
        const rtokens: any = [
            [coins.cvx, coins.crv],
            [coins.cvx, coins.crv],
            [coins.cvx, coins.crv, coins.angle],
        ];

        for (let i = 0; i < 3; i++) {
            deposits[i] = {
                targets: {
                    convex: {
                        pool: datas[i].crvRewards,
                        lp: datas[i].lptoken,
                        pid: bnn(datas[i].id),
                    },
                    curve: {
                        lp: curveLp[i],
                        cid: cids[i],
                    },
                },
                tokens: ttokens[i].concat(rtokens[i]),
            };

            crvLpTokens[i] = await helpers.getCoin(curveLp[i]);
            cvxLpTokens[i] = await helpers.getCoin(datas[i].lptoken);
        }
    });

    // isolate every test
    beforeEach(async () => {
        snapshotId = await helpers.snapshot();
    });

    afterEach(async () => {
        await helpers.revert(snapshotId);
    });

    describe("setup: contains tests on multiple simple functions", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                treasury.address,
                {
                    authority: authority.address,
                    tokens: [],
                    extender: extender.address,
                },
            );
        });

        it("passing: should confirm all vars are set correctly", async () => {
            expect(await allocator.status()).to.equal(0);
            expect(await allocator.treasury()).to.equal(
                "0x9A315BdF513367C0377FB36545857d12e85813Ef"
            );
            expect(await allocator.slippage()).to.equal(bne(10, 17).sub(bne(10, 16)));
            expect(await helpers.sload(allocator.address, bnn(5), BigNumber)).to.equal(
                bne(10, 17).sub(bne(10, 16))
            );
        });

        it("passing: addDeposit(), setSlippage(), setRegistry(), registerDeposit(), utilityTokens(), rewardTokens()", async () => {
            const tokens: MockERC20[] = [dai, dai, agEUR];

            for (let i = 0; i < deposits.length; i++) {
                await allocator.addDeposit(deposits[i]);

                expect((await allocator.tokens())[i]).to.equal(
                    ethers.utils.getAddress(tokens[i].address)
                );

                expect(await tokens[i].allowance(allocator.address, extender.address)).to.equal(
                    helpers.constants.uint256Max
                );

                // yes this shouldnt be enumerated like this but for this test it works
                expect(await rewards[i].allowance(allocator.address, extender.address)).to.equal(
                    helpers.constants.uint256Max
                );

                expect(
                    await crvLpTokens[i].allowance(allocator.address, extender.address)
                ).to.equal(helpers.constants.uint256Max);

                expect(
                    await cvxLpTokens[i].allowance(allocator.address, extender.address)
                ).to.equal(helpers.constants.uint256Max);

                await extender.registerDeposit(allocator.address);
            }

            await allocator.activate();

            expect(
                helpers.addressify(
                    (await helpers.sload(allocator.address, bnn(7), String)) as string
                )
            ).to.equal("0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5");

            const utilt: string[] = await allocator.utilityTokens();
            const rewt: string[] = await allocator.rewardTokens();

            for (let i = 0; i < deposits.length; i++) {
                expect(utilt[i]).to.equal(helpers.checksum(cvxLpTokens[i].address));
                expect(rewt[i]).to.equal(helpers.checksum(rewards[i].address));
            }

            const ninFive: BigNumber = bne(10, 17).sub(bne(10, 16).div(2));

            await allocator.setSlippage(ninFive);

            expect(await allocator.slippage()).to.equal(ninFive);
        });
    });

    describe("_update()", () => {
        beforeEach(async () => {
            allocator = await factory.deploy(
                treasury.address,
                {
                    authority: authority.address,
                    tokens: [],
                    extender: extender.address,
                },
            );

            for (let i = 0; i < deposits.length; i++) {
                await allocator.addDeposit(deposits[i]);
                await extender.registerDeposit(allocator.address);
            }

            await extender.setAllocatorLimits(1, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await extender.setAllocatorLimits(2, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await extender.setAllocatorLimits(3, {
                allocated: bne(10, 23),
                loss: bne(10, 21),
            });

            await allocator.activate();

            await expect(() =>
                extender.requestFundsFromTreasury(1, bne(10, 21))
            ).to.changeTokenBalance(dai, allocator, bne(10, 21));

            await expect(() =>
                extender.requestFundsFromTreasury(3, bne(10, 21))
            ).to.changeTokenBalance(agEUR, allocator, bne(10, 21));
        });

        it("passing: _update should transfer funds to contracts", async () => {
            await expect(() => allocator.update(1)).to.changeTokenBalance(
                dai,
                allocator,
                bnn(0).sub(bne(10, 21))
            );

            // need to transfer after otherwise will deposit all
            await expect(() =>
                extender.requestFundsFromTreasury(2, bne(10, 21))
            ).to.changeTokenBalance(dai, allocator, bne(10, 21));

            await expect(() => allocator.update(2)).to.changeTokenBalance(
                dai,
                allocator,
                bnn(0).sub(bne(10, 21))
            );

            await expect(() => allocator.update(3)).to.changeTokenBalance(
                agEUR,
                allocator,
                bnn(0).sub(bne(10, 21))
            );
        });
    });
});
