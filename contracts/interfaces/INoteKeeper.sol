// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.7.5;

interface INoteKeeper {
    // Info for market note
    struct Note {
        uint256 payout; // gOHM remaining to be paid
        uint48 created; // time market was created
        uint48 matured; // timestamp when market is matured
        uint48 redeemed; // time market was redeemed
        uint48 marketID; // market ID of deposit. uint48 to avoid adding a slot.
    }

    function redeem(
        address _user,
        uint256[] memory _indexes,
        bool _sendgOHM
    ) external returns (uint256);

    function redeemAll(address _user, bool _sendgOHM) external returns (uint256);

    function pushNote(address to, uint256 index) external;

    function pullNote(address from, uint256 index) external returns (uint256 newIndex_);

    function indexesFor(address _user) external view returns (uint256[] memory);

    function pendingFor(address _user, uint256 _index) external view returns (uint256 payout_, bool matured_);
}
