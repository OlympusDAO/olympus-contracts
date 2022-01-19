// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.7.5;

// See cheatcodes list at https://github.com/dapphub/dapptools/blob/009f850d18b48ef7e994fba3186e0bbafcb02d3b/src/hevm/README.md
// Have only implemented one, can add more as we need from that list
abstract contract Hevm {
    // @notice Sets the block timestamp to x
    function warp(uint256 x) public virtual;

    // @notice Sets the block number to x.
    function roll(uint256) public virtual;
}
