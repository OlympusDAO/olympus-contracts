// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "../types/OlympusAccessControlled.sol";

interface IREDACTEDStaking {
    function stake( uint _amount, address _recipient ) external returns ( bool );
    function unstake( uint _amount, bool _trigger ) external;
    function claim ( address _recipient ) external;
}

contract OlympusBTRFLYStaker is OlympusAccessControlled {

    using SafeERC20 for IERC20;

    // REDACTED staking contract
    IREDACTEDStaking internal immutable redactedStaking = IREDACTEDStaking(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);  
    // Olympus Treasury
    ITreasury internal treasury = ITreasury(0x9A315BdF513367C0377FB36545857d12e85813Ef);

    address internal immutable BTRFLY = 0xC0d4Ceb216B3BA9C3701B291766fDCbA977ceC3A;
    address internal immutable xBTRFLY = 0xCC94Faf235cC5D3Bf4bEd3a30db5984306c86aBC;

    constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

    function stakeBTRFLY(uint _amount) external onlyGuardian {
        // retrieve amount of BTRFLY from treasury
        treasury.manage(BTRFLY, _amount); 

        IERC20(BTRFLY).approve(address(redactedStaking), _amount);

        redactedStaking.stake(_amount, address(treasury));

        redactedStaking.claim(address(treasury));
    }

    function unstakeBTRFLY(uint _amount) external onlyGuardian {
        // retrieve amount of xBTRFLY from treasury
        treasury.manage(xBTRFLY, _amount); 

        IERC20(xBTRFLY).approve(address(redactedStaking), _amount);

        redactedStaking.unstake(_amount, false);

        IERC20(BTRFLY).safeTransfer(address(treasury), _amount);
    }

}