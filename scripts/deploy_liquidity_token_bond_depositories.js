async function main() {
    // TODO:
    // 1. add liquidity to spiritswap to create a BRICK-FRAX pool
    // 2. add liquidity to spiritswap to create a BRICK-WFTM pool
    // 3. whitelist BRICK-FRAX pool in Treasury, deploy BRICK-FRAX bond depository, initialize bond terms
    // 4. whitelist BRICK-WFTM pool in Treasury, deploy BRICK-WFTM bond depository, initialize bond terms
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
