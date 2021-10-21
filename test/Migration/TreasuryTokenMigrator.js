const { expect } = require('../Utils/test_env.js');
const { advanceBlock } = require("../Utils/advancement");
const { fork_network } = require('../Utils/network_fork');
const impersonateAccount = require('../Utils/impersonate_account');
const old_treasury_abi = require('../../ContractAbis/old_treasury_abi');

const DAI = process.env.DAI;
const FRAX = process.env.FRAX
const WETH = process.env.WETH;
const LUSD = process.env.LUSD;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const OLD_TREASURY_ADDRESS = process.env.OLD_TREASURY_ADDRESS;

let user0, user1, user2, manager, old_treasury;
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

        TreasuryTokenMigrator = await ethers.getContractFactory('TreasuryTokenMigrator')
        treasuryTokenMigrator = await TreasuryTokenMigrator.deploy(user0.address, DAI, OLD_TREASURY_ADDRESS, newTreasury.address);

        await user0.sendTransaction({
            to: TREASURY_MANAGER,
            value: ethers.utils.parseEther("1") // 1 ether
        })

        await impersonateAccount(TREASURY_MANAGER);

        manager = await ethers.getSigner(TREASURY_MANAGER);

        old_treasury = await new ethers.Contract(OLD_TREASURY_ADDRESS, old_treasury_abi, ethers.provider);

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
        await treasuryTokenMigrator.connect(user0).migrate();
    })
})

async function fastTrack(loop, address = []) {
    if(loop === 4){
        for(let i = 0; i < loop; i++){
            await newTreasury.connect(user0).enable(2, address[i], address[i])
        }
    }else{
        for(let i = 0; i < loop; i++){
            await advanceBlock();
        }
    } 
}