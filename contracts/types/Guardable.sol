// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IGuardable.sol";

contract Guardable is IGuardable {
    address internal _guardian;
    address internal _newGuardian;

    event GuardianPushed(address indexed previousGuardian, address indexed newGuardian);
    event GuardianPulled(address indexed previousGuardian, address indexed newGuardian);

    constructor() {
        _guardian = msg.sender;
        emit GuardianPulled(address(0), _guardian);
    }

    function guardian() public view override returns (address) {
        return _guardian;
    }

    modifier onlyGuardian() {
        require(_guardian == msg.sender, "Guardable: caller is not the guardian");
        _;
    }

    function renounceGuardian() public virtual override onlyGuardian {
        emit GuardianPulled(_guardian, address(0));
        _guardian = address(0);
        _newGuardian = address(0);
    }

    function pushGuardian(address newGuardian_) public virtual override onlyGuardian {
        emit GuardianPushed(_guardian, newGuardian_);
        _newGuardian = newGuardian_;
    }

    function pullGuardian() public virtual override {
        require(msg.sender == _newGuardian, "Guardable: must be new guardian to pull");
        emit GuardianPulled(_guardian, _newGuardian);
        _guardian = _newGuardian;
        _newGuardian = address(0);
    }
}
