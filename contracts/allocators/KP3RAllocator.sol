// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/OlympusAccessControlled.sol";

interface IKP3RVault {
    // Create lock for KP3R
    function create_lock(
        uint256 _value,
        uint256 _unlock_time
    ) external;

    // Increase amount of KP3R
     function increase_amount(
        uint256 _value
    ) external;

    // Increase unlock time
     function increase_unlock_time(
        uint256 _unlock_time
    ) external;

    // Withdraw once lock is over
     function withdraw() external;
}

interface IGauge {

    function vote(address[] calldata _tokenVote, uint256[] calldata _weights) external;

}

contract KP3RAllocator is OlympusAccessControlled {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLES ======== */

    // KP3RVault deposit contract
    IKP3RVault internal immutable KP3RVault = IKP3RVault(0x2FC52C61fB0C03489649311989CE2689D93dC1a2); 
    // Foxed Forex Gauge contract
    IGauge internal immutable gauge = IGauge(0x81a8CAb6bb568fC94bCa70C9AdbFCF05592dEd7b);
    // Olympus Treasury
    ITreasury internal treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef); 

    address internal immutable KP3R = 0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44;


    /* ======== CONSTRUCTOR ======== */

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    /* ======== POLICY FUNCTIONS ======== */

    function updateTreasury() external onlyGuardian {
        require(authority.vault() != address(0), "Zero address: Vault");
        require(address(authority.vault()) != address(treasury), "No change");
        treasury = ITreasury(authority.vault());
    }

    /**
     * @notice withdraws KP3R from treasury and creates vault
     */
    function createLock(uint256 amount, uint256 unlockTime) external onlyGuardian {

        // retrieve amount of KP3R from treasury
        treasury.manage(KP3R, amount); 

        // approve and deposit into curve
        IERC20(KP3R).approve(address(KP3RVault), amount); 

        KP3RVault.create_lock(amount, unlockTime);
    }

    /**
     * @notice withdraws KP3R from treasury and adds to already created vault
     */
    function increaseAmount(uint256 amount) external onlyGuardian {

        // retrieve amount of KP3R from treasury
        treasury.manage(KP3R, amount); 

        // approve and deposit into curve
        IERC20(KP3R).approve(address(KP3RVault), amount); 

        KP3RVault.increase_amount(amount);
    }

    /**
     * @notice Increases lock time on vault
     */
    function increaseLockTime(uint256 unlockTime) external onlyGuardian {

        KP3RVault.increase_unlock_time(unlockTime);
    }

    /**
     * @notice After timelock is over withdraw KP3R to treasury
     */
    function withdraw() external onlyGuardian {
        KP3RVault.withdraw();

        uint amount = IERC20(KP3R).balanceOf(address(this));

        IERC20(KP3R).transfer(address(treasury), amount);
    }


    /**
     * @notice Vote in Fixed Forex Gauge
     */
    function vote(address[] calldata _tokenVote, uint[] calldata _weights) external onlyGuardian {
        gauge.vote(_tokenVote, _weights);
    }

}