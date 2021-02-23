// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../../dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/periphery/libraries/UniswapV2Library.sol";

import "./Bursar.sol";

contract Sales is Bursar {
    using SafeMath for uint256;

    address private OLY = 0xa2AAe53531752161D30E314ad7D25FBaaC3E6e27;
    address private DAI = 0x9Be2Bb1f46c3fE215F7359DCCa45F2dd2EA11a65;
    address internal UNISWAP_PAIR_ADDRESS =
        0xF580E3B7D47c5dc22171aE3716ef2313f37831ED;
    address internal UNISWAP_FACTORY_ADDRESS =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    IUniswapV2Pair public uniswapV2Pair;
    IERC20 public oly;
    IERC20 public dai;

    bytes32 constant olyB =
        0x6f6c790000000000000000000000000000000000000000000000000000000000;
    bytes32 constant daiB =
        0x6461690000000000000000000000000000000000000000000000000000000000;

    address[] path0 = [DAI, OLY];
    address[] path1 = [OLY, DAI];

    uint256 currentPric;

    constructor() {
        oly = IERC20(OLY);
        dai = IERC20(DAI);
        uniswapV2Pair = IUniswapV2Pair(UNISWAP_PAIR_ADDRESS);
    }

    function setPrice(uint256 price) public {
        currentPric = price;
    }

    function sort(address tokenA, address tokenB)
        public
        pure
        returns (address token0, address token1)
    {
        (token0, token1) = UniswapV2Library.sortTokens(tokenA, tokenB);
    }

    function getPrice(uint256 tokenToSell, bytes32 ticker)
        public
        returns (uint256 amountBefore1$Threshold, uint256 currentPrice)
    {
        // get price from TWAP oracle for testing price is gotten from setPrice();
        if (ticker == olyB) {
            uint256 price; // gets OLY price from TWAP, using currentPric for testing
            (amountBefore1$Threshold, currentPrice) = priceCal(
                tokenToSell,
                totalOlyTokenToSellForTheNext8Hrs,
                currentPric
            );
            totalOlyTokenToSellForTheNext8Hrs = totalOlyTokenToSellForTheNext8Hrs
                .sub(amountBefore1$Threshold);
        }

        if (ticker == daiB) {
            uint256 price; // gets DAI price from TWAP, using currentPric for testing
            (amountBefore1$Threshold, currentPrice) = priceCal(
                tokenToSell,
                totalDAITokenToSellForTheNext8Hrs,
                currentPric
            );
            totalDAITokenToSellForTheNext8Hrs = totalDAITokenToSellForTheNext8Hrs
                .sub(amountBefore1$Threshold);
        }
    }

    function priceCal(
        uint256 tokenToSell,
        uint256 totalToken,
        uint256 currentPrice
    ) internal pure returns (uint256 amountBefore1$Threshold, uint256) {
        uint256 tokenToSend = (tokenToSell.mul(currentPrice)) / (1000);

        if (tokenToSend > totalToken) {
            uint256 totalTokenShort = tokenToSend.sub(totalToken);
            amountBefore1$Threshold = tokenToSend.sub(totalTokenShort);
        }

        if (tokenToSend < totalToken) {
            amountBefore1$Threshold = tokenToSend;
        }

        return (amountBefore1$Threshold, currentPrice);
    }

    function amountOut(bytes32 ticker, uint256 amountIn)
        public
        view
        returns (uint256[] memory amount)
    {
        if (ticker == olyB) {
            amount = UniswapV2Library.getAmountsOut(
                UNISWAP_FACTORY_ADDRESS,
                amountIn,
                path0
            );
        }

        if (ticker == daiB) {
            amount = UniswapV2Library.getAmountsOut(
                UNISWAP_FACTORY_ADDRESS,
                amountIn,
                path1
            );
        }
    }

    function swap(
        bytes32 ticker,
        uint256 tokenAmount,
        IERC20 sellToken,
        IERC20 buyToken
    ) internal {
        (uint256 amountBefore1$Threshold, uint256 currentP) =
            getPrice(tokenAmount, ticker);

        sellToken.transferFrom(msg.sender, address(this), tokenAmount);

        if (amountBefore1$Threshold > 0) {
            buyToken.transfer(msg.sender, amountBefore1$Threshold);

            uint256 tokenTaken =
                (amountBefore1$Threshold.mul(1000)) / (currentP);

            uint256 tokenLeft = tokenAmount.sub(tokenTaken);

            if (tokenLeft > 0) {
                sellToken.transfer(UNISWAP_PAIR_ADDRESS, tokenLeft);
                uint256[] memory amount = amountOut(ticker, tokenLeft);

                // slippage of 0.5%
                uint256 slippageTolerance = (amount[1].mul(5)) / (1000);

                uint256 tokenReceived = amount[1] - slippageTolerance;
                if (ticker == olyB) {
                    uniswapV2Pair.swap(
                        0,
                        tokenReceived,
                        msg.sender,
                        new bytes(0)
                    );
                } else {
                    uniswapV2Pair.swap(
                        tokenReceived,
                        0,
                        msg.sender,
                        new bytes(0)
                    );
                }
            }
        } else {
            sellToken.transfer(UNISWAP_PAIR_ADDRESS, tokenAmount);

            uint256[] memory amount = amountOut(ticker, tokenAmount);

            // slippage of 0.5%
            uint256 slippageTolerance = (amount[1].mul(5)) / (1000);

            uint256 tokenReceived = amount[1] - slippageTolerance;

            if (ticker == olyB) {
                uniswapV2Pair.swap(0, tokenReceived, msg.sender, new bytes(0));
            } else {
                uniswapV2Pair.swap(tokenReceived, 0, msg.sender, new bytes(0));
            }
        }
    }

    function buy(string calldata _ticker, uint256 tokenAmount) external {
        bytes32 ticker = stringToBytes32(_ticker);
        require(ticker == olyB || ticker == daiB, "ticker not found");

        if (ticker == olyB) {
            swap(ticker, tokenAmount, dai, oly);
        }
        if (ticker == daiB) {
            swap(ticker, tokenAmount, oly, dai);
        }
    }

    //HELPER FUNCTION

    // CONVERT STRING TO BYTES32

    function stringToBytes32(string memory _source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(_source);
        string memory tempSource = _source;

        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(tempSource, 32))
        }
    }
}
