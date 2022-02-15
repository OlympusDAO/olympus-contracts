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
    before(async () => {
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
            bob.address,
            10000,  // 1% percent
            0,  // 0 gClaimed
            1000000000000  // Max claim 1000 FLOOR
        );
    });

    it("should vest", async () => {
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

});