// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./Ownable.sol";


contract PolicyOwnable is Ownable {
    modifier onlyPolicy() {
        require( _owner == msg.sender, "PolicyOwnable: caller is not Policy" );
        _;
    }
}