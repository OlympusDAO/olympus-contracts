// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IUniswapV2Router.sol";
import "../../interfaces/IERC20.sol";
import "../../libraries/SafeERC20.sol";

contract UniSwapStrategy {
    using SafeERC20 for IERC20;

    IUniswapV2Router router;
    address incurDebtAddress;
    address ohmAddress;

    constructor(address _router, address _incurDebtAddress, address _ohmAddress) {
        router = IUniswapV2Router(_router);
        incurDebtAddress = _incurDebtAddress;
        ohmAddress = _ohmAddress;

        //preapproveOhm
    }

    function addLiquidity(bytes memory _data, uint256 _ohmAmount, uint256 _pairTokenAmount, address _user) external returns (uint256 liquidity, uint256 ohmUnused, address lpTokenAddress) {

        // enforce caller is incurDebt contract
    
        (
            address tokenA,
            address tokenB,
            uint256 amountADesired,
            uint256 amountBDesired,
            uint256 amountAMin,
            uint256 amountBMin,
            uint256 slippage
        ) = abi.decode(_data, (address, address, uint256, uint256, uint256, uint256, uint256));

        if (tokenA == ohmAddress) {
            //preapprove token B to router
            //require amountA and amountB equal to ohmAmount and pairTokenAmount
            IERC20(tokenA).safeTransferFrom(incurDebtAddress, address(this), _ohmAmount);
            IERC20(tokenB).safeTransferFrom(_user, address(this), _pairTokenAmount);
        } else if (tokenB == ohmAddress) {
            //preapprove token A to router
            //require amountA and amountB equal to ohmAmount and pairTokenAmount
            IERC20(tokenB).safeTransferFrom(incurDebtAddress, address(this), _ohmAmount);
            IERC20(tokenA).safeTransferFrom(_user, address(this), _pairTokenAmount);
        } else {
            // revert
        }

        uint256 amountA;
        uint256 amountB;

        (amountA, amountB, liquidity) = router.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            (amountAMin * slippage) / 1000,
            (amountBMin * slippage) / 1000,
            incurDebtAddress,
            block.timestamp
        );

        uint256 amountALeftover = amountADesired - amountA;
        uint256 amountBLeftover = amountBDesired - amountB;

        // use uniswap to get which is token a or b.
        if (tokenA == ohmAddress) { // Return leftover ohm to incurdebt and pair token to user
            ohmUnused = amountALeftover;
            if (amountALeftover > 0) {
                IERC20(ohmAddress).safeTransfer(incurDebtAddress, amountALeftover);
            }
            
            if (amountBLeftover > 0) {
                IERC20(tokenB).safeTransfer(_user, amountBLeftover);
            }
        } else {
            ohmUnused = amountBLeftover;
            if (amountBLeftover > 0) {
                IERC20(ohmAddress).safeTransfer(incurDebtAddress, amountBLeftover);
            }
            
            if (amountALeftover > 0) {
                IERC20(tokenA).safeTransfer(_user, amountALeftover);
            }
        }

        //Might need to use uniswapv2 library to get lp token address and return it as well
    }

    function removeLiquidity(bytes memory _data) external {
        (
            address tokenA,
            address tokenB,
            uint256 liquidity,
            uint256 amountAMin,
            uint256 amountBMin,
            address to,
            uint256 deadline,
            uint256 slippage
        ) = abi.decode(_data, (address, address, uint256, uint256, uint256, address, uint256, uint256));

        require(to == incurDebtAddress);

        router.removeLiquidity(
            tokenA,
            tokenB,
            liquidity,
            (amountAMin * slippage) / 1000,
            (amountBMin * slippage) / 1000,
            to,
            deadline
        );
    }
}
