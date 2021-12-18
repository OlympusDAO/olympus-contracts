const { config, ethers, getNamedAccounts, deployments: { get } } = require("hardhat");

async function main() {
  // TODO: fill it
  const fraxAddress = '';
  const frax = (await ethers.getContractFactory('ERC20')).attach(fraxAddress);
  const treasuryAddress = (await get('OlympusTreasury')).address;

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryAddress);

  // TODO: decide how much to mint and how much is profit
  const transferAmount = ethers.utils.parseEther('');
  const profit = 0;
  await frax.approve(treasury.address, transferAmount);
  await treasury.deposit(transferAmount, fraxAddress, profit);

  // Next step is to distribute BRICK tokens to CRE8R token holders.
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
