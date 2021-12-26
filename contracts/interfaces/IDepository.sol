// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./IERC20.sol";

interface IDepository {
  function deposit(
    uint256 _bid,
    uint256 _amount,
    uint256 _maxPrice,
    address _depositor,
    address _referral
  ) external returns (uint256 payout_, uint256 expiry_, uint256 index_);
  function redeem(address _bonder, uint256[] memory _indexes) external returns (uint256);
  function redeemAll(address _bonder) external returns (uint256);
  function getReward() external;
  function tune(uint256 _bid) external;
  function payoutFor(uint256 _amount, uint256 _bid) external view returns (uint256);
  function bondPrice(uint256 _bid) external view returns (uint256);
  function currentDebt(uint256 _bid) external view returns (uint256);
  function debtRatio(uint256 _bid) external view returns (uint256);
  function debtDecay(uint256 _bid) external view returns (uint256 decay_);
  function indexesFor(address _bonder) external view returns (uint256[] memory);
  function pendingFor(address _bonder, uint256 _index) external view returns (uint256);
  function pendingForIndexes(address _bonder, uint256[] memory _indexes) external view returns (uint256 pending_);
  function totalPendingFor(address _bonder) external view returns (uint256 pending_);

  function addBond(
    IERC20 _quoteToken,
    uint256 _capacity,
    bool _capacityInQuote,
    bool _fixedTerm,
    uint256 _vestingTerm,
    uint256 _conclusion,
    uint48 _decimals,
    uint256 _currentPrice
  ) external returns (uint256 id_);
  function deprecateBond(uint256 _id) external;
  function setDeposit(uint256 _id) external;
  function setRewards(uint256 _toFrontEnd, uint256 _toDAO) external;
  function whitelist(address _operator) external;
  function approve() external;
}