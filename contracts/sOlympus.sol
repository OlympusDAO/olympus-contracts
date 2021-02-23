/*
MIT License
Copyright (c) 2018 requestnetwork
Copyright (c) 2018 Fragments, Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../../dependencies/holyzeppelin/contracts/math/SafeMathInt.sol";
import "../../dependencies/holyzeppelin/contracts/math/SafeMath.sol";
import "../../dependencies/holyzeppelin/contracts/security/access/Ownable.sol";
import "../../dependencies/holyzeppelin/contracts/token/ERC20/interfaces/IERC20.sol";

contract sOlympus is IERC20, Ownable {

    using SafeMath for uint256;
    using SafeMathInt for int256;

    event LogRebase(uint256 indexed epoch, uint256 totalSupply);
    event LogMonetaryPolicyUpdated(address monetaryPolicy);

    // Used for authentication
    address public monetaryPolicy;

    address public stakingContract;

    modifier onlyMonetaryPolicy() {
        require(msg.sender == monetaryPolicy);
        _;
    }

    modifier validRecipient(address to) {
        require(to != address(0x0));
        require(to != address(this));
        _;
    }

    string internal _name;
    string internal _symbol;
    uint8 internal _decimals;

    uint8 private constant DECIMALS = 9;
    uint256 private constant MAX_UINT256 = ~uint256(0);
    uint256 private constant INITIAL_FRAGMENTS_SUPPLY = 50000 * 10**DECIMALS;

    // TOTAL_GONS is a multiple of INITIAL_FRAGMENTS_SUPPLY so that _gonsPerFragment is an integer.
    // Use the highest value that fits in a uint256 for max granularity.
    uint256 private constant TOTAL_GONS = MAX_UINT256 - (MAX_UINT256 % INITIAL_FRAGMENTS_SUPPLY);

    // MAX_SUPPLY = maximum integer < (sqrt(4*TOTAL_GONS + 1) - 1) / 2
    uint256 private constant MAX_SUPPLY = ~uint128(0);  // (2^128) - 1

    uint256 public _totalSupply;
    uint256 private _gonsPerFragment;
    mapping(address => uint256) private _gonBalances;

    // This is denominated in Fragments, because the gons-fragments conversion might change before
    // it's fully paid.
    mapping (address => mapping (address => uint256)) private _allowedFragments;

    constructor( 
        string memory name_
        , string memory symbol_
        , address _stakingContract
        // , uint8 decimals_
    ) {
        
        _name = name_;
        _symbol = symbol_;
        _decimals = DECIMALS;
        stakingContract = _stakingContract;

       _totalSupply = INITIAL_FRAGMENTS_SUPPLY;
       _gonBalances[stakingContract] = TOTAL_GONS;
       _gonsPerFragment = TOTAL_GONS.div(_totalSupply);

        emit Transfer(address(0x0), msg.sender, _totalSupply);
    }

    function setMonetaryPolicy(address monetaryPolicy_) external onlyOwner {
        monetaryPolicy = monetaryPolicy_;
        emit LogMonetaryPolicyUpdated(monetaryPolicy_);
    }

    function rebase(uint256 olyProfit) public onlyMonetaryPolicy() returns (uint256) {

        if (olyProfit == 0) {
            emit LogRebase(block.timestamp, _totalSupply);
            return _totalSupply;
        }

        // Some reason was not working before, was reverting during low level call from staking contract
        // Now it works though... calling circulatingSupply seemed to be issue
        uint256 _rebase = olyProfit.mul(_totalSupply).div(circulatingSupply());

        //uint _rebase = olyProfit.mul(_totalSupply).div(_totalSupply.sub(balanceOf(stakingContract)));

        _totalSupply = _totalSupply.add(_rebase);


        if (_totalSupply > MAX_SUPPLY) {
            _totalSupply = MAX_SUPPLY;
        }

        _gonsPerFragment = TOTAL_GONS.div(_totalSupply);

        emit LogRebase(block.timestamp, _totalSupply);
        return _totalSupply;
        
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function circulatingSupply() public view returns (uint) {
       return _totalSupply.sub(balanceOf(stakingContract));
    }

    function balanceOf(address who) public view override returns (uint256) {
        return _gonBalances[who].div(_gonsPerFragment);
    }

    function transfer(address to, uint256 value) public override validRecipient(to) returns (bool) {

        uint256 gonValue = value.mul(_gonsPerFragment);
        _gonBalances[msg.sender] = _gonBalances[msg.sender].sub(gonValue);
        _gonBalances[to] = _gonBalances[to].add(gonValue);
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address owner_, address spender) public view override returns (uint256) {
        return _allowedFragments[owner_][spender];
    }

    function transferFrom(address from, address to, uint256 value) public override validRecipient(to) returns (bool) {

        _allowedFragments[from][msg.sender] = _allowedFragments[from][msg.sender].sub(value);

        uint256 gonValue = value.mul(_gonsPerFragment);
        _gonBalances[from] = _gonBalances[from].sub(gonValue);
        _gonBalances[to] = _gonBalances[to].add(gonValue);
        emit Transfer(from, to, value);

        return true;
    }

    function approve(address spender, uint256 value) public override returns (bool) {
        _allowedFragments[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _allowedFragments[msg.sender][spender] =
            _allowedFragments[msg.sender][spender].add(addedValue);
        emit Approval(msg.sender, spender, _allowedFragments[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 oldValue = _allowedFragments[msg.sender][spender];
        if (subtractedValue >= oldValue) {
            _allowedFragments[msg.sender][spender] = 0;
        } else {
            _allowedFragments[msg.sender][spender] = oldValue.sub(subtractedValue);
        }
        emit Approval(msg.sender, spender, _allowedFragments[msg.sender][spender]);
        return true;
    }
}