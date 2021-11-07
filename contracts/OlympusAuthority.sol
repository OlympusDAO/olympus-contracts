// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.7.5;

import {IOlympusAuthority} from "./interfaces/OlympusV2Interface.sol";

import "./types/OlympusAccessControlled.sol";

contract OlympusAuthority is IOlympusAuthority, OlympusAccessControlled {
    
    
    /* ========== STATE VARIABLES ========== */
    
    address public override governor;
    
    address public override gaurdian;
    
    address public override policy;
    
    address public newGovernor;
    
    address public newGaurdian;
    
    address public newPolicy;
    
    
    /* ========== Constructor ========== */
    
    constructor(
        address _governor, 
        address _gaurdian,
        address _policy
    ) OlympusAccessControlled( IOlympusAuthority(address(this)) ) {
        governor = _governor;
        emit GovernorPushed(address(0), governor, true);
        gaurdian = _gaurdian;
        emit GaurdianPushed(address(0), gaurdian, true);
        policy = _policy;
        emit PolicyPushed(address(0), policy, true);
    }
    
    
    /* ========== GOV ONLY ========== */
    
    function pushGovernor(address _newGovernor, bool _effectiveImmediately) external onlyGovernor {
        if( _effectiveImmediately ) governor = _newGovernor;
        newGovernor = _newGovernor;
        emit GovernorPushed(governor, newGovernor, _effectiveImmediately);
    }
    
    function pushGaurdian(address _newGaurdian, bool _effectiveImmediately) external onlyGovernor {
        if( _effectiveImmediately ) gaurdian = _newGaurdian;
        newGaurdian = _newGaurdian;
        emit GovernorPushed(gaurdian, newGaurdian, _effectiveImmediately);
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

    function pullGaurdian() external {
        require(msg.sender == newGaurdian, "!newGov");
        emit GaurdianPulled(gaurdian, newGaurdian);
        gaurdian = newGaurdian;
    }
    
    function pullPolicy() external {
        require(msg.sender == newPolicy, "!newGov");
        emit GovernorPulled(policy, newPolicy);
        policy = newPolicy;
    }
}