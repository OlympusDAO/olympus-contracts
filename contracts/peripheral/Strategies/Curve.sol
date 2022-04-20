// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IERC20.sol";
import "../../libraries/SafeERC20.sol";
import "../../interfaces/IStrategy.sol";

interface ICurvePool {
    function add_liquidity(uint256[2] memory _deposit_amounts, uint256 _min_mint_amount) external returns (uint256);

    function remove_liquidity(uint256 _burn_amount, uint256[2] memory _min_amounts)
        external
        returns (uint256[2] memory);
}

interface ICurveFactory {
    function get_coins(address _pool) external view returns (address[8] memory);
}

error CurveStrategy_NotIncurDebtAddress();
error CurveStrategy_AmountsDoNotMatch();
error CurveStrategy_LPTokenDoesNotMatch();
error CurveStrategy_OhmAddressNotFound();

/**
    @title CurveStrategy
    @notice This contract provides liquidity to curve on behalf of IncurDebt contract.
 */
contract CurveStrategy is IStrategy {
    using SafeERC20 for IERC20;

    ICurveFactory factory;
    address public immutable incurDebtAddress;
    address public immutable ohmAddress;

    constructor(
        address _incurDebtAddress,
        address _ohmAddress,
        address _factory
    ) {
        factory = ICurveFactory(_factory);
        incurDebtAddress = _incurDebtAddress;
        ohmAddress = _ohmAddress;
    }

    /**
     * @dev Make sure input amounts is in the same order as the order of the tokens in the pool when calling get_coins
     */
    function addLiquidity(
        bytes memory _data,
        uint256 _ohmAmount,
        address _user
    )
        external
        returns (
            uint256 liquidity,
            uint256 ohmUnused,
            address lpTokenAddress
        )
    {
        if (msg.sender != incurDebtAddress) revert CurveStrategy_NotIncurDebtAddress();

        (uint256[2] memory amounts, uint256 min_mint_amount, address pairTokenAddress, address poolAddress) = abi
            .decode(_data, (uint256[2], uint256, address, address));

        address[8] memory poolTokens = factory.get_coins(poolAddress);

        if (poolTokens[0] == ohmAddress) {
            if (poolTokens[1] != pairTokenAddress) revert CurveStrategy_LPTokenDoesNotMatch();
            if (_ohmAmount != amounts[0]) revert CurveStrategy_AmountsDoNotMatch();

            IERC20(ohmAddress).safeTransferFrom(incurDebtAddress, address(this), _ohmAmount);
            IERC20(pairTokenAddress).safeTransferFrom(_user, address(this), amounts[1]);

            IERC20(pairTokenAddress).approve(poolAddress, amounts[1]);
        } else if (poolTokens[1] == ohmAddress) {
            if (poolTokens[0] != pairTokenAddress) revert CurveStrategy_LPTokenDoesNotMatch();
            if (_ohmAmount != amounts[1]) revert CurveStrategy_AmountsDoNotMatch();

            IERC20(ohmAddress).safeTransferFrom(incurDebtAddress, address(this), _ohmAmount);
            IERC20(pairTokenAddress).safeTransferFrom(_user, address(this), amounts[0]);

            IERC20(pairTokenAddress).approve(poolAddress, amounts[0]);
        } else {
            revert CurveStrategy_LPTokenDoesNotMatch();
        }

        liquidity = ICurvePool(poolAddress).add_liquidity(amounts, min_mint_amount); // Ohm unused will be 0 since curve uses up all input tokens for LP.

        lpTokenAddress = poolAddress; // For factory pools on curve, the LP token is the pool contract.
    }

    function removeLiquidity(
        bytes memory _data,
        uint256 _liquidity,
        address _lpTokenAddress,
        address _user
    ) external returns (uint256 ohmRecieved) {
        if (msg.sender != incurDebtAddress) revert CurveStrategy_NotIncurDebtAddress();

        (uint256 _burn_amount, uint256[2] memory _min_amounts) = abi.decode(_data, (uint256, uint256[2]));

        if (_burn_amount != _liquidity) revert CurveStrategy_AmountsDoNotMatch();

        // probably dont need to but test if need approve token to pool before remove lp. if all good remove this comment.

        uint256[2] memory resultAmounts = ICurvePool(_lpTokenAddress).remove_liquidity(_burn_amount, _min_amounts);

        address[8] memory poolTokens = factory.get_coins(_lpTokenAddress);

        if (poolTokens[0] == ohmAddress) {
            ohmRecieved = resultAmounts[0];
            IERC20(poolTokens[1]).safeTransfer(_user, resultAmounts[1]);
        } else {
            ohmRecieved = resultAmounts[1];
            IERC20(poolTokens[0]).safeTransfer(_user, resultAmounts[0]);
        }

        IERC20(ohmAddress).safeTransfer(incurDebtAddress, ohmRecieved);
    }
}
