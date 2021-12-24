// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./IOHM.sol";
import "./IsOHM.sol";
import "./IgOHM.sol";
import "./ITreasury.sol";
import "./IStaking.sol";
import "./IDistributor.sol";
import "./IDepository.sol";
import "./IOlympusAuthority.sol";

interface IOlympusDirectory {
    function ohm() external view returns (IOHM);
    function sOHM() external view returns (IsOHM);
    function gOHM() external view returns (IgOHM);
    function treasury() external view returns (ITreasury);
    function staking() external view returns (IStaking);
    function auth() external view returns (IOlympusAuthority);
    function dao() external view returns (address);
}