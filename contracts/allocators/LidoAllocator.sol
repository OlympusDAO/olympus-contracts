// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// Types
import "../types/BaseAllocator.sol";

// Interfaces
import "../interfaces/ITreasury.sol";
import "../interfaces/IERC20.sol";

import "hardhat/console.sol";

/*///////////////////////////////////////////////////////////////
                            TYPES
//////////////////////////////////////////////////////////////*/

enum SwapKind {
    GIVEN_IN,
    GIVEN_OUT
}

struct SingleSwap {
    bytes32 poolId;
    SwapKind kind;
    address assetIn;
    address assetOut;
    uint256 amount;
    bytes userData;
}

struct FundManagement {
    address sender;
    bool fromInternalBalance;
    address recipient;
    bool toInternalBalance;
}

interface IBalancerVault {
    function swap(
        SingleSwap memory singleSwap,
        FundManagement memory funds,
        uint256 limit,
        uint256 deadline
    ) external payable returns (uint256 amountCalculated);

    function setRelayerApproval(
        address sender,
        address relayer,
        bool approved
    ) external;
}

interface IstETH is IERC20 {
    function submit(address _referral) external payable returns (uint256);

    function withdraw(uint256 _amount, bytes32 _pubkeyHash) external;
}

interface IwstETH is IERC20 {
    function wrap(uint256 _stETHAmount) external returns (uint256);
}

interface IwETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint256 wad) external;
}

// Errors
error LidoAllocator_InvalidAddress();
error LidoAllocator_FeeToLarge();
error LidoAllocator_RatioTooLarge();
error LidoAllocator_WithdrawalNotEnabled();

// @title Lido Allocator
// @notice Stake treasury WETH into Lido as stETH
contract LidoAllocator is BaseAllocator {
    using SafeERC20 for IERC20;

    /*///////////////////////////////////////////////////////////////
                               CONTRACTS
    //////////////////////////////////////////////////////////////*/

    address public immutable treasury;

    // @notice Uniswap V2 Router for stETH to WETH swaps
    IBalancerVault public swapRouter;

    /*///////////////////////////////////////////////////////////////
                               TOKENS
    //////////////////////////////////////////////////////////////*/

    // @notice Lido/stETH contract. Accepts ETH deposits, and then returns stETH
    //         which behaves as an ERC20 token.
    IstETH public lido;
    IwstETH public wstETH;

    /*///////////////////////////////////////////////////////////////
                            CONFIG VARIABLES
    //////////////////////////////////////////////////////////////*/

    bytes32 public constant BALANCER_POOL_ID = 0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080;
    address public constant BALANCER_LIDO_RELAYER = 0xdcdbf71A870cc60C6F9B621E28a7D3Ffd6Dd4965;
    uint256 public constant POOL_FEE_MAX = 10000;
    uint256 public constant ETH_STETH_PRECISION = 10000;

    uint24 public poolFee = 3000;
    uint256 public minETHstETHRatio; // out of 1000 (950 -> 95.0%)
    bool public isLidoWithdrawalEnabled = false;

    /*///////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    // @notice Creates a new allocator for Lido
    // @param data Base allocator data, including token definition
    // @param treasury_ Address of the treasury contract
    // @param swapRouter_ Address of the Uni V2 pool contract
    // @param lido_ Address of the Lido contract
    // @param weth_ Address of the WETH9 contract
    // @param minETHstETHRatio_ Minimum ratio of stETH to ETH to swap at
    constructor(
        AllocatorInitData memory data,
        address treasury_,
        address swapRouter_,
        address lido_,
        address wsteth_,
        uint256 minETHstETHRatio_
    ) BaseAllocator(data) {
        // Verify that all addresses are valid
        if (treasury_ == address(0) || swapRouter_ == address(0) || lido_ == address(0))
            revert LidoAllocator_InvalidAddress();

        // Verify that the min ratio is not greater than 1
        if (minETHstETHRatio_ > 1000) revert LidoAllocator_RatioTooLarge();

        // Set contracts
        treasury = treasury_;
        swapRouter = IBalancerVault(swapRouter_);

        // Set tokens
        lido = IstETH(lido_);
        wstETH = IwstETH(wsteth_);

        // Set config variables
        minETHstETHRatio = minETHstETHRatio_;

        // Approvals
        IERC20(wsteth_).safeApprove(address(swapRouter), type(uint256).max);
        IERC20(lido_).safeApprove(address(extender), type(uint256).max);
        IERC20(lido_).safeApprove(wsteth_, type(uint256).max);
    }

    /*///////////////////////////////////////////////////////////////
                        ALLOCATOR OPERATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    // @notice If there is a WETH balance, unwrap it to ETH then stake to stETH. Then report
    //         the gain of stETH balance to the Treasury Extender.
    // @param id The id of the token. This is an irrelevant parameter for this allocator. It is not used.
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // Unwrap any WETH balance
        uint256 wrappedBalance = _tokens[0].balanceOf(address(this));
        if (wrappedBalance > 0) {
            IwETH(address(_tokens[0])).withdraw(wrappedBalance);
        }

        // Stake any ETH balance to Lido's stETH
        uint256 balance = address(this).balance;
        if (balance > 0) {
            // I'm not sure if this is the right way to handle a referrer
            lido.submit{value: balance}(address(this));
        }

        // Get the new stETH balance (based on shares, and thus gains as staking rewards are paid)
        // Also get the previous level by adding amount allocated and prior gains
        uint256 stBalance = lido.balanceOf(address(this));
        uint256 last = extender.getAllocatorAllocated(_ids[0]) + extender.getAllocatorPerformance(_ids[0]).gain;

        // Report gains (or losses)
        if (stBalance > last) gain = uint128(stBalance - last);
        else loss = uint128(last - stBalance);
    }

    // @notice Convert stETH back into WETH to prepare to return to the treasury
    // @param amounts A uint256 array of the amounts to convert out of stETH (only first index is used)
    // @dev There is no way to withdraw from Lido at the moment, so this just performs a stETH/WETH swap on Uni V2
    function deallocate(uint256[] memory amounts) public override {
        _onlyGuardian();

        // Wrap stETH to wstETH
        uint256 wstETHAmount = wstETH.wrap(amounts[0]);

        // Calculate the minimum quantity of WETH we would accept
        uint256 minWETH = (minETHstETHRatio * amounts[0]) / ETH_STETH_PRECISION;
        bytes memory userData;

        SingleSwap memory singleSwap = SingleSwap({
            poolId: BALANCER_POOL_ID,
            kind: SwapKind.GIVEN_IN,
            assetIn: address(wstETH),
            assetOut: address(_tokens[0]),
            amount: wstETHAmount,
            userData: userData
        });

        FundManagement memory funds = FundManagement({
            sender: address(this),
            fromInternalBalance: false,
            recipient: address(this),
            toInternalBalance: false
        });

        // Execute the swap
        swapRouter.swap(singleSwap, funds, minWETH, block.timestamp);
    }

    // @notice Convert full stETH balance back to WETH to prepare to return to the treasury
    // @param panic If true, denotes losses have been major, and funds are immediately sent to the treasury
    function _deactivate(bool panic) internal override {
        uint256 lidoBalance = lido.balanceOf(address(this));

        // Only deallocate if there is non-dust stETH (> 0.01). migrate() calls deactivate after a migration
        // has happened which triggers this to all run again when balance is near zero which reverts
        // on the swap
        if (lidoBalance > 10000000000000000) {
            uint256[] memory amounts = new uint256[](1);
            amounts[0] = lido.balanceOf(address(this));
            deallocate(amounts);
        }

        uint256 wethBalance = _tokens[0].balanceOf(address(this));
        if (panic) {
            _tokens[0].transfer(treasury, wethBalance);
        }
    }

    // @notice Convert full stETH balance back to WETH to prepare to move to a new contract
    function _prepareMigration() internal override {}

    // @notice Convert full stETH balance back to WETH through Lido withdrawal rather than swap
    // @param amounts A uint256 array of the amounts to convert out of stETH (only first index is used)
    function deallocateWithdraw(uint256[] memory amounts) public {
        _onlyGuardian();
        if (!isLidoWithdrawalEnabled) revert LidoAllocator_WithdrawalNotEnabled();

        // Withdraw stETH to ETH
        // This probably doesn't actually work because the Lido contract has the second parameter
        // bytes 32 but is supposed to represent the public key hash of the user. I don't think that's
        // something we can get in Solidity. Not sure how to proceed
        lido.withdraw(amounts[0], bytes32(uint256(uint160(address(this))) << 96));

        // Wrap to WETH
        uint256 ethBalance = address(this).balance;
        IwETH(address(_tokens[0])).deposit{value: ethBalance}();
    }

    /*///////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    // @notice Returns the total current stETH balance plus the WETH balance
    // @param id The id of the token. This is an irrelevant parameter for this allocator. It is not used.
    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 stBalance = lido.balanceOf(address(this));
        uint256 wethBalance = _tokens[0].balanceOf(address(this));

        return stBalance + wethBalance;
    }

    // @notice Exists just to override the base allocator's function, the only token involved
    //         is stETH (staked, and then returns gains in stETH)
    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory empty = new IERC20[](0);
        return empty;
    }

    // @notice Returns the tokens that are allocated to gain yield, in this case stETH
    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utilityTokens = new IERC20[](1);
        utilityTokens[0] = lido;
        return utilityTokens;
    }

    function name() external view override returns (string memory) {
        return "LidoAllocator";
    }

    /*///////////////////////////////////////////////////////////////
                            CONFIG FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    // @notice Allows us to change the pool fee in the event that it is adjusted on Uniswap's side
    // @param poolFee_ The new fee to use
    function setPoolFee(uint24 poolFee_) external {
        _onlyGuardian();
        if (poolFee_ > POOL_FEE_MAX) revert LidoAllocator_FeeToLarge();

        poolFee = poolFee_;
    }

    // @notice Allows us to change the minimum ratio of stETH to ETH we would accept
    // @param minETHstETHRatio_ The new ratio to use
    function setMinETHstETHRatio(uint256 minETHstETHRatio_) external {
        _onlyGuardian();
        if (minETHstETHRatio_ > 1000) revert LidoAllocator_RatioTooLarge();

        minETHstETHRatio = minETHstETHRatio_;
    }

    // @notice Allows us to enable access to deallocateWithdraw() when Lido enables withdrawals
    // @param isLidoWithdrawalEnabled_ Whether withdrawals are enabled
    function setisLidoWithdrawalEnabled(bool isLidoWithdrawalEnabled_) external {
        _onlyGuardian();

        isLidoWithdrawalEnabled = isLidoWithdrawalEnabled_;
    }

    /*///////////////////////////////////////////////////////////////
                            RECEIVE FUNCTION
    //////////////////////////////////////////////////////////////*/

    receive() external payable {}
}
