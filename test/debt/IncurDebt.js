const chai = require("chai");
const { assert, expect } = require("chai");
const { olympus } = require("../utils/olympus");
const { solidity } = require("ethereum-waffle");
const { increase } = require("../utils/advancement");
const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const gOhmHolderAddress = "0xD3D086B36d5502122F275F4Bc18e04c844Bd6E2e";
const sOhmHolderAddress = "0xa8b4bcB15382641574822214771b7f05a3e0B408";
const daiHolderAddress = "0x1B7BAa734C00298b9429b518D621753Bb0f6efF2";

describe("IncurDebt", async () => {
    let user,
        amount,
        factory,
        staking,
        governor,
        treasury,
        ohm_token,
        uniRouter,
        daiHolder,
        gohm_token,
        sohm_token,
        gOhmHolder,
        sOhmHolder,
        IncurDebt,
        incurDebt,
        daiContract,
        halfOfAmount,
        amountInGOHM,
        UniSwapStrategy,
        uniSwapStrategy,
        uniswapLpContract,
        uniOhmDaiLpAddress;

    beforeEach(async () => {
        await fork_network(14565910);
        [user] = await ethers.getSigners();

        amount = "1000000000000";
        halfOfAmount = "500000000000";
        amountInGOHM = "10000000000000000000"; // 10 gOHM

        uniRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
        uniOhmDaiLpAddress = "0x1b851374b8968393c11e8fb30c2842cfc4e986a5";

        IncurDebt = await ethers.getContractFactory("IncurDebt");
        incurDebt = await IncurDebt.deploy(
            olympus.ohm,
            olympus.gohm,
            olympus.sohm,
            olympus.staking,
            olympus.treasury,
            olympus.authority
        );

        UniSwapStrategy = await ethers.getContractFactory("UniSwapStrategy");
        uniSwapStrategy = await UniSwapStrategy.deploy(
            uniRouter,
            factory,
            incurDebt.address,
            olympus.ohm
        );

        daiContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        );

        uniswapLpContract = await ethers.getContractAt(
            "contracts/interfaces/IERC20.sol:IERC20",
            uniOhmDaiLpAddress
        );

        treasury = await ethers.getContractAt("OlympusTreasury", olympus.treasury);

        governor = await impersonate(olympus.governor);
        gOhmHolder = await impersonate(gOhmHolderAddress);
        sOhmHolder = await impersonate(sOhmHolderAddress);
        daiHolder = await impersonate(daiHolderAddress);

        ohm_token = await getContract("IOHM", olympus.ohm);
        gohm_token = await getContract("IgOHM", olympus.gohm);
        staking = await getContract("OlympusStaking", olympus.staking);
        sohm_token = await getContract("sOlympus", olympus.sohm);

        await treasury.connect(governor).enable(10, incurDebt.address, incurDebt.address);

        await treasury.connect(governor).enable(9, olympus.sohm, olympus.sohm);

        await gohm_token.connect(gOhmHolder).approve(incurDebt.address, amount);

        await user.sendTransaction({
            to: sOhmHolder.address,
            value: ethers.utils.parseEther("2"), // 2 ether
        });

        await gohm_token.connect(gOhmHolder).transfer(incurDebt.address, "100000000000000000"); // Send dust to contract for rounding issues
        await sohm_token.connect(sOhmHolder).transfer(incurDebt.address, "1000000000");
    });

    describe("setGlobalDebtLimit(uint256 _limit)", () => {
        const amount = "2000000000000";

        it("Should fail if caller is not governor  address", async () => {
            await expect(incurDebt.connect(user).setGlobalDebtLimit(amount)).to.revertedWith(
                "UNAUTHORIZED()"
            );
        });

        it("Should set global debt limit address", async () => {
            await expect(incurDebt.connect(governor).setGlobalDebtLimit(amount))
                .to.emit(incurDebt, "GlobalLimitChanged")
                .withArgs(amount);
            assert.equal(await incurDebt.globalDebtLimit(), amount);
        });
    });

    describe("allowBorrower(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(
                incurDebt.connect(user).allowBorrower(gOhmHolder.address, false, true)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should fail if isNonLpBorrower and isLpBorrower is true", async () => {
            await expect(
                incurDebt.connect(governor).allowBorrower(gOhmHolder.address, true, true)
            ).to.revertedWith("IncurDebt_BothParamsCannotBeTrue()");
        });

        it("Should fail if user is already a type of borrower", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(
                incurDebt.connect(governor).allowBorrower(gOhmHolder.address, true, false)
            ).to.revertedWith(`IncurDebt_AlreadyBorrower("${gOhmHolder.address}")`);
        });

        it("Should allow borrower", async () => {
            const borrowerInfoBeforerTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoBeforerTx.isNonLpBorrower, false);

            await expect(incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true))
                .to.emit(incurDebt, "BorrowerAllowed")
                .withArgs(gOhmHolder.address, false, true);

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.isNonLpBorrower, true);
        });
    });

    describe("setBorrowerDebtLimit(address _borrower, uint256 _limit)", () => {
        const amount = "2000000000000";
        it("Should fail if caller is not governor  address", async () => {
            await expect(
                incurDebt.connect(user).setBorrowerDebtLimit(gOhmHolder.address, amount)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebt.connect(governor).setBorrowerDebtLimit(user.address, amount)
            ).to.revertedWith(`IncurDebt_NotBorrower("${user.address}")`);
        });

        it("Should fail if _limit above global debt limit", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(
                incurDebt.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, amount)
            ).to.revertedWith(`IncurDebt_AboveGlobalDebtLimit(${amount})`);
        });

        it("Should set borrower debt limit", async () => {
            const _amount = "1000000000000";
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);

            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.limit, 0);
            await expect(
                incurDebt.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, _amount)
            )
                .to.emit(incurDebt, "BorrowerDebtLimitSet")
                .withArgs(gOhmHolder.address, _amount);

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.limit, _amount);
        });
    });

    describe("revokeBorrower(address _borrower)", () => {
        it("Should fail if caller is not governor address", async () => {
            await expect(
                incurDebt.connect(user).revokeBorrower(gOhmHolder.address, false, true)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebt.connect(governor).revokeBorrower(user.address, false, true)
            ).to.revertedWith(`IncurDebt_NotBorrower("${user.address}")`);
        });

        it("Should fail if isNonLpBorrower and isLpBorrower is true", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(
                incurDebt.connect(governor).revokeBorrower(gOhmHolder.address, true, true)
            ).to.revertedWith("IncurDebt_BothParamsCannotBeTrue()");
        });

        it("Should allow to revoke borrower", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.isNonLpBorrower, true);
            await expect(
                incurDebt.connect(governor).revokeBorrower(gOhmHolder.address, false, true)
            )
                .to.emit(incurDebt, "BorrowerRevoked")
                .withArgs(gOhmHolder.address, false, true);

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.isNonLpBorrower, false);
        });
    });

    describe("deposit(uint256 _amount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebt.connect(user).deposit(amountInGOHM)).to.revertedWith(
                `IncurDebt_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _borrower has no fund", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(sOhmHolder.address, false, true);

            await incurDebt.connect(governor).setBorrowerDebtLimit(sOhmHolder.address, amount);

            await gohm_token.connect(sOhmHolder).approve(incurDebt.address, amount);

            await expect(incurDebt.connect(sOhmHolder).deposit(amount)).to.revertedWith(
                `TRANSFER_FROM_FAILED`
            );
        });

        it("Should deposit gOHM", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);

            await incurDebt.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, amount);

            await gohm_token.connect(gOhmHolder).approve(incurDebt.address, amountInGOHM);
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.collateralInGOHM, 0);
            await expect(incurDebt.connect(gOhmHolder).deposit(amountInGOHM))
                .to.emit(incurDebt, "BorrowerDeposit")
                .withArgs(gOhmHolder.address, amountInGOHM);

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.collateralInGOHM, amountInGOHM);
        });
    });

    describe("borrow(uint256 _ohmAmount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebt.connect(user).borrow(amount)).to.revertedWith(
                `IncurDebt_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if amount to borrow is above borrowers debt limit", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);

            await incurDebt
                .connect(governor)
                .setBorrowerDebtLimit(gOhmHolder.address, "10000000000");
            await expect(incurDebt.connect(gOhmHolder).borrow(amount)).to.revertedWith(
                `IncurDebt_AboveBorrowersDebtLimit(1000000000000)`
            );
        });

        it("Should fail if borrowers available debt is below amount", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);

            await incurDebt.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, amount);
            await expect(incurDebt.connect(gOhmHolder).borrow(amount)).to.revertedWith(
                `IncurDebt_OHMAmountMoreThanAvailableLoan(1000000000000)`
            );
        });

        it("Should borrow", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoBeforeTx.debt, 0);

            const outstandingDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();
            assert.equal(outstandingDebtBeforeTx, 0);

            const ohmBalanceBeforeTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(ohmBalanceBeforeTx, 0);

            await expect(incurDebt.connect(gOhmHolder).borrow(amount))
                .to.emit(incurDebt, "Borrowed")
                .withArgs(
                    gOhmHolder.address,
                    amount,
                    borrowerInfoBeforeTx.debt.add(amount),
                    outstandingDebtBeforeTx.add(amount)
                );

            const ohmBalanceAfterTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(ohmBalanceAfterTx, amount);

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.debt, amount);
            const outstandingDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(outstandingDebtAfterTx, amount);
        });

        it("Should fail to revoke borrower", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow(amount);

            await expect(
                incurDebt.connect(governor).revokeBorrower(gOhmHolder.address, false, true)
            ).to.revertedWith(`IncurDebt_BorrowerStillHasOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should fail if borrower debt limit is above limit", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow(amount);

            await expect(
                incurDebt.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, "900000000000")
            ).to.revertedWith(`IncurDebt_AboveBorrowersDebtLimit(${900000000000})`);
        });

        it("Should fail if total outstanding debt is > limit", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow(amount);

            await expect(
                incurDebt.connect(governor).setGlobalDebtLimit("900000000000")
            ).to.revertedWith(`IncurDebt_LimitBelowOutstandingDebt(${900000000000})`);
        });
    });

    describe("withdraw(uint256 _amount,address _to)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebt.connect(user).withdraw(amount)).to.revertedWith(
                `IncurDebt_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _amount is 0", async () => {
            await incurDebt.connect(governor).allowBorrower(user.address, false, true);
            await expect(incurDebt.connect(user).withdraw(0)).to.revertedWith(
                `IncurDebt_InvaildNumber(${0})`
            );
        });

        it("Should fail if below borrower gOHM balance", async () => {
            await incurDebt.connect(governor).allowBorrower(user.address, false, true);
            await expect(incurDebt.connect(user).withdraw(amount)).to.revertedWith(
                `IncurDebt_AmountAboveBorrowerBalance(${amount})`
            );
        });

        it("Should fail if available collateral is tied to outstanding debt", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow("500000000000");

            await expect(incurDebt.connect(gOhmHolder).withdraw(amountInGOHM)).to.revertedWith(
                `IncurDebt_AmountAboveBorrowerBalance(${amountInGOHM})`
            );
        });

        it("Should withdraw borrowers gOHM balance", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            const availableToBorrowBeforeTx = await incurDebt
                .connect(gOhmHolder)
                .getAvailableToBorrow();

            await increase(28800); //8 hours;
            await staking.connect(gOhmHolder).rebase();

            const availableToBorrowAfterTx = await incurDebt
                .connect(gOhmHolder)
                .getAvailableToBorrow();
            expect(availableToBorrowAfterTx).to.be.above(availableToBorrowBeforeTx);

            const gOhmBanlanceBeforeTx = await gohm_token.balanceOf(gOhmHolder.address);

            await expect(incurDebt.connect(gOhmHolder).withdraw(amountInGOHM))
                .to.emit(incurDebt, "Withdrawal")
                .withArgs(gOhmHolder.address, amountInGOHM, 0);

            const gOhmBanlanceAfterTx = await gohm_token.balanceOf(gOhmHolder.address);
            expect(gOhmBanlanceBeforeTx.add(amountInGOHM)).to.equal(gOhmBanlanceAfterTx);

            const borrowerInfo = await incurDebt.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfo.collateralInGOHM, 0);
        });

        it("Should withdraw borrower gOHM available balance ", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow(halfOfAmount);
            const borrowerInfobeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfobeforeTx.collateralInGOHM, amountInGOHM);

            const gOhmBalanceBeforeTx = await gohm_token.balanceOf(gOhmHolder.address);
            const currentCollateral =
                borrowerInfobeforeTx.collateralInGOHM.sub("5000000000000000000");

            await expect(incurDebt.connect(gOhmHolder).withdraw("5000000000000000000"))
                .to.emit(incurDebt, "Withdrawal")
                .withArgs(gOhmHolder.address, "5000000000000000000", `${currentCollateral}`);

            const gOhmBalanceAfterTx = await gohm_token.balanceOf(gOhmHolder.address);

            expect(gOhmBalanceBeforeTx.add(currentCollateral)).to.equal(gOhmBalanceAfterTx);

            const borrowerInfo = await incurDebt.borrowers(gOhmHolder.address);
            expect(borrowerInfo.collateralInGOHM).to.equal("5000000000000000000");
        });
    });

    describe("repayDebtWithCollateral()", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebt.connect(gOhmHolder).repayDebtWithCollateral()).to.revertedWith(
                `IncurDebt_NotBorrower("${gOhmHolder.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(incurDebt.connect(gOhmHolder).repayDebtWithCollateral()).to.revertedWith(
                `IncurDebt_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`
            );
        });

        it("Should allow borrower pay debt with collateral", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow(halfOfAmount);
            const totalDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), Number(halfOfAmount));
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.collateralInGOHM, amountInGOHM);

            await expect(incurDebt.connect(gOhmHolder).repayDebtWithCollateral())
                .to.emit(incurDebt, "DebtPaidWithCollateral")
                .withArgs(
                    gOhmHolder.address,
                    halfOfAmount,
                    borrowerInfoBeforeTx.collateralInGOHM.sub(
                        await gohm_token.balanceTo(halfOfAmount)
                    ),
                    Number(borrowerInfoBeforeTx.debt) - Number(halfOfAmount),
                    Number(totalDebtBeforeTx) - Number(halfOfAmount)
                );
            const totalDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("repayDebtWithCollateralAndWithdrawTheRest()", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebt.connect(user).repayDebtWithCollateralAndWithdrawTheRest()
            ).to.revertedWith(`IncurDebt_NotBorrower("${user.address}")`);
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(
                incurDebt.connect(gOhmHolder).repayDebtWithCollateralAndWithdrawTheRest()
            ).to.revertedWith(`IncurDebt_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow borrower pay debt with collateral withdraw the rest to gOHM", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow(halfOfAmount);
            const totalDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(totalDebtBeforeTx, halfOfAmount);
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.collateralInGOHM, amountInGOHM);

            await expect(incurDebt.connect(gOhmHolder).repayDebtWithCollateralAndWithdrawTheRest())
                .to.emit(incurDebt, "DebtPaidWithCollateralAndWithdrawTheRest")
                .withArgs(
                    gOhmHolder.address,
                    halfOfAmount,
                    Number(borrowerInfoBeforeTx.collateralInGOHM) - Number(amountInGOHM),
                    Number(borrowerInfoBeforeTx.debt) - Number(halfOfAmount),
                    Number(totalDebtBeforeTx) - Number(halfOfAmount),
                    borrowerInfoBeforeTx.collateralInGOHM.sub(
                        await gohm_token.balanceTo(halfOfAmount)
                    )
                );

            const totalDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.collateralInGOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("repayDebtWithOHM(uint256 _ohmAmount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebt.connect(user).repayDebtWithOHM(amount)).to.revertedWith(
                `IncurDebt_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(
                incurDebt.connect(gOhmHolder).repayDebtWithOHM("500000000000")
            ).to.revertedWith(`IncurDebt_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow borrower pay debt with OHM", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            const totalDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            const userOhmBalanceBeforeTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(Number(userOhmBalanceBeforeTx), 500000000000);

            await ohm_token.connect(gOhmHolder).approve(incurDebt.address, amount);
            await expect(incurDebt.connect(gOhmHolder).repayDebtWithOHM(500000000000))
                .to.emit(incurDebt, "DebtPaidWithOHM")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000
                );

            const userOhmBalanceAfterTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(Number(userOhmBalanceAfterTx), 0);

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("forceRepay(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(incurDebt.connect(user).forceRepay(gOhmHolder.address)).to.revertedWith(
                "UNAUTHORIZED()"
            );
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebt.connect(governor).forceRepay(gOhmHolder.address)
            ).to.revertedWith(`IncurDebt_NotBorrower("${gOhmHolder.address}")`);
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(
                incurDebt.connect(governor).forceRepay(gOhmHolder.address)
            ).to.revertedWith(`IncurDebt_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow gov force payment", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            expect(borrowerInfoBeforeTx.collateralInGOHM).to.equal(amountInGOHM);

            const totalDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            await expect(incurDebt.connect(governor).forceRepay(gOhmHolder.address))
                .to.emit(incurDebt, "ForceDebtPayWithCollateralAndWithdrawTheRest")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    0,
                    0,
                    0,
                    borrowerInfoBeforeTx.collateralInGOHM.sub(
                        await gohm_token.balanceTo("500000000000")
                    )
                );

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
            assert.equal(borrowerInfoAfterTx.collateralInGOHM, 0);
        });
    });

    describe("seize(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(incurDebt.connect(user).seize(gOhmHolder.address)).to.revertedWith(
                "UNAUTHORIZED()"
            );
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebt.connect(governor).seize(gOhmHolder.address)).to.revertedWith(
                `IncurDebt_NotBorrower("${gOhmHolder.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await expect(incurDebt.connect(governor).seize(gOhmHolder.address)).to.revertedWith(
                `IncurDebt_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`
            );
        });

        it("Should allow gov seize borrower collateral and pay debt", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebt.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            assert.equal(borrowerInfoBeforeTx.collateralInGOHM, amountInGOHM);

            const totalDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            await expect(incurDebt.connect(governor).seize(gOhmHolder.address))
                .to.emit(incurDebt, "DebtPaidWithCollateralAndBurnTheRest")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    0,
                    0,
                    0,
                    borrowerInfoBeforeTx.collateralInGOHM.sub(
                        await gohm_token.balanceTo("500000000000")
                    )
                );

            const borrowerInfoAfterTx = await incurDebt.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);

            assert.equal(Number(borrowerInfoAfterTx.collateralInGOHM), 0);
        });
    });

    describe("function createLP(_ohmAmount, _strategy, _strategyParams)", async () => {
        const ohmAmount = "33000000000";
        const daiAmount = "1000000000000000000000";
        const token0 = olympus.ohm;
        const token1 = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        const slippage = 900;

        const data = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256", "uint256", "uint256", "uint256"],
            [token0, token1, ohmAmount, daiAmount, ohmAmount, daiAmount, slippage]
        );

        it("Should fail if borrower isNonLpBorrower", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);

            await expect(
                incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data)
            ).to.revertedWith(`IncurDebt_NotBorrower("${daiHolder.address}")`);
        });

        it("Should fail if strategy is not whitelist", async () => {
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);
            await expect(
                incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data)
            ).to.revertedWith(`IncurDebt_StrategyUnauthorized("${uniSwapStrategy.address}")`);
        });

        it("Should fail if amount to borrow is above borrowers debt limit", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);

            await incurDebt
                .connect(governor)
                .setBorrowerDebtLimit(daiHolder.address, "20000000000");

            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);
            await expect(
                incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data)
            ).to.revertedWith(`IncurDebt_AboveBorrowersDebtLimit(33000000000)`);
        });

        it("Should fail if borrowers available debt is below amount", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);

            await incurDebt.connect(governor).setBorrowerDebtLimit(daiHolder.address, ohmAmount);

            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);
            await expect(
                incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data)
            ).to.revertedWith(`IncurDebt_OHMAmountMoreThanAvailableLoan(33000000000)`);
        });

        it("Should allow borrower create lp", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);

            await incurDebt.connect(governor).setBorrowerDebtLimit(daiHolder.address, ohmAmount);

            await gohm_token.connect(daiHolder).approve(incurDebt.address, amountInGOHM);
            await gohm_token.connect(gOhmHolder).transfer(daiHolder.address, amountInGOHM);

            await incurDebt.connect(daiHolder).deposit(amountInGOHM);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, amount);

            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);
            await daiContract.connect(daiHolder).approve(uniSwapStrategy.address, daiAmount);
            await expect(
                incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data)
            ).to.emit(incurDebt, "LpInteraction");
        });
    });

    describe("function removeLP(_liquidity, _strategy, _lpToken, _strategyParams)", () => {
        const ohmAmount = "33000000000";
        const daiAmount = "1000000000000000000000";

        const token0 = olympus.ohm;
        const token1 = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

        const slippage = 900;
        const slippage1 = 900;

        const fakeData = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256", "uint256", "uint256"],
            [token0, token1, ohmAmount, daiAmount, ohmAmount, slippage]
        );

        const data1 = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256", "uint256", "uint256", "uint256"],
            [token0, token1, ohmAmount, daiAmount, ohmAmount, daiAmount, slippage]
        );

        it("Should fail if borrower isNonLpBorrower", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);

            await expect(
                incurDebt
                    .connect(daiHolder)
                    .removeLP(ohmAmount, uniSwapStrategy.address, uniOhmDaiLpAddress, fakeData)
            ).to.revertedWith(`IncurDebt_NotBorrower("${daiHolder.address}")`);
        });

        it("Should allow lp borrower removeLP LP", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);

            await incurDebt.connect(governor).setBorrowerDebtLimit(daiHolder.address, ohmAmount);

            await gohm_token.connect(daiHolder).approve(incurDebt.address, amountInGOHM);
            await gohm_token.connect(gOhmHolder).transfer(daiHolder.address, amountInGOHM);

            await incurDebt.connect(daiHolder).deposit(amountInGOHM);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, "3000000000000");

            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);
            await daiContract.connect(daiHolder).approve(uniSwapStrategy.address, daiAmount);

            await incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data1);

            const borrowerInfoBeforeTx = await incurDebt.borrowers(daiHolder.address);
            assert.equal(borrowerInfoBeforeTx.collateralInGOHM, amountInGOHM);
            expect(borrowerInfoBeforeTx.debt).to.be.above(0);

            const borrowerLpBeforeTx = await incurDebt.lpTokenOwnership(
                uniOhmDaiLpAddress,
                daiHolder.address
            );
            expect(borrowerLpBeforeTx).to.be.above(0);

            const borrowerLpBalanceBeforeTx = await uniswapLpContract.balanceOf(daiHolder.address);
            assert.equal(borrowerLpBalanceBeforeTx, 0);
            expect(borrowerInfoBeforeTx.debt).to.be.above(0);

            const totalOutstandingGlobalDebtBeforeTx = await incurDebt.totalOutstandingGlobalDebt();
            assert.equal(borrowerInfoBeforeTx.debt, totalOutstandingGlobalDebtBeforeTx.toString());

            const token0PoolBalance = await ohm_token.balanceOf(uniOhmDaiLpAddress);
            const token1PoolBalance = await daiContract.balanceOf(uniOhmDaiLpAddress);
            const poolTotalSupply = await uniswapLpContract.totalSupply();

            const amount1Min = (token0PoolBalance * borrowerLpBeforeTx) / poolTotalSupply;
            const amount2Min = (token1PoolBalance * borrowerLpBeforeTx) / poolTotalSupply;

            const data = ethers.utils.defaultAbiCoder.encode(
                ["address", "address", "uint256", "uint256", "uint256", "uint256"],
                [
                    token0,
                    token1,
                    borrowerLpBeforeTx,
                    amount1Min.toString(),
                    amount2Min.toString(),
                    slippage1,
                ]
            );
            await expect(
                incurDebt
                    .connect(daiHolder)
                    .removeLP(borrowerLpBeforeTx, uniSwapStrategy.address, uniOhmDaiLpAddress, data)
            ).to.emit(incurDebt, "LpInteraction");

            const borrowerInfoAfterTx = await incurDebt.borrowers(daiHolder.address);
            assert.equal(Number(borrowerInfoAfterTx.debt), 1);

            const totalOutstandingGlobalDebtAfterTx = await incurDebt.totalOutstandingGlobalDebt();
            assert.equal(Number(totalOutstandingGlobalDebtAfterTx), 1);
        });
    });

    describe("withdrawLP(uint256 _liquidity, address _lpToken)", async () => {
        const ohmAmount = "33000000000";
        const daiAmount = "1000000000000000000000";

        const token0 = olympus.ohm;
        const token1 = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

        const slippage = 900;

        const data = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256", "uint256", "uint256", "uint256"],
            [token0, token1, ohmAmount, daiAmount, ohmAmount, daiAmount, slippage]
        );

        it("Should fail if borrower isNonLpBorrower", async () => {
            await incurDebt.connect(governor).allowBorrower(gOhmHolder.address, false, true);
            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);

            await expect(
                incurDebt.connect(daiHolder).withdrawLP(ohmAmount, uniOhmDaiLpAddress)
            ).to.revertedWith(`IncurDebt_NotBorrower("${daiHolder.address}")`);
        });

        it("Should fail if borrower amount is above borrower balance", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);

            await incurDebt.connect(governor).setBorrowerDebtLimit(daiHolder.address, ohmAmount);

            await gohm_token.connect(daiHolder).approve(incurDebt.address, amountInGOHM);
            await gohm_token.connect(gOhmHolder).transfer(daiHolder.address, amountInGOHM);

            await incurDebt.connect(daiHolder).deposit(amountInGOHM);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, "3000000000000");

            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);
            await daiContract.connect(daiHolder).approve(uniSwapStrategy.address, daiAmount);

            await incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data);

            const borrowerLpBeforeTx = await incurDebt.lpTokenOwnership(
                uniOhmDaiLpAddress,
                daiHolder.address
            );
            await expect(
                incurDebt
                    .connect(daiHolder)
                    .withdrawLP(Number(borrowerLpBeforeTx) + 1, uniOhmDaiLpAddress)
            ).to.revertedWith(
                `IncurDebt_AmountAboveBorrowerBalance(${Number(borrowerLpBeforeTx) + 1})`
            );
        });

        it("Should allow lp borrower withdraw LP", async () => {
            await incurDebt.connect(governor).setGlobalDebtLimit(amount);
            await incurDebt.connect(governor).allowBorrower(daiHolder.address, true, false);

            await incurDebt.connect(governor).setBorrowerDebtLimit(daiHolder.address, ohmAmount);

            await gohm_token.connect(daiHolder).approve(incurDebt.address, amountInGOHM);
            await gohm_token.connect(gOhmHolder).transfer(daiHolder.address, amountInGOHM);

            await incurDebt.connect(daiHolder).deposit(amountInGOHM);
            await treasury.connect(governor).setDebtLimit(incurDebt.address, "3000000000000");

            await incurDebt.connect(governor).whitelistStrategy(uniSwapStrategy.address);
            await daiContract.connect(daiHolder).approve(uniSwapStrategy.address, daiAmount);

            await incurDebt.connect(daiHolder).createLP(ohmAmount, uniSwapStrategy.address, data);

            const borrowerInfoBeforerTx = await incurDebt.borrowers(daiHolder.address);
            assert.equal(borrowerInfoBeforerTx.collateralInGOHM, amountInGOHM);

            const borrowerLpBeforeTx = await incurDebt.lpTokenOwnership(
                uniOhmDaiLpAddress,
                daiHolder.address
            );
            expect(borrowerLpBeforeTx).to.be.above(0);

            const borrowerLpBalanceBeforeTx = await uniswapLpContract.balanceOf(daiHolder.address);
            assert(borrowerLpBalanceBeforeTx, 0);

            await expect(
                incurDebt.connect(daiHolder).withdrawLP(borrowerLpBeforeTx, uniOhmDaiLpAddress)
            ).to.emit(incurDebt, "LpWithdrawn");

            const borrowerInfoAfterTx = await incurDebt.borrowers(daiHolder.address);
            assert.equal(
                Number(borrowerInfoAfterTx.collateralInGOHM),
                amountInGOHM - Number(await gohm_token.balanceTo(borrowerInfoBeforerTx.debt))
            );

            const borrowerLpAfterTx = await incurDebt.lpTokenOwnership(
                uniOhmDaiLpAddress,
                daiHolder.address
            );
            assert.equal(borrowerLpAfterTx, 0);

            const borrowerLpBalanceAfterTx = await uniswapLpContract.balanceOf(daiHolder.address);
            assert.equal(Number(borrowerLpBalanceAfterTx), Number(borrowerLpBeforeTx));
        });
    });

    async function impersonate(address) {
        await impersonateAccount(address);
        const owner = await ethers.getSigner(address);
        return owner;
    }

    async function getContract(contractSource, address) {
        const contract = await ethers.getContractAt(contractSource, address);
        return contract;
    }

    async function setUp(amountInToken, userAddress, signer, contract) {
        await incurDebt.connect(governor).setGlobalDebtLimit(amountInToken);
        await incurDebt.connect(governor).allowBorrower(userAddress, false, true);

        await incurDebt.connect(governor).setBorrowerDebtLimit(userAddress, amountInToken);
        await contract.connect(signer).approve(incurDebt.address, amountInToken);

        await incurDebt.connect(signer).deposit(amountInToken);
    }
});
