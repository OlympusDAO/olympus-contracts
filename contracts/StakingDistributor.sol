// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import {ITreasury} from "./interfaces/OlympusV2Interface.sol";
import {IDistributor} from "./interfaces/OlympusV2Interface.sol";

import "./libraries/SafeERC20.sol";
import "./libraries/SafeMath.sol";

import "./types/Governable.sol";
import "./types/Guardable.sol";

contract Distributor is Governable, Guardable, IDistributor {
  
  /* ========== DEPENDENCIES ========== */

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  /* ====== VARIABLES ====== */

  IERC20 immutable OHM;
  ITreasury immutable treasury;
  address immutable staking;

  Info[] public info;

  mapping(uint256 => Adjust) public adjustments;


  /* ====== CONSTRUCTOR ====== */

  constructor(
    address _treasury,
    address _ohm,
    address _staking
  ) {
    require(_treasury != address(0));
    treasury = ITreasury(_treasury);
    require(_ohm != address(0));
    OHM = IERC20(_ohm);
    require(_staking != address(0));
    staking = _staking;
  }

  /* ====== public override FUNCTIONS ====== */

  /**
    @notice send epoch reward to staking contract
   */
  function distribute() external override {
    require(msg.sender == staking, "Only staking");

    // distribute rewards to each recipient
    for (uint256 i = 0; i < info.length; i++) {
      if (info[i].rate > 0) {
        treasury.mint(info[i].recipient, nextRewardAt(info[i].rate)); // mint and send from treasury
        adjust(i); // check for adjustment
      }
    }
  }

  /* ====== INTERNAL FUNCTIONS ====== */

  /**
    @notice increment reward rate for collector
   */
  function adjust(uint256 _index) internal {
    Adjust memory adjustment = adjustments[_index];
    if (adjustment.rate != 0) {
      if (adjustment.add) {
        // if rate should increase
        info[_index].rate = info[_index].rate.add(adjustment.rate); // raise rate
        if (info[_index].rate >= adjustment.target) {
          // if target met
          adjustments[_index].rate = 0; // turn off adjustment
        }
      } else {
        // if rate should decrease
        info[_index].rate = info[_index].rate.sub(adjustment.rate); // lower rate
        if (info[_index].rate <= adjustment.target) {
          // if target met
          adjustments[_index].rate = 0; // turn off adjustment
        }
      }
    }
  }

  /* ====== VIEW FUNCTIONS ====== */

  /**
    @notice view function for next reward at given rate
    @param _rate uint256
    @return uint256
   */
  function nextRewardAt(uint256 _rate) public override view returns (uint256) {
    return OHM.totalSupply().mul(_rate).div(1000000);
  }

  /**
    @notice view function for next reward for specified address
    @param _recipient address
    @return uint256
   */
  function nextRewardFor(address _recipient) public override view returns (uint256) {
    uint256 reward;
    for (uint256 i = 0; i < info.length; i++) {
      if (info[i].recipient == _recipient) {
        reward = nextRewardAt(info[i].rate);
      }
    }
    return reward;
  }

  /* ====== POLICY FUNCTIONS ====== */

  /**
    @notice adds recipient for distributions
    @param _recipient address
    @param _rewardRate uint256
   */
  function addRecipient(address _recipient, uint256 _rewardRate) external override onlyGovernor {
    require(_recipient != address(0));
    info.push(Info({recipient: _recipient, rate: _rewardRate}));
  }

  /**
    @notice removes recipient for distributions
    @param _index uint256
    @param _recipient address
   */
  function removeRecipient(uint256 _index, address _recipient) external override {
    require(msg.sender == governor() || msg.sender == guardian(), "Caller is not governor or guardian");
    require(_recipient == info[_index].recipient);
    info[_index].recipient = address(0);
    info[_index].rate = 0;
  }

  /**
    @notice set adjustment info for a collector's reward rate
    @param _index uint256
    @param _add bool
    @param _rate uint256
    @param _target uint256
   */
  function setAdjustment(
    uint256 _index,
    bool _add,
    uint256 _rate,
    uint256 _target
  ) external override {
    require(msg.sender == governor() || msg.sender == guardian(), "Caller is not governor or guardian");

    if (msg.sender == guardian()) {
      require(_rate <= info[_index].rate.mul(25).div(1000), "Limiter: cannot adjust by >2.5%");
    }

    adjustments[_index] = Adjust({add: _add, rate: _rate, target: _target});
  }
}
