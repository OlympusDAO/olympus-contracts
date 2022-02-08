import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // For Liquity addresses:
    // mainnet: https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt
    // rinkeby: https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/rinkebyDeploymentOutput.json

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const lusdTokenAddress = "0xaf844BBaD90fB27ae949376338F7c9DA1251acFf";
    const lqtyToken = "0xf8A1aA1c34970aCE24041ef038A442732d942b89";
    const stabilityPool = "0xFd0dB2BA8BEaC72d45f12A76f40c345BBf5f6F8d";
    const stakingPool = "0x35D3293EA6dD210b8Ca25668ae266ca4C834Ea1b";
    const weth = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const hopTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"; // DAI

    await deploy(CONTRACTS.lusdAllocator, {
        from: deployer,
        args: [
            authorityDeployment.address,
            treasuryDeployment.address,
            lusdTokenAddress,
            lqtyToken,
            stabilityPool,
            stakingPool,
            "0x0000000000000000000000000000000000000000",
            weth,
            hopTokenAddress,
            "0x0000000000000000000000000000000000000000",
        ],
        log: true,
    });
};

func.tags = [CONTRACTS.distributor, "lusdallocator"];
func.dependencies = [CONTRACTS.treasury];

export default func;
