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
}

library Address {

  function isContract(address account) internal view returns (bool) {
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return _functionCallWithValue(target, data, 0, errorMessage);
    }

    function _functionCallWithValue(address target, bytes memory data, uint256 weiValue, string memory errorMessage) private returns (bytes memory) {
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: weiValue }(data);
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {
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

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {
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
}

interface IERC20 {
    function decimals() external view returns (uint8);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function totalSupply() external view returns (uint256);

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

    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

interface IGuardable {
    function guardian() external view returns (address);

    function renounceGuardian() external;
  
    function pushGuardian( address newGuardian_ ) external;
  
    function pullGuardian() external;
}

contract Guardable is IGuardable {

    address internal _guardian;
    address internal _newGuardian;

    event GuardianPushed(address indexed previousGuardian, address indexed newGuardian);
    event GuardianPulled(address indexed previousGuardian, address indexed newGuardian);

    constructor () {
        _guardian = msg.sender;
        emit GuardianPulled( address(0), _guardian );
    }


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

interface IBondCalculator {
  function valuation( address pair_, uint amount_ ) external view returns ( uint _value );
}

contract OlympusTreasury is Guardable {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint;
    using SafeERC20 for IERC20;



    /* ========== EVENTS ========== */

    event ReservesManaged( address indexed token, uint amount );
    event RewardsDispensed( address indexed caller, address indexed recipient, uint amount );
    event ChangeQueued( STATUS indexed status, address queued );
    event ChangeActivated( STATUS indexed status, address activated, bool result );



    /* ========== DATA STRUCTURES ========== */

    enum STATUS {
        RESERVETOKEN,
        LIQUIDITYTOKEN,
        MANAGER, 
        DISPENSEE
    }

    struct Queue {
        STATUS managing;
        address toPermit;
        address calculator;
        uint timelockEnd;
        bool nullify;
        bool executed;
    }



    /* ========== STATE VARIABLES ========== */

    IERC20 immutable OHM;

    mapping( STATUS => address[] ) public registry;
    mapping( STATUS => mapping( address => bool ) ) public permissions;
    
    Queue[] public permissionQueue;
    uint public immutable blocksNeededForQueue;
    
    mapping( address => address ) public bondCalculator;
    


    /* ========== CONSTRUCTOR ========== */

    constructor ( address _OHM, uint _blocksNeededForQueue ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        
        blocksNeededForQueue = _blocksNeededForQueue;
    }



    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
        @notice allow approved address to withdraw assets
        @param _token address
        @param _amount uint
     */
    function manage( address _token, uint _amount ) external {
        require( permissions[ STATUS.MANAGER ][ msg.sender ], "Not approved" );

        IERC20( _token ).safeTransfer( msg.sender, _amount );

        emit ReservesManaged( _token, _amount );
    }

    /**
        @notice send epoch reward to staking contract
     */
    function dispense( address _recipient, uint _amount ) external {
        require( permissions[ STATUS.DISPENSEE ][ msg.sender ], "Not approved" );

        OHM.transfer( _recipient, _amount );

        emit RewardsDispensed( msg.sender, _recipient, _amount );
    } 

    /**
     *  @notice enable queued permission
     *  @param _index uint
     */
    function execute( uint _index ) external {
        Queue memory info = permissionQueue[ _index ];
        require( !info.nullify, "Action has been nullified" );
        require( !info.executed, "Action has already been executed" );
        require( block.number >= info.timelockEnd, "Timelock not complete" );

        registry[ info.managing ].push( info.toPermit );
        permissions[ info.managing ][ info.toPermit ] = true;
        
        if ( info.managing == STATUS.LIQUIDITYTOKEN ) { // 5
            bondCalculator[ info.toPermit ] = info.calculator;
        }
        
        permissionQueue[ _index ].executed = true;
    }



    /* ========== GOVERNOR FUNCTIONS ========== */

    /**
        @notice queue address to receive permission
        @param _status STATUS
        @param _address address
     */
    function queue( STATUS _status, address _address, address _calculator ) external onlyGuardian() {
        require( _address != address(0) );

        uint timelock = block.number;
        if ( _status == STATUS.MANAGER || _status == STATUS.DISPENSEE ) {
            timelock = block.number.add( blocksNeededForQueue );
        }

        permissionQueue.push( Queue({
            managing: _status,
            toPermit: _address,
            calculator: _calculator,
            timelockEnd: timelock,
            nullify: false,
            executed: false
        } ) );

        emit ChangeQueued( _status, _address );
    }



    /* ========== GUARDIAN FUNCTIONS ========== */

    /**
     *  @notice disable permission from address
     *  @param _status STATUS
     *  @param _toDisable address
     */
    function disable( STATUS _status, address _toDisable ) external onlyGuardian() {
        permissions[ _status ][ _toDisable ] = false;
    }

    /**
     *  @notice prevents queued action from taking place
     *  @param _index uint
     */
    function nullify( uint _index ) external onlyGuardian() {
        permissionQueue[ _index ].nullify = true;
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
        @notice returns OHM valuation of asset
        @param _token address
        @param _amount uint
        @return value_ uint
     */
    function valueOf( address _token, uint _amount ) public view returns ( uint value_ ) {
        if ( permissions[ STATUS.RESERVETOKEN ][ _token ] ) {
            // convert amount to match OHM decimals
            value_ = _amount.mul( 10 ** OHM.decimals() ).div( 10 ** IERC20( _token ).decimals() );
        } else if ( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
            value_ = IBondCalculator( bondCalculator[ _token ] ).valuation( _token, _amount );
        }
    }
}