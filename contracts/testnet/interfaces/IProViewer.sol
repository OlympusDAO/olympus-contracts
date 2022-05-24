// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

interface IProViewer {
    function isLive(uint256 _bid) external view returns (bool);

    function liveMarkets() external view returns (uint256[] memory);

    function liveMarketsFor(
        bool _creator,
        bool _base,
        address _address
    ) external view returns (uint256[] memory);

    function payoutFor(uint256 _amount, uint256 _bid) external view returns (uint256);

    function marketPrice(uint256 _bid) external view returns (uint256);

    function currentDebt(uint256 _bid) external view returns (uint256);
}
