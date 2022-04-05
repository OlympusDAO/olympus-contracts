const chai = require("chai");
const { assert, expect } = require("chai");
const { olympus } = require("../utils/olympus");
const { solidity } = require("ethereum-waffle");
const { increase } = require("../utils/advancement");
const { fork_network } = require("../utils/network_fork");
const impersonateAccount = require("../utils/impersonate_account");

chai.use(solidity);

const gOhmHolderAddress = "0xD3D086B36d5502122F275F4Bc18e04c844Bd6E2e";
const sOhmHolderAddress = "0xB4e168232ac61b49053f263F57920f9BF38856C2";

describe("IncurDebtV1", async () => {
    let user,
        amount,
        staking,
        governor,
        treasury,
        ohm_token,
        gohm_token,
        sohm_token,
        gOhmHolder,
        sOhmHolder,
        IncurDebtV1,
        incurDebtV1,
        amountInSOHM,
        halfOfTotalDeposit;

    beforeEach(async () => {
        await fork_network(14507894);
        [user] = await ethers.getSigners();

        amount = "2000000000000";
        amountInSOHM = "1000000000000";
        halfOfTotalDeposit = `${1000000000000 / 2}`;

        IncurDebtV1 = await ethers.getContractFactory("IncurDebtV1");
        incurDebtV1 = await IncurDebtV1.deploy(
            olympus.ohm,
            olympus.sohm,
            olympus.staking,
            olympus.treasury,
            olympus.authority
        );

        treasury = await ethers.getContractAt("OlympusTreasury", olympus.treasury);

        governor = await impersonate(olympus.governor);
        gOhmHolder = await impersonate(gOhmHolderAddress);
        sOhmHolder = await impersonate(sOhmHolderAddress);

        ohm_token = await getContract("IOHM", olympus.ohm);
        gohm_token = await getContract("IgOHM", olympus.gohm);
        staking = await getContract("OlympusStaking", olympus.staking);
        sohm_token = await getContract("sOlympus", olympus.sohm);

        await treasury.connect(governor).enable(10, incurDebtV1.address, incurDebtV1.address);

        await treasury.connect(governor).enable(9, olympus.sohm, olympus.sohm);
    });

    describe("setGlobalDebtLimit(uint256 _limit)", () => {
        const amount = "2000000000000";

        it("Should fail if caller is not governor  address", async () => {
            await expect(incurDebtV1.connect(user).setGlobalDebtLimit(amount)).to.revertedWith(
                "UNAUTHORIZED()"
            );
        });

        it("Should set global debt limit address", async () => {
            await expect(incurDebtV1.connect(governor).setGlobalDebtLimit(amount))
                .to.emit(incurDebtV1, "GlobalLimitChanged")
                .withArgs(amount);
            assert.equal(await incurDebtV1.globalDebtLimit(), amount);
        });
    });

    describe("allowBorrower(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(
                incurDebtV1.connect(user).allowBorrower(gOhmHolder.address)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should allow borrower", async () => {
            const borrowerInfoBeforerTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoBeforerTx.isAllowed, false);

            await expect(incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address))
                .to.emit(incurDebtV1, "BorrowerAllowed")
                .withArgs(sOhmHolder.address);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.isAllowed, true);
        });
    });

    describe("setBorrowerDebtLimit(address _borrower, uint256 _limit)", () => {
        const amount = "2000000000000";
        it("Should fail if caller is not governor  address", async () => {
            await expect(
                incurDebtV1.connect(user).setBorrowerDebtLimit(gOhmHolder.address, amount)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(governor).setBorrowerDebtLimit(user.address, amount)
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${user.address}")`);
        });

        it("Should fail if _limit above global debt limit", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(
                incurDebtV1.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, amount)
            ).to.revertedWith(`IncurDebtV1_AboveGlobalDebtLimit(${amount})`);
        });

        it("Should set borrower debt limit", async () => {
            const _amount = "1000000000000";
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);

            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.limit, 0);
            await expect(
                incurDebtV1.connect(governor).setBorrowerDebtLimit(sOhmHolder.address, _amount)
            )
                .to.emit(incurDebtV1, "BorrowerDebtLimitSet")
                .withArgs(sOhmHolder.address, _amount);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.limit, _amount);
        });
    });

    describe("revokeBorrower(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(
                incurDebtV1.connect(user).revokeBorrower(gOhmHolder.address)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(governor).revokeBorrower(user.address)
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${user.address}")`);
        });

        it("Should allow to revoke borrower", async () => {
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.isAllowed, true);
            await expect(incurDebtV1.connect(governor).revokeBorrower(sOhmHolder.address))
                .to.emit(incurDebtV1, "BorrowerRevoked")
                .withArgs(sOhmHolder.address);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.isAllowed, false);
        });
    });

    describe("deposit(uint256 _amount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(user).deposit(amount)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _borrower has no fund", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);

            await incurDebtV1.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, amount);

            await gohm_token.connect(gOhmHolder).approve(incurDebtV1.address, amount);

            await expect(incurDebtV1.connect(gOhmHolder).deposit(amount)).to.revertedWith(
                `TRANSFER_FROM_FAILED`
            );
        });

        it("Should deposit sohm", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);

            await incurDebtV1
                .connect(governor)
                .setBorrowerDebtLimit(sOhmHolder.address, amountInSOHM);

            await sohm_token.connect(sOhmHolder).approve(incurDebtV1.address, amount);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.collateralInSOHM, 0);
            await expect(incurDebtV1.connect(sOhmHolder).deposit(amountInSOHM))
                .to.emit(incurDebtV1, "BorrowerDeposit")
                .withArgs(sOhmHolder.address, olympus.sohm, amountInSOHM);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.collateralInSOHM, amountInSOHM);
        });
    });

    describe("borrow(uint256 _ohmAmount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(user).borrow(amount)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if amount to borrow is above borrowers debt limit", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);

            await incurDebtV1
                .connect(governor)
                .setBorrowerDebtLimit(sOhmHolder.address, amountInSOHM);
            await expect(incurDebtV1.connect(sOhmHolder).borrow(amount)).to.revertedWith(
                `IncurDebtV1_AboveBorrowersDebtLimit(2000000000000)`
            );
        });

        it("Should fail if borrowers available debt is below amount", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);

            await incurDebtV1.connect(governor).setBorrowerDebtLimit(sOhmHolder.address, amount);
            await expect(incurDebtV1.connect(sOhmHolder).borrow(amountInSOHM)).to.revertedWith(
                `IncurDebtV1_OHMAmountMoreThanAvailableLoan(1000000000000)`
            );
        });

        it("Should borrow", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoBeforeTx.debt, 0);

            const outstandingDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();
            assert.equal(outstandingDebtBeforeTx, 0);

            const ohmBalanceBeforeTx = await ohm_token.balanceOf(sOhmHolder.address);
            assert.equal(ohmBalanceBeforeTx, 0);

            await expect(incurDebtV1.connect(sOhmHolder).borrow(amountInSOHM))
                .to.emit(incurDebtV1, "Borrowed")
                .withArgs(
                    sOhmHolder.address,
                    amountInSOHM,
                    Number(amountInSOHM) + Number(borrowerInfoBeforeTx.debt),
                    Number(outstandingDebtBeforeTx) + Number(amountInSOHM)
                );
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);

            const ohmBalanceAfterTx = await ohm_token.balanceOf(sOhmHolder.address);
            assert.equal(ohmBalanceAfterTx, amountInSOHM);

            assert.equal(borrowerInfoAfterTx.debt, amountInSOHM);
            const outstandingDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(outstandingDebtAfterTx, amountInSOHM);
        });

        it("Should fail to revoke borrower", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow(amountInSOHM);

            await expect(
                incurDebtV1.connect(governor).revokeBorrower(sOhmHolder.address)
            ).to.revertedWith(
                `IncurDebtV1_BorrowerStillHasOutstandingDebt("${sOhmHolder.address}")`
            );
        });

        it("Should fail if borrower debt limit is above limit", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow(amountInSOHM);

            await expect(
                incurDebtV1
                    .connect(governor)
                    .setBorrowerDebtLimit(sOhmHolder.address, "900000000000")
            ).to.revertedWith(`IncurDebtV1_AboveBorrowersDebtLimit(${900000000000})`);
        });

        it("Should fail if total outstanding debt is > limit", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow(amountInSOHM);

            await expect(
                incurDebtV1.connect(governor).setGlobalDebtLimit("900000000000")
            ).to.revertedWith(`IncurDebtV1_LimitBelowOutstandingDebt(${900000000000})`);
        });
    });

    describe("withdraw(uint256 _amount,address _to)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(user).withdraw(amount, user.address)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _amount is 0", async () => {
            await incurDebtV1.connect(governor).allowBorrower(user.address);
            await expect(incurDebtV1.connect(user).withdraw(0, user.address)).to.revertedWith(
                `IncurDebtV1_InvaildNumber(${0})`
            );
        });

        it("Should fail if below borrower sOHM balance", async () => {
            await incurDebtV1.connect(governor).allowBorrower(user.address);
            await expect(incurDebtV1.connect(user).withdraw(amount, user.address)).to.revertedWith(
                `IncurDebtV1_AmountAboveBorrowerBalance(${amount})`
            );
        });

        it("Should fail if available collateral is tied to outstanding debt", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");

            await expect(
                incurDebtV1.connect(sOhmHolder).withdraw("500000000001", gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_AmountAboveBorrowerBalance(${500000000001})`);
        });

        it("Should withdraw borrowers sOHM balance", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            const availableToBorrowBeforeTx = await incurDebtV1
                .connect(sOhmHolder)
                .getAvailableToBorrow();

            await increase(28800); //8 hours;
            await staking.connect(sOhmHolder).rebase();

            const availableToBorrowAfterTx = await incurDebtV1
                .connect(sOhmHolder)
                .getAvailableToBorrow();
            expect(availableToBorrowAfterTx).to.be.above(availableToBorrowBeforeTx);

            const sOhmBanlanceBeforeTx = await sohm_token.balanceOf(sOhmHolder.address);
            await expect(incurDebtV1.connect(sOhmHolder).withdraw(amountInSOHM, sOhmHolder.address))
                .to.emit(incurDebtV1, "Withdrawal")
                .withArgs(
                    sOhmHolder.address,
                    olympus.sohm,
                    sOhmHolder.address,
                    amountInSOHM,
                    Number(availableToBorrowAfterTx) - amountInSOHM
                );

            const sOhmBanlanceAfterTx = await sohm_token.balanceOf(sOhmHolder.address);
            assert.equal(
                (Number(sOhmBanlanceBeforeTx) + Number(amountInSOHM)).toString(),
                Number(sOhmBanlanceAfterTx).toString()
            );

            const borrowerInfo = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(
                Number(borrowerInfo.collateralInSOHM),
                Number(availableToBorrowAfterTx) - amountInSOHM
            );
        });

        it("Should withdraw borrower sOHM available balance ", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow(halfOfTotalDeposit);
            const borrowerInfobeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfobeforeTx.collateralInSOHM), Number(amountInSOHM));

            const sOhmBanlanceBeforeTx = await sohm_token.balanceOf(sOhmHolder.address);
            const currentCollateral =
                Number(borrowerInfobeforeTx.collateralInSOHM) - Number(halfOfTotalDeposit);

            await expect(
                incurDebtV1.connect(sOhmHolder).withdraw(halfOfTotalDeposit, sOhmHolder.address)
            )
                .to.emit(incurDebtV1, "Withdrawal")
                .withArgs(
                    sOhmHolder.address,
                    olympus.sohm,
                    sOhmHolder.address,
                    halfOfTotalDeposit,
                    `${currentCollateral}`
                );

            const sOhmBanlanceAfterTx = await sohm_token.balanceOf(sOhmHolder.address);

            assert.equal(
                (Number(sOhmBanlanceBeforeTx) + currentCollateral).toString(),
                sOhmBanlanceAfterTx.toString()
            );

            const borrowerInfo = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(Number(borrowerInfo.collateralInSOHM), Number(halfOfTotalDeposit));

            assert.equal(Number(borrowerInfo.collateralInSOHM), Number(borrowerInfo.debt));
        });
    });

    describe("repayDebtWithCollateral()", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(sOhmHolder).repayDebtWithCollateral()).to.revertedWith(
                `IncurDebtV1_NotBorrower("${sOhmHolder.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);
            await expect(incurDebtV1.connect(sOhmHolder).repayDebtWithCollateral()).to.revertedWith(
                `IncurDebtV1_BorrowerHasNoOutstandingDebt("${sOhmHolder.address}")`
            );
        });

        it("Should allow borrower pay debt with collateral", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow(halfOfTotalDeposit);
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), Number(halfOfTotalDeposit));
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), Number(amountInSOHM));

            await expect(incurDebtV1.connect(sOhmHolder).repayDebtWithCollateral())
                .to.emit(incurDebtV1, "DebtPaidWithCollateral")
                .withArgs(
                    sOhmHolder.address,
                    halfOfTotalDeposit,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - Number(halfOfTotalDeposit),
                    Number(borrowerInfoBeforeTx.debt) - Number(halfOfTotalDeposit),
                    Number(totalDebtBeforeTx) - Number(halfOfTotalDeposit)
                );
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), Number(halfOfTotalDeposit));
        });
    });

    describe("repayDebtWithCollateralAndWithdrawTheRest()", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(user).repayDebtWithCollateralAndWithdrawTheRest()
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${user.address}")`);
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);
            await expect(
                incurDebtV1.connect(sOhmHolder).repayDebtWithCollateralAndWithdrawTheRest()
            ).to.revertedWith(`IncurDebtV1_BorrowerHasNoOutstandingDebt("${sOhmHolder.address}")`);
        });

        it("Should allow borrower pay debt with collateral withdraw the rest to sOHM", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow(halfOfTotalDeposit);
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), halfOfTotalDeposit);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), amountInSOHM);

            await expect(
                incurDebtV1.connect(sOhmHolder).repayDebtWithCollateralAndWithdrawTheRest()
            )
                .to.emit(incurDebtV1, "DebtPaidWithCollateralAndWithdrawTheRest")
                .withArgs(
                    sOhmHolder.address,
                    halfOfTotalDeposit,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - Number(amountInSOHM),
                    Number(borrowerInfoBeforeTx.debt) - Number(halfOfTotalDeposit),
                    Number(totalDebtBeforeTx) - Number(halfOfTotalDeposit),
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - Number(halfOfTotalDeposit)
                );

            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("repayDebtWithOHM(uint256 _ohmAmount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(user).repayDebtWithOHM(amount)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(
                incurDebtV1.connect(gOhmHolder).repayDebtWithOHM("500000000000")
            ).to.revertedWith(`IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow borrower pay debt with OHM", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            const userOhmBalanceBeforeTx = await ohm_token.balanceOf(sOhmHolder.address);
            assert.equal(Number(userOhmBalanceBeforeTx), 500000000000);

            await ohm_token.connect(sOhmHolder).approve(incurDebtV1.address, amount);
            await expect(incurDebtV1.connect(sOhmHolder).repayDebtWithOHM(500000000000))
                .to.emit(incurDebtV1, "DebtPaidWithOHM")
                .withArgs(
                    sOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000
                );

            const userOhmBalanceAfterTx = await ohm_token.balanceOf(sOhmHolder.address);
            assert.equal(Number(userOhmBalanceAfterTx), 0);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("forceRepay(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(incurDebtV1.connect(user).forceRepay(gOhmHolder.address)).to.revertedWith(
                "UNAUTHORIZED()"
            );
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(governor).forceRepay(gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${gOhmHolder.address}")`);
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(
                incurDebtV1.connect(governor).forceRepay(gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow gov force payment", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), amountInSOHM);

            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            await expect(incurDebtV1.connect(governor).forceRepay(sOhmHolder.address))
                .to.emit(incurDebtV1, "ForceDebtPayWithCollateralAndWithdrawTheRest")
                .withArgs(
                    sOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 1000000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000000
                );

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
        });
    });

    describe("seize(address _borrower)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(incurDebtV1.connect(user).seize(gOhmHolder.address)).to.revertedWith(
                "UNAUTHORIZED()"
            );
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(governor).seize(gOhmHolder.address)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${gOhmHolder.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(incurDebtV1.connect(governor).seize(gOhmHolder.address)).to.revertedWith(
                `IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`
            );
        });

        it("Should allow gov seize borrower collateral and pay debt", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), 1000000000000);

            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            await expect(incurDebtV1.connect(governor).seize(sOhmHolder.address))
                .to.emit(incurDebtV1, "DebtPaidWithCollateralAndBurnTheRest")
                .withArgs(
                    sOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 1000000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000000
                );

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
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
        await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
        await incurDebtV1.connect(governor).allowBorrower(userAddress);

        await incurDebtV1.connect(governor).setBorrowerDebtLimit(userAddress, amountInToken);
        await contract.connect(signer).approve(incurDebtV1.address, amountInToken);

        await incurDebtV1.connect(signer).deposit(amountInToken);
    }
});
