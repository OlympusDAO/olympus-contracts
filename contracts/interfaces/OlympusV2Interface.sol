// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.7.5;

import "./IERC20.sol";

interface IOHM is IERC20 {

  /* ====== OHM ====== */

  function mint(uint256 amount_) external;
  function mint(address account_, uint256 ammount_) external;
  function burnFrom(address account_, uint256 amount_) external;
  function vault() external returns (address);
}

interface IsOHM is IERC20 {

    /* ========== DATA STRUCTURES ========== */

    struct Rebase {
        uint epoch;
        uint rebase; // 18 decimals
        uint totalStakedBefore;
        uint totalStakedAfter;
        uint amountRebased;
        uint index;
        uint blockNumberOccured;
    }

  /* ====== EVENTS ====== */

  event LogSupply(uint256 indexed epoch, uint256 timestamp, uint256 totalSupply );
  event LogRebase( uint256 indexed epoch, uint256 rebase, uint256 index );
  event LogStakingContractUpdated( address stakingContract );

  /* ====== sOHM ====== */

  function rebase( uint256 ohmProfit_, uint256 epoch_) external returns (uint256);
  function circulatingSupply() external view returns (uint256);
  function gonsForBalance( uint256 amount ) external view returns (uint256);
  function balanceForGons( uint256 gons ) external view returns (uint256);
  function index() external view returns (uint256);
}

interface IgOHM is IERC20 {

  /* ====== gOHM ====== */

  function mint(address _to, uint256 _amount) external;
  function burn(address _from, uint256 _amount) external;
  function balanceFrom(uint256 _amount) external view returns (uint256);
  function balanceTo(uint256 _amount) external view returns (uint256);
  function migrate( address _staking, address _sOHM ) external;
}

interface IBondingCalculator {

  /* ====== VIEW FUNCTIONS ====== */

  function markdown(address _pair) external view returns (uint256);
  function getKValue(address _pair) external view returns ( uint256 k_ );
  function getTotalValue(address _pair) external view returns ( uint256 _value );
  function valuation(address _pair, uint256 amount_) external view returns ( uint256 _value );
}

interface IStaking {
  
  /* ========== EVENTS ========== */

  event gOHMSet( address gOHM );
  event DistributorSet( address distributor );
  event WarmupSet( uint256 warmup );


  /* ========== DATA STRUCTURES ========== */

  struct Epoch {
    uint256 length;
    uint256 number;
    uint256 endBlock;
    uint256 distribute;
  }

  struct Claim {
    uint256 deposit;
    uint256 gons;
    uint256 expiry;
    bool lock; // prevents malicious delays
  }

  enum CONTRACTS { DISTRIBUTOR, gOHM }


  /* ====== PUBLIC FUNCTIONS ====== */

  function stake(uint256 _amount, address _recipient, bool _rebasing, bool _claim) external returns (uint256);
  
  function unstake(uint256 _amount, bool _trigger, bool _rebasing) external returns (uint256);
  
  function claim (address _recipient, bool _rebasing) external returns (uint256);
  
  function wrap(uint256 _amount) external returns (uint256 gBalance_);
  
  function unwrap( uint256 _amount) external returns (uint256 sBalance_);
  
  function forfeit() external returns (uint256);
  
  function toggleLock() external;
  
  function rebase() external;


  /* ====== VIEW FUNCTIONS ====== */

  function distributor() external view returns (address);
  
  function contractBalance() external view returns (uint256);

  function supplyInWarmup() external view returns (uint256);

  function warmupPeriod() external view returns (uint256);

  function totalStaked() external view returns (uint256);
  
  function index() external view returns (uint256);


  /* ====== POLICY ====== */

  function setContract(CONTRACTS _contract, address _address) external;

  function setWarmup(uint256 _warmupPeriod) external;
}

interface ITeller {

  /* ========== EVENTS ========== */

  event BondCreated(address indexed bonder, uint256 payout, uint256 expires);
  event Redeemed(address indexed bonder, uint256 payout);


  /* ====== DATA STRUCTURES ====== */

  // Info for bond holder
  struct Bond {
    address principal;     // token used to pay for bond
    uint256 principalPaid; // amount of principal token paid for bond
    uint256 payout;        // sOHM remaining to be paid. agnostic balance
    uint256 vested;        // Block when vested
    uint256 created;       // time bond was created
    uint256 redeemed;      // time bond was redeemed
  }

  /* ====== DEPO FUNCTIONS ====== */

  function newBond( 
    address _bonder, 
    address _principal,
    uint256 _principalPaid,
    uint256 _payout, 
    uint256 _expires,
    address _feo
  ) external returns ( uint256 index_ );

  function redeemAll(address _bonder) external returns (uint256);

  function redeem(address _bonder, uint256[] memory _indexes) external returns (uint256); 


  /* ====== VIEW FUNCTIONS ====== */

  function pendingFor(address _bonder, uint256 _index) external view returns (uint256);

  function pendingForIndexes(address _bonder, uint256[] memory _indexes) external view returns (uint256 pending_);

  function totalPendingFor(address _bonder) external view returns (uint256 pending_);

  function percentVestedFor(address _bonder, uint256 _index) external view returns (uint256 percentVested_);


  /* ====== POLICY ====== */

  function setFEReward(uint256 reward) external;
}

interface ITreasury {

  /* ====== PUBLIC FUNCTIONS ====== */

  function deposit(uint256 _amount, address _token, uint256 _profit) external returns (uint256);

  function withdraw(uint256 _amount, address _token) external;

  function manage(address _token, uint256 _amount) external;

  function mint(address _recipient, uint256 _amount) external;

  function incurDebt(uint256 amount_,  address token_) external;

  function repayDebtWithReserve(uint256 amount_, address token_) external;


  /* ====== VIEW FUNCTIONS ====== */

  function excessReserves() external view returns (uint256);
  
  function tokenValue(address _token,  uint256 _amount) external view returns (uint256 value_);
}

interface IDistributor {

  /* ====== DATA STRUCTURES ====== */

  struct Info {
    uint256 rate; // in ten-thousandths ( 5000 = 0.5% )
    address recipient;
  }

  struct Adjust {
    bool add;
    uint256 rate;
    uint256 target;
  }


  /* ====== PUBLIC FUNCTIONS ====== */

  function distribute() external;


  /* ====== VIEW FUNCTIONS ====== */

  function nextRewardAt(uint256 _rate) external view returns (uint256);

  function nextRewardFor(address _recipient) external view returns (uint256);


  /* ====== POLICY FUNCTIONS ====== */

  function addRecipient(address _recipient, uint256 _rewardRate) external;

  function removeRecipient(uint256 _index, address _recipient) external;

  function setAdjustment(uint256 _index, bool _add, uint256 _rate, uint256 _target) external;
}

interface IBondDepository {

  /* ======== EVENTS ======== */

  event beforeBond(uint256 index, uint256 price, uint256 internalPrice, uint256 debtRatio);
  event CreateBond(uint256 index, uint256 amount, uint256 payout, uint256 expires);
  event afterBond(uint256 index, uint256 price, uint256 internalPrice, uint256 debtRatio);

  /* ======== STRUCTS ======== */

  // Info about each type of bond
  struct Bond {
      IERC20 principal;               // token to accept as payment
      IBondingCalculator calculator;  // contract to value principal
      Terms terms;                    // terms of bond
      bool termsSet;                  // have terms been set
      uint256 capacity;               // capacity remaining
      bool capacityIsPayout;          // capacity limit is for payout vs principal
      uint256 totalDebt;              // total debt from bond
      uint256 lastDecay;              // last block when debt was decayed
  }

  // Info for creating new bonds
  struct Terms {
      uint256 controlVariable;        // scaling variable for price
      bool fixedTerm;                 // fixed term or fixed expiration
      uint256 vestingTerm;            // term in blocks (fixed-term)
      uint256 expiration;             // block number bond matures (fixed-expiration)
      uint256 conclusion;             // block number bond no longer offered
      uint256 minimumPrice;           // vs principal value
      uint256 maxPayout;              // in thousandths of a %. i.e. 500 = 0.5%
      uint256 maxDebt;                // 9 decimal debt ratio, max % total supply created as debt
  }

  /* ======== POLICY FUNCTIONS ======== */

  function addBond(
      address _principal,
      address _calculator,
      uint256 _capacity,
      bool _capacityIsPayout
  ) external returns (uint256 id_);

  function setTerms(
      uint256 _id,
      uint256 _controlVariable,
      bool _fixedTerm,
      uint256 _vestingTerm,
      uint256 _expiration,
      uint256 _conclusion,
      uint256 _minimumPrice,
      uint256 _maxPayout,
      uint256 _maxDebt,
      uint256 _initialDebt
  ) external;

  function deprecateBond(uint256 _id) external;

  function setTeller(address _teller) external;


  /* ======== MUTABLE FUNCTIONS ======== */

  function deposit(
      uint256 _amount,
      uint256 _maxPrice,
      address _depositor,
      uint256 _BID,
      address _feo
  ) external returns (uint256, uint256);


  /* ======== VIEW FUNCTIONS ======== */

  function bondInfo(uint256 _BID) external view returns (
          address principal_,
          address calculator_,
          uint256 totalDebt_,
          uint256 lastBondCreatedAt_
      );

  function bondTerms(uint256 _BID) external view returns (
          uint256 controlVariable_,
          uint256 vestingTerm_,
          uint256 minimumPrice_,
          uint256 maxPayout_,
          uint256 maxDebt_
      );

  function maxPayout(uint256 _BID) external view returns (uint256);
  
  function payoutFor(uint256 _value, uint256 _BID) external view returns (uint256);

  function payoutForAmount(uint256 _amount, uint256 _BID) external view returns (uint256);
  
  function bondPrice(uint256 _BID) external view returns (uint256 price_);

  function bondPriceInUSD(uint256 _BID) external view returns (uint256 price_);

  function debtRatio(uint256 _BID) external view returns (uint256 debtRatio_);

  function standardizedDebtRatio(uint256 _BID) external view returns (uint256);

  function currentDebt(uint256 _BID) external view returns (uint256);

  function debtDecay(uint256 _BID) external view returns (uint256 decay_);
}

interface IOlympusAuthority {
    /* ========== EVENTS ========== */
    
    event GovernorPushed(address from, address to, bool _effectiveImmediately);
    event GaurdianPushed(address from, address to, bool _effectiveImmediately);    
    event PolicyPushed(address from, address to, bool _effectiveImmediately);    
    
    event GovernorPulled(address from, address to);
    event GaurdianPulled(address from, address to);
    event PolicyPulled(address from, address to);
    
    /* ========== VIEW ========== */
    
    function governor() external view returns (address);
    function policy() external view returns (address);
    function gaurdian() external view returns (address);
}