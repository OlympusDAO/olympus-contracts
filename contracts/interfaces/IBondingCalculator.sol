// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface IBondingCalculator {
    function markdown(address _LP) external view returns (uint256);

    function valuation(address pair_, uint256 amount_) external view returns (uint256 _value);
}
