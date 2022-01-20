pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../interfaces/IBondDepository.sol";

contract FixedTermERC1155 is ERC1155 {

    // Bond depository
    IBondDepository internal immutable bondDepository = IBondDepository(0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6);

    constructor(string memory _name) ERC1155(_name) {}
}