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
        limit,
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
        amountInGOHM,
        amountInSOHM;

    beforeEach(async () => {
        await fork_network(14434969);
        [user] = await ethers.getSigners();

        limit = "1000000000000";
        amount = "2000000000000";
        amountInSOHM = "1000000000000";
        amountInGOHM = "9709947069239462000";

        IncurDebtV1 = await ethers.getContractFactory("IncurDebtV1");
        incurDebtV1 = await IncurDebtV1.deploy(
            olympus.ohm,
            olympus.gohm,
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
        sohm_token = await getContract("contracts/interfaces/IERC20.sol:IERC20", olympus.sohm);

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
                .to.emit(incurDebtV1, "GlobalLimit")
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
            const borrowerInfoBeforerTx = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoBeforerTx.isAllowed, false);

            await expect(incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address))
                .to.emit(incurDebtV1, "BorrowerAllowed")
                .withArgs(gOhmHolder.address);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
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

            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.limit, 0);
            await expect(
                incurDebtV1.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, _amount)
            )
                .to.emit(incurDebtV1, "BorrowerDebtLimitSet")
                .withArgs(gOhmHolder.address, _amount);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
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
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.isAllowed, true);
            await expect(incurDebtV1.connect(governor).revokeBorrower(gOhmHolder.address))
                .to.emit(incurDebtV1, "BorrowerRevoked")
                .withArgs(gOhmHolder.address);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.isAllowed, false);
        });
    });

    describe("deposit(uint256 _amount, address _token)", () => {
        let amount = "2000000000000";
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(user).deposit(amount, olympus.gohm)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _token is not sOHM or gOHM", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);

            const gOHMAmount = "10000000000000000000";
            await incurDebtV1
                .connect(governor)
                .setBorrowerDebtLimit(gOhmHolder.address, "100000000000");

            await gohm_token.connect(gOhmHolder).approve(incurDebtV1.address, gOHMAmount);

            await expect(
                incurDebtV1.connect(gOhmHolder).deposit(amount, olympus.authority)
            ).to.revertedWith(`IncurDebtV1_WrongTokenAddress("${olympus.authority}")`);
        });

        it("Should deposit gohm", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);

            const gOHMAmount = "10000000000000000000";
            await incurDebtV1
                .connect(governor)
                .setBorrowerDebtLimit(gOhmHolder.address, "100000000000");

            await gohm_token.connect(gOhmHolder).approve(incurDebtV1.address, gOHMAmount);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.collateralInGOHM, 0);
            await expect(incurDebtV1.connect(gOhmHolder).deposit(gOHMAmount, olympus.gohm))
                .to.emit(incurDebtV1, "BorrowerDeposit")
                .withArgs(gOhmHolder.address, gOHMAmount, olympus.gohm);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.collateralInGOHM, gOHMAmount);
        });

        it("Should deposit sohm", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(sOhmHolder.address);

            const sOHMAmount = "100000000000";
            await incurDebtV1
                .connect(governor)
                .setBorrowerDebtLimit(sOhmHolder.address, sOHMAmount);

            await sohm_token.connect(sOhmHolder).approve(incurDebtV1.address, sOHMAmount);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(borrowerInfoBeforeTx.collateralInSOHM, 0);
            await expect(incurDebtV1.connect(sOhmHolder).deposit(sOHMAmount, olympus.sohm))
                .to.emit(incurDebtV1, "BorrowerDeposit")
                .withArgs(sOhmHolder.address, sOHMAmount, olympus.sohm);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(borrowerInfoAfterTx.collateralInSOHM.toString(), sOHMAmount);
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
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);

            await incurDebtV1.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, limit);
            await expect(incurDebtV1.connect(gOhmHolder).borrow("3000000000000")).to.revertedWith(
                `IncurDebtV1_AmountMoreThanBorrowersLimit(3000000000000)`
            );
        });

        it("Should fail if borrowers available debt is below amount", async () => {
            await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);

            await incurDebtV1.connect(governor).setBorrowerDebtLimit(gOhmHolder.address, limit);
            await expect(incurDebtV1.connect(gOhmHolder).borrow("1000000000000")).to.revertedWith(
                `IncurDebtV1_OHMAmountMoreThanAvailableLoan(1000000000000)`
            );
        });

        it("Should borrow", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfoBeforeTx.debt, 0);

            const outstandingDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();
            assert.equal(outstandingDebtBeforeTx, 0);

            const ohmBalanceBeforeTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(ohmBalanceBeforeTx, 0);

            await expect(incurDebtV1.connect(gOhmHolder).borrow(limit))
                .to.emit(incurDebtV1, "Borrowed")
                .withArgs(
                    gOhmHolder.address,
                    limit,
                    Number(limit) + Number(borrowerInfoBeforeTx.debt),
                    Number(outstandingDebtBeforeTx) + Number(limit)
                );
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);

            const ohmBalanceAfterTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(ohmBalanceAfterTx, limit);

            assert.equal(borrowerInfoAfterTx.debt, limit);
            const outstandingDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(outstandingDebtAfterTx, limit);
        });

        it("Should fail to revoke borrower", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow(limit);

            await expect(
                incurDebtV1.connect(governor).revokeBorrower(gOhmHolder.address)
            ).to.revertedWith(
                `IncurDebtV1_BorrowerStillHasOutstandingDebt("${gOhmHolder.address}")`
            );
        });

        it("Should fail if borrower debt limit is above limit", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow(limit);

            await expect(
                incurDebtV1
                    .connect(governor)
                    .setBorrowerDebtLimit(gOhmHolder.address, "900000000000")
            ).to.revertedWith(`IncurDebtV1_AboveBorrowersDebtLimit(${900000000000})`);
        });

        it("Should fail if total outstanding debt is > limit", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow(limit);

            await expect(
                incurDebtV1.connect(governor).setGlobalDebtLimit("900000000000")
            ).to.revertedWith(`IncurDebtV1_LimitBelowOutstandingDebt(${900000000000})`);
        });
    });

    describe("withdraw(uint256 _amount,address _to,address _token)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(user).withdraw(amount, user.address, olympus.gohm)
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${user.address}")`);
        });

        it("Should fail if _amount is 0", async () => {
            await incurDebtV1.connect(governor).allowBorrower(user.address);
            await expect(
                incurDebtV1.connect(user).withdraw(0, user.address, olympus.gohm)
            ).to.revertedWith(`IncurDebtV1_InvaildNumber(${0})`);
        });

        it("Should fail if below borrower gOHM balance", async () => {
            await incurDebtV1.connect(governor).allowBorrower(user.address);
            await expect(
                incurDebtV1.connect(user).withdraw(amount, user.address, olympus.gohm)
            ).to.revertedWith(
                `IncurDebtV1_AmountAboveBorrowerBalance(${await gohm_token.balanceFrom(amount)})`
            );
        });

        it("Should fail if below borrower sOHM balance", async () => {
            await incurDebtV1.connect(governor).allowBorrower(user.address);
            await expect(
                incurDebtV1.connect(user).withdraw(amount, user.address, olympus.sohm)
            ).to.revertedWith(`IncurDebtV1_AmountAboveBorrowerBalance(${amount})`);
        });

        it("Should fail if available collateral is tied to outstanding debt", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, olympus.sohm, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");
            await expect(
                incurDebtV1
                    .connect(sOhmHolder)
                    .withdraw("600000000000", sOhmHolder.address, olympus.sohm)
            ).to.revertedWith(`IncurDebtV1_AmountAboveBorrowerBalance(600000000000)`);
        });

        it("Should withdraw borrowers sOHM available balance ", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, olympus.sohm, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");
            const borrowerInfobeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfobeforeTx.collateralInSOHM), Number(limit));
            assert.equal(
                Number(borrowerInfobeforeTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(limit))
            );
            const availableToBorrow = await incurDebtV1.connect(sOhmHolder).getAvailableToBorrow();
            const sOhmBanlanceBeforeTx = await sohm_token.balanceOf(sOhmHolder.address);

            await expect(
                incurDebtV1
                    .connect(sOhmHolder)
                    .withdraw(availableToBorrow, sOhmHolder.address, olympus.sohm)
            )
                .to.emit(incurDebtV1, "Withdrawal")
                .withArgs(
                    sOhmHolder.address,
                    availableToBorrow,
                    olympus.sohm,
                    sOhmHolder.address,
                    Number(borrowerInfobeforeTx.collateralInSOHM) - 500000000000
                );
            const sOhmBanlanceAfterTx = await sohm_token.balanceOf(sOhmHolder.address);

            assert.equal(
                Number(sOhmBanlanceBeforeTx) + Number(availableToBorrow),
                Number(sOhmBanlanceAfterTx)
            );
            const borrowerInfo = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfo.collateralInSOHM), Number(borrowerInfo.debt));
            assert.equal(
                Number(borrowerInfo.collateralInGOHM).toString().slice(0, 5),
                Number(await gohm_token.balanceTo(borrowerInfo.debt))
                    .toString()
                    .slice(0, 5)
            );
        });

        it("Should withdraw borrowers initial sOHM balance leaving accrued balance after rebase", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, olympus.sohm, sOhmHolder, sohm_token);
            const availableToBorrowBeforeTx = await incurDebtV1
                .connect(sOhmHolder)
                .getAvailableToBorrow();

            await increase(28800); //8 hours;
            await staking.connect(gOhmHolder).rebase();

            await incurDebtV1.connect(sOhmHolder).updateCollateralInSOHM(sOhmHolder.address);
            const borrowerInfobeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            const availableToBorrowAfterTx = await incurDebtV1
                .connect(sOhmHolder)
                .getAvailableToBorrow();
            expect(availableToBorrowAfterTx).to.be.above(availableToBorrowBeforeTx);

            const sOhmBanlanceBeforeTx = await sohm_token.balanceOf(sOhmHolder.address);
            await expect(
                incurDebtV1.connect(sOhmHolder).withdraw(limit, sOhmHolder.address, olympus.sohm)
            )
                .to.emit(incurDebtV1, "Withdrawal")
                .withArgs(
                    sOhmHolder.address,
                    limit,
                    olympus.sohm,
                    sOhmHolder.address,
                    Number(borrowerInfobeforeTx.collateralInSOHM) - limit
                );

            const sOhmBanlanceAfterTx = await sohm_token.balanceOf(sOhmHolder.address);
            assert.equal(Number(sOhmBanlanceBeforeTx) + Number(limit), Number(sOhmBanlanceAfterTx));

            const borrowerInfo = await incurDebtV1.borrowers(sOhmHolder.address);
            assert.equal(
                borrowerInfo.collateralInSOHM,
                Number(availableToBorrowAfterTx) - Number(limit)
            );

            assert.equal(
                Number(borrowerInfo.collateralInGOHM).toString().slice(0, 5),
                Number(await gohm_token.balanceTo(Number(availableToBorrowAfterTx) - Number(limit)))
                    .toString()
                    .slice(0, 5)
            );
        });

        it("Should withdraw borrowers gOHM balance", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            const availableToBorrowBeforeTx = await incurDebtV1
                .connect(gOhmHolder)
                .getAvailableToBorrow();

            await increase(28800); //8 hours;
            await staking.connect(gOhmHolder).rebase();

            await incurDebtV1.connect(gOhmHolder).updateCollateralInSOHM(gOhmHolder.address);
            const borrowerInfobeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            const availableToBorrowAfterTx = await incurDebtV1
                .connect(gOhmHolder)
                .getAvailableToBorrow();
            expect(availableToBorrowAfterTx).to.be.above(availableToBorrowBeforeTx);

            const gOhmBanlanceBeforeTx = await gohm_token.balanceOf(gOhmHolder.address);
            await expect(
                incurDebtV1
                    .connect(gOhmHolder)
                    .withdraw(amountInGOHM, gOhmHolder.address, olympus.gohm)
            )
                .to.emit(incurDebtV1, "Withdrawal")
                .withArgs(
                    gOhmHolder.address,
                    amountInGOHM,
                    olympus.gohm,
                    gOhmHolder.address,
                    Number(borrowerInfobeforeTx.collateralInSOHM) -
                        (await gohm_token.balanceFrom(amountInGOHM))
                );

            const gOhmBanlanceAfterTx = await gohm_token.balanceOf(gOhmHolder.address);
            assert.equal(
                (Number(gOhmBanlanceBeforeTx) + Number(amountInGOHM)).toString().slice(0, 5),
                Number(gOhmBanlanceAfterTx).toString().slice(0, 5)
            );

            const borrowerInfo = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(borrowerInfo.collateralInSOHM, 0);

            assert.equal(Number(borrowerInfo.collateralInGOHM), 0);
        });

        it("Should withdraw borrowers gOHM available balance ", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfobeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(
                Number(borrowerInfobeforeTx.collateralInSOHM),
                Number(await gohm_token.balanceFrom(amountInGOHM))
            );
            assert.equal(Number(borrowerInfobeforeTx.collateralInGOHM), Number(amountInGOHM));

            const gOhmBanlanceBeforeTx = await gohm_token.balanceOf(gOhmHolder.address);
            await expect(
                incurDebtV1
                    .connect(gOhmHolder)
                    .withdraw("4854973534619731000", gOhmHolder.address, olympus.gohm)
            )
                .to.emit(incurDebtV1, "Withdrawal")
                .withArgs(
                    gOhmHolder.address,
                    "4854973534619731000",
                    olympus.gohm,
                    gOhmHolder.address,
                    Number(borrowerInfobeforeTx.collateralInSOHM) -
                        (await gohm_token.balanceFrom("4854973534619731000"))
                );

            const gOhmBanlanceAfterTx = await gohm_token.balanceOf(gOhmHolder.address);

            assert.equal(
                Number(gOhmBanlanceBeforeTx) + 4854973534619731000,
                Number(gOhmBanlanceAfterTx)
            );

            const borrowerInfo = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(
                Number(borrowerInfo.collateralInSOHM),
                await gohm_token.balanceFrom(
                    (Number(amountInGOHM) - 4854973534619731000).toString()
                )
            );

            assert.equal(
                Number(borrowerInfo.collateralInGOHM).toString().slice(0, 5),
                Number(await gohm_token.balanceTo(borrowerInfo.debt))
                    .toString()
                    .slice(0, 5)
            );
        });
    });

    describe("repayDebtWithCollateral()", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(gOhmHolder).repayDebtWithCollateral()).to.revertedWith(
                `IncurDebtV1_NotBorrower("${gOhmHolder.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(incurDebtV1.connect(gOhmHolder).repayDebtWithCollateral()).to.revertedWith(
                `IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`
            );
        });

        it("Should allow borrower pay debt with collateral", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow("500000000000");
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), 1000000000000);
            assert.equal(
                Number(borrowerInfoBeforeTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(1000000000000))
            );

            await expect(incurDebtV1.connect(gOhmHolder).repayDebtWithCollateral())
                .to.emit(incurDebtV1, "DebtPaidWithCollateral")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000
                );
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 500000000000);
            assert.equal(
                Number(borrowerInfoAfterTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(500000000000))
            );
        });
    });

    describe("repayDebtWithCollateralAndWithdrawTheRest(address _tokenToReceiveExcess)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(user).repayDebtWithCollateralAndWithdrawTheRest(user.address)
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${user.address}")`);
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(
                incurDebtV1
                    .connect(gOhmHolder)
                    .repayDebtWithCollateralAndWithdrawTheRest(gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow borrower pay debt with collateral withdraw the rest to gOHM", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow("500000000000");
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), 1000000000000);
            assert.equal(
                Number(borrowerInfoBeforeTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(1000000000000))
            );

            await expect(
                incurDebtV1
                    .connect(gOhmHolder)
                    .repayDebtWithCollateralAndWithdrawTheRest(gOhmHolder.address)
            )
                .to.emit(incurDebtV1, "DebtPaidWithCollateralAndWithdrawTheRest")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 1000000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000000
                );

            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.collateralInGOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });

        it("Should allow borrower pay debt with collateral withdraw the rest to sOHM", async () => {
            await setUp(amountInSOHM, sOhmHolder.address, olympus.sohm, sOhmHolder, sohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(sOhmHolder).borrow("500000000000");
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), 1000000000000);
            assert.equal(
                Number(borrowerInfoBeforeTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(1000000000000))
            );

            await expect(
                incurDebtV1
                    .connect(sOhmHolder)
                    .repayDebtWithCollateralAndWithdrawTheRest(sOhmHolder.address)
            )
                .to.emit(incurDebtV1, "DebtPaidWithCollateralAndWithdrawTheRest")
                .withArgs(
                    sOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 1000000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000001
                );

            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            const borrowerInfoAfterTx = await incurDebtV1.borrowers(sOhmHolder.address);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.collateralInGOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("repayDebtWithOHM(uint256 _ohmAmount)", () => {
        it("Should fail if _borrower is not borrower", async () => {
            await expect(incurDebtV1.connect(user).repayDebtWithOHM(limit)).to.revertedWith(
                `IncurDebtV1_NotBorrower("${user.address}")`
            );
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(
                incurDebtV1
                    .connect(gOhmHolder)
                    .repayDebtWithCollateralAndWithdrawTheRest(gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow borrower pay debt with OHM", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);

            const userOhmBalanceBeforeTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(Number(userOhmBalanceBeforeTx), 500000000000);

            await ohm_token.connect(gOhmHolder).approve(incurDebtV1.address, amount);
            await expect(incurDebtV1.connect(gOhmHolder).repayDebtWithOHM(500000000000))
                .to.emit(incurDebtV1, "DebtPaidWithOHM")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000
                );

            const userOhmBalanceAfterTx = await ohm_token.balanceOf(gOhmHolder.address);
            assert.equal(Number(userOhmBalanceAfterTx), 0);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);
        });
    });

    describe("forceRepay(address _borrower, address _to)", () => {
        it("Should fail if caller is not governor  address", async () => {
            await expect(
                incurDebtV1.connect(user).forceRepay(gOhmHolder.address, gOhmHolder.address)
            ).to.revertedWith("UNAUTHORIZED()");
        });

        it("Should fail if _borrower is not borrower", async () => {
            await expect(
                incurDebtV1.connect(governor).forceRepay(gOhmHolder.address, gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_NotBorrower("${gOhmHolder.address}")`);
        });

        it("Should fail if _borrower has no debt", async () => {
            await incurDebtV1.connect(governor).allowBorrower(gOhmHolder.address);
            await expect(
                incurDebtV1.connect(governor).forceRepay(gOhmHolder.address, gOhmHolder.address)
            ).to.revertedWith(`IncurDebtV1_BorrowerHasNoOutstandingDebt("${gOhmHolder.address}")`);
        });

        it("Should allow gov force payment", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), limit);

            assert.equal(
                Number(borrowerInfoBeforeTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(limit))
            );
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);
            const userSohmBalanceBeforeTx = await sohm_token.balanceOf(gOhmHolder.address);

            assert.equal(Number(userSohmBalanceBeforeTx), 0);
            await expect(
                incurDebtV1.connect(governor).forceRepay(gOhmHolder.address, gOhmHolder.address)
            )
                .to.emit(incurDebtV1, "ForceDebtPayWithCollateralAndWithdrawTheRest")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 1000000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000000
                );

            const userSohmBalanceAfterTx = await sohm_token.balanceOf(gOhmHolder.address);
            assert.equal(Number(userSohmBalanceAfterTx), 500000000000);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.collateralInGOHM), 0);
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
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);
            await treasury.connect(governor).setDebtLimit(incurDebtV1.address, amount);

            await incurDebtV1.connect(gOhmHolder).borrow("500000000000");
            const borrowerInfoBeforeTx = await incurDebtV1.borrowers(gOhmHolder.address);

            assert.equal(Number(borrowerInfoBeforeTx.debt), 500000000000);
            assert.equal(Number(borrowerInfoBeforeTx.collateralInSOHM), 1000000000000);

            assert.equal(
                Number(borrowerInfoBeforeTx.collateralInGOHM),
                Number(await gohm_token.balanceTo(1000000000000))
            );
            const totalDebtBeforeTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtBeforeTx), 500000000000);
            const userSohmBalanceBeforeTx = await sohm_token.balanceOf(gOhmHolder.address);

            assert.equal(Number(userSohmBalanceBeforeTx), 0);
            await expect(incurDebtV1.connect(governor).seize(gOhmHolder.address))
                .to.emit(incurDebtV1, "DebtPaidWithCollateralAndBurnTheRest")
                .withArgs(
                    gOhmHolder.address,
                    "500000000000",
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 1000000000000,
                    Number(borrowerInfoBeforeTx.debt) - 500000000000,
                    Number(totalDebtBeforeTx) - 500000000000,
                    Number(borrowerInfoBeforeTx.collateralInSOHM) - 500000000000
                );

            const userSohmBalanceAfterTx = await sohm_token.balanceOf(gOhmHolder.address);
            assert.equal(Number(userSohmBalanceAfterTx), 0);

            const borrowerInfoAfterTx = await incurDebtV1.borrowers(gOhmHolder.address);
            const totalDebtAfterTx = await incurDebtV1.totalOutstandingGlobalDebt();

            assert.equal(Number(totalDebtAfterTx), 0);
            assert.equal(Number(borrowerInfoAfterTx.debt), 0);

            assert.equal(Number(borrowerInfoAfterTx.collateralInSOHM), 0);
            assert.equal(Number(borrowerInfoAfterTx.collateralInGOHM), 0);
        });
    });

    describe("updateCollateralInSOHM(address _borrower)", () => {
        it("Should increase borrowers sohm balance after rebase", async () => {
            await setUp(amountInGOHM, gOhmHolder.address, olympus.gohm, gOhmHolder, gohm_token);

            const borrowerInfoBeforeRebase = await incurDebtV1.borrowers(gOhmHolder.address);
            assert.equal(
                Number(borrowerInfoBeforeRebase.collateralInSOHM),
                Number(await gohm_token.balanceFrom(amountInGOHM))
            );

            await increase(28800); //8 hours;
            await staking.connect(gOhmHolder).rebase();

            await incurDebtV1.connect(gOhmHolder).updateCollateralInSOHM(gOhmHolder.address);

            const borrowerInfoAfterRebase = await incurDebtV1.borrowers(gOhmHolder.address);
            expect(Number(borrowerInfoAfterRebase.collateralInSOHM)).to.be.above(
                Number(borrowerInfoBeforeRebase.collateralInSOHM)
            );
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

    async function setUp(amountInToken, userAddress, token, signer, contract) {
        await incurDebtV1.connect(governor).setGlobalDebtLimit(amount);
        await incurDebtV1.connect(governor).allowBorrower(userAddress);

        await incurDebtV1.connect(governor).setBorrowerDebtLimit(userAddress, limit);
        await contract.connect(signer).approve(incurDebtV1.address, amountInToken);

        await incurDebtV1.connect(signer).deposit(amountInToken, token);
    }
});
