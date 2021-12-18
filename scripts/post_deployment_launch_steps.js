const { config, ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
    // TODO:
    // 1. add liquidity to spiritswap to create a BRICK-FRAX pool
    // 2. add liquidity to spiritswap to create a BRICK-WFTM pool
    // 3. whitelist BRICK-FRAX pool in Treasury, deploy BRICK-FRAX bond depository, initialize bond terms
    // 4. whitelist BRICK-WFTM pool in Treasury, deploy BRICK-WFTM bond depository, initialize bond terms

    const accounts = await getNamedAccounts();
    const { deployer } = accounts;
    const treasuryAddress = (await get('OlympusTreasury')).address;
    const distributorAddress = (await get('Distributor')).address;
    const fraxBondDepositoryAddress = (await get('FraxBondDepository')).address;

    console.log(`deployer is ${deployer}`);
    console.log(`Treasury address is ${treasuryAddress}`);
    console.log(`Distributor address is ${distributorAddress}`);
    console.log(`FRAX bond depository address is ${fraxBondDepositoryAddress}`);

    // const wftmDepositoryBondAddress = (await get('WftmBondDepository')).address;
    const zeroAddress = config.contractAddresses.zero;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);

    const currentBlockNumber = await ethers.provider.getBlockNumber();

    const fraxBondDepositoryToggleBlockNumber = await treasury.reserveDepositorQueue(fraxBondDepositoryAddress);
    // const wftmBondDepositoryToggleBlockNumber = await treasury.reserveTokenQueue(wftmBondDepositoryAddress);

    console.log(`currentBlockNumber is ${currentBlockNumber}`);
    console.log(`fraxBondDepositoryToggleBlockNumber is ${fraxBondDepositoryToggleBlockNumber}`);

    // TODO: && > wftmBondDepositoryToggleBlockNumber
    if (currentBlockNumber > fraxBondDepositoryToggleBlockNumber) {
      await treasury.toggle('0', fraxBondDepositoryAddress, zeroAddress);
    }

    // await treasury.toggle('0', wftmBondAddress, zeroAddress);

    // approve deployer as the reserve and liquidity token depositor
    const deployerReserveDepositorToggleBlockNumber = await treasury.reserveDepositorQueue(deployer);
    const deployerLiquidityDepositorToggleBlockNumber = await treasury.LiquidityDepositorQueue(deployer);
    if (
      currentBlockNumber > deployerReserveDepositorToggleBlockNumber &&
      currentBlockNumber > deployerLiquidityDepositorToggleBlockNumber
    ) {
      await treasury.toggle('0', deployer, zeroAddress);
      await treasury.toggle('4', deployer, zeroAddress);
    }

    // approve staking distributor as the reward manager
    const distributorRewardManagerToggleBlockNumber = await treasury.rewardManagerQueue(distributorAddress);
    if (currentBlockNumber > distributorRewardManagerToggleBlockNumber) {
      await treasury.toggle('8', distributorAddress, zeroAddress);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
