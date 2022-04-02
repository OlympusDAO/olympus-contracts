const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");
const chai = require("chai");
const { assert, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { olympus } = require("../utils/olympus");

chai.use(solidity);

const sushiRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const olympusGovernor = "0x245cc372C84B3645Bf0Ffe6538620B04a217988B";

describe("SushiMigrator", async () => {
    let governor, treasury, ohmContract, SushiMigrator, sushiMigrator;

    beforeEach(async () => {
        await fork_network(14486473);
        treasury = await ethers.getContractAt(
            "OlympusTreasury",
            "0x9A315BdF513367C0377FB36545857d12e85813Ef"
        );
        ohmContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5"
        );

        SushiMigrator = await ethers.getContractFactory("SushiMigrator");
        sushiMigrator = await SushiMigrator.deploy(olympus.authority);

        impersonateAccount(olympusGovernor);
        governor = await ethers.getSigner(olympusGovernor);
    });

    it("Migrate Sushi OHM/DAI pair to Uniswap OHM/DAI pair", async () => {
        const sushiOhmDaiLpAddress = "0x055475920a8c93CfFb64d039A8205F7AcC7722d3";
        const uniOhmDaiLpAddress = "0x1b851374b8968393c11e8fb30c2842cfc4e986a5";
        const amount = "253163960111968806387";

        const uniswapLpContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            uniOhmDaiLpAddress
        );
        const daiContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        );

        await treasury.connect(governor).enable(3, sushiMigrator.address, sushiMigrator.address);

        const ohmBalBeforeTx = await ohmContract.balanceOf(treasury.address);
        const daiBalBeforeTx = await daiContract.balanceOf(treasury.address);
        const lpBalBeforeTx = await uniswapLpContract.balanceOf(treasury.address);

        await sushiMigrator
            .connect(governor)
            .executeTx(
                sushiRouter,
                uniRouter,
                sushiOhmDaiLpAddress,
                uniOhmDaiLpAddress,
                amount,
                990,
                900
            );

        const tx = await sushiMigrator.amountsByMigrationId(0);
        const ohmBalAfterTx = await ohmContract.balanceOf(treasury.address);

        const daiBalAfterTx = await daiContract.balanceOf(treasury.address);
        const lpBalAfterTx = await uniswapLpContract.balanceOf(treasury.address);

        if (tx.uniPoolToken0ReturnedToTreasury > 0) {
            assert.equal(
                Number(ohmBalAfterTx),
                Number(ohmBalBeforeTx) + Number(tx.uniPoolToken0ReturnedToTreasury)
            );
        }

        if (tx.uniPoolToken1ReturnedToTreasury > 0) {
            assert.equal(
                Number(daiBalAfterTx),
                Number(daiBalBeforeTx) + Number(tx.uniPoolToken1ReturnedToTreasury)
            );
        }

        assert.equal(Number(lpBalBeforeTx) + Number(tx.uniPoolLpReceived), Number(lpBalAfterTx));
    });

    it("Migrate Sushi OHM/ETH pair to Uniswap OHM/ETH pair", async () => {
        const sushiOhmEthLpAddress = "0x69b81152c5A8d35A67B32A4D3772795d96CaE4da";
        const uniOhmEthLpAddress = "0x88b8555CB3fdeE7077491e673a5bDdFB7144744f";
        const amount = "1364756451373102957";

        const uniswapLpContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            uniOhmEthLpAddress
        );
        const wethContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        );
        const router = await ethers.getContractAt("IUniswapV2Router", uniRouter);

        const SushiMigrator = await ethers.getContractFactory("SushiMigrator");
        const sushiMigrator = await SushiMigrator.deploy(olympus.authority);

        await treasury.connect(governor).enable(3, sushiMigrator.address, sushiMigrator.address);

        impersonateAccount("0xa94A3Cd8326EA720f5dE5718C5519f409aFdb9c2");
        const user = await ethers.getSigner("0xa94A3Cd8326EA720f5dE5718C5519f409aFdb9c2");

        impersonateAccount("0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3");
        const user1 = await ethers.getSigner("0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3");

        await wethContract
            .connect(user1)
            .transfer("0xa94A3Cd8326EA720f5dE5718C5519f409aFdb9c2", "5000000000000000000");

        await user1.sendTransaction({
            to: user.address,
            value: ethers.utils.parseEther("2.0"), // Sends exactly 1.0 ether
        });
        await ohmContract.connect(user).approve(uniRouter, "1247350");

        // The current price in the OHM/ETH uniswap pool isn't correct, using swapExactTokensForTokens to set the right price before proceeding.
        await router
            .connect(user)
            .swapExactTokensForTokens(
                "124735",
                0,
                [
                    "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5",
                    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                ],
                user.address,
                "1000000000000000000"
            );

        const ohmBalBeforeTx = await ohmContract.balanceOf(treasury.address);
        const wethBalBeforeTx = await wethContract.balanceOf(treasury.address);
        const lpBalBeforeTx = await uniswapLpContract.balanceOf(treasury.address);

        await sushiMigrator
            .connect(governor)
            .executeTx(
                sushiRouter,
                uniRouter,
                sushiOhmEthLpAddress,
                uniOhmEthLpAddress,
                amount,
                990,
                970
            );

        const ohmBalAfterTx = await ohmContract.balanceOf(treasury.address);
        const wethBalAfterTx = await wethContract.balanceOf(treasury.address);

        const lpBalAfterTx = await uniswapLpContract.balanceOf(treasury.address);
        const tx = await sushiMigrator.amountsByMigrationId(0);

        if (tx.uniPoolToken0ReturnedToTreasury > 0) {
            assert.equal(
                Number(ohmBalAfterTx),
                Number(ohmBalBeforeTx) + Number(tx.uniPoolToken0ReturnedToTreasury)
            );
        }

        if (tx.uniPoolToken1ReturnedToTreasury > 0) {
            assert.equal(
                Number(wethBalAfterTx),
                Number(wethBalBeforeTx) + Number(tx.uniPoolToken1ReturnedToTreasury)
            );
        }

        assert.equal(Number(lpBalBeforeTx) + Number(tx.uniPoolLpReceived), Number(lpBalAfterTx));
    });
});
