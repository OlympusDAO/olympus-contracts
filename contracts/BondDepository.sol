// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./types/OlympusAccessControlled.sol";

import "./libraries/SafeMath.sol";
import "./libraries/Address.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IOlympusAuthority.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/ITeller.sol";
import "./interfaces/IERC20Metadata.sol";

contract OlympusBondDepository is OlympusAccessControlled {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  /* ======== EVENTS ======== */

  event BeforeBond(uint256 index, uint256 price, uint256 internalPrice, uint256 debtRatio);
  event CreateBond(uint256 index, uint256 payout, uint256 expires);
  event BondAdded(uint16 bid);
  event BondEnabled(uint16 bid);
  event BondDeprecated(uint16 bid);
  event Set(SETTER _setter, address _address, uint128 _input);

  modifier onlyController() {
    require(msg.sender == controller, "Only controller");
    _;
  }

  /* ======== STRUCTS ======== */

  // Info about each type of bond
  struct BondMetadata {
    Terms terms; // terms of bond
    bool enabled; // must be enabled before accepts deposits
    uint256 totalDebt; // total debt from bond (in OHM)
    uint256 capacity; // capacity in ohm or principal
    IERC20 principal; // token to accept as payment
    uint48 last; // timestamp of last bond
    bool capacityInPrincipal; // capacity limit is in payout or principal terms
  }

  // Info for creating new bonds
  struct Terms {
    uint256 minDebt; // minimum OHM debt at a time
    uint256 maxDebt; // max OHM debt accrued at a time
    bool fixedTerm; // fixed term or fixed expiration
    uint48 controlVariable; // scaling variable for price
    uint48 conclusion; // timestamp when bond no longer offered
    uint48 vesting; // term in seconds if fixedTerm == true, expiration timestamp if not
  }

  struct Global {
    uint128 decayRate; // time in seconds to decay debt to zero.
    uint128 maxPayout; // percentage total supply. 9 decimals.
  }

  /* ======== STATE VARIABLES ======== */

  ITeller public teller; // handles payment
  address public controller; // adds or deprecated bonds
  ITreasury internal immutable treasury;
  IERC20 internal immutable ohm;
  IOracle public feed; // OHM-USD price feed for view function

  mapping(uint16 => BondMetadata) public bonds;
  address[] public ids; // bond IDs

  Global public global;

  /* ======== CONSTRUCTOR ======== */

  constructor(address _ohm, address _treasury, address _authority)
  OlympusAccessControlled(IOlympusAuthority(_authority)) {
    require(_ohm != address(0), "Zero address: OHM");
    ohm = IERC20(_ohm);
    require(_treasury != address(0), "Zero address: Treasury");
    treasury = ITreasury(_treasury);
    controller = msg.sender;
  }

  /* ======== MUTABLE FUNCTIONS ======== */

  /**
   * @notice deposit bond
   * @param _depositor address
   * @param _bid uint256
   * @param _amount uint256
   * @param _maxPrice uint256
   * @param _feo address
   * @return payout_ uint256
   * @return index_ uint256
   */
  function deposit(
    address _depositor,
    uint16 _bid,
    uint256 _amount,
    uint256 _maxPrice,
    address _feo
  ) external returns (uint256 payout_, uint16 index_) {
    require(_depositor != address(0), "Depository: invalid address");
    require(_maxPrice >= bondPrice(_bid), "Depository: more than max price");

    BondMetadata memory info = bonds[_bid];
    _beforeBond(info, _bid);

    payout_ = _in18Decimals(_amount, _bid) / bondPrice(_bid); 

    uint256 cap = payout_;
    if (info.capacityInPrincipal) { // capacity is in principal terms
      cap = _amount; 
    } 
    require(info.capacity >= cap, "Depository: exceeds capacity"); // ensure there is remaining capacity

    if (bonds[_bid].totalDebt < info.terms.minDebt || bonds[_bid].totalDebt + payout_ > info.terms.maxDebt) {
      bonds[_bid].capacity = 0; // disable bond if debt above max or below min bound
    } else {
      bonds[_bid].capacity -= cap; // lower future capacity
      bonds[_bid].totalDebt += payout_; // increase total debt
    }

    _payoutWithinBounds(payout_);

    uint256 expiration = info.terms.vesting;
    if (info.terms.fixedTerm) {
      expiration += block.timestamp;
    }

    emit CreateBond(_bid, payout_, expiration);
    // user info stored with teller
    index_ = teller.newBond(payout_, _bid, uint48(expiration), _depositor, _feo);
    info.principal.safeTransferFrom(msg.sender, address(treasury), _amount);
  }

  /* ======== INTERNAL FUNCTIONS ======== */

  // checks and event before bond
  function _beforeBond(BondMetadata memory _info, uint16 _bid) internal {
    require(block.timestamp < _info.terms.conclusion, "Depository: bond concluded");
    require(_info.enabled, "Depository: bond not enabled");
    _decayDebt(_bid);
    emit BeforeBond(_bid, bondPriceInUSD(_bid), bondPrice(_bid), debtRatio(_bid));
  }

  // reduce total debt based on time passed
  function _decayDebt(uint16 _bid) internal {
    bonds[_bid].totalDebt -= debtDecay(_bid);
    bonds[_bid].last = uint48(block.timestamp);
  }

  // ensure payout is not too large or small
  function _payoutWithinBounds(uint256 _payout) public view {
    require(_payout >= 1e7, "Depository: bond too small"); // must be > 0.01 OHM ( underflow protection )
    require(_payout <= maxPayout(), "Depository: bond too large"); // global max bond size
  }

  /* ======== VIEW FUNCTIONS ======== */

  // maximum ohm paid in single bond
  function maxPayout() public view returns (uint256) {
    return ohm.totalSupply() * global.maxPayout / 1e9;
  }

  // payout for principal of given bond id
  function payoutFor(uint256 _amount, uint16 _bid) external view returns (uint256) {
    return _in18Decimals(_amount, _bid) / bondPrice(_bid);
  }

  // internal price of bond principal token in ohm
  function bondPrice(uint16 _bid) public view returns (uint256) {
    return bonds[_bid].terms.controlVariable * debtRatio(_bid) / 1e9;
  }

  // internal bond price converted to USD. note relies on oracle. view only.
  function bondPriceInUSD(uint16 _bid) public view returns (uint256) {
    return bondPrice(_bid) * feed.getLatestPrice() / 1e8;
  }

  // undecayed debt for bond divided by ohm total supply
  function debtRatio(uint16 _bid) public view returns (uint256) {
    return currentDebt(_bid) * 1e9 / ohm.totalSupply();
  }

  // debt including decay since last bond
  function currentDebt(uint16 _bid) public view returns (uint256) {
    return bonds[_bid].totalDebt - debtDecay(_bid);
  }

  // amount of debt decayed since last bond
  function debtDecay(uint16 _bid) public view returns (uint256 decay_) {
    BondMetadata memory bond = bonds[_bid];
    uint48 timeSinceLast = uint48(block.timestamp) - bond.last;

    decay_ = bond.totalDebt * timeSinceLast / global.decayRate;

    if (decay_ > bond.totalDebt) {
      decay_ = bond.totalDebt;
    }
  }

  // terms for bond ID
  function bondTerms(uint16 _bid) external view
  returns (uint256[] memory terms_, bool fixedTerm_) {
    Terms memory terms = bonds[_bid].terms;
    terms_[0] = terms.controlVariable;
    terms_[1] = terms.conclusion;
    terms_[2] = terms.vesting;
    terms_[3] = terms.maxDebt;
    fixedTerm_ = terms.fixedTerm;
  }

  /* ======== POLICY FUNCTIONS ======== */

  enum SETTER {TELLER, CONTROLLER, FEED, DECAY, PAYOUT}

  /**
   * @notice set global variables
   * @param _setter SETTER
   * @param _address address
   * @param _input uint128
   */
  function set(SETTER _setter, address _address, uint128 _input) external onlyPolicy {
    if (_setter == SETTER.TELLER) { // 0
      require(address(teller) == address(0), "Teller is set");
      require(_address != address(0), "Zero address");
      teller = ITeller(_address);
    } else if (_setter == SETTER.CONTROLLER) { // 1
      require(_address != address(0), "Zero address");
      controller = _address;
    } else if (_setter == SETTER.FEED) { // 2
      require(_address != address(0), "Zero address");
      feed = IOracle(_address);
    } else if (_setter == SETTER.DECAY) { // 3
      global.decayRate = _input;
    } else if (_setter == SETTER.PAYOUT) { // 4
      global.maxPayout = _input;
    }
    emit Set(_setter, _address, _input);
  }

  /**
   * On creating bonds: New bond is created with a principal token to purchase,
   * an oracle quoting an 8 decimal price of that token in OHM, a budget capacity
   * (specified as in OHM or in principal token terms), a timestamp when the
   * bond concludes, and a vesting term or expiration timestamp dictated by
   * _fixedTerm being true or false, respectively.
   * 
   * The contract computes a BCV based on the amount of OHM to spend or principal
   * to buy, and the intended time to do it in (time from initialization to conclusion).
   * The bond is initialized with an amount of initial debt, which should start it
   * at the oracle price. Debt will decay from there to open discounts.
   */

  /**
   * @notice enable bond
   * @dev only necessary if safe mode enabled when bond added
   * @param _bid uint256
   */
  function enableBond(uint16 _bid) external onlyController {
    bonds[_bid].enabled = true;
    bonds[_bid].last = uint48(block.timestamp);
    emit BondEnabled(_bid);
  }

  /**
   * @notice disable existing bond
   * @param _bid uint
   */
  function deprecateBond(uint16 _bid) external onlyController {
    bonds[_bid].capacity = 0;
    emit BondDeprecated(_bid);
  }

  /**
   * @notice creates a new bond type
   * @dev note that oracle should feed 8-decimal price of principal in OHM
   * @param _principal address
   * @param _oracle address
   * @param _capacity uint256
   * @param _inPrincipal bool
   * @param _length uint256
   * @param _fixedTerm bool
   * @param _vesting uint256
   * @return id_ uint256
   */
  function addBond(
    IERC20 _principal,
    IOracle _oracle,
    uint128 _capacity,
    bool _inPrincipal,
    uint48 _length,
    bool _fixedTerm,
    uint48 _vesting
  ) external onlyController returns (uint16 id_) {
    (uint256 targetDebt, uint48 bcv) = _compute(_capacity, _inPrincipal, _length, _oracle);
    
    _checkLengths(_length, _vesting, _fixedTerm);

    Terms memory terms = Terms({
      controlVariable: bcv, 
      conclusion: uint48(block.timestamp) + _length,
      fixedTerm: _fixedTerm, 
      vesting: _vesting,
      maxDebt: targetDebt * 2, // these hedge tail risk by keeping debt in a range
      minDebt: targetDebt / 2 // wide spread given (-50%, +100%) to avoid impeding functionality
    });
    
    BondMetadata memory bond = BondMetadata({
      terms: terms,
      enabled: false,
      totalDebt: targetDebt,
      capacity: _capacity, 
      principal: _principal,   
      last: uint48(block.timestamp), 
      capacityInPrincipal: _inPrincipal
    });
    
    id_ = uint16(ids.length);
    bonds[id_] = bond;
    ids.push(address(_principal));
    emit BondAdded(id_);
  }

  /* ========== INTERNAL VIEW ========== */

  /**
   * @notice compute target debt and BCV for bond
   * @return targetDebt_ uint256
   * @return bcv_ uint64
   */
  function _compute(
    uint256 _capacity, 
    bool _inPrincipal, 
    uint256 _length, 
    IOracle _oracle
  ) internal view returns (uint256 targetDebt_, uint48 bcv_) {
    uint256 capacity = _capacity;
    if (_inPrincipal) {
      capacity = _capacity * _oracle.getLatestPrice() / 1e8;
    }

    targetDebt_ = capacity * global.decayRate / _length;
    uint256 discountedPrice = _oracle.getLatestPrice() * 98 / 100; // assume average discount of 2%
    bcv_ = uint48(discountedPrice * ohm.totalSupply() / targetDebt_);
    targetDebt_ = targetDebt_ * 102 / 100; // adjust back up to start at market price
  }
  
  // ensure bond times are appropriate
  function _checkLengths(uint48 _length, uint48 _vesting, bool _fixedTerm) internal pure {
    require(_length >= 5e5, "Program must run longer than 6 days");
    if (!_fixedTerm) {
      require(_vesting >= _length, "Bond must conclude before expiration");
    } else {
      require(_vesting >= 432_000, "Bond must vest longer than 5 days");
    }
  }
  
  /**
   * @notice amount converted to 18 decimal balance
   * @param _amt uint256
   * @param _bid uint16
   * @return uint256
   */
  function _in18Decimals(uint256 _amt, uint16 _bid) internal view returns (uint256) {
    return _amt * 
            1e9 * 
            10 ** IERC20Metadata(address(ohm)).decimals() / 
            10 ** IERC20Metadata(address(bonds[_bid].principal)).decimals();
  }
}