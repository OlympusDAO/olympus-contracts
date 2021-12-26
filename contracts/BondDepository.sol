// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./interfaces/IDepository.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IgOHM.sol";
import "./interfaces/IStaking.sol";
import "./libraries/Address.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";
import "./types/OlympusAccessControlled.sol";
import "./interfaces/IDirectory.sol";

contract OlympusBondDepository is OlympusAccessControlled, IDepository {
/* ======== DEPENDENCIES ======== */

  using SafeMath for uint256;
  using SafeMath for uint48;
  using SafeMath for uint64;
  using SafeERC20 for IERC20;
  using SafeERC20 for IOHM;
  using SafeERC20 for IgOHM;

/* ======== EVENTS ======== */

  event BeforeBond(uint256 id, uint256 internalPrice, uint256 debtRatio);
  event CreateBond(uint256 id, uint256 amount, uint256 payout, uint256 expires);
  event Redeemed(address indexed bonder, uint256 payout);

/* ======== STRUCTS ======== */

  // Info about each type of bond
  struct Bond {
    uint256 capacity; // capacity remaining
    uint256 totalDebt; // total debt from bond
    uint256 maxPayout; // max tokens in/out (determined by capacityInQuote false/true, respectively)
    uint256 purchased; // tokens in
    uint256 sold; // ohm out
    IERC20 quoteToken; // token to accept as payment
    bool capacityInQuote; // capacity limit is in payment token (true) or in OHM (false, default)
    bool deposit; // should engage deposit function (safeTransfer if false)
  }

  struct Metadata {
    uint48 lastTune; // last timestamp when control variable was tuned
    uint48 lastDecay; // last timestamp when bond was created and debt was decayed
    uint48 length; // time from creation to conclusion. used as speed to decay debt.
    uint48 decimals; // quote token decimals
  }

  // Info for creating new bonds
  struct Terms {
    bool fixedTerm; // fixed term or fixed expiration
    uint64 controlVariable; // scaling variable for price
    uint48 vesting; // length of time from deposit to maturity if fixed-term
    uint48 conclusion; // timestamp when bond no longer offered (doubles as time when bond matures if fixed-expiry)
    uint64 maxDebt; // 9 decimal debt maximum in OHM
  }

  // Info for bond note
  struct Note {
    uint256 payout; // gOHM remaining to be paid
    uint48 created; // time bond was created
    uint48 matured; // timestamp when bond is matured
    uint48 redeemed; // time bond was redeemed
    uint48 bondID; // bond ID of deposit. uint48 to avoid adding a slot.
  }

/* ======== STATE VARIABLES ======== */

  // Constants
  uint256 internal immutable tuneInterval = 360; // One hour between tuning
  uint256 internal immutable targetDepositInterval = 14400; // target four hours between deposits

  // Addresses
  ITreasury internal immutable treasury; // the purchaser of quote tokens
  IStaking internal immutable staking; // contract to stake payout
  IOHM internal immutable ohm; // the payment token for bonds
  IgOHM internal immutable gOHM; // payment token
  address internal immutable dao; // receives fees on each bond

  // Storage
  Bond[] public bonds;
  Terms[] public terms;
  Metadata[] public metadata;
  mapping(address => Note[]) public notes; // user deposit data

  // Front end incentive
  uint256[2] public rewardRate; // % reward for [operator, dao] (5 decimals)
  mapping(address => uint256) public rewards; // front end operator rewards
  mapping(address => bool) public whitelisted; // whitelisted status for operators

/* ======== CONSTRUCTOR ======== */

  constructor(
    IOlympusDirectory _directory
  ) OlympusAccessControlled(_directory.auth()) {
    ohm = _directory.ohm();
    treasury = _directory.treasury();
    staking = _directory.staking();
    gOHM = _directory.gOHM();
    dao = _directory.dao();
  }

/* ======== MUTABLE ======== */

  /**
   * @notice deposit bond
   * @param _bid uint256
   * @param _amount uint256
   * @param _maxPrice uint256
   * @param _depositor address
   * @param _referral address
   * @return payout_ uint256
   * @return expiry_ uint256
   * @return index_ uint256
   */
  function deposit(
    uint256 _bid,
    uint256 _amount,
    uint256 _maxPrice,
    address _depositor,
    address _referral
  ) external override returns (
    uint256 payout_, 
    uint256 expiry_,
    uint256 index_
  ) {
    Bond storage bond = bonds[_bid];
    Terms memory term = terms[_bid];

    // some basic sanity checks
    require(_depositor != address(0), "Depository: invalid address");
    require(block.timestamp < term.conclusion, "Depository: bond concluded");

    // decrement debt to create time decay
    bond.totalDebt = bond.totalDebt.sub(debtDecay(_bid));
    metadata[_bid].lastDecay = uint48(block.timestamp);

    // checks that are dependent on totalDebt being up-to-date
    uint256 price = bondPrice(_bid);
    require(bond.totalDebt <= term.maxDebt, "Depository: max debt exceeded");
    require(price <= _maxPrice, "Depository: more than max price"); // slippage protection

    emit BeforeBond(_bid, price, bond.totalDebt.mul(1e9).div(treasury.baseSupply()));

    // compute the users' payout in OHM for amount of quote token deposited
    payout_ = _eighteenDecimals(_amount, _bid).div(price); // and ensure it is within bounds
    require(payout_ <= bond.maxPayout, "Depository: max size exceeded");
    
    // ensure the contract can buy or sell this many tokens
    uint256 toCheck = payout_;
    if (bond.capacityInQuote) toCheck = _amount;
    // if true, it can buy this many -- use quote token amount.
    // if false, it can sell this many -- use base token (ohm) amount.
    require(toCheck <= bond.capacity, "Depository: capacity exceeded");
    bond.capacity = bond.capacity.sub(toCheck);

    // get the timestamp when bond will mature
    // a fixed term bond matures at deposit + an interval (the vesting term)
    if (term.fixedTerm) expiry_ = term.vesting.add(block.timestamp);
    else expiry_ = term.vesting; // otherwise, its a set timestamp

    // store the data as a new Note in the users' array
    index_ = notes[_depositor].length;
    notes[_depositor].push(
        Note({
            payout: gOHM.balanceTo(payout_),
            created: uint48(block.timestamp),
            matured: uint48(expiry_),
            redeemed: 0,
            bondID: uint48(_bid)
        })
    );
    emit CreateBond(_bid, _amount, payout_, expiry_);

    // increment sale/purchase counters
    bond.purchased = bond.purchased.add(_amount);
    bond.sold = bond.sold.add(payout_);

    // increment total debt
    bond.totalDebt = bond.totalDebt.add(payout_);

    // add to reward mappings + mint payout
    _giveRewards(payout_, _referral);

    // shut off future deposits if max debt is breached
    if (term.maxDebt < bond.totalDebt) bond.capacity = 0;

    address transferTo = address(treasury);
    // if it should deposit, transfer tokens into this contract and call clear() in batches.
    if (bond.deposit) transferTo = address(this);
    // transfer tokens from user
    bond.quoteToken.safeTransferFrom(msg.sender, transferTo, _amount);

    // tune the control variable to hit target on time
    _tune(_bid);
  }

  /**
   * @notice batch deposit funds into treasury
   * @param _token address
   */
  function clear(address _token) external {
    IERC20 token = IERC20(_token);
    uint256 balance = token.balanceOf(address(this));
    token.approve(address(treasury), balance);
    treasury.deposit(balance, _token, treasury.tokenValue(_token, balance));
  }

  /**
   * @notice trigger tuning without depositing
   * @param _bid uint256
   */
  function tune(uint256 _bid) external override {
    // as the external version of _tune, we first need to update debt
    bonds[_bid].totalDebt = bonds[_bid].totalDebt.sub(debtDecay(_bid));
    metadata[_bid].lastDecay = uint48(block.timestamp);
    // then we can call the function
    _tune(_bid);
  }

  // testing function to jump forward by a number of seconds
  function jump(uint256 _bid, uint256 _by) external {
    Terms storage term = terms[_bid];
    Metadata storage meta = metadata[_bid];
    meta.lastDecay = uint48(meta.lastDecay.sub(_by));
    meta.lastTune = uint48(meta.lastTune.sub(_by));
    term.conclusion = uint48(term.conclusion.sub(_by));
    if (!term.fixedTerm) term.vesting = uint48(term.vesting.sub(_by));
  }

  /**
   *  @notice redeem bond for user
   *  @param _bonder address
   *  @param _indexes calldata uint256[]
   *  @return uint256
   */
  function redeem(address _bonder, uint256[] memory _indexes) public override returns (uint256) {
      uint256 dues;
      for (uint256 i = 0; i < _indexes.length; i++) {
          Note memory info = notes[_bonder][_indexes[i]];
          (, bool matured) = pendingFor(_bonder, _indexes[i]);
          if (matured) {
              notes[_bonder][_indexes[i]].redeemed = uint48(block.timestamp); // mark as redeemed
              dues += info.payout;
          }
      }
      emit Redeemed(_bonder, dues);
      gOHM.safeTransfer(_bonder, dues);
      return dues;
  }

  // redeem all redeemable bonds for user
  function redeemAll(address _bonder) external override returns (uint256) {
      return redeem(_bonder, indexesFor(_bonder));
  }

  // pay reward to front end operator
  function getReward() external override {
      ohm.safeTransfer(msg.sender, rewards[msg.sender]);
      rewards[msg.sender] = 0;
  }

/* ======== INTERNAL ======== */

  /** 
    * @notice add new bond payout to user data
    * @param _payout uint256
    * @param _referral address
    */
  function _giveRewards(
      uint256 _payout,
      address _referral
  ) internal {
      // first we calculate rewards paid to the DAO and to the front end operator (referrer)
      uint256 toDAO = _payout.mul(rewardRate[1]).div(1e4);
      uint256 toReferrer = _payout.mul(rewardRate[0]).div(1e4);

      // and store them in our rewards mapping
      if (whitelisted[_referral]) {
          rewards[_referral] = rewards[_referral].add(toReferrer);
          rewards[dao] = rewards[dao].add(toDAO);
      } else { // the DAO receives both rewards if referrer is not whitelisted
          rewards[dao] = rewards[dao].add(toDAO.add(toReferrer));
      }

      // we mint the payout for the depositor, plus rewards above
      treasury.mint(address(this), _payout.add(toDAO).add(toReferrer));
      // note that we stake only what is given to the depositor
      staking.stake(address(this), _payout, false, true);
  }

  // auto-adjust control variable to hit capacity/spend target
  function _tune(uint256 _bid) internal {
    Bond memory bond = bonds[_bid];
    Metadata memory meta = metadata[_bid];
    if (block.timestamp >= meta.lastTune.add(tuneInterval)) {
      // compute seconds until bond will conclude
      uint256 timeRemaining = terms[_bid].conclusion.sub(block.timestamp);
      // standardize capacity into an OHM amount to compute target debt
      uint256 capacity = bond.capacity;
      if (bond.capacityInQuote) {
        capacity = _eighteenDecimals(capacity, _bid).div(bondPrice(_bid));
      }
      // calculate max payout for four hour intervals 
      bonds[_bid].maxPayout = capacity.mul(targetDepositInterval).div(timeRemaining);
      // calculate target debt to complete offering at conclusion
      uint256 targetDebt = capacity.mul(meta.length).div(timeRemaining);
      // derive a new control variable from the target debt
      uint256 newControlVariable = bondPrice(_bid).mul(treasury.baseSupply()).div(targetDebt);
      // prevent control variable by decrementing price by more than 2% at a time
      uint256 minNewControlVariable = terms[_bid].controlVariable.mul(98).div(100);
      if (minNewControlVariable < newControlVariable) {
        terms[_bid].controlVariable = uint64(newControlVariable);
      } else {
        terms[_bid].controlVariable = uint64(minNewControlVariable);
      }
    }
  }

  // convert an amount to standard 18 decimal format
  function _eighteenDecimals(uint256 _amount, uint256 _bid) internal view returns (uint256) {
    return _amount.mul(1e18).div(10 ** metadata[_bid].decimals);
  }

/* ======== VIEW ======== */

  // BONDS

  /**
   * @notice is a given bond accepting deposits
   * @param _bid uint256
   * @return bool
   */
  function isLive(uint256 _bid) public view override returns (bool) {
    if (bonds[_bid].capacity == 0 || terms[_bid].conclusion < block.timestamp) return false;
    return true;
  }

  /**
   * @notice returns all active bond IDs
   * @return uint256[] memory
   */
  function liveBonds() external override view returns (uint256[] memory) {
    uint256 num;
    for (uint256 i = 0; i < bonds.length; i++) {
      if (isLive(i)) num++;
    }
    uint256[] memory ids = new uint256[](num);
    uint256 nonce;
    for (uint256 i = 0; i < bonds.length; i++) {
      if (isLive(i)) {
        ids[nonce] = i;
        nonce++;
      }
    }
    return ids;
  }

  // DEPOSITS

  /**
   * @notice payout due for amount of treasury value
   * @param _amount uint256
   * @param _bid uint256
   * @return uint256
   */
  function payoutFor(uint256 _amount, uint256 _bid) public view override returns (uint256) {
    return _eighteenDecimals(_amount, _bid).div((bondPrice(_bid)));
  }

  /**
   * @notice calculate current bond price of quote token in OHM
   * @param _bid uint256
   * @return uint256
   */
  function bondPrice(uint256 _bid) public view override returns (uint256) {
    return terms[_bid].controlVariable.mul(debtRatio(_bid)).div(1e9);
  }

  /**
   * @notice calculate debt factoring in decay
   * @param _bid uint256
   * @return uint256
   */
  function currentDebt(uint256 _bid) public view override returns (uint256) {
    return bonds[_bid].totalDebt.sub(debtDecay(_bid));
  }

  /**
   * @notice calculate current ratio of debt to OHM supply
   * @param _bid uint256
   * @return uint256
   */
  function debtRatio(uint256 _bid) public view override returns (uint256) {
    return currentDebt(_bid).mul(1e9).div(treasury.baseSupply()); 
  }

  /**
   * @notice amount to decay total debt by
   * @param _bid uint256
   * @return decay_ uint256
   */
  function debtDecay(uint256 _bid) public view override returns (uint256 decay_) {
    uint256 totalDebt = bonds[_bid].totalDebt;
    uint256 secondsSinceLast = block.timestamp.sub(metadata[_bid].lastDecay);
    decay_ = totalDebt.mul(secondsSinceLast).div(metadata[_bid].length);
    if (decay_ > totalDebt) decay_ = totalDebt;
  }

  // REDEMPTIONS

  // all pending indexes for bonder
  function indexesFor(address _bonder) public view override returns (uint256[] memory) {
      uint256 length;
      for (uint256 i = 0; i < notes[_bonder].length; i++) {
          if (notes[_bonder][i].redeemed == 0) {
              length++;
          }
      }
      uint256[] memory array = new uint256[](length);
      uint256 position;
      for (uint256 i = 0; i < notes[_bonder].length; i++) {
          if (notes[_bonder][i].redeemed == 0) {
              array[position] = i;
              position++;
          }
      }
      return array;
  }

  /**
    * @notice calculate amount of OHM available for claim for single bond
    * @param _bonder address
    * @param _index uint256
    * @return payout_ uint256
    * @return matured_ bool
    */
  function pendingFor(address _bonder, uint256 _index) public view override returns (uint256 payout_, bool matured_) {
    payout_ = notes[_bonder][_index].payout;
      if (notes[_bonder][_index].redeemed == 0 && notes[_bonder][_index].matured <= block.timestamp) {
          matured_ = true;
      }
      matured_ = false;
  }

  /**
    * @notice calculate amount of OHM available for claim for array of bonds
    * @param _bonder address
    * @param _indexes uint256[]
    * @return pending_ uint256
    */
  function pendingForIndexes(address _bonder, uint256[] memory _indexes) public view override returns (uint256 pending_) {
    for (uint256 i = 0; i < _indexes.length; i++) {
      (uint256 pending,) = pendingFor(_bonder, i);
      pending_ += pending;
    }
  }

  /**
    *  @notice total pending on all bonds for bonder
    *  @param _bonder address
    *  @return pending_ uint256
    */
  function totalPendingFor(address _bonder) public view override returns (uint256 pending_) {
    uint256[] memory indexes = indexesFor(_bonder);
    for (uint256 i = 0; i < indexes.length; i++) {
      (uint256 pending,) = pendingFor(_bonder, i);
      pending_ += pending;
    }
  }

/* ======== POLICY ======== */

  /**
   * @notice creates a new bond type
   * @param _quoteToken IERC20
   * @param _capacity uint256
   * @param _capacityInQuote bool
   * @param _fixedTerm bool
   * @param _vesting uint256
   * @param _conclusion uint256
   * @param _currentPrice uint256
   * @return id_ uint256
   */
  function addBond(
    IERC20 _quoteToken,
    uint256 _capacity,
    bool _capacityInQuote,
    bool _fixedTerm,
    uint256 _vesting,
    uint256 _conclusion,
    uint48 _decimals,
    uint256 _currentPrice // 9 decimals, price of ohm in quote
  ) external override onlyPolicy returns (uint256 id_) {
    uint256 targetDebt = _capacity;
    if (_capacityInQuote) {
      targetDebt = targetDebt.mul(1e18).div(10 ** _decimals).div(_currentPrice);
    }
    uint256 length = _conclusion.sub(block.timestamp);
    uint256 maxPayout = targetDebt.mul(targetDepositInterval).div(length);
    uint256 controlVariable = _currentPrice.mul(treasury.baseSupply()).div(targetDebt);

    id_ = bonds.length;

    bonds.push(Bond({
      capacity: _capacity,
      totalDebt: targetDebt, 
      maxPayout: maxPayout,
      purchased: 0,
      sold: 0,
      quoteToken: _quoteToken, 
      capacityInQuote: _capacityInQuote,
      deposit: false
    }));

    terms.push(Terms({
      fixedTerm: _fixedTerm, 
      controlVariable: uint64(controlVariable),
      vesting: uint48(_vesting), 
      conclusion: uint48(_conclusion), 
      maxDebt: uint64(targetDebt.mul(3)) // 3x buffer. exists to hedge tail risk.
    }));

    metadata.push(Metadata({
      lastTune: uint48(block.timestamp),
      lastDecay: uint48(block.timestamp),
      length: uint48(length),
      decimals: _decimals
    }));
  }

  /**
   * @notice disable existing bond
   * @param _id uint
   */
  function deprecateBond(uint256 _id) external override onlyPolicy {
    bonds[_id].capacity = 0;
  }

  /**
   * @notice set bond ID to use or not use deposit
   * @dev disabled by default
   * @param _id uint256
   */
  function setDeposit(uint256 _id) external override onlyPolicy {
    bonds[_id].deposit = !bonds[_id].deposit;
  }

  // set reward for front end operator (4 decimals. 100 = 1%)
  function setRewards(uint256 _toFrontEnd, uint256 _toDAO) external override onlyPolicy {
      rewardRate[0] = _toFrontEnd;
      rewardRate[1] = _toDAO;
  }

  // add or remove address from the whitelist
  // whitelisted addresses can earn referral fees by operating a front end
  function whitelist(address _operator) external override onlyPolicy {
      require(_operator != dao, "Can not blacklist DAO");
      whitelisted[_operator] = !whitelisted[_operator];
  }

  function approve() external override onlyPolicy {
    ohm.approve(address(staking), 1e18);
  }
}