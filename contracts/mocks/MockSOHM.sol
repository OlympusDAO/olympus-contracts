// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

interface IMockSOHM {
    function rebase() external;
    function setRebasePct(uint256 newRebasePct_) external;
}

/**
 * A mock version of sOHM, with an over-simplified rebase mechanism, for testing purposes only
 * TODO currently untested
 */
contract MockSOHM is ERC20 {

    uint256 public immutable DECIMALS;
    uint256 public _index; // 9 decimals
    uint256 public _rebasePct; // 9 decimals

    mapping(address => uint256) public _agnosticAmount;
    mapping(address => mapping(address => uint256)) public _allowedValue;
    mapping(address => uint) public nextBlockCanClaim;


    constructor(uint256 initialIndex_, uint256 rebasePct_)
        ERC20("Staked OHM", "sOHM")
    {
        require(initialIndex_ > 0, "initial index must be greater than 0");
        require(rebasePct_ > 0, "rebase percentage must be greater than 0");

        DECIMALS = 10 ** decimals();
        _index = initialIndex_;
        _rebasePct = rebasePct_;
    }

    function decimals() public pure override returns (uint8) {
        return 9;
    }

    function approve(address spender_, uint256 value_) public override returns (bool) {
        _approve(msg.sender, spender_, value_);
        return true;
    }

    function mint(address to_, uint256 amount_) public returns (uint256) {
        uint256 scaledAmount = amount_ / _index;
        _agnosticAmount[msg.sender] += scaledAmount;
        _mint(to_, scaledAmount);
        return scaledAmount;
    }

    function transfer(address to_, uint256 value_) public override returns (bool) {
        return transferFrom(msg.sender, to_, value_);
    }

    function transferFrom(address from_, address to_, uint256 value_) public override returns (bool) {
        require(from_ != address(0), "ERC20: transfer from the zero address");
        require(to_ != address(0), "ERC20: transfer to the zero address");

        _allowedValue[from_][to_] -= value_;

        uint256 amount = value_ / _index;

        _agnosticAmount[from_] -= amount;
        _agnosticAmount[to_] += amount;

        emit Transfer(from_, to_, amount);
        return true;
    }

    function balanceOf(address owner_) public view override returns (uint256) {
        return _agnosticAmount[owner_] * _index;
    }

    // Rebase all balances by rebase percentage
    function rebase() external {
        _index += _index * _rebasePct / DECIMALS;
    }

    // Set rebase percentage to new amount. Percentage has 9 decimal places.
    function setRebasePct(uint256 newRebasePct_) external {
        require(newRebasePct_ > 0, "rebase percentage must be greater than 0");
        _rebasePct = newRebasePct_;
    }

    function setIndex(uint256 newIndex_) external {
        require(newIndex_ > 0, "new index must be greater than 0");
        _index = newIndex_;
    }

    // Drip 100 sOHM to caller
    function drip() external {
        require(nextBlockCanClaim[msg.sender] <= block.number, "Already claimed");
        nextBlockCanClaim[msg.sender] += 3000;
        mint(msg.sender, 100000000000);
    }

    function _approve(
        address owner_,
        address spender_,
        uint256 value_
    ) internal override {
        _allowedValue[owner_][spender_] = value_;
        emit Approval(owner_, spender_, value_);
    }
}