// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

interface IGuardable {
    function guardian() external view returns (address);

    function renounceGuardian() external;

    function pushGuardian(address newGuardian_) external;

    function pullGuardian() external;
}
