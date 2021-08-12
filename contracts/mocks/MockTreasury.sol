// // SPDX-License-Identifier: AGPL-3.0-or-later
// pragma solidity 0.7.5;

// library SafeMath {

//     function add(uint256 a, uint256 b) internal pure returns (uint256) {
//         uint256 c = a + b;
//         require(c >= a, "SafeMath: addition overflow");

//         return c;
//     }

//     function sub(uint256 a, uint256 b) internal pure returns (uint256) {
//         return sub(a, b, "SafeMath: subtraction overflow");
//     }

//     function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//         require(b <= a, errorMessage);
//         uint256 c = a - b;

//         return c;
//     }

//     function mul(uint256 a, uint256 b) internal pure returns (uint256) {
//         if (a == 0) {
//             return 0;
//         }

//         uint256 c = a * b;
//         require(c / a == b, "SafeMath: multiplication overflow");

//         return c;
//     }

//     function div(uint256 a, uint256 b) internal pure returns (uint256) {
//         return div(a, b, "SafeMath: division by zero");
//     }

//     function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//         require(b > 0, errorMessage);
//         uint256 c = a / b;
//         return c;
//     }
// }

// library Address {

//   function isContract(address account) internal view returns (bool) {
//         // This method relies in extcodesize, which returns 0 for contracts in
//         // construction, since the code is only stored at the end of the
//         // constructor execution.

//         uint256 size;
//         // solhint-disable-next-line no-inline-assembly
//         assembly { size := extcodesize(account) }
//         return size > 0;
//     }

//     function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
//         return _functionCallWithValue(target, data, 0, errorMessage);
//     }

//     function _functionCallWithValue(address target, bytes memory data, uint256 weiValue, string memory errorMessage) private returns (bytes memory) {
//         require(isContract(target), "Address: call to non-contract");

//         // solhint-disable-next-line avoid-low-level-calls
//         (bool success, bytes memory returndata) = target.call{ value: weiValue }(data);
//         if (success) {
//             return returndata;
//         } else {
//             if (returndata.length > 0) {
//                 // solhint-disable-next-line no-inline-assembly
//                 assembly {
//                     let returndata_size := mload(returndata)
//                     revert(add(32, returndata), returndata_size)
//                 }
//             } else {
//                 revert(errorMessage);
//             }
//         }
//     }

//     function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
//         if (success) {
//             return returndata;
//         } else {
//             if (returndata.length > 0) {
//                 // solhint-disable-next-line no-inline-assembly
//                 assembly {
//                     let returndata_size := mload(returndata)
//                     revert(add(32, returndata), returndata_size)
//                 }
//             } else {
//                 revert(errorMessage);
//             }
//         }
//     }
// }

// interface IERC20 {
//     function decimals() external view returns (uint8);

//     function balanceOf(address account) external view returns (uint256);

//     function transfer(address recipient, uint256 amount) external returns (bool);

//     function approve(address spender, uint256 amount) external returns (bool);

//     function totalSupply() external view returns (uint256);

//     function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

//     event Transfer(address indexed from, address indexed to, uint256 value);

//     event Approval(address indexed owner, address indexed spender, uint256 value);
// }

// library SafeERC20 {
//     using SafeMath for uint256;
//     using Address for address;

//     function safeTransfer(IERC20 token, address to, uint256 value) internal {
//         _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
//     }

//     function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
//         _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
//     }

//     function _callOptionalReturn(IERC20 token, bytes memory data) private {
//         bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
//         if (returndata.length > 0) { // Return data is optional
//             // solhint-disable-next-line max-line-length
//             require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
//         }
//     }
// }

// interface IGovernable {
//     function governor() external view returns (address);

//     function guardian() external view returns (address);

//     function renounceGovernor() external;

//     function renounceGuardian() external;
  
//     function pushGovernor( address newGovernor_ ) external;

//     function pushGuardian( address newGuardian_ ) external;
  
//     function pullGovernor() external;

//     function pullGuardian() external;
// }

// contract Governable is IGovernable {

//     address internal _governor;
//     address internal _newGovernor;

//     address internal _guardian;
//     address internal _newGuardian;

//     event GovernorPushed(address indexed previousGovernor, address indexed newGovernor);
//     event GovernorPulled(address indexed previousGovernor, address indexed newGovernor);

//     event GuardianPushed(address indexed previousGuardian, address indexed newGuardian);
//     event GuardianPulled(address indexed previousGuardian, address indexed newGuardian);

//     constructor () {
//         _governor = msg.sender;
//         _guardian = msg.sender;
//         emit GovernorPulled( address(0), _governor );
//         emit GuardianPulled( address(0), _guardian );
//     }

//     /* ========== GOVERNOR ========== */

//     function governor() public view override returns (address) {
//         return _governor;
//     }

//     modifier onlyGovernor() {
//         require( _governor == msg.sender, "Governable: caller is not the governor" );
//         _;
//     }

//     function renounceGovernor() public virtual override onlyGovernor() {
//         emit GovernorPushed( _governor, address(0) );
//         _governor = address(0);
//     }

//     function pushGovernor( address newGovernor_ ) public virtual override onlyGovernor() {
//         require( newGovernor_ != address(0), "Governable: new governor is the zero address");
//         emit GovernorPushed( _governor, newGovernor_ );
//         _newGovernor = newGovernor_;
//     }
    
//     function pullGovernor() public virtual override {
//         require( msg.sender == _newGovernor, "Governable: must be new governor to pull");
//         emit GovernorPulled( _governor, _newGovernor );
//         _governor = _newGovernor;
//     }

//     /* ========== GUARDIAN ========== */

//     function guardian() public view override returns (address) {
//         return _guardian;
//     }

//     modifier onlyGuardian() {
//         require( _guardian == msg.sender, "Guardable: caller is not the guardian" );
//         _;
//     }

//     function renounceGuardian() public virtual override onlyGuardian() {
//         emit GuardianPushed( _guardian, address(0) );
//         _guardian = address(0);
//     }

//     function pushGuardian( address newGuardian_ ) public virtual override onlyGuardian() {
//         require( newGuardian_ != address(0), "Guardable: new guardian is the zero address");
//         emit GuardianPushed( _guardian, newGuardian_ );
//         _newGuardian = newGuardian_;
//     }
    
//     function pullGuardian() public virtual override {
//         require( msg.sender == _newGuardian, "Guardable: must be new guardian to pull");
//         emit GuardianPulled( _guardian, _newGuardian );
//         _guardian = _newGuardian;
//     }
// }

// interface IOHMERC20 is IERC20 {
//     function mint( uint256 amount_ ) external;
//     function mint( address account_, uint256 ammount_ ) external;
//     function burnFrom(address account_, uint256 amount_) external;
// }

// interface IBondCalculator {
//   function valuation( address pair_, uint amount_ ) external view returns ( uint _value );
// }

// contract MockOlympusTreasury is Governable {

//     /* ========== DEPENDENCIES ========== */

//     using SafeMath for uint;
//     using SafeERC20 for IERC20;



//     /* ========== EVENTS ========== */

//     event Deposit( address indexed token, uint amount, uint value );
//     event Withdrawal( address indexed token, uint amount, uint value );
//     event CreateDebt( address indexed debtor, address indexed token, uint amount, uint value );
//     event RepayDebt( address indexed debtor, address indexed token, uint amount, uint value );
//     event ReservesManaged( address indexed token, uint amount );
//     event ReservesUpdated( uint indexed totalReserves );
//     event ReservesAudited( uint indexed totalReserves );
//     event RewardsMinted( address indexed caller, address indexed recipient, uint amount );
//     event ChangeQueued( STATUS indexed status, address queued );
//     event ChangeActivated( STATUS indexed status, address activated, bool result );



//     /* ========== DATA STRUCTURES ========== */

//     enum STATUS {
//         RESERVEDEPOSITOR,
//         RESERVESPENDER,
//         RESERVETOKEN, 
//         RESERVEMANAGER, 
//         LIQUIDITYDEPOSITOR, 
//         LIQUIDITYTOKEN, 
//         LIQUIDITYMANAGER, 
//         DEBTOR, 
//         REWARDMANAGER, 
//         SOHM 
//     }

//     struct Queue {
//         STATUS managing;
//         address toPermit;
//         address calculator;
//         uint timelockEnd;
//         bool nullify;
//         bool executed;
//     }



//     /* ========== STATE VARIABLES ========== */

//     IOHMERC20 immutable OHM;
//     address sOHM;

//     mapping( STATUS => address[] ) public registry;
//     mapping( STATUS => mapping( address => bool ) ) public permissions;
    
//     Queue[] public permissionQueue;
//     uint public immutable blocksNeededForQueue;
    
//     mapping( address => address ) public bondCalculator;

//     mapping( address => uint ) public debtorBalance;
    
//     uint public totalReserves;
//     uint public totalDebt;



//     /* ========== CONSTRUCTOR ========== */

//     constructor (
//         address _OHM,
//         address _DAI,
//         address _OHMDAI,
//         uint _blocksNeededForQueue
//     ) {
//         require( _OHM != address(0) );
//         OHM = IOHMERC20( _OHM );

//         permissions[ STATUS.RESERVETOKEN ][ _DAI ] = true;
//         registry[ STATUS.RESERVETOKEN ].push( _DAI );

//         permissions[ STATUS.LIQUIDITYTOKEN ][ _OHMDAI ] = true;
//         registry[ STATUS.LIQUIDITYTOKEN ].push( _OHMDAI );

//         blocksNeededForQueue = _blocksNeededForQueue;
//     }



//     /* ========== MUTATIVE FUNCTIONS ========== */

//     /**
//         @notice allow approved address to deposit an asset for OHM
//         @param _from address
//         @param _amount uint
//         @param _token address
//         @param _profit uint
//         @return send_ uint
//      */
//     function deposit( address _from, uint _amount, address _token, uint _profit ) external returns ( uint send_ ) {
//         if ( permissions[ STATUS.RESERVETOKEN ][ _token ] ) {
//             require( permissions[ STATUS.RESERVEDEPOSITOR ][ msg.sender ], "Not approved" );
//         } else if ( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
//             require( permissions[ STATUS.LIQUIDITYDEPOSITOR ][ msg.sender ], "Not approved" );
//         } else {
//             require( 1 == 0 ); // guarantee revert
//         }

//         IERC20( _token ).safeTransferFrom( _from, address(this), _amount );

//         uint value = valueOfToken( _token, _amount );
//         // mint OHM needed and store amount of rewards for distribution
//         send_ = value.sub( _profit );
//         OHM.mint( msg.sender, send_ );

//         totalReserves = totalReserves.add( value );
//         emit ReservesUpdated( totalReserves );

//         emit Deposit( _token, _amount, value );
//     }

//     /**
//         @notice allow approved address to burn OHM for reserves
//         @param _amount uint
//         @param _token address
//      */
//     function withdraw( uint _amount, address _token ) external {
//         require( permissions[ STATUS.RESERVETOKEN ][ _token ], "Not accepted" ); // Only reserves can be used for redemptions
//         require( permissions[ STATUS.RESERVESPENDER ][ msg.sender ] == true, "Not approved" );

//         uint value = valueOfToken( _token, _amount );
//         OHM.burnFrom( msg.sender, value );

//         totalReserves = totalReserves.sub( value );
//         emit ReservesUpdated( totalReserves );

//         IERC20( _token ).safeTransfer( msg.sender, _amount );

//         emit Withdrawal( _token, _amount, value );
//     }

//     /**
//         @notice allow approved address to borrow reserves
//         @param _amount uint
//         @param _token address
//      */
//     function incurDebt( uint _amount, address _token ) external {
//         require( permissions[ STATUS.DEBTOR ][ msg.sender ], "Not approved" );
//         require( permissions[ STATUS.RESERVETOKEN ][ _token ], "Not accepted" );

//         uint value = valueOfToken( _token, _amount );

//         uint maximumDebt = IERC20( sOHM ).balanceOf( msg.sender ); // Can only borrow against sOHM held
//         uint availableDebt = maximumDebt.sub( debtorBalance[ msg.sender ] );
//         require( value <= availableDebt, "Exceeds debt limit" );

//         debtorBalance[ msg.sender ] = debtorBalance[ msg.sender ].add( value );
//         totalDebt = totalDebt.add( value );

//         totalReserves = totalReserves.sub( value );
//         emit ReservesUpdated( totalReserves );

//         IERC20( _token ).transfer( msg.sender, _amount );
        
//         emit CreateDebt( msg.sender, _token, _amount, value );
//     }

//     /**
//         @notice allow approved address to repay borrowed reserves with reserves
//         @param _amount uint
//         @param _token address
//      */
//     function repayDebtWithReserve( uint _amount, address _token ) external {
//         require( permissions[ STATUS.DEBTOR ][ msg.sender ], "Not approved" );
//         require( permissions[ STATUS.RESERVETOKEN ][ _token ], "Not accepted" );

//         IERC20( _token ).safeTransferFrom( msg.sender, address(this), _amount );

//         uint value = valueOfToken( _token, _amount );
//         debtorBalance[ msg.sender ] = debtorBalance[ msg.sender ].sub( value );
//         totalDebt = totalDebt.sub( value );

//         totalReserves = totalReserves.add( value );
//         emit ReservesUpdated( totalReserves );

//         emit RepayDebt( msg.sender, _token, _amount, value );
//     }

//     /**
//         @notice allow approved address to repay borrowed reserves with OHM
//         @param _amount uint
//      */
//     function repayDebtWithOHM( uint _amount ) external {
//         require( permissions[ STATUS.DEBTOR ][ msg.sender ], "Not approved" );

//         IOHMERC20( OHM ).burnFrom( msg.sender, _amount );

//         debtorBalance[ msg.sender ] = debtorBalance[ msg.sender ].sub( _amount );
//         totalDebt = totalDebt.sub( _amount );

//         emit RepayDebt( msg.sender, address( OHM ), _amount, _amount );
//     }

//     /**
//         @notice allow approved address to withdraw assets
//         @param _token address
//         @param _amount uint
//      */
//     function manage( address _token, uint _amount ) external {
//         if( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
//             require( permissions[ STATUS.LIQUIDITYMANAGER ][ msg.sender ], "Not approved" );
//         } else {
//             require( permissions[ STATUS.RESERVEMANAGER ][ msg.sender ], "Not approved" );
//         }

//         uint value = valueOfToken( _token, _amount );
//         require( value <= excessReserves(), "Insufficient reserves" );

//         totalReserves = totalReserves.sub( value );
//         emit ReservesUpdated( totalReserves );

//         IERC20( _token ).safeTransfer( msg.sender, _amount );

//         emit ReservesManaged( _token, _amount );
//     }

//     /**
//         @notice send epoch reward to staking contract
//      */
//     function mintRewards( address _recipient, uint _amount ) external {
//         require( permissions[ STATUS.REWARDMANAGER ][ msg.sender ], "Not approved" );
//         require( _amount <= excessReserves(), "Insufficient reserves" );

//         OHM.mint( _recipient, _amount );

//         emit RewardsMinted( msg.sender, _recipient, _amount );
//     } 

//     /**
//      *  @notice enable queued permission
//      *  @param _index uint
//      */
//     function execute( uint _index ) external {
//         Queue memory info = permissionQueue[ _index ];
//         require( !info.nullify, "Action has been nullified" );
//         require( !info.executed, "Action has already been executed" );
//         require( block.number >= info.timelockEnd, "Timelock not complete" );

//         if ( info.managing == STATUS.SOHM ) { // 9
//             sOHM = info.toPermit;
//         } else {
//             registry[ info.managing ].push( info.toPermit );
//             permissions[ info.managing ][ info.toPermit ] = true;
            
//             if ( info.managing == STATUS.LIQUIDITYTOKEN ) { // 5
//                 bondCalculator[ info.toPermit ] = info.calculator;
//             }
//         }
//         permissionQueue[ _index ].executed = true;
//     }



//     /* ========== GOVERNOR FUNCTIONS ========== */

//     /**
//         @notice queue address to receive permission
//         @param _status STATUS
//         @param _address address
//      */
//     function queue( STATUS _status, address _address, address _calculator ) external onlyGovernor() {
//         require( _address != address(0) );

//         uint timelock = block.number.add( blocksNeededForQueue );
//         if ( _status == STATUS.RESERVEMANAGER || _status == STATUS.LIQUIDITYMANAGER ) {
//             timelock = block.number.add( blocksNeededForQueue.mul( 2 ) );
//         }

//         permissionQueue.push( Queue({
//             managing: _status,
//             toPermit: _address,
//             calculator: _calculator,
//             timelockEnd: timelock,
//             nullify: false,
//             executed: false
//         } ) );

//         emit ChangeQueued( _status, _address );
//     }



//     /* ========== GOVERNOR or GUARDIAN FUNCTIONS ========== */

//     /**
//      *  @notice disable permission from address
//      *  @param _status STATUS
//      *  @param _toDisable address
//      */
//     function disable( STATUS _status, address _toDisable ) external {
//         require( msg.sender == governor() || msg.sender == guardian(), "Not governor or guardian" );
//         permissions[ _status ][ _toDisable ] = false;
//     }

//     /* ========== GUARDIAN FUNCTIONS ========== */

//     /**
//         @notice takes inventory of all tracked assets
//         @notice always consolidate to recognized reserves before audit
//      */
//     function auditReserves() external onlyGuardian() {
//         uint reserves;
//         address[] memory reserveToken = registry[ STATUS.RESERVETOKEN ];
//         for( uint i = 0; i < reserveToken.length; i++ ) {
//             reserves = reserves.add ( 
//                 valueOfToken( reserveToken[ i ], IERC20( reserveToken[ i ] ).balanceOf( address(this) ) )
//             );
//         }
//         address[] memory liquidityToken = registry[ STATUS.LIQUIDITYTOKEN ];
//         for( uint i = 0; i < liquidityToken.length; i++ ) {
//             reserves = reserves.add (
//                 valueOfToken( liquidityToken[ i ], IERC20( liquidityToken[ i ] ).balanceOf( address(this) ) )
//             );
//         }
//         totalReserves = reserves;
//         emit ReservesUpdated( reserves );
//         emit ReservesAudited( reserves );
//     }

//     /**
//      *  @notice prevents queued action from taking place
//      *  @param _index uint
//      */
//     function nullify( uint _index ) external onlyGuardian() {
//         require( !permissionQueue[ _index ].executed, "Action has already been executed" );
//         permissionQueue[ _index ].nullify = true;
//     }



//     /* ========== VIEW FUNCTIONS ========== */

//     /**
//         @notice returns excess reserves not backing tokens
//         @return uint
//      */
//     function excessReserves() public view returns ( uint ) {
//         return totalReserves.sub( OHM.totalSupply().sub( totalDebt ) );
//     }

//     /**
//         @notice returns OHM valuation of asset
//         @param _token address
//         @param _amount uint
//         @return value_ uint
//      */
//     function valueOfToken( address _token, uint _amount ) public view returns ( uint value_ ) {
//         if ( permissions[ STATUS.RESERVETOKEN ][ _token ] ) {
//             // convert amount to match OHM decimals
//             value_ = _amount.mul( 10 ** OHM.decimals() ).div( 10 ** IERC20( _token ).decimals() );
//         } else if ( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
//             value_ = IBondCalculator( bondCalculator[ _token ] ).valuation( _token, _amount );
//         }
//     }
// }