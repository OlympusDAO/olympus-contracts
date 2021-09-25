/**
 *Submitted for verification at Etherscan.io on 2021-06-12
*/

// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function add32(uint32 a, uint32 b) internal pure returns (uint32) {
        uint32 c = a + b;
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
        assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
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

library Address {

    function isContract(address account) internal view returns (bool) {
        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return _functionCall(target, data);
    }

    function _functionCall(address target, bytes memory data) private returns (bytes memory) {
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: 0 }(data);
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
                revert("Address: low-level call failed");
            }
        }
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
        bytes memory returndata = address(token).functionCall(data);
        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

interface IGovernable {
  function governor() external view returns (address);

  function renounceGovernor() external;
  
  function pushGovernor( address newGovernor_ ) external;
  
  function pullGovernor() external;
}

contract Governable is IGovernable {

    address internal _governor;
    address internal _newGovernor;

    event GovernorPushed(address indexed previousGovernor, address indexed newGovernor);
    event GovernorPulled(address indexed previousGovernor, address indexed newGovernor);

    constructor () {
        _governor = msg.sender;
        emit GovernorPulled( address(0), _governor );
    }

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
}

interface IsOHM is IERC20 {
    function rebase( uint256 ohmProfit_, uint epoch_) external returns (uint256);
    function circulatingSupply() external view returns (uint256);
    function balanceOf(address who) external override view returns (uint256);
    function gonsForBalance( uint amount ) external view returns ( uint );
    function balanceForGons( uint gons ) external view returns ( uint );
    function index() external view returns ( uint );
}

interface IWarmup {
    function retrieve( address staker_, uint amount_ ) external;
}

interface IDistributor {
    function distribute() external returns ( bool );
}

contract OlympusStaking is Governable {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint;
    using SafeMath for uint32;
    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;



    /* ========== DATA STRUCTURES ========== */

    struct Epoch {
        uint32 length;
        uint number;
        uint32 endTime;
        uint distribute;
    }

    struct Claim {
        uint deposit;
        uint gons;
        uint expiry;
        bool lock; // prevents malicious delays
    }

    enum CONTRACTS { DISTRIBUTOR, WARMUP }



    /* ========== STATE VARIABLES ========== */

    IERC20 immutable OHM;
    IsOHM immutable sOHM;

    Epoch public epoch;

    address public distributor;
    address public warmupContract;

    uint public warmupPeriod;

    mapping( address => Claim ) public warmupInfo;



    /* ========== CONSTRUCTOR ========== */
    
    constructor ( 
        address _OHM, 
        address _sOHM, 
        uint32 _epochLength,
        uint _firstEpochNumber,
        uint32 _firstEpochTime
    ) {
        require( _OHM != address(0) );
        OHM = IERC20( _OHM );
        require( _sOHM != address(0) );
        sOHM = IsOHM( _sOHM );
        
        epoch = Epoch({
            length: _epochLength,
            number: _firstEpochNumber,
            endTime: _firstEpochTime,
            distribute: 0
        });
    }

    

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
        @notice stake OHM to enter warmup
        @param _amount uint
        @param _claim bool
     */
    function stake( uint _amount, address _recipient, bool _claim ) external returns ( uint agnostic_ ) {
        rebase();
        
        OHM.safeTransferFrom( msg.sender, address(this), _amount );

        if ( _claim && warmupPeriod == 0 ) {
            sOHM.safeTransfer( _recipient, _amount );
        } else {
            Claim memory info = warmupInfo[ _recipient ];
            require( !info.lock, "Deposits for account are locked" );

            warmupInfo[ _recipient ] = Claim ({
                deposit: info.deposit.add( _amount ),
                gons: info.gons.add( sOHM.gonsForBalance( _amount ) ),
                expiry: epoch.number.add( warmupPeriod ),
                lock: false
            });
            
            sOHM.safeTransfer( warmupContract, _amount );
        }
        return getAgnosticBalance( _amount );
    }

    /**
        @notice retrieve sOHM from warmup
        @param _recipient address
     */
    function claim ( address _recipient ) public {
        Claim memory info = warmupInfo[ _recipient ];
        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];
            IWarmup( warmupContract ).retrieve( _recipient, sOHM.balanceForGons( info.gons ) );
        }
    }

    /**
        @notice forfeit sOHM in warmup and retrieve OHM
     */
    function forfeit() external {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        IWarmup( warmupContract ).retrieve( address(this), sOHM.balanceForGons( info.gons ) );
        OHM.safeTransfer( msg.sender, info.deposit );
    }

    /**
        @notice prevent new deposits to address (protection from malicious activity)
     */
    function toggleDepositLock() external {
        warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
    }

    /**
        @notice redeem sOHM for OHM
        @param _amount uint
        @param _trigger bool
     */
    function unstake( uint _amount, bool _trigger ) external {
        if ( _trigger ) {
            rebase();
        }
        sOHM.safeTransferFrom( msg.sender, address(this), _amount );
        OHM.safeTransfer( msg.sender, _amount );
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endTime <= block.timestamp ) {
            sOHM.rebase( epoch.distribute, epoch.number );

            epoch.endTime = epoch.endTime.add32( epoch.length );
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            uint balance = sOHM.balanceOf( address(this) );
            uint staked = IsOHM( sOHM ).circulatingSupply();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance.sub( staked );
            }
        }
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
        @notice returns the sOHM index, which tracks rebase growth
        @return uint
     */
    function index() public view returns ( uint ) {
        return sOHM.index();
    }

    /**
        @notice returns static balance instead of rebasing
        @param _amount uint
        @return uint
     */
    function getAgnosticBalance( uint _amount ) public view returns ( uint ) {
        return _amount.mul( 1e9 ).div( index() );
    }

    /**
        @notice converts static balance back to rebased
        @param _amount uint
        @return uint
     */
    function fromAgnosticBalance( uint _amount ) external view returns ( uint ) {
        return _amount.mul( index() ).div( 1e9 );
    }



    /* ========== MANAGERIAL FUNCTIONS ========== */

    /**
        @notice sets the contract address for LP staking
        @param _contract address
     */
    function setContract( CONTRACTS _contract, address _address ) external onlyGovernor() {
        if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
            distributor = _address;
        } else if ( _contract == CONTRACTS.WARMUP ) { // 1
            require( warmupContract == address( 0 ), "Warmup cannot be set more than once" );
            warmupContract = _address;
        }
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmup( uint _warmupPeriod ) external onlyGovernor() {
        warmupPeriod = _warmupPeriod;
    }
}
