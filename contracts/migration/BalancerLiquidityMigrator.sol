// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;
pragma abicoder v2;

import "../libraries/SafeERC20.sol";

import "../interfaces/ITreasury.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IOlympusAuthority.sol";

import "../types/OlympusAccessControlled.sol";

interface IBalancerVault {
    /**
     * @dev Called by users to join a Pool, which transfers tokens from `sender` into the Pool's balance. This will
     * trigger custom Pool behavior, which will typically grant something in return to `recipient` - often tokenized
     * Pool shares.
     *
     * If the caller is not `sender`, it must be an authorized relayer for them.
     *
     * The `assets` and `maxAmountsIn` arrays must have the same length, and each entry indicates the maximum amount
     * to send for each asset. The amounts to send are decided by the Pool and not the Vault: it just enforces
     * these maximums.
     *
     * If joining a Pool that holds WETH, it is possible to send ETH directly: the Vault will do the wrapping. To enable
     * this mechanism, the IAsset sentinel value (the zero address) must be passed in the `assets` array instead of the
     * WETH address. Note that it is not possible to combine ETH and WETH in the same join. Any excess ETH will be sent
     * back to the caller (not the sender, which is important for relayers).
     *
     * `assets` must have the same length and order as the array returned by `getPoolTokens`. This prevents issues when
     * interacting with Pools that register and deregister tokens frequently. If sending ETH however, the array must be
     * sorted *before* replacing the WETH address with the ETH sentinel value (the zero address), which means the final
     * `assets` array might not be sorted. Pools with no registered tokens cannot be joined.
     *
     * If `fromInternalBalance` is true, the caller's Internal Balance will be preferred: ERC20 transfers will only
     * be made for the difference between the requested amount and Internal Balance (if any). Note that ETH cannot be
     * withdrawn from Internal Balance: attempting to do so will trigger a revert.
     *
     * This causes the Vault to call the `IBasePool.onJoinPool` hook on the Pool's contract, where Pools implement
     * their own custom logic. This typically requires additional information from the user (such as the expected number
     * of Pool shares). This can be encoded in the `userData` argument, which is ignored by the Vault and passed
     * directly to the Pool's contract, as is `recipient`.
     *
     * Emits a `PoolBalanceChanged` event.
     */
    function joinPool(
        bytes32 poolId,
        address sender,
        address recipient,
        JoinPoolRequest memory request
    ) external payable;

    struct JoinPoolRequest {
        address[] assets;
        uint256[] maxAmountsIn;
        bytes userData;
        bool fromInternalBalance;
    }
}

contract BalancerLiquidityMigrator is OlympusAccessControlled {
    using SafeERC20 for IERC20;

    // Balancer Vault
    IBalancerVault internal immutable balancerVault = IBalancerVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    // Olympus Treasury
    ITreasury internal immutable treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);

    // Sushiswap Router
    IUniswapV2Router internal immutable router = IUniswapV2Router(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    // Balancer 50OHM-25DAI-25WETH poolID
    bytes32 internal immutable balancerPoolID = 0xc45d42f801105e861e86658648e3678ad7aa70f900010000000000000000011e;

    address internal immutable OHMETHSLP = 0x69b81152c5A8d35A67B32A4D3772795d96CaE4da;
    address internal immutable OHMDAISLP = 0x055475920a8c93CfFb64d039A8205F7AcC7722d3;
    address internal immutable OHM = 0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5;
    address internal immutable WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal immutable DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    /**
     * @notice Removes liquidity from OHM/ETH SLP and OHM/DAI SLP, then adds liquidty to
     * 50OHM-25DAI-25WETH Balancer pool.
     */
    function moveLiquidity(
        uint256 _amountOHMETH,
        uint256 _amountOHMDAI,
        uint256[2] memory _minOHMETH,
        uint256[2] memory _minOHMDAI,
        uint256 _deadline,
        bytes memory _userData
    ) external onlyGuardian {
        // Manage LPs from treasury
        treasury.manage(OHMETHSLP, _amountOHMETH);
        treasury.manage(OHMDAISLP, _amountOHMDAI);

        // Approve LPs to be spent by the Sushiswap router
        IERC20(OHMETHSLP).approve(address(router), _amountOHMETH);
        IERC20(OHMDAISLP).approve(address(router), _amountOHMDAI);

        // Remove specified liquidity from OHM/ETH SLP
        (uint256 amountETH, uint256 amountOHM1) = router.removeLiquidity(
            WETH,
            OHM,
            _amountOHMETH,
            _minOHMETH[0],
            _minOHMETH[1],
            address(this),
            _deadline
        );

        // Remove specified liquidity from OHM/DAI SLP
        (uint256 amountDAI, uint256 amountOHM2) = router.removeLiquidity(
            DAI,
            OHM,
            _amountOHMDAI,
            _minOHMDAI[0],
            _minOHMDAI[1],
            address(this),
            _deadline
        );

        // Amount of OHM removed from liquidity
        uint256 amountOHM = amountOHM1 + amountOHM2;

        // Approve Balancer vault to spend tokens
        IERC20(OHM).approve(address(balancerVault), amountOHM);
        IERC20(WETH).approve(address(balancerVault), amountETH);
        IERC20(DAI).approve(address(balancerVault), amountDAI);

        // Array of tokens that liquidty will be added for
        address[] memory tokens = new address[](3);
        tokens[0] = OHM;
        tokens[1] = DAI;
        tokens[2] = WETH;

        // Max amount of each token that liquidity will be added for
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = amountOHM;
        amounts[1] = amountDAI;
        amounts[2] = amountETH;

        // Struct that is passed in when adding to the pool
        IBalancerVault.JoinPoolRequest memory poolRequest = IBalancerVault.JoinPoolRequest(
            tokens,
            amounts,
            _userData,
            false
        );

        // Add liquidity to the Balancer pool
        balancerVault.joinPool(balancerPoolID, address(this), address(treasury), poolRequest);

        // Send any leftover OHM back to guardian and WETH and DAI to treasury
        IERC20(OHM).safeTransfer(authority.guardian(), amountOHM);
        IERC20(WETH).safeTransfer(address(treasury), amountETH);
        IERC20(DAI).safeTransfer(address(treasury), amountDAI);
    }
}
