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
import "./interfaces/IgOHM.sol";
import "./interfaces/IStaking.sol";

contract OlympusBondDepository is OlympusAccessControlled {
/* ======== DEPENDENCIES ======== */

  using SafeMath for uint256;
  using SafeMath for uint48;
  using SafeMath for uint64;
  using SafeERC20 for IERC20;
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
    IERC20 quoteToken; // token to accept as payment
    bool capacityInQuote; // capacity limit is in payment token (true) or in OHM (false, default)
    uint48 lastTune; // last timestamp when control variable was tuned
    uint48 lastDecay; // last timestamp when bond was created and debt was decayed
    uint48 length; // time from creation to conclusion. used as speed to decay debt.
  }

  // Info for creating new bonds
  struct Terms {
    bool fixedTerm; // fixed term or fixed expiration
    uint64 controlVariable; // scaling variable for price
    uint48 vestingTerm; // length of time from deposit to maturity if fixed-term
    uint48 conclusion; // timestamp when bond no longer offered (doubles as time when bond matures if fixed-expiry)
    uint64 maxDebt; // 9 decimal debt maximum in OHM
  }

  // Info for bond note
  struct Note {
    uint256 payout; // gOHM remaining to be paid
    uint48 created; // time bond was created
    uint48 matured; // timestamp when bond is matured
    uint48 redeemed; // time bond was redeemed
  }

/* ======== STATE VARIABLES ======== */

  // Constants
  uint256 internal immutable tuneInterval = 360; // One hour between tuning
  uint256 internal immutable targetDepositInterval = 14400; // target four hours between deposits

  // Addresses
  ITreasury internal immutable treasury; // the purchaser of quote tokens
  IStaking internal immutable staking; // contract to stake payout
  IERC20 internal immutable ohm; // the payment token for bonds
  IgOHM internal immutable gOHM; // payment token
  address internal immutable dao; // receives fees on each bond

  // Storage
  Bond[] public bonds;
  Terms[] public terms;
  mapping(address => Note[]) public notes; // user deposit data

  // Front end incentive
  uint256[2] public rewardRate; // % reward for [operator, dao] (5 decimals)
  mapping(address => uint256) public rewards; // front end operator rewards
  mapping(address => bool) public whitelisted; // whitelisted status for operators

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
    staking = IStaking(_staking);
    gOHM = IgOHM(_gohm);
    dao = _dao;
  }

/* ======== MUTABLE ======== */

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
    Terms memory term = terms[_bid];
    // ensure initial requirements are true
    require(_depositor != address(0), "Depository: invalid address");
    require(block.timestamp < term.conclusion, "Depository: bond concluded");
    // decrement debt once initial checks have passed
    bond.totalDebt = bond.totalDebt.sub(debtDecay(_bid));
    bond.lastDecay = uint48(block.timestamp);
    // do checks reliant on update to date debt
    uint256 price = bondPrice(_bid);
    require(bond.totalDebt <= term.maxDebt, "Depository: max debt exceeded");
    require(_maxPrice >= price, "Depository: more than max price"); // slippage protection
    emit BeforeBond(_bid, price, bond.totalDebt.mul(1e9).div(ohm.totalSupply()));
    // compute payout in OHM for amount of quote
    payout_ = _amount.div(price);
    // check that capacity is sufficient and payout is within bounds
    uint256 checkAgainst; // use amount paid in if tracking in terms of quote, payout otherwise
    if (bond.capacityInQuote) checkAgainst = _amount; else checkAgainst = payout_;
    require(bond.capacity >= checkAgainst, "Depository: capacity exceeded");
    require(bond.maxPayout >= checkAgainst, "Depository: max size exceeded");
    bond.capacity = bond.capacity.sub(checkAgainst);
    // get the timestamp when bond will mature
    uint256 maturation; // fixed term means now + fixed amount of time, otherwise use static maturation time
    if (!term.fixedTerm) maturation = term.conclusion; else maturation = term.vestingTerm.add(block.timestamp);
    // store user data 
    index_ = newBond(_depositor, payout_, maturation, _referral);
    emit CreateBond(_bid, _amount, payout_, maturation);
    // transfer tokens and add to total debt (increasing price for next bond)
    bond.quoteToken.safeTransferFrom(msg.sender, address(treasury), _amount);
    bond.totalDebt = bond.totalDebt.add(payout_);
    // shut off new bonds if max debt is breached
    if (bond.totalDebt > term.maxDebt) bond.capacity = 0;
    // tune control variable to hit target on time
    tune(_bid);
  }

  /**
   *  @notice redeem bond for user
   *  @param _bonder address
   *  @param _indexes calldata uint256[]
   *  @return uint256
   */
  function redeem(address _bonder, uint256[] memory _indexes) public returns (uint256) {
      uint256 dues;
      for (uint256 i = 0; i < _indexes.length; i++) {
          Note memory info = notes[_bonder][_indexes[i]];
          if (pendingFor(_bonder, _indexes[i]) != 0) {
              notes[_bonder][_indexes[i]].redeemed = uint48(block.timestamp); // mark as redeemed
              dues += info.payout;
          }
      }
      emit Redeemed(_bonder, dues);
      gOHM.safeTransfer(_bonder, dues);
      return dues;
  }

  // redeem all redeemable bonds for user
  function redeemAll(address _bonder) external returns (uint256) {
      return redeem(_bonder, indexesFor(_bonder));
  }

  // pay reward to front end operator
  function getReward() external {
      ohm.safeTransfer(msg.sender, rewards[msg.sender]);
      rewards[msg.sender] = 0;
  }

/* ======== INTERNAL ======== */

  /** 
    * @notice add new bond payout to user data
    * @param _bonder address
    * @param _payout uint256
    * @param _expires uint256
    * @param _referral address
    * @return index_ uint256
    */
  function newBond(
      address _bonder,
      uint256 _payout,
      uint256 _expires,
      address _referral
  ) internal returns (uint256 index_) {
      // compute dao and front end referrer bonuses
      uint256 toDAO = _payout.mul(rewardRate[1]).div(1e4);
      uint256 toReferrer = _payout.mul(rewardRate[0]).div(1e4);
      // mint OHM and stake payout
      treasury.mint(address(this), _payout.add(toDAO).add(toReferrer));
      staking.stake(address(this), _payout, false, true);
      // log rewards
      if (whitelisted[_referral]) {
          rewards[_referral] = rewards[_referral].add(toReferrer);
          rewards[dao] = rewards[dao].add(toDAO);
      } else { // DAO receives both rewards if referrer is not whitelisted
          rewards[dao] = rewards[dao].add(toDAO.add(toReferrer));
      }
      // store info
      index_ = notes[_bonder].length;
      notes[_bonder].push(
          Note({
              payout: gOHM.balanceTo(_payout),
              created: uint48(block.timestamp),
              matured: uint48(_expires),
              redeemed: 0
          })
      );
  }

  // auto-adjust control variable to hit capacity/spend target
  function tune(uint256 _bid) public {
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
      uint256 targetDebt = capacity.mul(bond.length).div(timeRemaining);
      // derive a new control variable from the target debt
      uint256 newControlVariable = bondPrice(_bid).mul(ohm.totalSupply()).div(targetDebt);
      // prevent control variable by decrementing price by more than 2% at a time
      uint256 minNewControlVariable = terms[_bid].controlVariable.mul(98).div(100);
      if (minNewControlVariable < newControlVariable) {
        terms[_bid].controlVariable = uint64(newControlVariable);
      } else {
        terms[_bid].controlVariable = uint64(minNewControlVariable);
      }
    }
  }

/* ======== VIEW ======== */

  // DEPOSITS

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
    decay_ = totalDebt.mul(secondsSinceLast).div(bonds[_bid].length);
    if (decay_ > totalDebt) decay_ = totalDebt;
  }

  // REDEMPTIONS

  // all pending indexes for bonder
  function indexesFor(address _bonder) public view returns (uint256[] memory) {
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
    * @return uint256
    */
  function pendingFor(address _bonder, uint256 _index) public view returns (uint256) {
      if (notes[_bonder][_index].redeemed == 0 && notes[_bonder][_index].matured <= block.timestamp) {
          return notes[_bonder][_index].payout;
      }
      return 0;
  }

  /**
    * @notice calculate amount of OHM available for claim for array of bonds
    * @param _bonder address
    * @param _indexes uint256[]
    * @return pending_ uint256
    */
  function pendingForIndexes(address _bonder, uint256[] memory _indexes) public view returns (uint256 pending_) {
      for (uint256 i = 0; i < _indexes.length; i++) {
          pending_ += pendingFor(_bonder, i);
      }
  }

  /**
    *  @notice total pending on all bonds for bonder
    *  @param _bonder address
    *  @return pending_ uint256
    */
  function totalPendingFor(address _bonder) public view returns (uint256 pending_) {
      uint256[] memory indexes = indexesFor(_bonder);
      for (uint256 i = 0; i < indexes.length; i++) {
          pending_ += pendingFor(_bonder, indexes[i]);
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
  ) external onlyPolicy returns (uint256 id_) {
    uint256 capacity = _capacity;
    if (_capacityInQuote) {
      require(IERC20Metadata(address(_quoteToken)).decimals() == 18, "Only 18 decimals for capacity in quote");
      capacity = capacity.div(_currentPrice);
    }
    uint256 length = _conclusion.sub(block.timestamp);
    uint256 maxPayout = capacity.mul(targetDepositInterval).div(length);
    uint256 targetDebt = capacity;
    uint256 controlVariable = _currentPrice.mul(ohm.totalSupply()).div(targetDebt);

    id_ = bonds.length;
    bonds.push(Bond({
      capacity: _capacity,
      totalDebt: targetDebt, 
      maxPayout: maxPayout,
      quoteToken: _quoteToken, 
      capacityInQuote: _capacityInQuote,
      lastTune: uint48(block.timestamp),
      lastDecay: uint48(block.timestamp),
      length: uint48(length)
    }));

    terms.push(Terms({
      fixedTerm: _fixedTerm, 
      controlVariable: uint64(controlVariable),
      vestingTerm: uint48(_vestingTerm), 
      conclusion: uint48(_conclusion), 
      maxDebt: uint48(targetDebt.mul(3)) // 3x buffer. exists to hedge tail risk.
    }));
  }

  /**
   * @notice disable existing bond
   * @param _id uint
   */
  function deprecateBond(uint256 _id) external onlyPolicy {
    bonds[_id].capacity = 0;
  }

  // set reward for front end operator (4 decimals. 100 = 1%)
  function setRewards(uint256 _toFrontEnd, uint256 _toDAO) external onlyPolicy {
      rewardRate[0] = _toFrontEnd;
      rewardRate[1] = _toDAO;
  }

  // add or remove address from the whitelist
  // whitelisted addresses can earn referral fees by operating a front end
  function whitelist(address _operator) external onlyPolicy {
      require(_operator != dao, "Can not blacklist DAO");
      whitelisted[_operator] = !whitelisted[_operator];
  }

  function approve() external onlyPolicy {
    ohm.approve(address(staking), 1e18);
  }
}