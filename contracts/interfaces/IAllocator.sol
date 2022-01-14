pragma solidity ^0.8.10;

interface IAllocator {
    function tokenAllocated() external view returns (address);
}
