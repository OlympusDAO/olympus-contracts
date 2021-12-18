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
    const distributorAddress = (await get('OlympusDistributor')).address;
    const fraxBondAddress = (await get('FraxBondDepository')).address;

    console.log(`Treasury address is ${treasuryAddress}`);
    console.log(`Distributor address is ${distributorAddress}`);
    console.log(`FRAX bond address is ${fraxBondAddress}`);

    // const wftmBondAddress = (await get('WftmBondDepository')).address;
    const zeroAddress = config.contractAddresses.zero;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);

    // TODO: use reserveTokenQueue to check for block number.
    // const fraxBondToggleBlockNumber = await treasury.reserveTokenQueue(fraxBondAddress);
    // const wftmBondToggleBlockNumber = await treasury.reserveTokenQueue(wftmBondAddress);
    await treasury.toggle('0', fraxBondAddress, zeroAddress);
    // await treasury.toggle('0', wftmBondAddress, zeroAddress);

    // approve deployer as the reserve and liquidity token depositor
    await treasury.toggle('0', deployer.address, zeroAddress);
    await treasury.toggle('4', deployer.address, zeroAddress);

    // approve staking distributor as the reward manager
    await treasury.toggle('8', distributorAddress, zeroAddress);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
