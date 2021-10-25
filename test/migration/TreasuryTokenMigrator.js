const { expect } = require('../utils/test_env.js');
const { advanceBlock } = require("../utils/advancement");
const { fork_network } = require('../utils/network_fork');
const old_treasury_abi = require('../../abis/old_treasury_abi');
const impersonateAccount = require('../utils/impersonate_account');
const { treasury_tokens, olympus_tokens, olympus_lp_tokens, swaps } = require("./tokens");

const EPOCH_LEGNTH = 2200;
const DAI_ADDRESS = process.env.DAI;
const OHM_USER = process.env.OLD_OHM_HOLDER;
const SOHM_USER = process.env.OLD_SOHM_HOLDER;
const SUSHI_ROUTER = process.env.SUSHI_ROUTER;
const WSOHM_USER = process.env.OLD_WSOHM_HOLDER;
const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER;
const OLD_OHM_ADDRESS = process.env.OLD_OHM_ADDRESS;
const OLD_SOHM_ADDRESS = process.env.OLD_SOHM_ADDRESS;
const TREASURY_MANAGER = process.env.TREASURY_MANAGER;
const NON_TOKEN_HOLDER = process.env.NON_TOKEN_HOLDER;
const OLD_WSOHM_ADDRESS = process.env.OLD_WSOHM_ADDRESS;
const OLD_STAKING_ADDRESS = process.env.OLD_STAKING_ADDRESS;
const OLD_TREASURY_ADDRESS = process.env.OLD_TREASURY_ADDRESS;

let deployer, user1, manager, old_treasury;
let olympusTokenMigrator, ohm, sOhm, gOhm, newTreasury, newStaking;
const tokenAddresses = treasury_tokens.map((token) => token.address);
const reserveToken = treasury_tokens.map((token) => token.isReserve);

const lp_token_0 = olympus_lp_tokens.map((lp_token) => lp_token.token0);
const lp_token_1 = olympus_lp_tokens.map((lp_token) => lp_token.token1);
const is_sushi_lp = olympus_lp_tokens.map((lp_token) => lp_token.is_sushi);
const lp_token_addresses = olympus_lp_tokens.map((lp_token) => lp_token.address);

describe('Treasury Token Migration', async () => {

    before(async () => {
        await fork_network(13487643);
        [deployer, user1] = await ethers.getSigners();

        let ohmContract = await ethers.getContractFactory("OlympusERC20Token");
        ohm = await ohmContract.deploy();

        let sOhmContract = await ethers.getContractFactory("sOlympus");
        sOhm = await sOhmContract.connect(deployer).deploy();

        let newTreasuryContract = await ethers.getContractFactory("OlympusTreasury");
        newTreasury = await newTreasuryContract.deploy(ohm.address, 10);

        let newStakingContract = await ethers.getContractFactory("OlympusStaking");
        newStaking = await newStakingContract.deploy(ohm.address, sOhm.address, EPOCH_LEGNTH, 0, 0);

        let tokenMigratorContract = await ethers.getContractFactory("OlympusTokenMigrator");
        olympusTokenMigrator = await tokenMigratorContract.deploy(
            OLD_OHM_ADDRESS,
            OLD_SOHM_ADDRESS,
            OLD_TREASURY_ADDRESS,
            OLD_STAKING_ADDRESS,
            OLD_WSOHM_ADDRESS,
            DAI_ADDRESS,
            SUSHI_ROUTER,
            UNISWAP_ROUTER,
            0 // timelock
        );

        let gOhmContract = await ethers.getContractFactory("gOHM");
        gOhm = await gOhmContract.deploy(olympusTokenMigrator.address);

        // Set gOHM on migrator contract
        await olympusTokenMigrator.connect(deployer).setgOHM(gOhm.address);
        await sOhm.connect(deployer).setgOHM(gOhm.address);
        await newStaking.connect(deployer).setContract(1,gOhm.address);
        await sOhm.connect(deployer).setIndex(20);

        await helper('send eth', '', TREASURY_MANAGER);

        manager = await helper('impersonate account', '', TREASURY_MANAGER);

        old_treasury = await new ethers.Contract(
            OLD_TREASURY_ADDRESS,
            old_treasury_abi,
            ethers.provider
        );

        await helper('set contracts', '', '',treasury_tokens);
        await helper('set contracts', '', '', olympus_tokens);
        await helper('set contracts', '', '', olympus_lp_tokens);
        await helper('set contracts', '', '', swaps);

        // 3 is the reserve manager
        await old_treasury.connect(manager).queue(3, olympusTokenMigrator.address);
        await old_treasury.connect(manager).queue(6, olympusTokenMigrator.address);
        await old_treasury.connect(manager).queue(1, olympusTokenMigrator.address);

        // 2 is the reserve token
        await old_treasury.connect(manager).queue(2, lp_token_1[0]);

        await helper(13000);

        await old_treasury
            .connect(manager)
            .toggle(3, olympusTokenMigrator.address, olympusTokenMigrator.address);

        await old_treasury
            .connect(manager)
            .toggle(6, olympusTokenMigrator.address, olympusTokenMigrator.address);

                await old_treasury
            .connect(manager)
            .toggle(1, olympusTokenMigrator.address, olympusTokenMigrator.address);    

        await old_treasury.connect(manager).toggle(2, lp_token_1[0], lp_token_1[0]);

        // Enables onchain governance, needs two calls. :odd:
        await newTreasury.connect(deployer).enableOnChainGovernance();

        await helper(1000);

        await newTreasury.connect(deployer).enableOnChainGovernance();

        await helper('enable address in new treasury', 2, '', treasury_tokens);
        
        // 0 = RESERVED DEPOSITOR
        await helper('enable address in new treasury', 0, olympusTokenMigrator.address);

        // 8 = REWARD MANAGER (allows minting)
        await helper('enable address in new treasury', 8, olympusTokenMigrator.address);
    });

    it("Should fail if sender is not DAO", async () => {

        await expect(
            olympusTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken)
        ).to.revertedWith("Ownable: caller is not the owner");

        await expect(
            olympusTokenMigrator
            .connect(user1)
            .addLPTokens(lp_token_addresses, lp_token_0, lp_token_1, is_sushi_lp)
        ).to.revertedWith("Ownable: caller is not the owner");

        await expect(
            olympusTokenMigrator.connect(user1).addTokens(tokenAddresses, reserveToken)
        ).to.revertedWith("Ownable: caller is not the owner");
    })

    it("Should fail if user does not have any of the ohm tokens to migrate ", async () => {
        await helper('send eth', '', NON_TOKEN_HOLDER);
        const user = await helper('impersonate account', '', NON_TOKEN_HOLDER);
        await expect(olympusTokenMigrator.connect(user).migrate(1000000, 0)
        ).to.revertedWith("ERC20: transfer amount exceeds balance"); 
    })

    it('should fail if token is not equal to reserve token', async () => {
        await expect(olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, [true, true, true]))
                .to.revertedWith("token array lengths do not match");

        await expect(
            olympusTokenMigrator
            .connect(deployer)
            .addLPTokens(lp_token_addresses, lp_token_0, lp_token_1, [true, true])
        ).to.revertedWith("token array lengths do not match");
    })

    it("Should migrate user ohm, sohm, and wsohm to gohm when migration is false ", async () => {
        await helper('migrate tokens or bridge back', 0, OHM_USER, ['migrate'], 2);
        await helper('migrate tokens or bridge back', 1, SOHM_USER, ['migrate'], 1);
        await helper('migrate tokens or bridge back', 2, WSOHM_USER, ['migrate'], 0);
    })

    it("Should allow DAO add tokens", async () => {
        await olympusTokenMigrator.connect(deployer).addTokens(tokenAddresses, reserveToken);
    });

    it("Should allow DAO add lp tokens", async () => {
        await olympusTokenMigrator
            .connect(deployer)
            .addLPTokens(lp_token_addresses, lp_token_0, lp_token_1, is_sushi_lp);
    })

    it("Should fail if user does not have any of the ohm tokens to bridge back ", async () => {
        await helper('send eth', '', NON_TOKEN_HOLDER);
        const user = await helper('impersonate account', '', NON_TOKEN_HOLDER);
        await expect(olympusTokenMigrator.connect(user).bridgeBack(1000000, 0)
        ).to.revertedWith("SafeMath: subtraction overflow"); 
    })

    it("Should bridgeBack user ohm, sohm, and wsohm from gohm when migration is false ", async () => {
        
        await helper('migrate tokens or bridge back', 0, OHM_USER,[ 'bridgeBack'], 2);
        await helper('migrate tokens or bridge back', 1, SOHM_USER, ['bridgeBack'], 1);
        await helper('migrate tokens or bridge back', 2, WSOHM_USER, ['bridgeBack'], 0);
    })

    it("Should allow DAO migrate tokens ", async () => {
        await ohm.connect(deployer).setVault(newTreasury.address);
        await sOhm.connect(deployer).initialize(newStaking.address);

        await helper('get tokens and lp tokens old and new treasury balance b4 tx');

        await olympusTokenMigrator
            .connect(deployer)
            .migrateContracts(newTreasury.address, newStaking.address, ohm.address, sOhm.address);

        await helper('get tokens and lp tokens old and new treasury balance after tx');
    })

    it("Should defund", async () => {
        //migrate users token again after brdige back so olympus token migrator contract has some balance
        await helper('migrate tokens or bridge back', 0, OHM_USER, ['migrate'], 2);

        await olympusTokenMigrator.connect(deployer).startTimelock();
        await helper(1000);
        await olympusTokenMigrator.connect(deployer).defund();
    })
})

async function 
    helper
    (
        message, 
        enum_number = 0,
        address = ethers.constants.AddressZero,
        array = [],
        number = 100
    ) 
{

    if(message === 'set contracts'){
        array.forEach((token) => {
            token.contract = new ethers.Contract(token.address, token.abi, ethers.provider);
        });
    }
    else if(message === 'get tokens and lp tokens old and new treasury balance b4 tx'){
        for(let i = 0; i < 4; i++){
            console.log("===============Treasury Token Migration Started!===============");
            const contract = treasury_tokens[i].contract;
            const name = treasury_tokens[i].name;

            const bal_before_tx = await contract.connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
            console.log(`old_treasury_${name}_bal_before_tx`, bal_before_tx.toString());

            const bal_after_tx = await contract.connect(deployer).balanceOf(newTreasury.address);
            console.log(`new_treasury_${name}_bal_before_tx`, bal_after_tx.toString());
        }

        for(let i = 0; i < 3; i++){
            console.log("===============Treasury LP Migration Started!===============");
            const contract = olympus_lp_tokens[i].contract;
            const name = olympus_lp_tokens[i].name;

            const bal_before_tx = await contract.connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
            console.log(`old_treasury_${name}_bal_before_tx`, bal_before_tx.toString());

            const bal_after_tx = await contract.connect(deployer).balanceOf(newTreasury.address);
            console.log(`new_treasury_${name}_bal_before_tx`, bal_after_tx.toString());
        }
    }
    else if(message === 'get tokens and lp tokens old and new treasury balance after tx'){
        for(let i = 0; i < 4; i++){
            console.log("===============Treasury Token Migration Done!===============");
            const contract = treasury_tokens[i].contract;
            const name = treasury_tokens[i].name;
        
            const bal_before_tx = await contract.connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
            console.log(`old_treasury_${name}_bal_after_tx`, bal_before_tx.toString());

            const bal_after_tx = await contract.connect(deployer).balanceOf(newTreasury.address);
            console.log(`new_treasury_${name}_bal_after_tx`, bal_after_tx.toString());
        }

        const uni_factory_contract = swaps[0].contract;
        const sushi_factory_contract = swaps[1].contract;

        const new_ohm_frax_lp_address = await uni_factory_contract.getPair(ohm.address, tokenAddresses[0]);
        const new_ohm_dai_lp_address = await sushi_factory_contract.getPair(ohm.address, tokenAddresses[3]);
        const new_ohm_lusd_lp_address = await sushi_factory_contract.getPair(ohm.address, tokenAddresses[2]);

        const new_ohm_frax_lp = new ethers.Contract(new_ohm_frax_lp_address, olympus_lp_tokens[0].abi, ethers.provider);
        const new_ohm_dai_lp = new ethers.Contract(new_ohm_dai_lp_address, olympus_lp_tokens[0].abi, ethers.provider);
        const new_ohm_lusd_lp = new ethers.Contract(new_ohm_lusd_lp_address, olympus_lp_tokens[0].abi, ethers.provider);
        const addr = [new_ohm_frax_lp, new_ohm_lusd_lp, new_ohm_dai_lp];

        for(let i = 0; i < 3; i++){
            const name = ['frax', 'lusd', 'dai'];
            
            console.log("===============Treasury LP Migration Done!===============");

            const bal_before_tx = await addr[i].connect(deployer).balanceOf(OLD_TREASURY_ADDRESS);
            console.log(`old_treasury_${name[i]}_bal_after_tx`, bal_before_tx.toString());

            const bal_after_tx = await addr[i].connect(deployer).balanceOf(newTreasury.address);
            console.log(`new_treasury_${name[i]}_bal_after_tx`, bal_after_tx.toString());
        }
    }
    else if(message === 'enable address in new treasury'){
        if(enum_number === 0 || enum_number === 8){
            await newTreasury
                .connect(deployer)
                .enable(enum_number, address, address);
        }
        else{
            array.forEach(async(token) => {
                await newTreasury
                    .connect(deployer)
                    .enable(enum_number, token.address, token.address);
            });
        }
    }
    else if(message === 'impersonate account'){
        await impersonateAccount(address);
        const owner = await ethers.getSigner(address);
        return owner;
    }
    else if(message === 'migrate tokens or bridge back'){         
        const contract = olympus_tokens[number].contract;
        const name = olympus_tokens[number].name;

        const balance_before_tx = await contract.balanceOf(address);
        const gohm_balance_before_tx = await gOhm.balanceOf(address);

        console.log(`user_${name}_balance_before_tx:`, balance_before_tx.toString());
        console.log('user_gohm_balance_before_tx:', gohm_balance_before_tx.toString())

        const user = await helper('impersonate account', '', address);
        await helper('send eth', '', address);

        await contract.connect(user).approve(olympusTokenMigrator.address, balance_before_tx)

        if(array[0] === 'migrate'){
            await olympusTokenMigrator.connect(user).migrate(balance_before_tx, enum_number);
            console.log("===============User Token Migration Done!===============");
        }
        else if(array[0] === 'bridgeBack'){
            await olympusTokenMigrator.connect(user).bridgeBack(gohm_balance_before_tx, enum_number);
            console.log("===============User Token Bridged Back Done!===============");
        }

        const balance_after_tx = await contract.balanceOf(address);
        const gohm_balance_after_tx = await gOhm.balanceOf(address);

        console.log(`user_${name}_balance_after_tx:`, balance_after_tx.toString());
        console.log('user_gohm_balance_after_tx:', gohm_balance_after_tx.toString());
    }
    else if(message === 'send eth'){
        await deployer.sendTransaction({
            to: address,
            value: ethers.utils.parseEther("1"), // 1 ether
        });
    }
    else{
        for(let i = 0; i < message; i++){ //message here is a number
            await advanceBlock();
        }
    } 
}