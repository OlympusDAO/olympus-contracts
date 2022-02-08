// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;

import "../libraries/SafeERC20.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
import "../interfaces/ITreasury.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/LiquityInterfaces.sol";
import "../types/OlympusAccessControlled.sol";

/**
 *  Contract deploys reserves from treasury into the liquity stabilty pool, and those rewards
 *  are then paid out to the staking contract.  See harvest() function for more details.
 */

contract LUSDAllocator is OlympusAccessControlled {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeERC20 for IWETH;

    event Deposit(address indexed dst, uint256 amount);

    /* ======== STATE VARIABLES ======== */
    IStabilityPool immutable lusdStabilityPool;
    ILQTYStaking immutable lqtyStaking;
    IWETH immutable weth; // WETH address (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    ISwapRouter immutable swapRouter;
    ITreasury public treasury; // Olympus Treasury

    uint256 public constant FEE_PRECISION = 1e6;
    uint256 public constant POOL_FEE_MAX = 10000;
    /**
     * @notice The target percent of eth to swap to LUSD at uniswap.  divide by 1e6 to get actual value.
     * Examples:
     * 500000 => 500000 / 1e6 = 0.50 = 50%
     * 330000 => 330000 / 1e6 = 0.33 = 33%
     */
    uint256 public ethToLUSDRatio = 330000; // 33% of ETH to LUSD
    /**
     * @notice poolFee parameter for uniswap swaprouter, divide by 1e6 to get the actual value.  See https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps#calling-the-function-1
     * Maximum allowed value is 10000 (1%)
     * Examples:
     * poolFee =  3000 =>  3000 / 1e6 = 0.003 = 0.3%
     * poolFee = 10000 => 10000 / 1e6 =  0.01 = 1.0%
     */
    uint256 public poolFee = 3000; // Init the uniswap pool fee to 0.3%

    address public hopTokenAddress; //Initially DAI, could potentially be USDC

    // TODO(zx): I don't think we care about front-end because we're our own frontend.
    address public frontEndAddress; // frontEndAddress for potential liquity rewards
    address public lusdTokenAddress; // LUSD Address (0x5f98805A4E8be255a32880FDeC7F6728C6568bA0)
    address public lqtyTokenAddress; // LQTY Address (0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D)  from https://github.com/liquity/dev/blob/a12f8b737d765bfee6e1bfcf8bf7ef155c814e1e/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt#L61

    uint256 public totalValueDeployed; // total RFV deployed into lending pool
    uint256 public totalAmountDeployed; // Total amount of tokens deployed

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _authority,
        address _treasury,
        address _lusdTokenAddress,
        address _lqtyTokenAddress,
        address _stabilityPool,
        address _lqtyStaking,
        address _frontEndAddress,
        address _wethAddress,
        address _hopTokenAddress,
        address _uniswapV3Router
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        treasury = ITreasury(_treasury);
        lusdTokenAddress = _lusdTokenAddress;
        lqtyTokenAddress = _lqtyTokenAddress;
        lusdStabilityPool = IStabilityPool(_stabilityPool);
        lqtyStaking = ILQTYStaking(_lqtyStaking);
        frontEndAddress = _frontEndAddress; // address can be 0
        weth = IWETH(_wethAddress);
        hopTokenAddress = _hopTokenAddress; // address can be 0
        swapRouter = ISwapRouter(_uniswapV3Router);

        // infinite approve to save gas
        weth.safeApprove(address(treasury), type(uint256).max);
        weth.safeApprove(address(swapRouter), type(uint256).max);
        IERC20(lusdTokenAddress).safeApprove(address(lusdStabilityPool), type(uint256).max);
        IERC20(lusdTokenAddress).safeApprove(address(treasury), type(uint256).max);
        IERC20(lqtyTokenAddress).safeApprove(address(treasury), type(uint256).max);
    }

    /**
        StabilityPool::withdrawFromSP() and LQTYStaking::stake() will send ETH here, so capture and emit the event
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /* ======== CONFIGURE FUNCTIONS for Guardian only ======== */
    function setEthToLUSDRatio(uint256 _ethToLUSDRatio) external onlyGuardian {
        require(_ethToLUSDRatio <= FEE_PRECISION, "Value must be between 0 and 1e6");
        ethToLUSDRatio = _ethToLUSDRatio;
    }

    function setPoolFee(uint256 _poolFee) external onlyGuardian {
        require(_poolFee <= POOL_FEE_MAX, "Value must be between 0 and 10000");
        poolFee = _poolFee;
    }

    function setHopTokenAddress(address _hopTokenAddress) external onlyGuardian {
        hopTokenAddress = _hopTokenAddress;
    }

    /**
     *  @notice setsFrontEndAddress for Stability pool rewards
     *  @param _frontEndAddress address
     */
    function setFrontEndAddress(address _frontEndAddress) external onlyGuardian {
        frontEndAddress = _frontEndAddress;
    }

    function updateTreasury() public onlyGuardian {
        require(authority.vault() != address(0), "Zero address: Vault");
        require(address(authority.vault()) != address(treasury), "No change");
        treasury = ITreasury(authority.vault());
    }

    /* ======== OPEN FUNCTIONS ======== */

    /**
     *  @notice claims LQTY & ETH Rewards.   minETHLUSDRate minimum rate of when swapping ETH->LUSD.  e.g. 3500 means we swap at a rate of 1 ETH for a minimum 3500 LUSD
     
        1.  Harvest from LUSD StabilityPool to get ETH+LQTY rewards
        2.  Stake LQTY rewards from #1.  This txn will also give out any outstanding ETH+LUSD rewards from prior staking
        3.  If we have eth, convert to weth, then swap a percentage of it to LUSD.  If swap successul then send all remaining WETH to treasury
        4.  Deposit LUSD from #2 and potentially #3 into StabilityPool
     */
    function harvest(uint256 minETHLUSDRate) public onlyGuardian returns (bool) {
        uint256 stabilityPoolEthRewards = getETHRewards();
        uint256 stabilityPoolLqtyRewards = getLQTYRewards();

        if (stabilityPoolEthRewards == 0 && stabilityPoolLqtyRewards == 0) {
            return false;
        }
        // 1.  Harvest from LUSD StabilityPool to get ETH+LQTY rewards
        lusdStabilityPool.withdrawFromSP(0); //Passing 0 b/c we don't want to withdraw from the pool but harvest - see https://discord.com/channels/700620821198143498/818895484956835912/908031137010581594

        // 2.  Stake LQTY rewards from #1.  This txn will also give out any outstanding ETH+LUSD rewards from prior staking
        uint256 balanceLqty = IERC20(lqtyTokenAddress).balanceOf(address(this)); // LQTY balance received from stability pool
        if (balanceLqty > 0) {
            //Stake
            lqtyStaking.stake(balanceLqty); //Stake LQTY, also receives any prior ETH+LUSD rewards from prior staking
        }

        // 3.  If we have eth, convert to weth, then swap a percentage of it to LUSD.  If swap successul then send all remaining WETH to treasury
        uint256 ethBalance = address(this).balance; // Use total balance in case we have leftover from a prior failed attempt
        bool swappedLUSDSuccessfully;
        if (ethBalance > 0) {
            // Wrap ETH to WETH
            weth.deposit{value: ethBalance}();

            uint256 wethBalance = weth.balanceOf(address(this)); //Base off of WETH balance in case we have leftover from a prior failed attempt
            if (ethToLUSDRatio > 0) {
                uint256 amountWethToSwap = (wethBalance * ethToLUSDRatio) / FEE_PRECISION;

                uint256 amountLUSDMin = amountWethToSwap * minETHLUSDRate; //WETH and LUSD is 18 decimals

                // From https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps#calling-the-function-1
                // Multiple pool swaps are encoded through bytes called a `path`. A path is a sequence of token addresses and poolFees that define the pools used in the swaps.
                // The format for pool encoding is (tokenIn, fee, tokenOut/tokenIn, fee, tokenOut) where tokenIn/tokenOut parameter is the shared token across the pools.
                // Since we are swapping WETH to DAI and then DAI to LUSD the path encoding is (WETH, 0.3%, DAI, 0.3%, LUSD).
                ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
                    path: abi.encodePacked(address(weth), poolFee, hopTokenAddress, poolFee, lusdTokenAddress),
                    recipient: address(this), //Send LUSD here
                    deadline: block.timestamp + 25, //25 blocks, at 12 seconds per block is 5 minutes
                    amountIn: amountWethToSwap,
                    amountOutMinimum: amountLUSDMin
                });

                // Executes the swap
                if (swapRouter.exactInput(params) > 0) {
                    swappedLUSDSuccessfully = true;
                }
            }
        }
        if (ethToLUSDRatio == 0 || swappedLUSDSuccessfully) {
            // If swap was successful (or if percent to swap is 0), send the remaining WETH to the treasury.  Crucial check otherwise we'd send all our WETH to the treasury and not respect our desired percentage

            // Get updated balance, send to treasury
            uint256 wethBalance = weth.balanceOf(address(this));
            if (wethBalance > 0) {
                // transfer WETH to treasury
                weth.safeTransfer(address(treasury), wethBalance);
            }
        }

        // 4.  Deposit LUSD from #2 and potentially #3 into StabilityPool
        uint256 lusdBalance = IERC20(lusdTokenAddress).balanceOf(address(this));
        if (lusdBalance > 0) {
            _depositLUSD(lusdBalance);
        }

        return true;
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice withdraws asset from treasury, deposits asset into stability pool
     *  @param amount uint
     */
    function deposit(uint256 amount) external onlyGuardian {
        treasury.manage(lusdTokenAddress, amount); // retrieve amount of asset from treasury

        _depositLUSD(amount);
    }

    /**
     *  @notice withdraws from stability pool, and deposits asset into treasury
     *  @param token address
     *  @param amount uint
     */
    function withdraw(address token, uint256 amount) external onlyGuardian {
        require(
            token == lusdTokenAddress || token == lqtyTokenAddress,
            "token address does not match LUSD nor LQTY token"
        );

        if (token == lusdTokenAddress) {
            lusdStabilityPool.withdrawFromSP(amount); // withdraw from SP

            uint256 balance = IERC20(token).balanceOf(address(this)); // balance of asset received from stability pool
            uint256 value = _tokenValue(token, balance); // treasury RFV calculator

            _accountingFor(balance, value, false); // account for withdrawal

            treasury.deposit(balance, token, value); // deposit using value as profit so no OHM is minted
        } else {
            lqtyStaking.unstake(amount);

            uint256 balance = IERC20(token).balanceOf(address(this)); // balance of asset received from stability pool
            IERC20(token).safeTransfer(address(treasury), balance);
        }
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    function _depositLUSD(uint256 amount) internal {
        lusdStabilityPool.provideToSP(amount, frontEndAddress); //s either a front-end address OR 0x0

        uint256 value = _tokenValue(lusdTokenAddress, amount); // treasury RFV calculator
        _accountingFor(amount, value, true); // account for deposit
    }

    /**
     *  @notice accounting of deposits/withdrawals of assets
     *  @param amount uint
     *  @param value uint
     *  @param add bool
     */
    function _accountingFor(
        uint256 amount,
        uint256 value,
        bool add
    ) internal {
        if (add) {
            totalAmountDeployed = totalAmountDeployed + amount;
            totalValueDeployed = totalValueDeployed + value; // track total value allocated into pools
        } else {
            // track total value allocated into pools
            if (amount < totalAmountDeployed) {
                totalAmountDeployed = totalAmountDeployed - amount;
            } else {
                totalAmountDeployed = 0;
            }

            if (value < totalValueDeployed) {
                totalValueDeployed = totalValueDeployed - value;
            } else {
                totalValueDeployed = 0;
            }
        }
    }

    /**
    Helper method copying OlympusTreasury::_tokenValue(), whose name was 'valueOf()' in v1 
    Implemented here so we don't have to upgrade contract later
     */
    function _tokenValue(address _token, uint256 _amount) internal view returns (uint256 value_) {
        value_ = (_amount * (10**9)) / (10**IERC20Metadata(_token).decimals());
        return value_;
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice get ETH rewards from SP
     *  @return uint
     */
    function getETHRewards() public view returns (uint256) {
        return lusdStabilityPool.getDepositorETHGain(address(this));
    }

    /**
     *  @notice get LQTY rewards from SP
     *  @return uint
     */
    function getLQTYRewards() public view returns (uint256) {
        return lusdStabilityPool.getDepositorLQTYGain(address(this));
    }
}
