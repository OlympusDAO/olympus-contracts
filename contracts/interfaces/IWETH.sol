// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

import "./IERC20.sol";
interface IWETH is IERC20 {

    function deposit() external payable;

    function withdraw(uint) external;

}