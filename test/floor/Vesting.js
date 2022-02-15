const { ethers, network } = require("hardhat");
const { expect } = require("chai");
const { smock } = require("@defi-wonderland/smock");


describe("Vesting", async () => {

    let deployer, alice, bob, carol;
    let erc20Factory, gFloorFactory;
    let vestingClaim;

    let _floor, _weth, _gFLOOR;
    let _treasury, _staking;


    /**
     * Everything in this block is only run once before all tests.
     * This is the home for setup methods
     */
    beforeEach(async () => {
        [deployer, alice, bob, carol] = await ethers.getSigners();

        erc20Factory = await smock.mock("MockERC20");
        gFloorFactory = await smock.mock("MockGFloor");

        const authorityContract = await ethers.getContractFactory("FloorAuthority");
        const _authority = await authorityContract.deploy(deployer.address, deployer.address, deployer.address, deployer.address);

        _floor = await erc20Factory.deploy("Floor", "FLOOR", 9);
        _weth = await erc20Factory.deploy("Weth", "WETH", 18);
        _gFLOOR = await gFloorFactory.deploy("1000000000"); // Set index as 1

        // Set up 
        treasuryContract = await ethers.getContractFactory("FloorTreasury")
        _treasury = await treasuryContract.deploy(_floor.address, 0, _authority.address);
        _staking = await smock.fake("FloorStaking");

        const vestingClaimFactory = await ethers.getContractFactory("VestingClaim");
        vestingClaim = await vestingClaimFactory.deploy(
            _floor.address,
            _weth.address,
            _gFLOOR.address,
            _treasury.address,
            _staking.address,
            _authority.address
        );

        // Enable WETH as reserve token
        await _treasury.enable(2, _weth.address, ethers.constants.AddressZero)

        // Enable vesting contract as a reward manager
        await _treasury.enable(0, vestingClaim.address, ethers.constants.AddressZero)
        await _treasury.enable(9, vestingClaim.address, ethers.constants.AddressZero)

        await vestingClaim.approve();
        await vestingClaim.setTerms(
            alice.address,
            10000,  // 1% percent
            0,  // 0 gClaimed
            100000000000  // Max claim 100 FLOOR
        );
        await vestingClaim.setTerms(
            bob.address,
            10000,  // 1% percent
            0,  // 0 gClaimed
            1000000000000  // Max claim 1000 FLOOR
        );
        await vestingClaim.setTerms(
            carol.address,
            10000,  // 1% percent
            0,  // 0 gClaimed
            1000000000000  // Max claim 1000 FLOOR
        );
    });

    it("should be able to vest and claim", async () => {
        await _weth.mint(deployer.address, "10000000000000000000");
        await _weth.approve(vestingClaim.address, _weth.balanceOf(deployer.address));
        await _weth.approve(_treasury.address, _weth.balanceOf(deployer.address));
        await _treasury.enable(0, deployer.address, ethers.constants.AddressZero)
        await _treasury.enable(9, deployer.address, ethers.constants.AddressZero)

        // Give bob 10 WETH
        await _weth.mint(bob.address, "10000000000000000000");
        await _weth.connect(bob).approve(vestingClaim.address, _weth.balanceOf(bob.address));

        // Put 100 WETH into the treasury to cover 10,0000 FLOOR
        await _weth.mint(_treasury.address, "1000000000000000000");

        // Audit the reserves to generate corresponding FLOOR
        await _treasury.auditReserves();

        // Put 10,000 FLOOR in the treasury
        await _floor.mint(_treasury.address, "10000000000000");

        // At this point our treasury will have a totalReserves() value of 10000_000000000.
        expect(await _weth.balanceOf(_treasury.address)).to.equal("1000000000000000000");
        expect(await _floor.balanceOf(_treasury.address)).to.equal("10000000000000");

        // We initiate a claim from Bob at this point at the value of 100 FLOOR. Bob can only claim
        // 1% of the total FLOOR which is 100 out of 10000. This is set in his terms
        expect(await vestingClaim.redeemableFor(bob.address)).to.equal("100000000000")
        await vestingClaim.connect(bob).claim(bob.address, "100000000000");
        expect(await vestingClaim.claimed(bob.address)).to.equal("100000000000")

        expect(await _weth.balanceOf(bob.address)).to.equal("9900000000000000000");
        expect(await _floor.balanceOf(bob.address)).to.equal("100000000000");

        expect(await _weth.balanceOf(_treasury.address)).to.equal("1100000000000000000");
        expect(await _floor.balanceOf(_treasury.address)).to.equal("10000000000000");
    });

    it("should not allow a claim greater than max", async () => {
        await _weth.mint(deployer.address, "10000000000000000000");
        await _weth.approve(vestingClaim.address, _weth.balanceOf(deployer.address));
        await _weth.approve(_treasury.address, _weth.balanceOf(deployer.address));
        await _treasury.enable(0, deployer.address, ethers.constants.AddressZero)

        // Give alice 10 WETH
        await _weth.mint(alice.address, "10000000000000000000");

        await _weth.connect(alice).approve(vestingClaim.address, _weth.balanceOf(alice.address));

        // Put 100 WETH into the treasury to cover 100,000 FLOOR
        await _weth.mint(_treasury.address, "100000000000000000000");

        // Audit the reserves to generate corresponding FLOOR
        await _treasury.auditReserves();

        // Put 20,000 FLOOR in the treasury
        await _floor.mint(_treasury.address, "20000000000000");

        // At this point our treasury will have a totalReserves() value of 100 WETH and 20,000 FLOOR.
        expect(await _weth.balanceOf(_treasury.address)).to.equal("100000000000000000000");
        expect(await _floor.balanceOf(_treasury.address)).to.equal("20000000000000");

        // Alice can only claim 1% of the total FLOOR which is 200 out of 20,000 but maxed at
        // 100. This is set in her terms.
        expect(await vestingClaim.redeemableFor(alice.address)).to.equal("100000000000");

        let vesting_terms = await vestingClaim.terms(alice.address);
        expect((vesting_terms.gClaimed).toString(), "0")

        // Claim 70 FLOOR
        await vestingClaim.connect(alice).claim(alice.address, "70000000000");

        expect(await vestingClaim.redeemableFor(alice.address)).to.equal("30000000000");

        vesting_terms = await vestingClaim.terms(alice.address);
        expect((vesting_terms.gClaimed).toString(), "70000000000000000000")

        // Try and claim 30.000000001 FLOOR
        await expect(vestingClaim.connect(alice).claim(alice.address, "30000000001")).to.be.revertedWith("Claim more than vested");

        // Claim 30 FLOOR
        await vestingClaim.connect(alice).claim(alice.address, "30000000000");

        // Nothing more should be vesting
        expect(await vestingClaim.redeemableFor(alice.address)).to.equal("0");

        a = await vestingClaim.terms(alice.address);
        expect((vesting_terms.gClaimed).toString(), "100000000000000000000")

        // Try and claim 1 FLOOR
        await expect(vestingClaim.connect(alice).claim(alice.address, "1000000000")).to.be.revertedWith("Claim more than vested");
    });

    it("should not allow a claim greater than percentage", async () => {
        await _weth.mint(deployer.address, "10000000000000000000");
        await _weth.approve(vestingClaim.address, _weth.balanceOf(deployer.address));
        await _weth.approve(_treasury.address, _weth.balanceOf(deployer.address));
        await _treasury.enable(0, deployer.address, ethers.constants.AddressZero)

        // Give carol 10 WETH
        await _weth.mint(carol.address, "10000000000000000000");

        await _weth.connect(carol).approve(vestingClaim.address, _weth.balanceOf(carol.address));

        // Put 100 WETH into the treasury to cover 100,000 FLOOR
        await _weth.mint(_treasury.address, "100000000000000000000");

        // Audit the reserves to generate corresponding FLOOR
        await _treasury.auditReserves();

        // Put 20,000 FLOOR in the treasury
        await _floor.mint(_treasury.address, "20000000000000");

        // At this point our treasury will have a totalReserves() value of 100 WETH and 20,000 FLOOR.
        expect(await _weth.balanceOf(_treasury.address)).to.equal("100000000000000000000");
        expect(await _floor.balanceOf(_treasury.address)).to.equal("20000000000000");

        // Carol can only claim 1% of the total FLOOR which is 200 out of 20,000.
        expect(await vestingClaim.redeemableFor(carol.address)).to.equal("200000000000");

        let vesting_terms = await vestingClaim.terms(carol.address);
        expect((vesting_terms.gClaimed).toString(), "0")

        // Claim 200 FLOOR
        await vestingClaim.connect(carol).claim(carol.address, "200000000000");

        // The claim has added more FLOOR to the treasury so it won't be 0, but instead still 1%
        // including the additional WETH from the claim.
        expect(await vestingClaim.redeemableFor(carol.address)).to.equal("2000000000");

        vesting_terms = await vestingClaim.terms(carol.address);
        expect((vesting_terms.gClaimed).toString(), "200000000000000000000")

        // Increase Carol max supply by increase the number of floor in circulation by 10,000. This
        // will give her another potential to claim 100 FLOOR.
        await _floor.mint(_treasury.address, "10000000000000");

        expect(await vestingClaim.redeemableFor(carol.address)).to.equal("102000000000");
    });

});