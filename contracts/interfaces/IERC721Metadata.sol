// SPDX-License-Identifier: WTFPL
pragma solidity 0.7.5;

import "./IERC721.sol";

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
