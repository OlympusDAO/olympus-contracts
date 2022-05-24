// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IERC20.sol";

interface IProNoteKeeper {
    // Info for market note
    struct Note {
        uint256 payout; // gOHM remaining to be paid
        uint48 created; // time market was created
        uint48 matured; // timestamp when market is matured
        uint48 redeemed; // time market was redeemed
        uint48 marketID; // market ID of deposit. uint48 to avoid adding a slot.
        address token; // token to be paid.
    }

    function redeem(address _user, uint256[] memory _indexes) external;

    function redeemAll(address _user) external;

    function pushNote(address to, uint256 index) external;

    function pullNote(address from, uint256 index) external returns (uint256 newIndex_);

    function indexesFor(address _user) external view returns (uint256[] memory);

    function pendingFor(address _user, uint256 _index) external view returns (uint256 payout_, bool matured_);
}
