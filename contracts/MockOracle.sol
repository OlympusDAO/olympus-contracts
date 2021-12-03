// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/IOracle.sol";

contract Oracle is IOracle {

    uint256 public price;

    function getLatestPrice() external view override returns (uint256) {
        return price;
    }

    function setPrice(uint256 _price) external override {
        price = _price;
    }
}