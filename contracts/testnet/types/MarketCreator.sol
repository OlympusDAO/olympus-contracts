// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "../../interfaces/IERC20Metadata.sol";
import "../interfaces/IProMarketCreator.sol";

abstract contract ProMarketCreator is IProMarketCreator {

/* ========== EVENTS ========== */

  event CreateMarket(uint256 indexed id, address baseToken, address quoteToken, uint256 initialPrice, uint256 conclusion);
  event CloseMarket(uint256 indexed id);

/* ========== STATE VARIABLES ========== */

  // Markets
  Market[] public markets; // persistent market data
  Terms[] public terms; // deposit construction data
  Metadata[] public metadata; // extraneous market data
  mapping(uint256 => Adjustment) public adjustments; // control variable changes

  // Queries
  mapping(address => uint256[]) public marketsForBase; // market IDs for base token
  mapping(address => uint256[]) public marketsForQuote; // market IDs for quote token
  mapping(address => uint256[]) public marketsForCreator; // market IDs for market creator

/* ========== CREATE ========== */

  /**
   * @notice             creates a new market type
   * @dev                current price should be in base token decimals.
   * @param _tokens      [base token for payout, quote token used to deposit]
   * @param _market      [capacity (in base or quote), initial price / base, minimum price, debt buffer (3 decimals)]
   * @param _booleans    [capacity in quote, fixed term, call]
   * @param _terms       [vesting length (if fixed term) or vested timestamp, conclusion timestamp]
   * @param _intervals   [deposit interval (seconds), tune interval (seconds)]
   * @return id_         ID of new bond market
   */
  function create(
    IERC20[2] memory _tokens,
    uint256[4] memory _market,
    bool[2] memory _booleans,
    uint256[2] memory _terms,
    uint32[2] memory _intervals
  ) external override returns (uint256 id_) {
    require(_market[1] >= _market[2], "Creator: min price must be > initial");

    // depositing into, or getting info for, the created market uses this ID
    id_ = markets.length;

    marketsForBase[address(_tokens[0])].push(id_);
    marketsForQuote[address(_tokens[1])].push(id_);
    marketsForCreator[msg.sender].push(id_);

    emit CreateMarket(id_, address(_tokens[0]), address(_tokens[1]), _market[1], _terms[1]);

    // the length of the program, in seconds
    uint256 secondsToConclusion = _terms[1] - block.timestamp;

    // the decimal count of the base and quote token
    uint256 baseDecimals = IERC20Metadata(address(_tokens[0])).decimals();
    uint256 quoteDecimals = IERC20Metadata(address(_tokens[1])).decimals();

    metadata.push(Metadata({
      lastTune: uint48(block.timestamp),
      lastDecay: uint48(block.timestamp),
      length: uint48(secondsToConclusion),
      depositInterval: _intervals[0],
      tuneInterval: _intervals[1],
      baseDecimals: uint8(baseDecimals),
      quoteDecimals: uint8(quoteDecimals)
    }));

    /* 
     * initial target debt is equal to capacity (this is the amount of debt
     * that will decay over in the length of the program if price remains the same).
     * it is converted into base token terms if passed in in quote token terms.
     */
    uint256 targetDebt = _booleans[0]
      ? (_market[0] * (10 ** (2 * baseDecimals)) / _market[1]) / 10 ** quoteDecimals
      : _market[0];

    /*
     * max payout is the amount of capacity that should be utilized in a deposit
     * interval. for example, if capacity is 1,000 TOKEN, there are 10 days to conclusion, 
     * and the preferred deposit interval is 1 day, max payout would be 100 TOKEN.
     */
    uint256 maxPayout = targetDebt * _intervals[0] / secondsToConclusion;

    markets.push(Market({
      creator: msg.sender,
      baseToken: _tokens[0],
      quoteToken: _tokens[1],
      call: false,
      capacityInQuote: _booleans[0],
      capacity: _market[0],
      totalDebt: targetDebt, 
      minPrice: _market[2],
      maxPayout: maxPayout,
      purchased: 0,
      sold: 0
    }));

    /*
     * max debt serves as a circuit breaker for the market. let's say the quote
     * token is a stablecoin, and that stablecoin depegs. without max debt, the
     * market would continue to buy until it runs out of capacity. this is
     * configurable with a 3 decimal buffer (1000 = 1% above initial price).
     * note that its likely advisable to keep this buffer wide.
     * note that the buffer is above 100%. i.e. 10% buffer = initial debt * 1.1
     */
    uint256 maxDebt = targetDebt + (targetDebt * _market[3] / 1e5); // 1e5 = 100,000. 10,000 / 100,000 = 10%.

    /*
     * the control variable is set so that initial price equals the desired
     * initial price. the control variable is the ultimate determinant of price,
     * so we compute this last.
     *
     * price = control variable * debt ratio
     * debt ratio = total debt / supply
     * therefore, control variable = price / debt ratio
     */
    uint256 controlVariable = _market[1] * (10 ** baseDecimals) / targetDebt;

    terms.push(Terms({
      fixedTerm: _booleans[1], 
      controlVariable: controlVariable,
      vesting: uint48(_terms[0]), 
      conclusion: uint48(_terms[1]), 
      maxDebt: maxDebt
    }));
  }

/* ========== CLOSE ========== */

  /**
   * @notice             disable existing market
   * @notice             must be creator
   * @param _id          ID of market to close
   */
  function close(uint256 _id) external override {
    require(msg.sender == markets[_id].creator, "Only creator");
    terms[_id].conclusion = uint48(block.timestamp);
    markets[_id].capacity = 0;
    emit CloseMarket(_id);
  }
}
