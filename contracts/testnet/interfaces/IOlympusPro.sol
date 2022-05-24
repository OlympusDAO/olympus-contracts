// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "./IProMarketCreator.sol";
import "./IProNoteKeeper.sol";
import "./IProViewer.sol";

interface IOlympusPro is IProMarketCreator, IProNoteKeeper, IProViewer {
    /**
     * @notice deposit quote tokens in exchange for a bond in a specified market
     */
    function deposit(
        uint48 _id,
        uint256[2] memory _amounts,
        address[2] memory _addresses
    )
        external
        returns (
            uint256 payout_,
            uint256 expiry_,
            uint256 index_
        );
}
