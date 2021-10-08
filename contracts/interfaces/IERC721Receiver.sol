// SPDX-License-Identifier: WTFPL
pragma solidity 0.7.5;

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external 
        returns (bytes4);
}
