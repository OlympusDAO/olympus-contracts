// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

import "./ITreasury.sol";

interface IMigrator {
    enum TYPE {UNSTAKED, STAKED, WRAPPED}
    function migrate(
        uint256 _amount,
        TYPE _from,
        TYPE _to
    ) external;

    function migrateAll(TYPE _to) external;

    function bridgeBack(uint256 _amount, TYPE _to) external;

    function halt() external;

    function newTreasury() external view returns (ITreasury);

    function defund(address reserve) external;

    function startTimelock() external;

    function setgOHM(address _gOHM) external;

    function migrateToken(address token) external;

    function migrateLP(
        address pair,
        bool sushi,
        address token,
        uint256 _minA,
        uint256 _minB
    ) external;

    function withdrawToken(
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external;

    function migrateContracts(
        address _newTreasury,
        address _newStaking,
        address _newOHM,
        address _newsOHM,
        address _reserve
    ) external;
}