const dai_abi = require("../../abis/dai");
const { expect } = require('../utils/test_env.js');
const frax_abi = require("../../abis/frax");
const weth_abi = require("../../abis/weth");
const lusd_abi = require("../../abis/lusd");
const { advanceBlock } = require("../utils/advancement");
const { fork_network } = require('../utils/network_fork');
const impersonateAccount = require('../utils/impersonate_account');
const old_treasury_abi = require('../../abis/old_treasury_abi');

const DAI = process.env.DAI;
const FRAX = process.env.FRAX
const WETH = process.env.WETH;
const LUSD = process.env.LUSD;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const OLD_TREASURY_ADDRESS = process.env.OLD_TREASURY_ADDRESS;

let user0, user1, user2, manager, old_treasury, dai, weth, frax, lusd;
const tokenAddresses = [DAI, FRAX, WETH, LUSD]
const reserveToken = [true, true, true, true]
let TreasuryTokenMigrator, treasuryTokenMigrator, Olympus, olympus, NewTreasury, newTreasury;

describe('Treasury Token Migration', async () => {

    before(async () => {
        await fork_network();

        [user0, user1, user2] = await ethers.getSigners();

        Olympus = await ethers.getContractFactory('OlympusERC20Token')
        olympus = await Olympus.deploy();

        NewTreasury = await ethers.getContractFactory('OlympusTreasury')
        newTreasury = await NewTreasury.deploy(olympus.address, 10);

        TreasuryTokenMigrator = await ethers.getContractFactory('OlympusTokenMigrator')
        treasuryTokenMigrator = await TreasuryTokenMigrator.deploy(user0.address, DAI, OLD_TREASURY_ADDRESS, newTreasury.address);

        await user0.sendTransaction({
            to: TREASURY_MANAGER,
            value: ethers.utils.parseEther("1") // 1 ether
        })

        await impersonateAccount(TREASURY_MANAGER);

        manager = await ethers.getSigner(TREASURY_MANAGER);

        old_treasury = await new ethers.Contract(OLD_TREASURY_ADDRESS, old_treasury_abi, ethers.provider);

        const tokens = await fastTrack(1, tokenAddresses);

        dai = tokens[0]; frax = tokens[1]; weth = tokens[2]; lusd = tokens[3];

        await old_treasury.connect(manager).queue(3, treasuryTokenMigrator.address);

        await fastTrack(13000);

        await old_treasury.connect(manager).toggle(3, treasuryTokenMigrator.address, treasuryTokenMigrator.address);

        await newTreasury.connect(user0).enableOnChainGovernance();

        await fastTrack(1000);

        await newTreasury.connect(user0).enableOnChainGovernance();

        await fastTrack(4,tokenAddresses);

        await newTreasury.connect(user0).enable(0, treasuryTokenMigrator.address, treasuryTokenMigrator.address)
    
        
    });

    it("Should fail if sender is not DAO", async () => {
        await expect(treasuryTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken))
                .to.revertedWith('Only DAO can call this function');
        
        await expect(treasuryTokenMigrator.connect(user1).migrate())
                .to.revertedWith('Only DAO can call this function');
    })

    it('should fail if token is not equal to reserve token', async () => {
        await expect(treasuryTokenMigrator.connect(user0).addTokens(tokenAddresses, [true, true, true]))
                .to.revertedWith('arrays length does not match');
    })

    it("Should allow DAO add tokens", async () => {
        await treasuryTokenMigrator.connect(user0).addTokens(tokenAddresses, reserveToken);
    })

    it("Should fail if new treasury is not vault", async () => {
        await expect(treasuryTokenMigrator.connect(user0).migrate())
                .to.revertedWith('VaultOwned: caller is not the Vault');
    })

    it("Should allow DAO migrate tokens", async () => {
        await olympus.connect(user0).setVault(newTreasury.address);
        await fastTrack(2);

        await treasuryTokenMigrator.connect(user0).migrate();
        console.log('Migration done!');
        await fastTrack(3);
    })
})

async function fastTrack(loop, address = []) {
    if(loop === 4){
        for(let i = 0; i < loop; i++){
            await newTreasury.connect(user0).enable(2, address[i], address[i])
        }
    }
    else if(loop === 1){
        const count = loop + 3; 
        const tokens = [];
        const token_abi = [dai_abi, frax_abi, weth_abi, lusd_abi];

        for(let i = 0; i < count; i++){
            const token_address = await new ethers.Contract(address[i], token_abi[i], ethers.provider);
            tokens[i] = token_address;
        }

        return tokens;
    }
    else if(loop === 2){
        const count = loop + 2; 

        const contract = [dai, frax, weth, lusd];
        const contract_name = ['dai', 'frax', 'weth', 'lusd'];

        for(let i = 0; i < count; i++){
            const bal_before_tx = await contract[i].connect(user0).balanceOf(OLD_TREASURY_ADDRESS);
            console.log(`old_treasury_${contract_name[i]}_bal_before_tx`, bal_before_tx.toString());

            const bal_after_tx = await contract[i].connect(user0).balanceOf(newTreasury.address);
            console.log(`new_treasury_${contract_name[i]}_bal_before_tx`, bal_after_tx.toString());
        }
    }
    else if(loop === 3){
        const count = loop + 1; 

        const contract = [dai, frax, weth, lusd];
        const contract_name = ['dai', 'frax', 'weth', 'lusd'];

        for(let i = 0; i < count; i++){
            const bal_before_tx = await contract[i].connect(user0).balanceOf(OLD_TREASURY_ADDRESS);
            console.log(`old_treasury_${contract_name[i]}_bal_after_tx`, bal_before_tx.toString());

            const bal_after_tx = await contract[i].connect(user0).balanceOf(newTreasury.address);
            console.log(`new_treasury_${contract_name[i]}bal_after_tx`, bal_after_tx.toString());
        }
    }
    else{
        for(let i = 0; i < loop; i++){
            await advanceBlock();
        }
    } 
}