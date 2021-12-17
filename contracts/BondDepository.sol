// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";
import "../types/OlympusAccessControlled.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/ITeller.sol";
import "../interfaces/IOracle.sol";
import "./OHMTeller.sol";

contract OlympusBondDepository is OlympusAccessControlled {
/* ======== DEPENDENCIES ======== */

  using SafeMath for uint256;
  using SafeMath for uint48;
  using SafeMath for uint64;
  using SafeERC20 for IERC20;

/* ======== EVENTS ======== */

  event BeforeBond(uint256 id, uint256 internalPrice, uint256 debtRatio);
  event CreateBond(uint256 id, uint256 amount, uint256 payout, uint256 expires);

/* ======== STRUCTS ======== */

  // Info about each type of bond
  struct Bond {
    IERC20 quoteToken; // token to accept as payment
    uint256 capacity; // capacity remaining
    uint256 totalDebt; // total debt from bond
    uint256 maxPayout; // max percentage of OHM total supply can sell at once (5 decimals)
  }

  // Info for creating new bonds
  struct Terms {
    bool fixedTerm; // fixed term or fixed expiration
    uint64 controlVariable; // scaling variable for price
    uint48 vestingTerm; // length of time from deposit to maturity if fixed-term
    uint48 conclusion; // timestamp when bond no longer offered (doubles as time when bond matures if fixed-expiry)
    uint64 maxDebt; // 9 decimal debt ratio, max % total supply created as debt
  }

  struct Metadata {
    bool capacityInQuote; // capacity limit is in payment token (true) or in OHM (false, default)
    uint8 quoteDecimals; // decimals of quote token
    uint48 lastTune; // last timestamp when control variable was tuned
    uint48 lastDecay; // last timestamp when bond was created and debt was decayed
  }

/* ======== STATE VARIABLES ======== */

  uint256 internal immutable tuneInterval = 0; // One hour between tuning
  uint256 internal decay = 86400; // One week decay period

  mapping(uint256 => Bond) public bonds;
  mapping(uint256 => Terms) public terms;
  mapping(uint256 => Metadata) public metadata;
  address[] public ids; // bond IDs

  ITeller public teller; // handles payment

  ITreasury internal immutable treasury; // the purchaser of quote tokens
  IERC20 internal immutable ohm; // the payment token for bonds
  IOracle internal immutable oracle; // OHM/USD price feed for front end view

/* ======== CONSTRUCTOR ======== */

  constructor(
    address _ohm, 
    address _treasury, 
    address _oracle, 
    address _staking,
    address _sohm,
    address _authority
  ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
    require(_ohm != address(0), "Zero address: OHM");
    ohm = IERC20(_ohm);
    require(_treasury != address(0), "Zero address: Treasury");
    treasury = ITreasury(_treasury);
    require(_oracle != address(0), "Zero address: Oracle");
    oracle = IOracle(_oracle);
    require(_staking != address(0), "Zero address: Staking");
    require(_sohm != address(0), "Zero address: sOHM");
    teller = ITeller(address(new BondTeller(address(this), _staking, _treasury, _ohm, _sohm, _authority)));
  }

/* ======== DEPOSIT ======== */

  /**
   * @notice deposit bond
   * @param _amount uint
   * @param _maxPrice uint
   * @param _depositor address
   * @param _bid uint
   * @param _referral address
   * @return payout_ uint256
   * @return index_ uint256
   */
  function deposit(
    uint256 _amount,
    uint256 _maxPrice,
    address _depositor,
    uint256 _bid,
    address _referral
  ) external returns (uint256 payout_, uint256 index_) {
    Bond memory bond = bonds[_bid];
    // ensure certain requirements are true
    _checkBeforeBond(_bid, _depositor, _maxPrice);
    // compute payout in OHM for amount of quote
    payout_ = payoutFor(_amount, _bid);
    if (metadata[_bid].capacityInQuote) { // vvv -- the difference
      _checkPayoutAndCapacity(bond, _bid, _amount, payout_);
    } else {
      _checkPayoutAndCapacity(bond, _bid, payout_, payout_);
    }
    Terms memory info = terms[_bid];
    uint256 expiration = info.vestingTerm.add(block.timestamp);
    if (!info.fixedTerm) {
      expiration = info.conclusion;
    }
    // user info stored with teller
    index_ = teller.newBond(_depositor, payout_, expiration, _referral);
    emit CreateBond(_bid, _amount, payout_, expiration);
    // transfer tokens and add to total debt (increasing price for next bond)
    bond.quoteToken.safeTransferFrom(msg.sender, address(treasury), _amount); // send payout to treasury
    bonds[_bid].totalDebt = bonds[_bid].totalDebt.add(payout_); // increase total debt
  }

/* ======== INTERNAL ======== */

  // check various conditions to be true before bond is created
  function _checkBeforeBond(uint256 _bid, address _depositor, uint256 _maxPrice) internal {
    require(_depositor != address(0), "Invalid address");

    require(block.number < terms[_bid].conclusion, "Bond concluded");

    emit BeforeBond(_bid, bondPrice(_bid), debtRatio(_bid));
    _decayDebt(_bid);

    require(bonds[_bid].totalDebt <= terms[_bid].maxDebt, "Max debt exceeded");
    require(_maxPrice >= bondPrice(_bid), "Slippage limit: more than max price"); // slippage protection
  }

  /**
   * @notice reduce total debt
   * @param _bid uint256
   */
  function _decayDebt(uint256 _bid) internal {
    bonds[_bid].totalDebt = bonds[_bid].totalDebt.sub(debtDecay(_bid));
    metadata[_bid].lastDecay = uint48(block.timestamp);
  }

  // check that capacity exists and payout is within bounds
  function _checkPayoutAndCapacity(Bond memory _info, uint256 _bid, uint256 _capacityUsed, uint256 _payout) internal {
    // ensure there is remaining capacity for bond
    require(_info.capacity >= _capacityUsed, "Capacity overflow");
    bonds[_bid].capacity = bonds[_bid].capacity.sub(_capacityUsed);
    require(_payout <= maxPayout(_bid), "Bond too large"); // size protection because there is no slippage
  }

  // auto-adjust control variable to hit capacity/spend target
  function _tune(uint256 _bid) internal {
    Terms memory info = terms[_bid];
    if (block.timestamp >= metadata[_bid].lastTune.add(tuneInterval)) {
      // calculate target debt to complete offering at conclusion
      uint256 targetDebt = _getCapacity(_bid).mul(decay).div((info.conclusion.sub(block.timestamp)));
      uint256 newControlVariable = bondPrice(_bid).mul(ohm.totalSupply()).div(targetDebt);
      // prevent control variable by adjusting down by more than 2% at a time
      uint256 minNewControlVariable = info.controlVariable.mul(98).div(100);
      if (minNewControlVariable < newControlVariable) {
        terms[_bid].controlVariable = uint64(newControlVariable);
      } else {
        terms[_bid].controlVariable = uint64(minNewControlVariable);
      }
    }
  }

  // returns capacity in base or quote token terms
  function _getCapacity(uint256 _bid) public view returns (uint256 capacity_) {
    capacity_ = bonds[_bid].capacity;
    if (metadata[_bid].capacityInQuote) {
      capacity_ = capacity_.mul(bondPrice(_bid)).div(1e9);
    }
  }

/* ======== VIEW ======== */

  // PAYOUT

  /**
   * @notice determine maximum bond size
   * @param _bid uint256
   * @return uint256
   */
  function maxPayout(uint256 _bid) public view returns (uint256) {
    return ohm.totalSupply().mul(bonds[_bid].maxPayout).div(1e5);
  }

  /**
   * @notice payout due for amount of treasury value
   * @dev decimals parameter is decimal count of quote token
   * @param _amount uint256
   * @param _bid uint256
   * @return uint256
   */
  function payoutFor(uint256 _amount, uint256 _bid) public view returns (uint256) {
    return _amount.div((bondPrice(_bid)));
  }

  // BOND PRICE

  /**
   * @notice calculate current bond price of quote token in OHM
   * @param _bid uint256
   * @return uint256
   */
  function bondPrice(uint256 _bid) public view returns (uint256) {
    return terms[_bid].controlVariable.mul(debtRatio(_bid)).div(1e9);
  }

  /**
   * @notice converts bond price to USD value
   * @dev uses price feed from oracle that bond was initialized with
   * @param _bid uint256
   * @return uint256
   */
  function bondPriceInUSD(uint256 _bid) public view returns (uint256) {
    return bondPrice(_bid).mul(1e8).div(oracle.getLatestPrice());
  }

  // DEBT

  /**
   * @notice calculate current ratio of debt to OHM supply
   * @param _bid uint256
   * @return uint256
   */
  function debtRatio(uint256 _bid) public view returns (uint256) {
    return currentDebt(_bid).mul(1e9).div(ohm.totalSupply()); 
  }

  /**
   * @notice calculate debt factoring in decay
   * @param _bid uint256
   * @return uint256
   */
  function currentDebt(uint256 _bid) public view returns (uint256) {
    return bonds[_bid].totalDebt.sub(debtDecay(_bid));
  }

  /**
   * @notice amount to decay total debt by
   * @param _bid uint256
   * @return decay_ uint256
   */
  function debtDecay(uint256 _bid) public view returns (uint256 decay_) {
    uint256 totalDebt = bonds[_bid].totalDebt;
    uint256 secondsSinceLast = block.timestamp.sub(metadata[_bid].lastDecay);
    decay_ = totalDebt.mul(secondsSinceLast).div(decay);
    if (decay_ > totalDebt) {
      decay_ = totalDebt;
    }
  }

/* ======== POLICY ======== */

  /**
   * @notice creates a new bond type
   * @param _quoteToken IERC20
   * @param _capacity uint256
   * @param _capacityInQuote bool
   * @param _quoteDecimals uint256
   * @param _maxPayout uint256
   * @return id_ uint256
   */
  function addBond(
    IERC20 _quoteToken,
    uint256 _capacity,
    bool _capacityInQuote,
    uint256 _quoteDecimals,
    uint256 _maxPayout,
    bool _fixedTerm,
    uint256 _vestingTerm,
    uint256 _conclusion,
    uint256 _maxDebt,
    uint256 _currentPrice // 9 decimals, price of quote in ohm
  ) external onlyGuardian returns (uint256 id_) {
    uint256 capacity = _capacity;
    if (_capacityInQuote) {
      capacity = capacity.mul(_currentPrice).div(_quoteDecimals.add(8));
    }
    uint256 targetDebt = capacity.mul(decay).div(_conclusion.sub(block.timestamp));
    uint256 controlVariable = _currentPrice.mul(ohm.totalSupply()).div(targetDebt);

    id_ = ids.length;

    bonds[id_] = Bond({
      quoteToken: _quoteToken, 
      capacity: _capacity,
      totalDebt: targetDebt, 
      maxPayout: _maxPayout
    });

    metadata[id_] = Metadata({
      capacityInQuote: _capacityInQuote,
      quoteDecimals: uint8(_quoteDecimals),
      lastTune: uint48(block.timestamp),
      lastDecay: uint48(block.timestamp)
    });

    terms[id_] = Terms({
      fixedTerm: _fixedTerm, 
      controlVariable: uint64(controlVariable),
      vestingTerm: uint48(_vestingTerm), 
      conclusion: uint48(_conclusion), 
      maxDebt: uint48(_maxDebt)
    });
    ids.push(address(_quoteToken));
  }

  /**
   * @notice disable existing bond
   * @param _id uint
   */
  function deprecateBond(uint256 _id) external onlyGuardian {
    bonds[_id].capacity = 0;
  }
}