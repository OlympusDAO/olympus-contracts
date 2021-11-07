// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import {IsOHM} from "./interfaces/OlympusV2Interface.sol";
import {IgOHM} from "./interfaces/OlympusV2Interface.sol";
import {IStaking} from "./interfaces/OlympusV2Interface.sol";
import {IDistributor} from "./interfaces/OlympusV2Interface.sol";

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./types/OlympusAccessControlled.sol";

contract OlympusStaking is OlympusAccessControlled, IStaking {

  /* ========== DEPENDENCIES ========== */

  using SafeMath for uint256;
  using SafeERC20 for IERC20;
  using SafeERC20 for IsOHM;
  using SafeERC20 for IgOHM;


  /* ========== STATE VARIABLES ========== */

  IERC20 public immutable OHM;
  IsOHM public immutable sOHM;
  IgOHM public gOHM;

  Epoch public epoch;

  address public override distributor;

  mapping( address => Claim ) public warmupInfo;
  uint256 public override warmupPeriod;
  uint256 gonsInWarmup;


  /* ========== CONSTRUCTOR ========== */
  
  constructor ( 
    address _OHM, 
    address _sOHM, 
    uint256 _epochLength,
    uint256 _firstEpochNumber,
    uint256 _firstEpochBlock,
    IOlympusAuthority _authority
  ) OlympusAccessControlled(_authority) {
    require( _OHM != address(0) );
    OHM = IERC20( _OHM );
    require( _sOHM != address(0) );
    sOHM = IsOHM( _sOHM );
    
    epoch = Epoch({
      length: _epochLength,
      number: _firstEpochNumber,
      endBlock: _firstEpochBlock,
      distribute: 0
    });
  }

  

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice stake OHM to enter warmup
   * @param _amount uint256
   * @param _recipient address
   * @param _claim bool
   * @param _rebasing bool
   */
  function stake(
      uint256 _amount, 
      address _recipient, 
      bool _rebasing, 
      bool _claim
  ) external override returns (uint256) {
    rebase();

    OHM.safeTransferFrom( msg.sender, address(this), _amount );

    if ( _claim && warmupPeriod == 0 ) {
      return _send( _recipient, _amount, _rebasing );

    } else {
      Claim memory info = warmupInfo[ _recipient ];

      if ( !info.lock ) {
        require( _recipient == msg.sender, "external deposits for account are locked" );
      }

      warmupInfo[ _recipient ] = Claim ({
        deposit: info.deposit.add( _amount ),
        gons: info.gons.add( sOHM.gonsForBalance( _amount ) ),
        expiry: epoch.number.add( warmupPeriod ),
        lock: info.lock
      });

      gonsInWarmup = gonsInWarmup.add( sOHM.gonsForBalance( _amount ) );

      return _amount;
    }
  }

  /**
   * @notice retrieve stake from warmup
   * @param _recipient address
   * @param _rebasing bool
   */
  function claim ( address _recipient, bool _rebasing ) public override returns (uint256) {
    Claim memory info = warmupInfo[ _recipient ];

    if ( !info.lock ) {
      require( _recipient == msg.sender, "external override claims for account are locked" );
    }

    if ( epoch.number >= info.expiry && info.expiry != 0 ) {
      delete warmupInfo[ _recipient ];

      gonsInWarmup = gonsInWarmup.sub( info.gons );

      return _send( _recipient, sOHM.balanceForGons( info.gons ), _rebasing );
    }
    return 0;
  }

  /**
   * @notice forfeit stake and retrieve OHM
   */
  function forfeit() external override returns (uint256) {
    Claim memory info = warmupInfo[ msg.sender ];
    delete warmupInfo[ msg.sender ];

    gonsInWarmup = gonsInWarmup.sub( info.gons );

    OHM.safeTransfer( msg.sender, info.deposit );

    return info.deposit;
  }

  /**
   * @notice prevent new deposits or claims from ext. address (protection from malicious activity)
   */
  function toggleLock() external override {
    warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
  }

  /**
   * @notice redeem sOHM for OHM
   * @param _amount uint256
   * @param _trigger bool
   * @param _rebasing bool
   */
  function unstake( uint256 _amount, bool _trigger, bool _rebasing ) external override returns (uint256) {
    if ( _trigger ) {
      rebase();
    }

    uint256 amount = _amount;
    if ( _rebasing ) {
      sOHM.safeTransferFrom( msg.sender, address(this), _amount );
    } else {
      gOHM.burn( msg.sender, _amount ); // amount was given in gOHM terms
      amount = gOHM.balanceFrom( _amount ); // convert amount to OHM terms
    }
    
    OHM.safeTransfer( msg.sender, amount );

    return amount;
  }

  /**
   * @notice convert _amount sOHM into gBalance_ gOHM
   * @param _amount uint256
   * @return gBalance_ uint256
   */
  function wrap( uint256 _amount ) external override returns ( uint256 gBalance_ ) {
    sOHM.safeTransferFrom( msg.sender, address(this), _amount );

    gBalance_ = gOHM.balanceTo( _amount );
    gOHM.mint( msg.sender, gBalance_ );
  }

  /**
   * @notice convert _amount gOHM into sBalance_ sOHM
   * @param _amount uint256
   * @return sBalance_ uint256
   */
  function unwrap( uint256 _amount ) external override returns ( uint256 sBalance_ ) {
    gOHM.burn( msg.sender, _amount );

    sBalance_ = gOHM.balanceFrom( _amount );
    sOHM.safeTransfer( msg.sender, sBalance_ );
  }

  /**
    @notice trigger rebase if epoch over
   */
  function rebase() public override {
    if( epoch.endBlock <= block.number ) {
      sOHM.rebase( epoch.distribute, epoch.number );

      epoch.endBlock = epoch.endBlock.add( epoch.length );
      epoch.number++;
      
      if ( distributor != address(0) ) {
        IDistributor( distributor ).distribute();
      }

      if( contractBalance() <= totalStaked() ) {
        epoch.distribute = 0;
      } else {
        epoch.distribute = contractBalance().sub( totalStaked() );
      }
    }
  }

  /* ========== INTERNAL FUNCTIONS ========== */

  /**
   * @notice send staker their amount as sOHM or gOHM
   * @param _recipient address
   * @param _amount uint256
   * @param _rebasing bool
   */
  function _send( address _recipient, uint256 _amount, bool _rebasing ) internal returns (uint256) {
    if ( _rebasing ) {
      sOHM.safeTransfer( _recipient, _amount ); // send as sOHM (equal unit as OHM)
      return _amount;
    } else {
      gOHM.mint( _recipient, gOHM.balanceTo( _amount ) ); // send as gOHM (convert units from OHM)
      return gOHM.balanceTo( _amount );
    }
  }



  /* ========== VIEW FUNCTIONS ========== */

  /**
    @notice returns the sOHM index, which tracks rebase growth
    @return uint256
   */
  function index() public override view returns (uint256) {
    return sOHM.index();
  }

  /**
    @notice returns contract OHM holdings, including bonuses provided
    @return uint256
   */
  function contractBalance() public override view returns (uint256) {
    return OHM.balanceOf( address(this) );
  }

  function totalStaked() public override view returns (uint256) {
    return sOHM.circulatingSupply();
  }

  function supplyInWarmup() public override view returns (uint256) {
    return sOHM.balanceForGons( gonsInWarmup );
  }



  /* ========== MANAGERIAL FUNCTIONS ========== */

  /**
    @notice sets the contract address for LP staking
    @param _contract address
   */
  function setContract( CONTRACTS _contract, address _address ) external override onlyGovernor() {
    if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
      distributor = _address;
      emit DistributorSet( _address );
    } else if ( _contract == CONTRACTS.gOHM ) { // 1
      require( address( gOHM ) == address( 0 ) ); // only set once
      gOHM = IgOHM( _address );
      emit gOHMSet( _address );
    }
  }
  
  /**
   * @notice set warmup period for new stakers
   * @param _warmupPeriod uint256
   */
  function setWarmup( uint256 _warmupPeriod ) external override onlyGovernor() {
    warmupPeriod = _warmupPeriod;
    emit WarmupSet( _warmupPeriod );
  }
}