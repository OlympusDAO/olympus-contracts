pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct V3Params {
    uint24[] fees;
    address[] path;
    address denomination;
    address recipient;
    uint256 deadline;
    uint256 amount;
    uint256 slippage;
}

struct V2Params {
    address router;
    address[] path;
    address denomination;
    address recipient;
    uint256 deadline;
    uint256 amount;
    uint256 slippage;
}

error OlympuusLinkswap_WrongV3PathLength();
error OlympusLinkswap_ApproveFailed();
error OlympusLinkswap_TransferFromFailed();
error OlympusLinkswap_TransferFailed();

contract OlympusChainlinkBasedSwapper {
    FeedRegistryInterface public registry;
    ISwapRouter public v3SwapRouter;

    constructor(address _registry, address _v3SwapRouter) {
        registry = FeedRegistryInterface(_registry);
        v3SwapRouter = ISwapRouter(_v3SwapRouter);
    }

    function v3ExactInput(V3Params calldata params) external returns (uint256 amountOut) {
        amountOut = _exact(params, true);
    }

    function v3ExactOutput(V3Params calldata params) external returns (uint256 amountIn) {
        amountIn = _exact(params, false);
    }

    function v2Swap(V2Params calldata params) external {
        // reads
        address inputToken = params.path[0];
        address out = params.path[params.path.length - 1];
        IUniswapV2Router02 router = IUniswapV2Router02(params.router);
        address denomination = (params.denomination == address(0)) ? Denominations.USD : params.denomination;

        // interactions + checks
        // didn't abstract to keep readable

        bool check = IERC20(params.path[0]).transferFrom(msg.sender, address(this), params.amount);

        if (!check) revert OlympusLinkswap_TransferFromFailed();

        check = IERC20(params.path[0]).approve(params.router, params.amount);

        if (!check) revert OlympusLinkswap_ApproveFailed();

        // big interaction
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            params.amount,
            _calcAmountMin(inputToken, out, denomination, params.slippage, params.amount),
            params.path,
            params.recipient,
            (params.deadline == 0) ? block.timestamp : params.deadline
        );

        // cleanup
        _clean(inputToken);
    }

    function _exact(V3Params calldata params, bool isIn) internal returns (uint256 amount) {
        // reads + calcs
        address inputToken = params.path[0];
        address out = params.path[params.path.length - 1];
        address denomination = (params.denomination == address(0)) ? Denominations.USD : params.denomination;

        // checks
        if (params.path.length - 1 != params.fees.length) revert OlympuusLinkswap_WrongV3PathLength();

        // interactions + checks

        bool check = IERC20(params.path[0]).transferFrom(msg.sender, address(this), params.amount);

        if (!check) revert OlympusLinkswap_TransferFromFailed();

        check = IERC20(params.path[0]).approve(address(v3SwapRouter), params.amount);

        if (!check) revert OlympusLinkswap_ApproveFailed();

        // big interaction
        if (!isIn) {
            amount = v3SwapRouter.exactOutput(
                ISwapRouter.ExactOutputParams({
                    path: _encode(params.fees.length, params.path, params.fees),
                    recipient: params.recipient,
                    deadline: (params.deadline == 0) ? block.timestamp : params.deadline,
                    amountOut: _calcAmountMin(inputToken, out, denomination, params.slippage, params.amount),
                    amountInMaximum: params.amount
                })
            );
        } else {
            amount = v3SwapRouter.exactInput(
                ISwapRouter.ExactInputParams({
                    path: _encode(params.fees.length, params.path, params.fees),
                    recipient: params.recipient,
                    deadline: (params.deadline == 0) ? block.timestamp : params.deadline,
                    amountIn: params.amount,
                    amountOutMinimum: _calcAmountMin(inputToken, out, denomination, params.slippage, params.amount)
                })
            );
        }

        // cleanup
        _clean(inputToken);
    }

    // @notice
    function _clean(address inputToken) internal {
        bool check = IERC20(inputToken).transfer(msg.sender, IERC20(inputToken).balanceOf(address(this)));
        if (!check) revert OlympusLinkswap_TransferFailed();
    }

    function _calcAmountMin(
        address inputToken,
        address out,
        address denom,
        uint256 slippage,
        uint256 amount
    ) internal view returns (uint256 amountMin) {
        uint256 inPrice = uint256(_latestPrice(inputToken, denom));
        uint256 outPrice = uint256(_latestPrice(out, denom));

        // slippage must be normalized to 1e18
        amountMin = (amount * inPrice * slippage) / (slippage * outPrice);
    }

    function _latestPrice(address base, address quote) internal view returns (int256 price) {
        (, price, , , ) = registry.latestRoundData(base, quote);
    }

    function _encode(
        uint256 pairs,
        address[] calldata tokens,
        uint24[] calldata poolFees
    ) internal pure returns (bytes memory path) {
        if (pairs == 1) {
            path = abi.encodePacked(tokens[0], poolFees[0], tokens[1]);
        } else if (pairs == 2) {
            path = abi.encodePacked(tokens[0], poolFees[0], tokens[1], poolFees[1], tokens[2]);
        } else if (pairs == 3) {
            path = abi.encodePacked(tokens[0], poolFees[0], tokens[1], poolFees[1], tokens[2], poolFees[2], tokens[3]);
        } else if (pairs == 4) {
            path = abi.encodePacked(
                tokens[0],
                poolFees[0],
                tokens[1],
                poolFees[1],
                tokens[2],
                poolFees[2],
                tokens[3],
                poolFees[3],
                tokens[4]
            );
        } else if (pairs == 5) {
            path = abi.encodePacked(
                tokens[0],
                poolFees[0],
                tokens[1],
                poolFees[1],
                tokens[2],
                poolFees[2],
                tokens[3],
                poolFees[3],
                tokens[4],
                poolFees[4],
                tokens[5]
            );
        }
    }
}
