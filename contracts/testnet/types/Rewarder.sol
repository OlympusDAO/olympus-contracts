// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "../../types/OlympusAccessControlled.sol";

import "../../interfaces/IERC20.sol";

abstract contract ProRewarder is OlympusAccessControlled {

/* ========== STATE VARIABLES ========== */

  uint256 public daoReward; // % reward for dao (3 decimals: 100 = 1%)
  uint256 public refReward; // % reward for referrer (3 decimals: 100 = 1%)

  mapping(address => mapping(IERC20 => uint256)) public rewards; // front end operator rewards
  mapping(address => bool) public whitelisted; // whitelisted status for operators

  constructor(IOlympusAuthority _authority) OlympusAccessControlled(_authority) {}

/* ========== EXTERNAL FUNCTIONS ========== */

  // pay reward to front end operator
  function getReward(IERC20[] memory tokens) external {
    for (uint256 i; i < tokens.length; i++) {
      uint256 reward = rewards[msg.sender][tokens[i]];

      rewards[msg.sender][tokens[i]] = 0;
      tokens[i].transfer(msg.sender, reward);
    }
  }

/* ========== INTERNAL ========== */

  /** 
   * @notice add new market payout to user data
   */
  function _giveRewards(
    IERC20 _token,
    uint256 _payout,
    address _referral
  ) internal returns (uint256) {
    // first we calculate rewards paid to the DAO and to the front end operator (referrer)
    uint256 toDAO = _payout * daoReward / 1e4;
    uint256 toRef = _payout * refReward / 1e4;

    // and store them in our rewards mapping
    if (whitelisted[_referral]) {
      rewards[_referral][_token] += toRef;
      rewards[authority.guardian()][_token] += toDAO;
    } else { // the DAO receives both rewards if referrer is not whitelisted
      rewards[authority.guardian()][_token] += toDAO + toRef;
    }
    return toDAO + toRef;
  }

/* ========== OWNABLE ========== */ 

  /**
   * @notice turn on rewards for front end operators and DAO
   */
  function enableRewards() external onlyGovernor {
    refReward = 3;
    daoReward = 30;
  }

  /**
   * @notice turn off rewards for front end operators and DAO
   */
  function disableRewards(bool _dao) external onlyGovernor {
    if (_dao) {
      daoReward = 0;
    } else {
      refReward = 0;
    }
  }

  /**
   * @notice add or remove addresses from the front end reward whitelist
   */
  function whitelist(address _operator) external onlyPolicy {
    whitelisted[_operator] = !whitelisted[_operator];
  }
}
