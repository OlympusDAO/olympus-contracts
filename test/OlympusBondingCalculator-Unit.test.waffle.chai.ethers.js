const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe('OlympusBondingCalculator', () => {

    let
      // Used as default deployer for contracts, asks as owner of contracts.
      deployer,
      // Used as the default user for deposits and trade. Intended to be the default regular user.
      depositor,
      TestToken1Contract,
      tt1,
      TestToken2Contract,
      tt2,
      UniswapV2FactoryContract,
      uniFactory,
      pairAddress,
      MockPairContract,
      mockPair,
      MockDebtCalculatorContract,
      mockDebtCalculator,
      BondingCalcContract,
      bondingCalc

    beforeEach(
      async function() {
        [
          deployer,
          depositor
        ] = await ethers.getSigners();

        TestToken1Contract = await ethers.getContractFactory('TestToken1');
        tt1 = await TestToken1Contract.connect(deployer).deploy();

        TestToken2Contract = await ethers.getContractFactory('TestToken2');
        tt2 = await TestToken2Contract.connect(deployer).deploy();

        UniswapV2FactoryContract = await ethers.getContractFactory('UniswapV2Factory');
        uniFactory = await UniswapV2FactoryContract.connect(deployer).deploy( deployer.address );

        // pairAddress = await uniFactory.createPair( tt1.address, tt2.address );
        await uniFactory.connect(deployer).createPair( tt1.address, tt2.address );
        pairAddress = await uniFactory.getPair( tt1.address, tt2.address );
        MockPairContract = await ethers.getContractFactory('MockUniswapV2Pair');
        mockPair = await MockPairContract.connect(deployer).deploy();

        MockDebtCalculatorContract = await ethers.getContractFactory('MockDebtCalculator');
        mockDebtCalculator = await MockDebtCalculatorContract.connect(deployer).deploy();
        
        BondingCalcContract = await ethers.getContractFactory('OlympusBondingCalculator');
        bondingCalc = await BondingCalcContract.connect(deployer).deploy();

      }
    );
        
    describe(
      'Deployment', 
      () => {
        it(
          "calcDebtfRatioForToken( address tokenToCalcDebt_, address debtCalcToConsult_ )",
          async () => {
            // await expect( () => tt1.connect(deployer).transfer( pairAddress, ethers.utils.parseUnits( String( 10000 ) ) ) )
            //   .to.changeTokenBalance( tt1, deployer, ethers.utils.parseUnits( String( -10000 ) ));
            // await expect( () => tt2.connect(deployer).transfer( pairAddress, ethers.utils.parseUnits( String( 5000 ) ) ) )
            //   .to.changeTokenBalance( tt2, deployer, ethers.utils.parseUnits( String( -5000 ) ));
            // await mockPair.connect(deployer).mint( pairAddress, deployer.address );
            // expect( await mockPair.connect(deployer).balanceOf( pairAddress, deployer.address ) ).to.equal( "7071067811865475243008" );

            await expect( () => tt1.connect(deployer).mint( deployer.address, ethers.utils.parseEther( String( 100 ) ) ) )
              .to.changeTokenBalance( tt1, deployer, ethers.utils.parseUnits( String( 100 ) ) );

            await mockDebtCalculator.setMockOutstandingDebt( deployer.address, tt1.address, ethers.utils.parseEther( String( 10 ) ) );
            
            //const debt = await mockDebtCalculator.getOutstandingDebtForToken( deployer.address, tt1.address );

            //console.log(debt.value.toString());
            await expect(bondingCalc.calcDebtfRatioForToken( deployer.address, tt1.address, mockDebtCalculator.address ))
              .to.emit(bondingCalc, 'Debt')
              .withArgs(String( 10 ));

          }
        );

        it('should get the principle valuation', async () => {
            await bondingCalc.principleValuation(mockPair.address, 100000);
        });
      }
    );
  }
);