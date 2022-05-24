// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "./MarketCreator.sol";
import "../interfaces/IProViewer.sol";

abstract contract ProViewer is IProViewer, ProMarketCreator {

    constructor() ProMarketCreator() {}

/* ========== EXTERNAL VIEW ========== */

  /**
   * @notice             calculate current market price of base token in quote tokens
   * @dev                accounts for debt and control variable decay since last deposit (vs _marketPrice())
   * @param _id          ID of market
   * @return             price for market in base token decimals
   *
   * price is derived from the equation
   *
   * p = c * d
   *
   * where
   * p = price
   * c = control variable
   * d = debt
   *
   * d -= ( d * (dt / l) )
   * 
   * where
   * dt = change in time
   * l = length of program
   *
   * if price is below minimum price, minimum price is returned
   * this is enforced on deposits by manipulating total debt (see _decay())
   */
  function marketPrice(uint256 _id) public view override returns (uint256) {
    uint256 price = 
      currentControlVariable(_id)
      * currentDebt(_id)
      / (10 ** metadata[_id].baseDecimals);
    return 
      (price > markets[_id].minPrice) 
      ? price 
      : markets[_id].minPrice;
  }

  /**
   * @notice             payout due for amount of quote tokens
   * @dev                accounts for debt and control variable decay so it is up to date
   * @param _amount      amount of quote tokens to spend
   * @param _id          ID of market
   * @return             amount of base tokens to be paid
   */
  function payoutFor(uint256 _amount, uint256 _id) public view override returns (uint256) {
    Metadata memory meta = metadata[_id];
    return 
      _amount
      * 10 ** (2 * meta.baseDecimals)
      / marketPrice(_id)
      / 10 ** meta.quoteDecimals;
  }

  /**
   * @notice             calculate debt factoring in decay
   * @dev                accounts for debt decay since last deposit
   * @param _id          ID of market
   * @return             current debt for market in base token decimals
   */
  function currentDebt(uint256 _id) public view override returns (uint256) {
    uint256 decay = markets[_id].totalDebt 
      * (block.timestamp - metadata[_id].lastDecay) 
      / metadata[_id].length;
    return markets[_id].totalDebt - decay;
  }

  /**
   * @notice             up to date control variable
   * @dev                accounts for control variable adjustment
   * @param _id          ID of market
   * @return             control variable for market in base token decimals
   */
  function currentControlVariable(uint256 _id) public view returns (uint256) {
    (uint256 decay,,) = _controlDecay(_id);
    return terms[_id].controlVariable - decay;
  }

  /**
   * @notice             returns maximum quote token in for market
   */
  function maxIn(uint256 _id) public view returns (uint256) {
    Metadata memory meta = metadata[_id];
    return
      markets[_id].maxPayout
      * 10 ** meta.quoteDecimals
      * marketPrice(_id)
      / 2 * (10 ** meta.baseDecimals);
  }

  /**
   * @notice             does market send payout immediately
   * @param _id          market ID to search for
   */
  function instantSwap(uint256 _id) public view returns (bool) {
    Terms memory term = terms[_id];
    return (term.fixedTerm && term.vesting == 0) || (!term.fixedTerm && term.vesting <= block.timestamp);
  }

  /**
   * @notice             is a given market accepting deposits
   * @param _id          ID of market
   */
  function isLive(uint256 _id) public view override returns (bool) {
    return (markets[_id].capacity != 0 && terms[_id].conclusion > block.timestamp);
  }

  /**
   * @notice             returns an array of all active market IDs
   */
  function liveMarkets() external view override returns (uint256[] memory) {
    return liveMarketsBetween(0, markets.length);
  }

  /**
   * @notice             returns array of active market IDs within a range
   * @notice             should be used if length exceeds max to query entire array
   */
  function liveMarketsBetween(uint256 firstIndex, uint256 lastIndex) public view returns (uint256[] memory) {
    uint256 num;
    for (uint256 i = firstIndex; i < lastIndex; i++) {
      if (isLive(i)) num++;
    }

    uint256[] memory ids = new uint256[](num);
    uint256 nonce;
    for (uint256 i = firstIndex; i < lastIndex; i++) {
      if (isLive(i)) {
        ids[nonce] = i;
        nonce++;
      }
    }
    return ids;
  }

  /**
   * @notice             returns an array of all active market IDs for a given quote token
   * @param _creator     is query for markets by creator, or for markets by token
   * @param _base        if query is for markets by token, search by base or quote token
   * @param _address     address of creator or token to query by
   */
  function liveMarketsFor(bool _creator, bool _base, address _address) public view override returns (uint256[] memory) {
    uint256[] memory mkts;
    
    if (_creator) {
      mkts = marketsForCreator[_address];
    } else {
      mkts = _base 
      ? marketsForBase[_address]
      : marketsForQuote[_address];
    }

    uint256 num;

    for (uint256 i = 0; i < mkts.length; i++) {
      if (isLive(mkts[i])) num++;
    }

    uint256[] memory ids = new uint256[](num);
    uint256 nonce;

    for (uint256 i = 0; i < mkts.length; i++) {
      if (isLive(mkts[i])) {
        ids[nonce] = mkts[i];
        nonce++;
      }
    }
    return ids;
  }


  function marketsFor(address tokenIn, address tokenOut) public view returns (uint256[] memory) {
    uint256[] memory forBase = liveMarketsFor(false, true, tokenOut);
    uint256[] memory ids;
    uint256 nonce;
    for(uint256 i; i < forBase.length; i++) {
      if (address(markets[forBase[i]].quoteToken) == tokenIn) {
        ids[nonce] = forBase[i];
      }
    }
    return ids;
  }

  function findMarketFor(
    address tokenIn, 
    address tokenOut, 
    uint256 amountIn, 
    uint256 minAmountOut, 
    uint256 maxExpiry
  ) external view returns (uint256 id) {
    uint256[] memory ids = marketsFor(tokenIn, tokenOut);
    uint256[] memory payouts;
    uint256 n;
    for(uint256 i; i < ids.length; i++) {
      Terms memory term = terms[ids[i]];

      uint256 expiry = term.fixedTerm ? block.timestamp + term.vesting : term.vesting;
      require(expiry <= maxExpiry, "Bad expiry");

      if (minAmountOut > markets[ids[i]].maxPayout) {
        payouts[n] = payoutFor(amountIn, ids[i]);
      } else {
        payouts[n] = 0;
      }
      n++;
    }
    uint256 highestOut;
    for (uint256 i; i < payouts.length; i++) {
      if (payouts[i] > highestOut) {
        highestOut = payouts[i];
        id = ids[i];
      }
    }
  }

/* ========== INTERNAL VIEW ========== */

  /**
   * @notice                  amount to decay control variable by
   * @param _id               ID of market
   * @return decay_           change in control variable
   * @return secondsSince_    seconds since last change in control variable
   * @return active_          whether or not change remains active
   */ 
  function _controlDecay(uint256 _id) internal view returns (uint256 decay_, uint48 secondsSince_, bool active_) {
    Adjustment memory info = adjustments[_id];
    if (!info.active) return (0, 0, false);

    secondsSince_ = uint48(block.timestamp) - info.lastAdjustment;

    active_ = secondsSince_ < info.timeToAdjusted;
    decay_ = active_ 
      ? info.change * secondsSince_ / info.timeToAdjusted
      : info.change;
  }
}
