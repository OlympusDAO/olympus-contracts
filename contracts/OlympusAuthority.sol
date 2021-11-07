// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.7.5;

import {IOlympusAuthority} from "./interfaces/OlympusV2Interface.sol";

import "./types/OlympusAccessControlled.sol";

contract OlympusAuthority is IOlympusAuthority, OlympusAccessControlled {
    
    
    /* ========== STATE VARIABLES ========== */
    
    address public override governor;
    
    address public override guardian;
    
    address public override policy;
    
    address public newGovernor;
    
    address public newGuardian;
    
    address public newPolicy;
    
    
    /* ========== Constructor ========== */
    
    constructor(
        address _governor, 
        address _guardian,
        address _policy
    ) OlympusAccessControlled( IOlympusAuthority(address(this)) ) {
        governor = _governor;
        emit GovernorPushed(address(0), governor, true);
        guardian = _guardian;
        emit GuardianPushed(address(0), guardian, true);
        policy = _policy;
        emit PolicyPushed(address(0), policy, true);
    }
    
    
    /* ========== GOV ONLY ========== */
    
    function pushGovernor(address _newGovernor, bool _effectiveImmediately) external onlyGovernor {
        if( _effectiveImmediately ) governor = _newGovernor;
        newGovernor = _newGovernor;
        emit GovernorPushed(governor, newGovernor, _effectiveImmediately);
    }
    
    function pushGuardian(address _newGuardian, bool _effectiveImmediately) external onlyGovernor {
        if( _effectiveImmediately ) guardian = _newGuardian;
        newGuardian = _newGuardian;
        emit GovernorPushed(guardian, newGuardian, _effectiveImmediately);
    }
    
    function pushPolicy(address _newPolicy, bool _effectiveImmediately) external onlyGovernor {
        if( _effectiveImmediately ) policy = _newPolicy;
        newPolicy = _newPolicy;
        emit GovernorPushed(policy, newPolicy, _effectiveImmediately);
    }
    
    
    /* ========== PENDING ROLE ONLY ========== */
    
    function pullGovernor() external {
        require(msg.sender == newGovernor, "!newGov");
        emit GovernorPulled(governor, newGovernor);
        governor = newGovernor;
    }

    function pullGuardian() external {
        require(msg.sender == newGuardian, "!newGov");
        emit GuardianPulled(guardian, newGuardian);
        guardian = newGuardian;
    }
    
    function pullPolicy() external {
        require(msg.sender == newPolicy, "!newGov");
        emit GovernorPulled(policy, newPolicy);
        policy = newPolicy;
    }
}