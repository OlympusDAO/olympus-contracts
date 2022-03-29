// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

interface ICurvePool {
    function add_liquidity(
        uint256[2] memory amounts,
        uint256 min_mint_amount,
        bool use_eth,
        address receiver
    ) external payable returns (uint256);
}

contract CurveStrategy {
    ICurvePool curve;
    address incurDebtAddress;

    constructor(address _curve, address _incurDebtAddress) {
        curve = ICurvePool(_curve);
        incurDebtAddress = _incurDebtAddress;
    }

    function addLiquidity(bytes memory _data) external returns (uint256 liquidity) {
        (uint256[2] memory amounts, uint256 min_mint_amount, bool use_eth, address receiver) = abi.decode(
            _data,
            (uint256[2], uint256, bool, address)
        );

        (liquidity) = curve.add_liquidity(amounts, min_mint_amount, use_eth, receiver);
    }

    function removeLiquidity(bytes memory _data) external {}
}
