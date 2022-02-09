// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../libraries/SafeMath.sol";

import "../interfaces/IBondingCalculator.sol";

contract BondingCalculatorMock is IBondingCalculator {
    using SafeMath for uint256;

    constructor() {}

    function valuation(address _pair, uint256 amount_) external view override returns (uint256 _value) {
        _value = amount_.mul(2);
    }

    function markdown(address _pair) external view override returns (uint256) {
        return 0;
    }
}
