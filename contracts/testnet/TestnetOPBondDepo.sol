// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "./types/MarketCreator.sol";
import "./types/NoteKeeper.sol";
import "./types/Rewarder.sol";
import "./types/Viewer.sol";

import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20Metadata.sol";
import "./interfaces/IOlympusPro.sol";
import "./interfaces/IProCall.sol";

/// @title Olympus Pro Depository V2
/// @author Zeus, Indigo
/// Review by: JeffX

contract TestnetOPBondDepo is ProMarketCreator, ProViewer, ProNoteKeeper, ProRewarder {
    using SafeERC20 for IERC20;

    event Bond(uint256 indexed id, uint256 amount, uint256 price);
    event Tuned(uint256 indexed id, uint256 oldControlVariable, uint256 newControlVariable);

    constructor(address _authority)
        ProMarketCreator()
        ProViewer()
        ProNoteKeeper()
        ProRewarder(IOlympusAuthority(_authority))
    {}

    /* ========== EXTERNAL ========== */

    /**
     * @notice             deposit quote tokens in exchange for a bond in a specified market
     * @param _amounts     [amount in, min amount out]
     * @param _addresses   [recipient, referrer]
     */
    function deposit(
        uint48 _id,
        uint256[2] memory _amounts,
        address[2] memory _addresses
    )
        external
        returns (
            uint256 payout_,
            uint256 expiry_,
            uint256 index_
        )
    {
        Market storage market = markets[_id];
        Terms memory term = terms[_id];
        uint48 currentTime = uint48(block.timestamp);
        address sendTo; // receives base tokens at time of deposit
        uint256 price = _decayAndGetPrice(_id, currentTime); // Debt and the control variable decay over time

        // Markets end at a defined timestamp
        require(currentTime < term.conclusion, "Depository: market concluded");

        /**
         * payout for the deposit = amount / price
         *
         * where
         * payout = base tokens out
         * amount = quote tokens in
         * price = quote tokens : base token (i.e. 200 QUOTE : BASE)
         */
        payout_ = (_amounts[0] * (10**(2 * metadata[_id].baseDecimals))) / price / (10**metadata[_id].quoteDecimals);

        // markets have a max payout amount, capping size because deposits
        // do not experience slippage. max payout is recalculated upon tuning
        require(payout_ <= market.maxPayout, "Depository: max size exceeded");

        // payout must be greater than user inputted minimum
        require(payout_ >= _amounts[1], "Depository: Less than min out");

        // if there is no vesting time, the deposit is treated as an instant swap.
        // in this case, the recipient (_address[0]) receives the payout immediately.
        // otherwise, deposit info is stored and payout is available at a future timestamp.
        if ((term.fixedTerm && term.vesting == 0) || (!term.fixedTerm && term.vesting <= block.timestamp)) {
            // instant swap case
            sendTo = _addresses[0];

            // Note zero expiry denotes an instant swap in return values
            expiry_ = 0;
        } else {
            // vested swap case
            sendTo = address(vestingContract);

            // we have to store info about their deposit

            /**
             * bonds mature with a cliff at a set timestamp
             * prior to the expiry timestamp, no payout tokens are accessible to the user
             * after the expiry timestamp, the entire payout can be redeemed
             *
             * there are two types of bonds: fixed-term and fixed-expiration
             *
             * fixed-term bonds mature in a set amount of time from deposit
             * i.e. term = 1 week. when alice deposits on day 1, her bond
             * expires on day 8. when bob deposits on day 2, his bond expires day 9.
             *
             * fixed-expiration bonds mature at a set timestamp
             * i.e. expiration = day 10. when alice deposits on day 1, her term
             * is 9 days. when bob deposits on day 2, his term is 8 days.
             */
            expiry_ = term.fixedTerm ? term.vesting + currentTime : term.vesting;

            // the index of the note is the next in the user's array
            index_ = notes[_addresses[0]].length;

            /**
             * user data is stored as Notes. these are isolated array entries
             * storing the amount due, the time created, the time when payout
             * is redeemable, the time when payout was redeemed, the ID
             * of the market deposited into, and the payout (quote) token.
             */
            notes[_addresses[0]].push(
                Note({
                    payout: payout_,
                    created: uint48(block.timestamp),
                    matured: uint48(expiry_),
                    redeemed: 0,
                    marketID: uint48(_id),
                    token: address(market.baseToken)
                })
            );
        }

        /*
         * capacity is either the number of base tokens that the market can sell
         * (if capacity in quote is false),
         *
         * or the number of quote tokens that the market can buy
         * (if capacity in quote is true)
         */

        // capacity is decreased by the deposited or paid amount
        market.capacity -= market.capacityInQuote ? _amounts[0] : payout_;

        // markets keep track of how many quote tokens have been
        // purchased, and how many base tokens have been sold
        market.purchased += _amounts[0];
        market.sold += payout_;

        // incrementing total debt raises the price of the next bond
        market.totalDebt += payout_;

        emit Bond(_id, _amounts[0], price);

        // if max debt is breached, the market is closed
        // this a circuit breaker
        if (term.maxDebt < market.totalDebt) {
            market.capacity = 0;
            emit CloseMarket(_id);
        } else {
            // if market will continue, the control variable is tuned to hit targets on time
            _tune(_id, currentTime, price); // TODO
        }

        // give fees, and transfer in base tokens from creator
        _getBaseTokens(market.call, _id, _amounts[0], payout_, _addresses[1]);

        // if instant swap, send payout to recipient. otherwise, sent to vesting
        markets[_id].baseToken.safeTransfer(sendTo, payout_);

        // transfer payment to creator
        markets[_id].quoteToken.safeTransferFrom(msg.sender, markets[_id].creator, _amounts[0]);
    }

    /* ========== INTERNAL ========== */

    /**
     * @notice             calculate current market price of base token in quote tokens
     * @dev                see marketPrice() for explanation of price computation
     * @dev                uses info from storage because data has been updated before call (vs marketPrice())
     * @param _id          market ID
     * @return             price for market in base token decimals
     */
    function _marketPrice(uint256 _id) internal view returns (uint256) {
        return (terms[_id].controlVariable * markets[_id].totalDebt) / 10**metadata[_id].baseDecimals;
    }

    /**
     * @notice             decay debt, and adjust control variable if there is an active change
     * @param _id          ID of market
     * @param _time        uint48 timestamp (saves gas when passed in)
     */
    function _decayAndGetPrice(uint256 _id, uint48 _time) internal returns (uint256 marketPrice_) {
        // Debt decay

        /*
         * Debt is a time-decayed sum of tokens spent in a market
         * Debt is added when deposits occur and removed over time
         * |
         * |    debt falls with
         * |   / \  inactivity       / \
         * | /     \              /\/    \
         * |         \           /         \
         * |           \      /\/            \
         * |             \  /  and rises       \
         * |                with deposits
         * |
         * |------------------------------------| t
         */
        markets[_id].totalDebt -= _debtDecay(_id);
        metadata[_id].lastDecay = _time;

        // Control variable decay

        // The bond control variable is continually tuned. When it is lowered (which
        // lowers the market price), the change is carried out smoothly over time.
        if (adjustments[_id].active) {
            Adjustment storage adjustment = adjustments[_id];

            (uint256 adjustBy, uint48 secondsSince, bool stillActive) = _controlDecay(_id); // implementation in ProViewer
            terms[_id].controlVariable -= adjustBy;

            if (stillActive) {
                adjustment.change -= uint128(adjustBy);
                adjustment.timeToAdjusted -= secondsSince;
                adjustment.lastAdjustment = _time;
            } else {
                adjustment.active = false;
            }
        }

        // a minimum price is maintained by raising debt back up if price has fallen below.
        marketPrice_ = _marketPrice(_id);
        uint256 minPrice = markets[_id].minPrice;
        if (marketPrice_ < minPrice) {
            markets[_id].totalDebt = (markets[_id].totalDebt * minPrice) / marketPrice_;
            marketPrice_ = minPrice;
        }
    }

    /**
     * @notice             auto-adjust control variable to hit capacity/spend target
     * @param _id          ID of market
     * @param _time        uint48 timestamp (saves gas when passed in)
     */
    function _tune(
        uint256 _id,
        uint48 _time,
        uint256 _price
    ) internal {
        Metadata memory meta = metadata[_id];

        if (_time >= meta.lastTune + meta.tuneInterval) {
            Market memory market = markets[_id];

            // compute seconds remaining until market will conclude
            uint256 timeRemaining = terms[_id].conclusion - _time;

            // standardize capacity into an base token amount
            uint256 capacity = market.capacityInQuote
                ? ((market.capacity * (10**(2 * meta.baseDecimals))) / _price) / (10**meta.quoteDecimals)
                : market.capacity;

            /**
             * calculate the correct payout to complete on time assuming each bond
             * will be max size in the desired deposit interval for the remaining time
             *
             * i.e. market has 10 days remaining. deposit interval is 1 day. capacity
             * is 10,000 TOKEN. max payout would be 1,000 TOKEN (10,000 * 1 / 10).
             */
            markets[_id].maxPayout = (capacity * meta.depositInterval) / timeRemaining;

            // calculate the ideal total debt to satisfy capacity in the remaining time
            uint256 targetDebt = (capacity * meta.length) / timeRemaining;

            // derive a new control variable from the target deb
            uint256 newControlVariable = (_price * (10**meta.baseDecimals)) / targetDebt;

            emit Tuned(_id, terms[_id].controlVariable, newControlVariable);

            if (newControlVariable >= terms[_id].controlVariable) {
                terms[_id].controlVariable = newControlVariable;
            } else {
                // if decrease, control variable change will be carried out over the tune interval
                // this is because price will be lowered
                uint256 change = terms[_id].controlVariable - newControlVariable;
                adjustments[_id] = Adjustment(uint128(change), _time, meta.tuneInterval, true);
            }
            metadata[_id].lastTune = _time;
        }
    }

    function _getBaseTokens(
        bool _call,
        uint48 _id,
        uint256 _amount,
        uint256 _payout,
        address _referrer
    ) internal {
        IERC20 baseToken = markets[_id].baseToken;

        /**
         * front end operators can earn rewards by referring users
         * transfers in reward amount to this contract (must be separate
         * transfer because payout may be sent directly to _address[0])
         */
        uint256 fee = _giveRewards(baseToken, _payout, _referrer);

        /**
         * instead of basic transferFrom, creator can be called. useful if creator
         * i.e. mints the tokens, or wants custom logic blocking transactions.
         * the balance of the correct recipient must be increased by the payout amount.
         * note that call could reenter, so this is done second to last, followed only by paying creator.
         */
        if (_call) {
            uint256 balance = baseToken.balanceOf(address(this));
            IProCall(markets[_id].creator).call(_id, _amount, _payout + fee);
            require(baseToken.balanceOf(address(this)) >= balance + _payout + fee, "Depository: not funded");

            // default is to simply transfer tokens in. make sure creator has approved this address.
        } else baseToken.safeTransferFrom(markets[_id].creator, address(this), _payout + fee);
    }

    /**
     * @notice             amount of debt to decay from total debt for market ID
     * @param _id          ID of market
     * @return             amount of debt to decay
     */
    function _debtDecay(uint256 _id) internal view returns (uint256) {
        Metadata memory meta = metadata[_id];

        uint256 secondsSince = block.timestamp - meta.lastDecay;

        return (markets[_id].totalDebt * secondsSince) / meta.length;
    }
}
