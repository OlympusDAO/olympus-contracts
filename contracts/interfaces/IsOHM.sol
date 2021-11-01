// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../types/ERC20Permit.sol";

abstract contract IsOHM is ERC20Permit {
    function rebase( uint256 ohmProfit_, uint epoch_) public virtual returns (uint256);

    function circulatingSupply() public view virtual returns (uint256);

//    function balanceOf(address who) external override view returns (uint256);

    function gonsForBalance( uint amount ) public view virtual returns ( uint );

    function balanceForGons( uint gons ) public view virtual returns ( uint );

    function index() public view virtual returns ( uint );
}
