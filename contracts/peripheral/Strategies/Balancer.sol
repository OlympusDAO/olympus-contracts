// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IERC20.sol";
import "../../libraries/SafeERC20.sol";
import "../../interfaces/IStrategy.sol";
import "../../interfaces/IBalancerVault.sol";

error BalancerStrategy_NotIncurDebtAddress();
error BalancerStrategy_AmountDoesNotMatch();
error BalancerStrategy_LPTokenDoesNotMatch();
error BalancerStrategy_OhmAddressNotFound();

/**
    @title BalancerStrategy
    @notice This contract provides liquidity to balancer on behalf of IncurDebt contract.
 */
contract BalancerStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IVault vault;

    address incurDebtAddress;
    address ohmAddress;

    constructor(
        address _vault,
        address _incurDebtAddress,
        address _ohmAddress
    ) {
        vault = IVault(_vault);
        incurDebtAddress = _incurDebtAddress;
        ohmAddress = _ohmAddress;

        IERC20(ohmAddress).approve(_vault, type(uint256).max);
    }

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
        if (msg.sender != incurDebtAddress) revert BalancerStrategy_NotIncurDebtAddress();
        (
            bytes32 poolId,
            address[] memory assets,
            uint256[] memory maxAmountsIn,
            uint256 minimumBPT,
            bool fromInternalBalance
        ) = abi.decode(_data, (bytes32, address[], uint256[], uint256, bool));

        uint256 index = type(uint256).max;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i] == ohmAddress) {
                index = i;
            }
        }

        if (index == type(uint256).max) revert BalancerStrategy_OhmAddressNotFound();
        if (maxAmountsIn[index] != _ohmAmount) revert BalancerStrategy_AmountDoesNotMatch();

        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i] == ohmAddress) {
                IERC20(ohmAddress).safeTransferFrom(incurDebtAddress, address(this), maxAmountsIn[i]);
            } else {
                IERC20(assets[i]).safeTransferFrom(_user, address(this), maxAmountsIn[i]);
                IERC20(assets[i]).approve(address(vault), maxAmountsIn[i]);
            }
        }

        (lpTokenAddress, ) = vault.getPool(poolId);
        uint256 lpBalanceBeforeJoin = IERC20(lpTokenAddress).balanceOf(incurDebtAddress);
        bytes memory userData = abi.encode(1, maxAmountsIn, minimumBPT);

        vault.joinPool(
            poolId,
            address(this),
            incurDebtAddress,
            JoinPoolRequest({
                assets: assets,
                maxAmountsIn: maxAmountsIn,
                userData: userData,
                fromInternalBalance: fromInternalBalance
            })
        );

        uint256 lpBalanceAfterJoin = IERC20(lpTokenAddress).balanceOf(incurDebtAddress);
        liquidity = lpBalanceAfterJoin - lpBalanceBeforeJoin;
    }

    function removeLiquidity(
        bytes memory _data,
        uint256 _liquidity,
        address _lpTokenAddress,
        address _user
    ) external returns (uint256 ohmRecieved) {
        if (msg.sender != incurDebtAddress) revert BalancerStrategy_NotIncurDebtAddress();
        (bytes32 poolId, address[] memory assets, uint256[] memory minAmountsOut, bool toInternalBalance) = abi.decode(
            _data,
            (bytes32, address[], uint256[], bool)
        );

        (address lpTokenAddress, ) = vault.getPool(poolId);
        if (_lpTokenAddress != lpTokenAddress) revert BalancerStrategy_LPTokenDoesNotMatch();

        bytes memory userData = abi.encode(1, _liquidity);

        vault.exitPool(
            poolId,
            address(this),
            payable(address(this)),
            ExitPoolRequest({
                assets: assets,
                minAmountsOut: minAmountsOut,
                userData: userData,
                toInternalBalance: toInternalBalance
            })
        );

        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i] == ohmAddress) {
                ohmRecieved = IERC20(ohmAddress).balanceOf(address(this));
                IERC20(ohmAddress).safeTransfer(incurDebtAddress, ohmRecieved);
            } else {
                uint256 balance = IERC20(assets[i]).balanceOf(address(this));
                IERC20(assets[i]).safeTransfer(_user, balance);
            }
        }
    }
}
