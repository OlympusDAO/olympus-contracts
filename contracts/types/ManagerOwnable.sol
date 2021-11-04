// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.0;

import "./Ownable.sol";

contract ManagerOwnable is Ownable {
    modifier onlyManager() {
        require( _owner == msg.sender, "Ownable: caller is not the owner" );
        _;
    }
}
