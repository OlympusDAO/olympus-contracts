// SPDX-License-Identifier: WTFPL
pragma solidity 0.7.5;

import "../interfaces/IERC165.sol";

abstract contract ERC165 is IERC165 {
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}
