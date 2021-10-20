async function main() {
	const ohmAddress = "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932";
	const sohmAddress = "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084";
	

	const tycheFactory = await ethers.getContractFactory('TycheYieldDirector');
	const tyche = await tycheFactory.deploy(ohmAddress, sohmAddress);

	await tyche.deployed();

	console.log("Tyche deployed to:", tyche.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });