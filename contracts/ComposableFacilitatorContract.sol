// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./types/Ownable.sol";

import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";


contract FacilitatorContract is Ownable {
    using SafeERC20 for IERC20;

    mapping( address => bool ) approvedToRecieve;

    function retriveUnderlying( address _asset, uint _amount ) external returns ( bool ) {
        require( approvedToRecieve[ msg.sender ]);

        IERC20( _asset ).safeTransfer( msg.sender, _amount );

        return true;
    }

    function toggleApproved( address _address ) onlyOwner() external returns ( bool ) {
        approvedToRecieve[ _address ] = !approvedToRecieve[ _address ];

        return true;
    }

}