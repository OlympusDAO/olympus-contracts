const { ethers } = require("hardhat");
const { expect } = require("chai");
const { solidity, MockProvider, createFixtureLoader } = require('ethereum-waffle');
const { signERC2612Permit } = require('eth-permit');


describe('sOlympus', () => {

    let
      // Used as default deployer for contracts, asks as owner of contracts.
      deployer,
      addr1,
      Treasury,
      treasury,
      Staking,
      staking,
      OLY,
      oly,
      sOLY,
      soly,
      addr2,
      addr3,
      v, 
      r, 
      s,
      nonce,
      nonceAddr1,
      deadline,
      domain,
      domainAddr1,
      types,
      val,
      valAddr1,
      tokenAmount,
      sig,
      sigAddr1,
      CalcEpochContract,
      calcEpochContract

    beforeEach(async () => {
 

        [deployer, addr1, addr2, addr3] = await ethers.getSigners();

        OLY = await ethers.getContractFactory('OlympusERC20TOken');
        oly = await OLY.deploy();

        Staking = await ethers.getContractFactory('OlympusStaking');
        staking = await Staking.deploy();

        Treasury = await ethers.getContractFactory('MockTreasury');
        treasury = await Treasury.deploy();
        
        CalcEpochContract = await ethers.getContractFactory('CalculateEpoch');
        calcEpochContract = await CalcEpochContract.deploy();
        calcEpochContract.setTreasury(treasury.address);

        await treasury.setStakingAndOLY(staking.address, oly.address);

        await oly.mint(treasury.address, 9000000000000000);

        sOLY = await ethers.getContractFactory('sOlympus');
        soly = await sOLY.deploy(staking.address);
        tokenAmount = '1000000000'
    
        await staking.initialize(oly.address, soly.address, treasury.address, calcEpochContract.address);
        await soly.setMonetaryPolicy(staking.address);
        //await soly.setStakingContract(staking.address);

        await oly.mint(addr1.address, 1000000000000000);
        await oly.mint(deployer.address, 1000000000000000);
        await oly.mint(addr2.address, 1000000000);
        await oly.mint(addr3.address, 1000000000000000);
        
        nonce = await oly.nonces(deployer.address)

        deadline = ethers.constants.MaxUint256

        domain = {
            name: await oly.name(),
            version:'1',
            chainId: deployer.provider._network.chainId,
            verifyingContract: oly.address.toString()
        }

        types = {
            Permit: [
            {name: "owner", type: "address"},
            {name: "spender", type: "address"},
            {name: "value", type: "uint256"},
            {name: "nonce", type: "uint256"},
            {name: "deadline", type: "uint256"},
            ]
        }

        val = {
            'owner': deployer.address.toString(),
            'spender': staking.address.toString(),
            'value': 1000000000,
            'nonce': nonce.toString(),
            'deadline': deadline.toString()
        }

        const signer = ethers.provider.getSigner() // owner is 0 and should be the signer
        const signature = await signer._signTypedData(domain, types, val)
        sig = ethers.utils.splitSignature(signature);

    });

    describe('setMonetaryPolicy()', () => {
        it('should NOT let a non-owner address call', async () => {
            await expect(soly.connect(addr1).setMonetaryPolicy(addr1.address)).to.be.revertedWith("caller is not the owner");
        });
 
        it('should let an owner address call', async () => {
            await soly.setMonetaryPolicy(deployer.address);
        });
    });

    describe('rebase()', () => {
        it('should NOT let a non monetaryPolicy address call a rebase', async () => {
            await expect(soly.connect(deployer).rebase(10000)).to.be.revertedWith("");
        });

        it('should monetaryPolicy address call a rebase', async () => {
            await soly.setMonetaryPolicy(deployer.address);
            await soly.rebase(10000000);
        });
    });

    describe('transfer()', () => {
        it('should allow the staking contract to transfer sOLY', async () => {            
            await expect(await soly.balanceOf(deployer.address)).to.equal(0);
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            await expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);


        });

        it('should NOT allow users to transfer sOLY', async () => {
           await expect(await soly.balanceOf(deployer.address)).to.equal(0);
           await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
           await expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);

           await expect(soly.transfer(addr1.address, 500000000)).to.be.revertedWith('transfer not from staking contract');

       });
    });

    describe('transferFrom()', () => {
        it('should allow transferFrom to be to staking ocontract', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            await soly.approve(deployer.address, 500000000);

            soly.transferFrom(deployer.address, staking.address, 500000000);

            await expect(await soly.balanceOf(deployer.address)).to.equal(500000000);
        });

        it('should allow unstake to transfer sOLY back to staking', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);

            const _nonce = await soly.nonces(deployer.address);

            const _domain = {
                name: await soly.name(),
                version:'1',
                chainId: deployer.provider._network.chainId,
                verifyingContract: soly.address.toString()
            }

            const _val = {
                'owner': deployer.address.toString(),
                'spender': staking.address.toString(),
                'value': '500000000',
                'nonce': _nonce.toString(),
                'deadline': deadline.toString()
            }

            const signer = ethers.provider.getSigner() 
            const signature = await signer._signTypedData(_domain, types, _val)
            const _sig = ethers.utils.splitSignature(signature);

            await staking.unstakeOLY('500000000', deadline, _sig.v, _sig.r, _sig.s);

            await expect(await soly.balanceOf(deployer.address)).to.equal(500000000);

        });

        it('should NOT allow transferFrom to be to a user address', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            console.log((await soly.totalSupply()).toString());
            console.log((await soly.circulatingSupply()).toString());
            console.log((await soly.balanceOf(staking.address)).toString());

            await soly.approve(deployer.address, 500000000);

            await expect(soly.transferFrom(deployer.address, addr1.address, 500000000 )).to.be.revertedWith('transfer from not to staking contract');

            await expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);
        });
    });


});