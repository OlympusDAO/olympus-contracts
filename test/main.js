const { fork_network } = require('./utils/network_fork');

const DAI = process.env.DAI;
const FRAX = process.env.FRAX
const WETH = process.env.WETH;
const LUSD = process.env.LUSD;

let user0, user1, user2, manager, old_treasury;
const tokenAddresses = [DAI, FRAX, WETH, LUSD]

describe('Deployment Verification', async () => {
    let olympus;
    let Olympus; 


    before(async () => {
        await fork_network();

        [user0, user1, user2] = await ethers.getSigners();

        Olympus = await ethers.getContractFactory('OlympusERC20Token')
        olympus = await Olympus.deploy();

    })

    it("Should deploy the token", async () =>{
        expect(await olympus.name()).to.equal("Olympus");
        expect(await olympus.symbol()).to.equal("OHM");
        expect(await olympus.decimals()).to.equal(9);
    })
})

