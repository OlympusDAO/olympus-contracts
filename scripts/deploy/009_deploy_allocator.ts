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

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const lusdTokenAddress = "0xaf844BBaD90fB27ae949376338F7c9DA1251acFf";
    const lqtyToken = "0xf8A1aA1c34970aCE24041ef038A442732d942b89";
    const stabilityPool = "0xFd0dB2BA8BEaC72d45f12A76f40c345BBf5f6F8d";
    const stakingPool = "0x35D3293EA6dD210b8Ca25668ae266ca4C834Ea1b";
    const weth = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  
    await deploy(CONTRACTS.lusdAllocator, {
        from: deployer,
        args: [
            treasuryDeployment.address,
            lusdTokenAddress,
            lqtyToken,
            stabilityPool,
            stakingPool,
            "0x0000000000000000000000000000000000000000",
            weth
        ],
        log: true,
    });
};

func.tags = [CONTRACTS.distributor, "lusdallocator"];
func.dependencies = [
    CONTRACTS.treasury
];

export default func;
