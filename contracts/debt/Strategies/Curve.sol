// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IERC20.sol";
import "../interfaces/IStrategy.sol";
import "../../libraries/SafeERC20.sol";

interface ICurvePool {
    function add_liquidity(
        uint256[2] memory _deposit_amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);

    function remove_liquidity(
        uint256 _burn_amount,
        uint256[2] memory _min_amounts
    ) external returns (uint256[2] memory);

    function coins(uint256 index) external view returns (address);
}

error CurveStrategy_NotIncurDebtAddress();
error CurveStrategy_AmountsDoNotMatch();
error CurveStrategy_LPTokenDoesNotMatch();
error CurveStrategy_OhmAddressNotFound();

contract CurveStrategy is IStrategy {
    using SafeERC20 for IERC20;

    ICurvePool curve;
    address public immutable incurDebtAddress;
    address public immutable ohmAddress;
    address public pairTokenAddress;
    uint256 public ohmAddressIndex;
    uint256 public pairTokenAddressIndex;

    constructor(address _curve, address _incurDebtAddress, address _ohmAddress) {
        curve = ICurvePool(_curve);
        incurDebtAddress = _incurDebtAddress;
        ohmAddress = _ohmAddress;

        if (curve.coins(0) == ohmAddress) {
            pairTokenAddress = curve.coins(1);
            ohmAddressIndex = 0;
            pairTokenAddressIndex = 1;
        } else if (curve.coins(1) == ohmAddress) {
            pairTokenAddress = curve.coins(0);
            ohmAddressIndex = 1;
            pairTokenAddressIndex = 0;
        } else {
            revert CurveStrategy_OhmAddressNotFound();
        }

        IERC20(ohmAddress).approve(_curve, type(uint256).max);
        IERC20(pairTokenAddress).approve(_curve, type(uint256).max);
    }

    function addLiquidity(
        bytes memory _data,
        uint256 _ohmAmount,
        uint256 _pairTokenAmount,
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

        (uint256[2] memory amounts, uint256 min_mint_amount) = abi.decode(
            _data,
            (uint256[2], uint256)
        );

        if (_ohmAmount != amounts[ohmAddressIndex] || _pairTokenAmount != amounts[_pairTokenAmount]) revert CurveStrategy_AmountsDoNotMatch();

        IERC20(ohmAddress).safeTransferFrom(incurDebtAddress, address(this), _ohmAmount);
        IERC20(pairTokenAddress).safeTransferFrom(_user, address(this), _pairTokenAmount);

        liquidity = curve.add_liquidity(amounts, min_mint_amount); // Ohm unused will be 0 since curve uses up all input tokens for LP.

        lpTokenAddress = address(this); // For factory pools on curve, the LP token is the pool contract.
    }

    function removeLiquidity(
        bytes memory _data,
        uint256 _liquidity,
        address _lpTokenAddress,
        address _user
    ) external returns (uint256 ohmRecieved) {
        if (msg.sender != incurDebtAddress) revert CurveStrategy_NotIncurDebtAddress();

        (uint256 _burn_amount, uint256[2] memory _min_amounts) = abi.decode(
            _data,
            (uint256, uint256[2])
        );

        if (_burn_amount != _liquidity) revert CurveStrategy_AmountsDoNotMatch();
        if (_lpTokenAddress != address(this)) revert CurveStrategy_LPTokenDoesNotMatch();

        // probably dont need to but test if need approve token to pool before remove lp. if all good remove this comment.

        uint256[2] memory resultAmounts = curve.remove_liquidity(_burn_amount, _min_amounts);
        ohmRecieved = resultAmounts[ohmAddressIndex];
        IERC20(ohmAddress).safeTransfer(incurDebtAddress, ohmRecieved);
        IERC20(pairTokenAddress).safeTransfer(_user, resultAmounts[pairTokenAddressIndex]);
    }


}
