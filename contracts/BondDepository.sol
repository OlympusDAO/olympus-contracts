// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./libraries/Address.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";
import "./types/OlympusAccessControlled.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/ITeller.sol";
import "./interfaces/IERC20Metadata.sol";
import "./BondTeller.sol";

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
    uint256 capacity; // capacity remaining
    uint256 totalDebt; // total debt from bond
    uint256 maxPayout; // max tokens in/out (determined by capacityInQuote false/true, respectively)
    IERC20 quoteToken; // token to accept as payment
    bool capacityInQuote; // capacity limit is in payment token (true) or in OHM (false, default)
    uint48 lastTune; // last timestamp when control variable was tuned
    uint48 lastDecay; // last timestamp when bond was created and debt was decayed
  }

  // Info for creating new bonds
  struct Terms {
    bool fixedTerm; // fixed term or fixed expiration
    uint64 controlVariable; // scaling variable for price
    uint48 vestingTerm; // length of time from deposit to maturity if fixed-term
    uint48 conclusion; // timestamp when bond no longer offered (doubles as time when bond matures if fixed-expiry)
    uint64 maxDebt; // 9 decimal debt maximum in OHM
  }

/* ======== STATE VARIABLES ======== */

  uint256 internal immutable tuneInterval = 3600; // One hour between tuning
  uint256 internal immutable targetDepositInterval = 21600; // target six hours between deposits
  uint256 internal immutable decay = 432000; // Five day decay period

  mapping(uint256 => Bond) public bonds;
  mapping(uint256 => Terms) public terms;
  uint256 public nonce; // last index on bonds and terms mappings

  ITeller public teller; // handles payment

  ITreasury internal immutable treasury; // the purchaser of quote tokens
  IERC20 internal immutable ohm; // the payment token for bonds

/* ======== CONSTRUCTOR ======== */

  constructor(
    address _ohm, 
    address _treasury, 
    address _staking,
    address _gohm,
    address _dao,
    address _authority
  ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
    require(_ohm != address(0), "Zero address: OHM");
    require(_treasury != address(0), "Zero address: Treasury");
    require(_staking != address(0), "Zero address: Staking");
    require(_gohm != address(0), "Zero address: gOHM");
    require(_dao != address(0), "Zero address: DAO");
    ohm = IERC20(_ohm);
    treasury = ITreasury(_treasury);
    teller = ITeller(address(new BondTeller(address(this), _staking, _treasury, _ohm, _gohm, _dao, _authority)));
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
    Bond storage bond = bonds[_bid];
    Terms memory info = terms[_bid];
    // ensure certain requirements are true
    _checkBeforeBond(_bid, _depositor, _maxPrice);
    // compute payout in OHM for amount of quote
    payout_ = payoutFor(_amount, _bid);
    // check that capacity is sufficient and payout is within bounds
    if (bond.capacityInQuote) {
      require(bond.capacity >= _amount, "Capacity overflow");
      require(bond.maxPayout >= _amount, "Size overflow");
      bond.capacity = bond.capacity.sub(_amount);
    } else {
      require(bond.capacity >= payout_, "Capacity overflow");
      require(bond.maxPayout >= payout_, "Size overflow");
      bond.capacity = bond.capacity.sub(payout_);
    }
    // get the timestamp when bond will mature
    uint256 expiration = info.vestingTerm.add(block.timestamp);
    if (!info.fixedTerm) {
      expiration = info.conclusion;
    }
    // store user info with teller
    index_ = teller.newBond(_depositor, payout_, expiration, _referral);
    emit CreateBond(_bid, _amount, payout_, expiration);
    // transfer tokens and add to total debt (increasing price for next bond)
    bond.quoteToken.safeTransferFrom(msg.sender, address(treasury), _amount);
    bond.totalDebt = bond.totalDebt.add(payout_);
    // shut off new bonds if max debt is breached
    if (bond.totalDebt > info.maxDebt) {
      bond.capacity = 0;
    }
  }

/* ======== INTERNAL ======== */

  // check various conditions to be true before bond is created
  function _checkBeforeBond(uint256 _bid, address _depositor, uint256 _maxPrice) internal {
    require(_depositor != address(0), "Invalid address");
    require(block.timestamp < terms[_bid].conclusion, "Bond concluded");
    emit BeforeBond(_bid, bondPrice(_bid), debtRatio(_bid));
    // decrement debt once initial checks have passed
    _decayDebt(_bid);
    // do checks reliant on update to date debt
    require(bonds[_bid].totalDebt <= terms[_bid].maxDebt, "Max debt exceeded");
    require(_maxPrice >= bondPrice(_bid), "Slippage limit: more than max price"); // slippage protection
  }

  // reduce total debt
  function _decayDebt(uint256 _bid) internal {
    bonds[_bid].totalDebt = bonds[_bid].totalDebt.sub(debtDecay(_bid));
    bonds[_bid].lastDecay = uint48(block.timestamp);
  }

  // auto-adjust control variable to hit capacity/spend target
  function _tune(uint256 _bid) internal {
    Bond memory bond = bonds[_bid];
    if (block.timestamp >= bond.lastTune.add(tuneInterval)) {
      // compute seconds until bond will conclude
      uint256 timeRemaining = terms[_bid].conclusion.sub(block.timestamp);
      // calculate max payout for six hour intervals 
      bonds[_bid].maxPayout = bond.capacity.mul(targetDepositInterval).div(timeRemaining);
      // standardize capacity into an OHM amount to compute target debt
      uint256 capacity = bond.capacity;
      if (bond.capacityInQuote) { // quote token has to be 18 decimals (required in addBond())
        capacity = capacity.div(bondPrice(_bid));
      }
      // calculate target debt to complete offering at conclusion
      uint256 targetDebt = capacity.mul(decay).div(timeRemaining);
      // derive a new control variable from the target debt
      uint256 newControlVariable = bondPrice(_bid).mul(ohm.totalSupply()).div(targetDebt);
      // prevent control variable by adjusting down by more than 2% at a time
      uint256 minNewControlVariable = terms[_bid].controlVariable.mul(98).div(100);
      if (minNewControlVariable < newControlVariable) {
        terms[_bid].controlVariable = uint64(newControlVariable);
      } else {
        terms[_bid].controlVariable = uint64(minNewControlVariable);
      }
    }
  }

/* ======== VIEW ======== */

  /**
   * @notice payout due for amount of treasury value
   * @param _amount uint256
   * @param _bid uint256
   * @return uint256
   */
  function payoutFor(uint256 _amount, uint256 _bid) public view returns (uint256) {
    return _amount.div((bondPrice(_bid)));
  }

  /**
   * @notice calculate current bond price of quote token in OHM
   * @param _bid uint256
   * @return uint256
   */
  function bondPrice(uint256 _bid) public view returns (uint256) {
    return terms[_bid].controlVariable.mul(debtRatio(_bid)).div(1e9);
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
   * @notice calculate current ratio of debt to OHM supply
   * @param _bid uint256
   * @return uint256
   */
  function debtRatio(uint256 _bid) public view returns (uint256) {
    return currentDebt(_bid).mul(1e9).div(ohm.totalSupply()); 
  }

  /**
   * @notice amount to decay total debt by
   * @param _bid uint256
   * @return decay_ uint256
   */
  function debtDecay(uint256 _bid) public view returns (uint256 decay_) {
    uint256 totalDebt = bonds[_bid].totalDebt;
    uint256 secondsSinceLast = block.timestamp.sub(bonds[_bid].lastDecay);
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
   * @param _fixedTerm bool
   * @param _vestingTerm uint256
   * @param _conclusion uint256
   * @param _currentPrice uint256
   * @return id_ uint256
   */
  function addBond(
    IERC20 _quoteToken,
    uint256 _capacity,
    bool _capacityInQuote,
    bool _fixedTerm,
    uint256 _vestingTerm,
    uint256 _conclusion,
    uint256 _currentPrice // 9 decimals, price of ohm in quote
  ) external onlyGuardian returns (uint256 id_) {
    uint256 capacity = _capacity;
    if (_capacityInQuote) {
      require(IERC20Metadata(address(_quoteToken)).decimals() == 18, "Only 18 decimals for capacity in quote");
      capacity = capacity.div(_currentPrice);
    }
    uint256 timeToConclusion = _conclusion.sub(block.timestamp);
    uint256 maxPayout = capacity.mul(targetDepositInterval).div(timeToConclusion);
    uint256 targetDebt = capacity.mul(decay).div(timeToConclusion);
    uint256 controlVariable = _currentPrice.mul(ohm.totalSupply()).div(targetDebt);

    id_ = nonce;
    bonds[id_] = Bond({
      capacity: _capacity,
      totalDebt: targetDebt, 
      maxPayout: maxPayout,
      quoteToken: _quoteToken, 
      capacityInQuote: _capacityInQuote,
      lastTune: uint48(block.timestamp),
      lastDecay: uint48(block.timestamp)
    });

    terms[id_] = Terms({
      fixedTerm: _fixedTerm, 
      controlVariable: uint64(controlVariable),
      vestingTerm: uint48(_vestingTerm), 
      conclusion: uint48(_conclusion), 
      maxDebt: uint48(targetDebt.mul(3)) // 3x buffer. exists to hedge tail risk.
    });
    nonce = nonce.add(1);
  }

  /**
   * @notice disable existing bond
   * @param _id uint
   */
  function deprecateBond(uint256 _id) external onlyGuardian {
    bonds[_id].capacity = 0;
  }
}