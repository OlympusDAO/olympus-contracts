// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;
// pragma abicoder v2; //not needed anymore, enabled by default

import {ITreasury} from "./interfaces/OlympusInterfaces.sol";
import {ITeller} from "./interfaces/OlympusInterfaces.sol";
import {IBondDepository} from "./interfaces/OlympusInterfaces.sol";
import {IBondingCalculator} from "./interfaces/OlympusInterfaces.sol";
import {IERC20} from "./interfaces/OlympusInterfaces.sol";

import {SafeERC20} from "./libraries/SafeERC20.sol";

import "./types/Governable.sol";
import "./types/Guardable.sol";

contract OlympusBondDepository is Governable, Guardable, IBondDepository {

    using SafeERC20 for IERC20;

    /* ======== STATE VARIABLES ======== */

    mapping(uint256 => Bond) public bonds;
    address[] public IDs; // bond IDs

    ITeller public teller; // handles payment

    ITreasury immutable treasury;
    IERC20 immutable OHM;

    /* ======== CONSTRUCTOR ======== */

    constructor(address _OHM, address _treasury) {
        require(_OHM != address(0));
        require(_treasury != address(0));

        OHM = IERC20(_OHM);
        treasury = ITreasury(_treasury);
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     * @notice creates a new bond type
     * @param _principal address
     * @param _calculator address
     * @param _capacity uint
     * @param _capacityIsPayout bool
     */
    function addBond(
        address _principal,
        address _calculator,
        uint256 _capacity,
        bool _capacityIsPayout
    ) external onlyGuardian returns (uint256 id_) {
        Terms memory terms = Terms({
            controlVariable: 0,
            fixedTerm: false,
            vestingTerm: 0,
            expiration: 0,
            conclusion: 0,
            minimumPrice: 0,
            maxPayout: 0,
            maxDebt: 0
        });

        bonds[IDs.length] = Bond({
            principal: IERC20(_principal),
            calculator: IBondingCalculator(_calculator),
            terms: terms,
            termsSet: false,
            totalDebt: 0,
            lastDecay: block.number,
            capacity: _capacity,
            capacityIsPayout: _capacityIsPayout
        });

        id_ = IDs.length;
        IDs.push(_principal);
    }

    /**
     * @notice set minimum price for new bond
     * @param _id uint
     * @param _controlVariable uint
     * @param _fixedTerm bool
     * @param _vestingTerm uint
     * @param _expiration uint
     * @param _conclusion uint
     * @param _minimumPrice uint
     * @param _maxPayout uint
     * @param _maxDebt uint
     * @param _initialDebt uint
     */
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
    ) external onlyGuardian {
        require(!bonds[_id].termsSet, "Already set");

        Terms memory terms = Terms({
            controlVariable: _controlVariable,
            fixedTerm: _fixedTerm,
            vestingTerm: _vestingTerm,
            expiration: _expiration,
            conclusion: _conclusion,
            minimumPrice: _minimumPrice,
            maxPayout: _maxPayout,
            maxDebt: _maxDebt
        });

        bonds[_id].terms = terms;
        bonds[_id].totalDebt = _initialDebt;
        bonds[_id].termsSet = true;
    }

    /**
     * @notice disable existing bond
     * @param _id uint
     */
    function deprecateBond(uint256 _id) external onlyGuardian {
      bonds[_id].capacity = 0;
    }

    /**
     * @notice set teller contract
     * @param _teller address
     */
    function setTeller(address _teller) external onlyGovernor {
      require(address(teller) == address(0));
      require(_teller != address(0));
      teller = ITeller(_teller);
    }

    /* ======== MUTABLE FUNCTIONS ======== */

    event log_named_address      (string key, address val);
    event log_named_bytes32      (string key, bytes32 val);
    event log_named_decimal_int  (string key, int val, uint decimals);
    event log_named_decimal_uint (string key, uint val, uint decimals);
    event log_named_int          (string key, int val);
    event log_named_uint         (string key, uint val);
    event log_named_bytes        (string key, bytes val);
    event log_named_string       (string key, string val);
    /**
     * @notice deposit bond
     * @param _amount uint
     * @param _maxPrice uint
     * @param _depositor address
     * @param _BID uint
     * @param _feo address
     * @return uint
     */
    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor,
        uint256 _BID,
        address _feo
    ) external returns (uint256, uint256) {
        require(_depositor != address(0), "Invalid address");

        Bond memory info = bonds[ _BID ];

        require(bonds[ _BID ].termsSet, "Not initialized");
        require(block.number < info.terms.conclusion, "Bond concluded");

        emit beforeBond(_BID, bondPriceInUSD(_BID), bondPrice(_BID), debtRatio(_BID));
        calcDebtDecay(_BID);
        decayDebt(_BID);

        require(info.totalDebt <= info.terms.maxDebt, "Max debt exceeded");
        require(_maxPrice >= _bondPrice(_BID), "Slippage limit: more than max price"); // slippage protection

        uint256 value = treasury.tokenValue(address(info.principal), _amount);

//       emit log_named_uint("value", value);
//
//        emit log_named_uint("bonds[ _BID ].terms.controlVariable", bonds[ _BID ].terms.controlVariable);
//
//        emit log_named_uint("currentDebt(_BID)", currentDebt(_BID));
//        emit log_named_uint("OHM.totalSupply", OHM.totalSupply());
//        emit log_named_uint("bonds[ _BID ].totalDebt", bonds[ _BID ].totalDebt);



//        emit log_named_uint("debtRatio mnanual calc", (currentDebt(_BID) * 1e9 / OHM.totalSupply()) / 1e18);
//        emit log_named_uint("debtRatio(_BID)", debtRatio(_BID));
//        emit log_named_uint("price_", (bonds[ _BID ].terms.controlVariable * debtRatio(_BID) + 1000000000) / 1e7);
        uint256 payout = payoutFor(value, _BID); // payout to bonder is computed

        // ensure there is remaining capacity for bond
        if (info.capacityIsPayout) {
          // capacity in payout terms
          require(info.capacity >= payout, "Bond concluded");
          info.capacity -= payout;
        } else {
          // capacity in principal terms
          require(info.capacity >= _amount, "Bond concluded");
          info.capacity -= _amount;
        }

//emit log_named_uint("payout", payout);
        require(payout >= 10000000, "Bond too small"); // must be > 0.01 OHM ( underflow protection )
        require(payout <= maxPayout(_BID), "Bond too large"); // size protection because there is no slippage

        SafeERC20.safeTransfer(info.principal, address(treasury), _amount); // send payout to treasury

        bonds[ _BID ].totalDebt = info.totalDebt + value; // increase total debt

        uint256 expiration = info.terms.vestingTerm + block.number;
        if (!info.terms.fixedTerm) {
          expiration = info.terms.expiration;
        }

        // user info stored with teller
        uint256 index = teller.newBond(
            _depositor,
            address(info.principal),
            _amount, payout,
            expiration,
            _feo
        );

        emit CreateBond(_BID, _amount, payout, expiration);

        return (payout, index);
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     * @notice reduce total debt
     * @param _BID uint
     */
    function decayDebt(uint256 _BID) internal {
      bonds[ _BID ].totalDebt -= debtDecay(_BID);
      bonds[ _BID ].lastDecay = block.number;
    }

    /* ======== VIEW FUNCTIONS ======== */

    // BOND TYPE INFO

    /**
     * @notice returns data about a bond type
     * @param _BID uint
     * @return principal_ address
     * @return calculator_ address
     * @return totalDebt_ uint
     * @return lastBondCreatedAt_ uint
     */
    function bondInfo(uint256 _BID)
        external
        view
        returns (
            address principal_,
            address calculator_,
            uint256 totalDebt_,
            uint256 lastBondCreatedAt_
        )
    {
        Bond memory info = bonds[ _BID ];

        principal_ = address(info.principal);
        calculator_ = address(info.calculator);
        totalDebt_ = info.totalDebt;
        lastBondCreatedAt_ = info.lastDecay;
    }

    /**
     * @notice returns terms for a bond type
     * @param _BID uint
     * @return controlVariable_ uint
     * @return vestingTerm_ uint
     * @return minimumPrice_ uint
     * @return maxPayout_ uint
     * @return maxDebt_ uint
     */
    function bondTerms(uint256 _BID)
        external
        view
        returns (
            uint256 controlVariable_,
            uint256 vestingTerm_,
            uint256 minimumPrice_,
            uint256 maxPayout_,
            uint256 maxDebt_
        )
    {
        Terms memory terms = bonds[ _BID ].terms;

        controlVariable_ = terms.controlVariable;
        vestingTerm_ = terms.vestingTerm;
        minimumPrice_ = terms.minimumPrice;
        maxPayout_ = terms.maxPayout;
        maxDebt_ = terms.maxDebt;
    }

    // PAYOUT

    /**
     * @notice determine maximum bond size
     * @param _BID uint
     * @return uint
     */
    function maxPayout(uint256 _BID) public view returns (uint256) {
      return (OHM.totalSupply() * bonds[ _BID ].terms.maxPayout) / 1e5;
    }

    /**
     * @notice payout due for amount of treasury value
     * @param _value uint
     * @param _BID uint
     * @return uint
     */
    function payoutFor(uint256 _value, uint256 _BID) public view returns (uint256) {
      return (_value / bondPrice(_BID)) / 1e16;
    }

    /**
     * @notice payout due for amount of token
     * @param _amount uint
     * @param _BID uint
     */
    function payoutForAmount(uint256 _amount, uint256 _BID) public view returns (uint256) {
      address principal = address(bonds[ _BID ].principal);
      return payoutFor(treasury.tokenValue(principal, _amount), _BID);
    }

    // BOND PRICE

    /**
     * @notice calculate current bond premium
     * @param _BID uint
     * @return price_ uint
     */
    function bondPrice(uint256 _BID) public view returns (uint256 price_) {
        price_ = (bonds[ _BID ].terms.controlVariable * debtRatio(_BID) + 1000000000) / 1e7;

        if (price_ < bonds[ _BID ].terms.minimumPrice) {
          price_ = bonds[ _BID ].terms.minimumPrice;
        }
    }

    /**
     * @notice calculate current bond price and remove floor if above
     * @param _BID uint
     * @return price_ uint
     */
    function _bondPrice(uint256 _BID) internal returns (uint256 price_) {
      Bond memory info = bonds[ _BID ];

      price_ = (info.terms.controlVariable * debtRatio(_BID) + 1e9) / 1e7;

      if (price_ < info.terms.minimumPrice) {
        price_ = info.terms.minimumPrice;
      } else if (info.terms.minimumPrice != 0) {
        bonds[ _BID ].terms.minimumPrice = 0;
      }
    }

    /**
     * @notice converts bond price to DAI value
     * @param _BID uint
     * @return price_ uint
     */
    function bondPriceInUSD(uint256 _BID) public view returns (uint256 price_) {
      Bond memory bond = bonds[ _BID ];

      if ( address(bond.calculator) != address(0) ) {
        price_ = bondPrice(_BID) * bond.calculator.markdown( address(bond.principal) ) / 100;
      } else {
        price_ = bondPrice(_BID) * 10**bond.principal.decimals() / 100;
      }
    }

    // DEBT

    /**
     * @notice calculate current ratio of debt to OHM supply
     * @param _BID uint
     * @return debtRatio_ uint
     */
    function debtRatio(uint256 _BID) public view returns (uint256 debtRatio_) {
      //debtRatio_ = FixedPoint.fraction( currentDebt(_BID) * 1e9, OHM.totalSupply() ).decode112with18() / 1e18;
      debtRatio_ = (currentDebt(_BID) * 1e9 / OHM.totalSupply()) / 1e18;
    }

    /**
     * @notice debt ratio in same terms for reserve or liquidity bonds
     * @return uint
     */
    function standardizedDebtRatio(uint256 _BID) public view returns (uint256) {
      Bond memory bond = bonds[ _BID ];
      if (address(bond.calculator) != address(0)) {
        return debtRatio(_BID) * bond.calculator.markdown( address(bond.principal) ) / 1e9;
      } else {
        return debtRatio(_BID);
      }
    }

    /**
     * @notice calculate debt factoring in decay
     * @param _BID uint
     * @return uint
     */
    function currentDebt(uint256 _BID) public view returns (uint256) {
      return bonds[ _BID ].totalDebt - debtDecay(_BID);
    }

    /**
     * @notice amount to decay total debt by
     * @param _BID uint
     * @return decay_ uint
     */
    function debtDecay(uint256 _BID) public view returns (uint256 decay_) {
      Bond memory bond = bonds[ _BID ];
      uint256 blocksSinceLast = block.number - bond.lastDecay;

      decay_ = bond.totalDebt * blocksSinceLast / bond.terms.vestingTerm;
      if (decay_ > bond.totalDebt) {
        decay_ = bond.totalDebt;
      }
    }

    function calcDebtDecay(uint256 _BID) public  returns (uint256 decay_) {
        Bond memory bond = bonds[ _BID ];
        uint256 blocksSinceLast = block.number - bond.lastDecay;
        emit log_named_uint("block.number", block.number);
        emit log_named_uint("bond.lastDecay", bond.lastDecay);
        emit log_named_uint("blocksSinceLast", blocksSinceLast);

        decay_ = bond.totalDebt * blocksSinceLast / bond.terms.vestingTerm;
        emit log_named_uint("decay_", decay_);
        if (decay_ > bond.totalDebt) {
            decay_ = bond.totalDebt;
            emit log_named_uint("decay_", decay_);
        }

//        emit log_named_uint("debtDecay(_BID)", debtDecay(_BID));
//
//        Bond memory bond = bonds[ _BID ];
//        uint256 blocksSinceLast = block.number - bond.lastDecay;
//
//        decay_ = bond.totalDebt * blocksSinceLast / bond.terms.vestingTerm;
//        if (decay_ > bond.totalDebt) {
//            decay_ = bond.totalDebt;
//        }
    }
}
