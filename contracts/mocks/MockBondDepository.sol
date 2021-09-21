// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }

    function sqrrt(uint256 a) internal pure returns (uint c) {
        if (a > 3) {
            c = a;
            uint b = add( div( a, 2), 1 );
            while (b < c) {
                c = b;
                b = div( add( div( a, b ), b), 2 );
            }
        } else if (a != 0) {
            c = 1;
        }
    }
}

library Address {

    function isContract(address account) internal view returns (bool) {

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return functionCall(target, data, "Address: low-level call failed");
    }

    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return _functionCallWithValue(target, data, 0, errorMessage);
    }

    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _functionCallWithValue(address target, bytes memory data, uint256 weiValue, string memory errorMessage) private returns (bytes memory) {
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: weiValue }(data);
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

    function addressToString(address _address) internal pure returns(string memory) {
        bytes32 _bytes = bytes32(uint256(_address));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _addr = new bytes(42);

        _addr[0] = '0';
        _addr[1] = 'x';

        for(uint256 i = 0; i < 20; i++) {
            _addr[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _addr[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }

        return string(_addr);

    }
}

interface IERC20 {
    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {

        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private {

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

library FullMath {
    function fullMul(uint256 x, uint256 y) private pure returns (uint256 l, uint256 h) {
        uint256 mm = mulmod(x, y, uint256(-1));
        l = x * y;
        h = mm - l;
        if (mm < l) h -= 1;
    }

    function fullDiv(
        uint256 l,
        uint256 h,
        uint256 d
    ) private pure returns (uint256) {
        uint256 pow2 = d & -d;
        d /= pow2;
        l /= pow2;
        l += h * ((-pow2) / pow2 + 1);
        uint256 r = 1;
        r *= 2 - d * r;
        r *= 2 - d * r;
        r *= 2 - d * r;
        r *= 2 - d * r;
        r *= 2 - d * r;
        r *= 2 - d * r;
        r *= 2 - d * r;
        r *= 2 - d * r;
        return l * r;
    }

    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 d
    ) internal pure returns (uint256) {
        (uint256 l, uint256 h) = fullMul(x, y);
        uint256 mm = mulmod(x, y, d);
        if (mm > l) h -= 1;
        l -= mm;
        require(h < d, 'FullMath::mulDiv: overflow');
        return fullDiv(l, h, d);
    }
}

library FixedPoint {

    struct uq112x112 {
        uint224 _x;
    }

    struct uq144x112 {
        uint256 _x;
    }

    uint8 private constant RESOLUTION = 112;
    uint256 private constant Q112 = 0x10000000000000000000000000000;
    uint256 private constant Q224 = 0x100000000000000000000000000000000000000000000000000000000;
    uint256 private constant LOWER_MASK = 0xffffffffffffffffffffffffffff; // decimal of UQ*x112 (lower 112 bits)

    function decode(uq112x112 memory self) internal pure returns (uint112) {
        return uint112(self._x >> RESOLUTION);
    }

    function decode112with18(uq112x112 memory self) internal pure returns (uint) {

        return uint(self._x) / 5192296858534827;
    }

    function fraction(uint256 numerator, uint256 denominator) internal pure returns (uq112x112 memory) {
        require(denominator > 0, 'FixedPoint::fraction: division by zero');
        if (numerator == 0) return FixedPoint.uq112x112(0);

        if (numerator <= uint144(-1)) {
            uint256 result = (numerator << RESOLUTION) / denominator;
            require(result <= uint224(-1), 'FixedPoint::fraction: overflow');
            return uq112x112(uint224(result));
        } else {
            uint256 result = FullMath.mulDiv(numerator, Q112, denominator);
            require(result <= uint224(-1), 'FixedPoint::fraction: overflow');
            return uq112x112(uint224(result));
        }
    }
}

interface IGovernable {
    function governor() external view returns (address);

    function guardian() external view returns (address);

    function renounceGovernor() external;

    function renounceGuardian() external;
  
    function pushGovernor( address newGovernor_ ) external;

    function pushGuardian( address newGuardian_ ) external;
  
    function pullGovernor() external;

    function pullGuardian() external;
}

contract Governable is IGovernable {

    address internal _governor;
    address internal _newGovernor;

    address internal _guardian;
    address internal _newGuardian;

    event GovernorPushed(address indexed previousGovernor, address indexed newGovernor);
    event GovernorPulled(address indexed previousGovernor, address indexed newGovernor);

    event GuardianPushed(address indexed previousGuardian, address indexed newGuardian);
    event GuardianPulled(address indexed previousGuardian, address indexed newGuardian);

    constructor () {
        _governor = msg.sender;
        _guardian = msg.sender;
        emit GovernorPulled( address(0), _governor );
        emit GuardianPulled( address(0), _guardian );
    }

    /* ========== GOVERNOR ========== */

    function governor() public view override returns (address) {
        return _governor;
    }

    modifier onlyGovernor() {
        require( _governor == msg.sender, "Governable: caller is not the governor" );
        _;
    }

    function renounceGovernor() public virtual override onlyGovernor() {
        emit GovernorPushed( _governor, address(0) );
        _governor = address(0);
    }

    function pushGovernor( address newGovernor_ ) public virtual override onlyGovernor() {
        require( newGovernor_ != address(0), "Governable: new governor is the zero address");
        emit GovernorPushed( _governor, newGovernor_ );
        _newGovernor = newGovernor_;
    }
    
    function pullGovernor() public virtual override {
        require( msg.sender == _newGovernor, "Governable: must be new governor to pull");
        emit GovernorPulled( _governor, _newGovernor );
        _governor = _newGovernor;
    }

    /* ========== GUARDIAN ========== */

    function guardian() public view override returns (address) {
        return _guardian;
    }

    modifier onlyGuardian() {
        require( _guardian == msg.sender, "Guardable: caller is not the guardian" );
        _;
    }

    function renounceGuardian() public virtual override onlyGuardian() {
        emit GuardianPushed( _guardian, address(0) );
        _guardian = address(0);
    }

    function pushGuardian( address newGuardian_ ) public virtual override onlyGuardian() {
        require( newGuardian_ != address(0), "Guardable: new guardian is the zero address");
        emit GuardianPushed( _guardian, newGuardian_ );
        _newGuardian = newGuardian_;
    }
    
    function pullGuardian() public virtual override {
        require( msg.sender == _newGuardian, "Guardable: must be new guardian to pull");
        emit GuardianPulled( _guardian, _newGuardian );
        _guardian = _newGuardian;
    }
}

interface ITreasury {
    function deposit( address _from, uint _amount, address _token, uint _profit ) external returns ( uint );
    function valueOfToken( address _token, uint _amount ) external view returns ( uint value_ );
    function mintRewards( address _recipient, uint _amount ) external;
}

interface IBondingCalculator {
    function markdown( address _LP ) external view returns ( uint );
}

interface ITeller {
    function newBond( address _bonder, uint _payout, uint _end ) external;
}

contract MockOlympusBondDepository is Governable {

    using FixedPoint for *;
    using SafeERC20 for IERC20;
    using SafeMath for uint;



    /* ======== EVENTS ======== */

    event USDPriceChanged( uint before, uint current );
    event InternalPriceChanged( uint before, uint current );
    event DebtRatioChanged( uint before, uint current, uint stdBefore, uint stdCurrent );
    event ControlVariableAdjustment( uint initialBCV, uint newBCV, uint adjustment, bool addition );



    /* ======== STRUCTS ======== */

    // Info about each type of bond
    struct BondType {
        IERC20 principal; // token to accept as payment
        IBondingCalculator calculator; // contract to value principal
        bool isLiquidityBond; // is principal a liquidity token
        bool isRiskAsset; // mint instead of deposit (no RFV)
        Terms terms; // terms of bond
        Adjust adjustment; // adjustment to terms of bond
        uint totalDebt; // total debt from bond 
        uint lastDecay; // last block when debt was decayed
    }

    // Info for creating new bonds
    struct Terms {
        uint controlVariable; // scaling variable for price
        uint vestingTerm; // in blocks
        uint minimumPrice; // vs principal value
        uint maxPayout; // in thousandths of a %. i.e. 500 = 0.5%
        uint fee; // as % of bond payout, in hundreths. ( 500 = 5% = 0.05 for every 1 paid)
        uint maxDebt; // 9 decimal debt ratio, max % total supply created as debt
    }

    

    // Info for incremental adjustments to control variable 
    struct Adjust {
        bool add; // addition or subtraction
        uint delta; // BCV when adjustment finished
        uint blocksToTarget; // blocks until target reached
        uint lastBlock; // block when last adjustment made
    }



    /* ======== STATE VARIABLES ======== */

    IERC20 immutable OHM; // token given as payment for bond
    ITreasury immutable treasury; // mints OHM when receives principal
    address public immutable DAO; // receives profit share from bond

    mapping( address => BondType ) bonds;

    address[] public principals;

    ITeller teller;



    /* ======== CONSTRUCTOR ======== */

    constructor ( 
        address _OHM,
        address _treasury, 
        address _DAO
    ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
        require( _DAO != address(0) );
        DAO = _DAO;
    }


    
    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice initializes bond parameters
     *  @param _principal address
     *  @param _calculator address
     *  @param _controlVariable uint
     *  @param _vestingTerm uint
     *  @param _minimumPrice uint
     *  @param _maxPayout uint
     *  @param _fee uint
     *  @param _maxDebt uint
     *  @param _initialDebt uint
     */
    function addBondType( 
        address _principal,
        address _calculator,
        bool _isRisk,
        uint _controlVariable, 
        uint _vestingTerm,
        uint _minimumPrice,
        uint _maxPayout,
        uint _fee,
        uint _maxDebt,
        uint _initialDebt
    ) external onlyGuardian() {
        require( bonds[ _principal ].terms.controlVariable == 0, "Bonds must be initialized from 0" );
        require( address( bonds[ _principal ].principal ) == address(0), "Cannot replace existing bond" );

        Terms memory terms = Terms ({
            controlVariable: _controlVariable,
            vestingTerm: _vestingTerm,
            minimumPrice: _minimumPrice,
            maxPayout: _maxPayout,
            fee: _fee,
            maxDebt: _maxDebt
        });

        bonds[ _principal ] = BondType({
            principal: IERC20( _principal ),
            calculator: IBondingCalculator( _calculator ),
            isLiquidityBond: ( _calculator != address(0) ),
            isRiskAsset: _isRisk,
            terms: terms,
            adjustment: Adjust(false, 0, 0, 0),
            totalDebt: _initialDebt,
            lastDecay: block.number
        });

        principals.push( _principal );
    }

    enum PARAMETER { VESTING, PAYOUT, FEE, DEBT }
    /**
     *  @notice set parameters for new bonds
     *  @param _parameter PARAMETER
     *  @param _input uint
     */
    function setBondTerms ( address _principal, PARAMETER _parameter, uint _input ) external onlyGovernor() {
        if ( _parameter == PARAMETER.VESTING ) { // 0
            bonds[ _principal ].terms.vestingTerm = _input;
        } else if ( _parameter == PARAMETER.PAYOUT ) { // 1
            bonds[ _principal ].terms.maxPayout = _input;
        } else if ( _parameter == PARAMETER.FEE ) { // 2
            bonds[ _principal ].terms.fee = _input;
        } else if ( _parameter == PARAMETER.DEBT ) { // 3
            bonds[ _principal ].terms.maxDebt = _input;
        }
    }

    /**
     *  @notice set control variable adjustment
     *  @param _addition bool
     *  @param _delta uint
     *  @param _blocks uint
     */
    function setAdjustment ( 
        address _principal,
        bool _addition,
        uint _delta,
        uint _blocks
    ) external {
        require( msg.sender == governor() || msg.sender == guardian(), "Not governor or guardian" );
        
        require( _blocks <= 3300, "Adjustment: Change too fast" ); // must take at least 4 hours

        bonds[ _principal ].adjustment = Adjust({
            add: _addition,
            delta: _delta,
            blocksToTarget: _blocks,
            lastBlock: block.number
        });
    }


    

    /* ======== MUTABLE FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint
     *  @param _maxPrice uint
     *  @param _depositor address
     *  @param _principal address
     *  @return uint
     */
    function deposit( 
        uint _amount, 
        uint _maxPrice,
        address _depositor,
        address _principal
    ) external returns ( uint ) {
        require( _depositor != address(0), "Invalid address" );
        
        uint initialUSDPrice = bondPriceInUSD( _principal ); // Stored in bond info
        uint initialInternalPrice = bondPrice( _principal );
        uint initialDebtRatio = debtRatio( _principal );
        uint initialStdDebtRatio = standardizedDebtRatio( _principal );

        BondType memory info = bonds[ _principal ];

        decayDebt( _principal );
        require( info.totalDebt <= info.terms.maxDebt, "Max capacity reached" );
        
        

        require( _maxPrice >= _bondPrice( _principal ), "Slippage limit: more than max price" ); // slippage protection

        uint value = treasury.valueOfToken( _principal, _amount );
        uint payout = payoutFor( value, _principal ); // payout to bonder is computed

        require( payout >= 10000000, "Bond too small" ); // must be > 0.01 OHM ( underflow protection )
        require( payout <= maxPayout( _principal ), "Bond too large"); // size protection because there is no slippage

        if ( !info.isRiskAsset ) {
            // deposit principal from sender address to treasury
            treasury.deposit( msg.sender, _amount, _principal, value.sub( payout ) );
        } else {
            treasury.mintRewards( address(this), payout );
        }
        
        // total debt is increased
        bonds[ _principal ].totalDebt = info.totalDebt.add( value ); 

        // price change event emitted        
        emit InternalPriceChanged( initialInternalPrice, bondPrice( _principal ) );
        emit USDPriceChanged( initialUSDPrice, bondPriceInUSD( _principal ) );
        emit DebtRatioChanged( initialDebtRatio, debtRatio( _principal ), initialStdDebtRatio, standardizedDebtRatio( _principal ) );
        
        // user info stored with teller
        teller.newBond( _depositor, payout, info.terms.vestingTerm );

        return payout; 
    }



    
    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     *  @notice make adjustment to control variable
     */
    function adjust( address _principal ) internal {
        Adjust memory adjustment = bonds[ _principal ].adjustment;

        if( adjustment.delta != 0 ) {
            uint initial = bonds[ _principal ].terms.controlVariable;
            uint blocksSinceLast = block.number.sub( adjustment.lastBlock );
            uint change = changeBy( _principal );

            bonds[ _principal ].adjustment.delta = adjustment.delta.sub( change );
            bonds[ _principal ].adjustment.blocksToTarget = adjustment.blocksToTarget.sub( blocksSinceLast );

            if ( adjustment.add ) {
                bonds[ _principal ].terms.controlVariable = bonds[ _principal ].terms.controlVariable.add( change );
            } else {
                bonds[ _principal ].terms.controlVariable = bonds[ _principal ].terms.controlVariable.sub( change );
            }

            bonds[ _principal ].adjustment.lastBlock = block.number;

            emit ControlVariableAdjustment( 
                initial, 
                bonds[ _principal ].terms.controlVariable, 
                change, 
                adjustment.add 
            );
        }
    }

    /**
     *  @notice reduce total debt
     */
    function decayDebt( address _principal ) internal {
        bonds[ _principal ].totalDebt = bonds[ _principal ].totalDebt.sub( debtDecay( _principal ) );
        bonds[ _principal ].lastDecay = block.number;
    }




    /* ======== VIEW FUNCTIONS ======== */

    // BOND TYPE INFO

    /**
     *  @notice returns data about a bond type
     *  @param _principal address
     *  @return calculator_ address
     *  @return isLiquidityBond_ bool
     *  @return totalDebt_ uint
     *  @return lastBondCreatedAt_ uint
     */
    function bondTypeInfo( address _principal ) external view returns (
        address calculator_,
        bool isLiquidityBond_,
        uint totalDebt_,
        uint lastBondCreatedAt_
    ) {
        calculator_ = address( bonds[ _principal ].calculator );
        isLiquidityBond_ = bonds[ _principal ].isLiquidityBond;
        totalDebt_ = bonds[ _principal ].totalDebt;
        lastBondCreatedAt_ = bonds[ _principal ].lastDecay;
    }
    
    /**
     *  @notice returns terms for a bond type
     *  @param _principal address
     *  @return controlVariable_ uint
     *  @return vestingTerm_ uint
     *  @return minimumPrice_ uint
     *  @return maxPayout_ uint
     *  @return fee_ uint
     *  @return maxDebt_ uint
     */
    function bondTerms( address _principal ) external view returns (
        uint controlVariable_,
        uint vestingTerm_,
        uint minimumPrice_,
        uint maxPayout_,
        uint fee_,
        uint maxDebt_
    ) {
        Terms memory terms = bonds[ _principal ].terms;
        controlVariable_ = terms.controlVariable;
        vestingTerm_ = terms.vestingTerm;
        minimumPrice_ = terms.minimumPrice;
        maxPayout_ = terms.maxPayout;
        fee_ = terms.fee;
        maxDebt_ = terms.maxDebt;
    }
    
    /**
     *  @notice returns pending BCV adjustment for a bond type
     *  @param _principal address
     *  @return controlVariable_ uint
     *  @return add_ bool
     *  @return delta_ uint
     *  @return blocksToTarget_ uint
     *  @return lastBlock_ uint
     */
    function bondAdjustments( address _principal ) external view returns (
        uint controlVariable_,
        bool add_,
        uint delta_,
        uint blocksToTarget_,
        uint lastBlock_
    ) {
        controlVariable_ = bonds[ _principal ].terms.controlVariable;
        Adjust memory adjustment = bonds[ _principal ].adjustment;
        add_ = adjustment.add;
        delta_ = adjustment.delta;
        blocksToTarget_ = adjustment.blocksToTarget;
        lastBlock_ = adjustment.lastBlock;
    }


    // PAYOUT

    /**
     *  @notice determine maximum bond size
     *  @return uint
     */
    function maxPayout( address _principal ) public view returns ( uint ) {
        return OHM.totalSupply().mul( bonds[ _principal ].terms.maxPayout ).div( 100000 );
    }

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint
     *  @return uint
     */
    function payoutFor( uint _value, address _principal ) public view returns ( uint ) {
        return FixedPoint.fraction( _value, bondPrice( _principal ) ).decode112with18().div( 1e16 );
    }


    // BOND CONTROL VARIABLE

    function BCV( address _principal ) public view returns ( uint BCV_ ) {
        Adjust memory adjustment = bonds[ _principal ].adjustment;

        uint change = changeBy( _principal );

        if ( adjustment.add ) {
            BCV_ = bonds[ _principal ].terms.controlVariable.add( change );
        } else {
            BCV_ = bonds[ _principal ].terms.controlVariable.sub( change );
        }
    }

    /**
     *  @notice amount to change BCV by
     *  @param _principal address
     *  @return changeBy_ uint
     */
    function changeBy( address _principal ) internal view returns ( uint changeBy_ ) {
        Adjust memory adjustment = bonds[ _principal ].adjustment;

        uint blocksSinceLast = block.number.sub( adjustment.lastBlock );

        changeBy_ = adjustment.delta.mul( blocksSinceLast ).div( adjustment.blocksToTarget );

        if ( changeBy_ > adjustment.delta ) {
            changeBy_ = adjustment.delta;
        }
    }


    // BOND PRICE

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint
     */
    function bondPrice( address _principal ) public view returns ( uint price_ ) { 
        price_ = BCV( _principal ).mul( debtRatio( _principal ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < bonds[ _principal ].terms.minimumPrice ) {
            price_ = bonds[ _principal ].terms.minimumPrice;
        }
    }

    /**
     *  @notice calculate current bond price and remove floor if above
     *  @return price_ uint
     */
    function _bondPrice( address _principal ) internal returns ( uint price_ ) {
        adjust( _principal );
        price_ = bonds[ _principal ].terms.controlVariable.mul( debtRatio( _principal ) ).add( 1000000000 ).div( 1e7 );
        if ( price_ < bonds[ _principal ].terms.minimumPrice ) {
            price_ = bonds[ _principal ].terms.minimumPrice;        
        } else if ( bonds[ _principal ].terms.minimumPrice != 0 ) {
            bonds[ _principal ].terms.minimumPrice = 0;
        }
    }

    /**
     *  @notice converts bond price to DAI value
     *  @return price_ uint
     */
    function bondPriceInUSD( address _principal ) public view returns ( uint price_ ) {
        BondType memory bond = bonds[ _principal ];
        if( bond.isLiquidityBond ) {
            price_ = bondPrice( _principal ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 100 );
        } else {
            price_ = bondPrice( _principal ).mul( 10 ** bond.principal.decimals() ).div( 100 );
        }
    }


    // DEBT

    /**
     *  @notice calculate current ratio of debt to OHM supply
     *  @return debtRatio_ uint
     */
    function debtRatio( address _principal ) public view returns ( uint debtRatio_ ) {   
        debtRatio_ = FixedPoint.fraction( 
            currentDebt( _principal ).mul( 1e9 ), 
            OHM.totalSupply()
        ).decode112with18().div( 1e18 );
    }

    /**
     *  @notice debt ratio in same terms for reserve or liquidity bonds
     *  @return uint
     */
    function standardizedDebtRatio( address _principal ) public view returns ( uint ) {
        BondType memory bond = bonds[ _principal ];
        if ( bond.isLiquidityBond ) {
            return debtRatio( _principal ).mul( bond.calculator.markdown( address( bond.principal ) ) ).div( 1e9 );
        } else {
            return debtRatio( _principal );
        }
    }

    /**
     *  @notice calculate debt factoring in decay
     *  @return uint
     */
    function currentDebt( address _principal ) public view returns ( uint ) {
        return bonds[ _principal ].totalDebt.sub( debtDecay( _principal ) );
    }

    /**
     *  @notice amount to decay total debt by
     *  @return decay_ uint
     */
    function debtDecay( address _principal ) public view returns ( uint decay_ ) {
        BondType memory bond = bonds[ _principal ];
        uint blocksSinceLast = block.number.sub( bond.lastDecay );
        decay_ = bond.totalDebt.mul( blocksSinceLast ).div( bond.terms.vestingTerm );
        if ( decay_ > bond.totalDebt ) {
            decay_ = bond.totalDebt;
        }
    }



    /* ======= AUXILLIARY ======= */

    /**
     *  @notice allow anyone to send lost tokens (except OHM) to the DAO
     */
    function recoverLostToken( address _token ) external {
        require( _token != address( OHM ) );
        IERC20( _token ).safeTransfer( DAO, IERC20( _token ).balanceOf( address(this) ) );
    }
}