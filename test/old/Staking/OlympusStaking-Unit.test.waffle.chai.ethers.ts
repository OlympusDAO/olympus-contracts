//import { OutliningSpanKind } from "typescript";

//import { isCallSignatureDeclaration } from "typescript";
const { isCallSignatureDeclaration } = require("typescript");
const { OutliningSpanKind } = require("typescript");

const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");

// @ts-ignore
// import { PERMIT_TYPEHASH, getPermitDigest, getDomainSeparator, sign } from './utils/signatures'

// type Contract = any

describe('Olympus Staking', () => {


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
      CalculateEpoch,
      calculateEpoch

    beforeEach(async () => {

        [deployer, addr1, addr2, addr3] = await ethers.getSigners();

        OLY = await ethers.getContractFactory('OlympusERC20TOken');
        oly = await OLY.deploy();

        Staking = await ethers.getContractFactory('OlympusStaking');
        staking = await Staking.deploy();

        Treasury = await ethers.getContractFactory('MockTreasury');
        treasury = await Treasury.deploy();

        CalculateEpoch = await ethers.getContractFactory('CalculateEpoch');
        calculateEpoch = await CalculateEpoch.deploy();

        await treasury.setStakingAndOLY(staking.address, oly.address);

        await oly.mint(treasury.address, 9000000000000000);

        sOLY = await ethers.getContractFactory('sOlympus');
        soly = await sOLY.deploy(staking.address);

        await staking.initialize( oly.address, soly.address, treasury.address, calculateEpoch.address);
        await staking.transferOwnership(treasury.address)
        await soly.setMonetaryPolicy(staking.address);
        await calculateEpoch.setTreasury(treasury.address)
        tokenAmount = '1000000000'
        await oly.mint(deployer.address, '10000000000000');
        await oly.mint(addr1.address, '10000000000000000');
        // await oly.mint(addr3.address, 1000000000000000);

        await oly.transferOwnership(treasury.address);

        nonce = await oly.nonces(deployer.address)
        nonceAddr1 = await oly.nonces(addr1.address);

        deadline = ethers.constants.MaxUint256

        domain = {
            name: await oly.name(),
            version:'1',
            chainId: deployer.provider._network.chainId,
            verifyingContract: oly.address.toString()
        }

        domainAddr1 = {
            name: await oly.name(),
            version:'1',
            chainId: addr1.provider._network.chainId,
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

        valAddr1 = {
            'owner': addr1.address.toString(),
            'spender': staking.address.toString(),
            'value': 3000000000,
            'nonce': nonceAddr1.toString(),
            'deadline': deadline.toString()
        }

        const signer = ethers.provider.getSigner() // owner is 0 and should be the signer
        const signature = await signer._signTypedData(domain, types, val)
        sig = ethers.utils.splitSignature(signature);

        const signerAddr1 = ethers.provider.getSigner(1);
        const signatureAddr1 = await signerAddr1._signTypedData(domainAddr1, types, valAddr1)
        sigAddr1 = ethers.utils.splitSignature(signatureAddr1);
        

    });
        
    describe('stakeOLY()', () => {
        it('should transfer sOLY from staking contract to staker when stake is made', async () => {
            expect(await soly.balanceOf(deployer.address)).to.equal(0);
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);
        });

        it('should not let a user stake if they are not the proper signer', async () => {
            const _nonce = await oly.nonces(deployer.address);

            const _domain = {
                name: await oly.name(),
                version:'1',
                chainId: deployer.provider._network.chainId,
                verifyingContract: oly.address.toString()
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

            await expect(staking.connect(addr1).stakeOLY('500000000', deadline,  _sig.v, _sig.r, _sig.s)).to.be.revertedWith("revert ZeroSwapPermit: Invalid signature")

            await staking.stakeOLY('500000000', deadline,  _sig.v, _sig.r, _sig.s);

        });

        it('should not let a user stake more than they have', async () => {
            val = {
                'owner': deployer.address.toString(),
                'spender': staking.address.toString(),
                'value': '10000000000000001',
                'nonce': nonce.toString(),
                'deadline': deadline.toString()
            }

            const signer = ethers.provider.getSigner() // owner is 0 and should be the signer
            const signature = await signer._signTypedData(domain, types, val)
            sig = ethers.utils.splitSignature(signature);

            await expect(staking.stakeOLY('10000000000000001', deadline,  sig.v, sig.r, sig.s)).to.be.revertedWith("transfer amount exceeds balance");
            expect(await soly.balanceOf(deployer.address)).to.equal(0);
            expect(await oly.balanceOf(deployer.address)).to.equal('10000000000000');

            
        });

        it('should not distribute profits after the first epoch', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            expect(await soly.balanceOf(deployer.address)).to.equal(tokenAmount);

            console.log("Staking address is : " + staking.address);

            await treasury.sendOLYProfits(2000000000);
            expect(await soly.balanceOf(deployer.address)).to.equal(tokenAmount);
        });

        it('should distirbute profits correctly if someone stakes after epoch', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);

            await treasury.sendOLYProfits(2000000000);
            await staking.connect(addr1).stakeOLY(3000000000, deadline,  sigAddr1.v, sigAddr1.r, sigAddr1.s);
            expect(await soly.balanceOf(deployer.address)).to.equal(tokenAmount);
            expect(await soly.balanceOf(addr1.address)).to.equal(3000000000);

            await treasury.sendOLYProfits(1000000000);

            expect(await soly.balanceOf(deployer.address)).to.equal(1500000000);
            expect(await soly.balanceOf(addr1.address)).to.equal(4500000000);
        });

        it('should transfer OLY from staker to staking contract when stake is made', async () => {
            const balanceBefore = await oly.balanceOf(deployer.address);

            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);

            const balanceAfter = await oly.balanceOf(deployer.address);

            expect(balanceAfter).to.equal(balanceBefore - tokenAmount);
        });

        it('should add sOLY to circulating supply when stake is made', async () => {            
            expect(await soly.circulatingSupply()).to.equal(0);

            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            expect(await soly.circulatingSupply()).to.equal(tokenAmount);
        });

        it('should rebase a single user correctly when profits are distributed', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);

            await treasury.sendOLYProfits(2000000000);
            await treasury.sendOLYProfits(1000000000);
            expect(await soly.balanceOf(deployer.address)).to.equal(+2000000000 + +tokenAmount);
        });

        it('should add circulating supply correctly when a rebase is made to distribute profits', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);

            await treasury.sendOLYProfits(2000000000);
            await treasury.sendOLYProfits(1000000000);
            expect(await soly.circulatingSupply()).to.equal(+2000000000 + +tokenAmount);
        });

        it('should rebase multiple users correctly when profits are distributed', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            await staking.connect(addr1).stakeOLY(3000000000, deadline,  sigAddr1.v, sigAddr1.r, sigAddr1.s);

            await treasury.sendOLYProfits(3000000000);
            await treasury.sendOLYProfits(1000000000);  
            expect(await soly.balanceOf(deployer.address)).to.equal(1750000000);
            expect(await soly.balanceOf(addr1.address)).to.equal(5250000000);
        });

        it('should add circualting supply correctly when multiple users are distributed profits', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            await staking.connect(addr1).stakeOLY(3000000000, deadline,  sigAddr1.v, sigAddr1.r, sigAddr1.s);

            await treasury.sendOLYProfits(3000000000);
            await treasury.sendOLYProfits(1000000000);
            expect(await soly.circulatingSupply()).to.equal(7000000000);
        });

        it('should pass if there is profit and no staker', async () => {
            const totalSupplyBefore = await soly.totalSupply();
            await treasury.sendOLYProfits(3000000000);

            const totalSupplyAfter1 = await soly.totalSupply();  
            expect(totalSupplyBefore).to.equal(totalSupplyAfter1);

            await treasury.sendOLYProfits(3000000000);

            const totalSupplyAfter2 = await soly.totalSupply();  
            expect(totalSupplyAfter2).to.equal(totalSupplyBefore.toNumber() + 3000000000);
        });

        it('should NOT add to circulating supply if there is profit and no stakers', async () => {
            const circulatingSupplyBefore = await soly.circulatingSupply();
            expect(circulatingSupplyBefore).to.equal(0);

            await treasury.sendOLYProfits(3000000000);
            const circulatingSupplyAfter1 = await soly.circulatingSupply(); 
            expect(circulatingSupplyAfter1).to.equal(0);

            await treasury.sendOLYProfits(3000000000);
            const circulatingSupplyAfter2 = await soly.circulatingSupply(); 
            expect(circulatingSupplyAfter2).to.equal(0);
        });

        it('should work properly if profit is over 10000000000000000', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            await treasury.sendOLYProfits("19000000000000000");
            await treasury.sendOLYProfits("19000000000000000");

            expect(await soly.balanceOf(deployer.address)).to.equal("19000001000000000");
        });
    
    });

    describe('unstakeOLY()', () => {
        it('should transfer sOLY from unstaker to staking contract when user unstakes', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            expect(await soly.balanceOf(deployer.address)).to.equal(1000000000);

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
            expect(await soly.balanceOf(deployer.address)).to.equal('500000000');

            const _nonce2 = await soly.nonces(deployer.address);

            const _domain2 = {
                name: await soly.name(),
                version:'1',
                chainId: deployer.provider._network.chainId,
                verifyingContract: soly.address.toString()
            }

            const _val2 = {
                'owner': deployer.address.toString(),
                'spender': staking.address.toString(),
                'value': '500000000',
                'nonce': _nonce2.toString(),
                'deadline': deadline.toString()
            }

            const signer2 = ethers.provider.getSigner() 
            const signature2 = await signer2._signTypedData(_domain2, types, _val2)
            
            const _sig2 = ethers.utils.splitSignature(signature2);

            await staking.unstakeOLY(500000000, deadline, _sig2.v, _sig2.r, _sig2.s);
            expect(await soly.balanceOf(deployer.address)).to.equal(0);
        });

        it('should transfer OLY back to user when they unstake', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            const balanceAfter = await oly.balanceOf(deployer.address);

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
            expect(await oly.balanceOf(deployer.address)).to.equal(+balanceAfter.toNumber() + +500000000);

            const _nonce2 = await soly.nonces(deployer.address);

            const _domain2 = {
                name: await soly.name(),
                version:'1',
                chainId: deployer.provider._network.chainId,
                verifyingContract: soly.address.toString()
            }

            const _val2 = {
                'owner': deployer.address.toString(),
                'spender': staking.address.toString(),
                'value': '500000000',
                'nonce': _nonce2.toString(),
                'deadline': deadline.toString()
            }

            const signer2 = ethers.provider.getSigner() 
            const signature2 = await signer2._signTypedData(_domain2, types, _val2)
            
            const _sig2 = ethers.utils.splitSignature(signature2);

            await staking.unstakeOLY(500000000, deadline, _sig2.v, _sig2.r, _sig2.s);
            expect(await oly.balanceOf(deployer.address)).to.equal(balanceAfter.toNumber() + 1000000000);
        });

        it('should remove sOLY from circulating supply when unstake is made', async () => {            
            expect(await soly.circulatingSupply()).to.equal(0);

            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            expect(await soly.circulatingSupply()).to.equal(1000000000);

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
            expect(await soly.circulatingSupply()).to.equal(500000000);

            const _nonce2 = await soly.nonces(deployer.address);

            const _domain2 = {
                name: await soly.name(),
                version:'1',
                chainId: deployer.provider._network.chainId,
                verifyingContract: soly.address.toString()
            }

            const _val2 = {
                'owner': deployer.address.toString(),
                'spender': staking.address.toString(),
                'value': '500000000',
                'nonce': _nonce2.toString(),
                'deadline': deadline.toString()
            }

            const signer2 = ethers.provider.getSigner() 
            const signature2 = await signer2._signTypedData(_domain2, types, _val2)
            
            const _sig2 = ethers.utils.splitSignature(signature2);

            await staking.unstakeOLY(500000000, deadline, _sig2.v, _sig2.r, _sig2.s);
            expect(await soly.circulatingSupply()).to.equal(0);
        });

        it('shoud NOT let a user unstake more than they have', async () => {
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
                'value': '1000000001',
                'nonce': _nonce.toString(),
                'deadline': deadline.toString()
            }

            const signer = ethers.provider.getSigner() 
            const signature = await signer._signTypedData(_domain, types, _val)
            const _sig = ethers.utils.splitSignature(signature);
            
            await expect(staking.unstakeOLY(1000000001, deadline, _sig.v, _sig.r, _sig.s)).to.be.revertedWith("revert SafeMath: subtraction overflow");
        });

        it('should not let a user unstake if they are not the approved signer', async () => {
            await staking.stakeOLY(tokenAmount, deadline,  sig.v, sig.r, sig.s);
            await staking.connect(addr1).stakeOLY(3000000000, deadline,  sigAddr1.v, sigAddr1.r, sigAddr1.s);

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
                'value': tokenAmount,
                'nonce': _nonce.toString(),
                'deadline': deadline.toString()
            }

            const signer = ethers.provider.getSigner() 
            const signature = await signer._signTypedData(_domain, types, _val)
            const _sig = ethers.utils.splitSignature(signature);

            await expect(staking.connect(addr1).stakeOLY(tokenAmount, deadline,  _sig.v, _sig.r, _sig.s)).to.be.revertedWith("revert ZeroSwapPermit: Invalid signature");

            await staking.unstakeOLY(tokenAmount, deadline, _sig.v, _sig.r, _sig.s);

        });

    });

    describe('distributeOLYProfits()', () => {
        it('should NOT let non owner distribute', async () => {
            await expect(staking.distributeOLYProfits()).to.be.revertedWith("caller is not the owner");
        });

    });

});