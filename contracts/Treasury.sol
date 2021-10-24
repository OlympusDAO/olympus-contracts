 // SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IOwnable.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IERC20Metadata.sol";
import "./interfaces/IOHMERC20.sol";
import "./interfaces/IBondingCalculator.sol";

import "./types/Ownable.sol";

contract OlympusTreasury is Ownable {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint;
    using SafeERC20 for IERC20;



    /* ========== EVENTS ========== */

    event Deposit( address indexed token, uint amount, uint value );
    event Withdrawal( address indexed token, uint amount, uint value );
    event CreateDebt( address indexed debtor, address indexed token, uint amount, uint value );
    event RepayDebt( address indexed debtor, address indexed token, uint amount, uint value );
    event ReservesManaged( address indexed token, uint amount );
    event ReservesAudited( uint indexed totalReserves );
    event Minted( address indexed caller, address indexed recipient, uint amount );
    event PermissionQueued( STATUS indexed status, address queued );
    event Permissioned( address addr, STATUS indexed status, bool result );



    /* ========== DATA STRUCTURES ========== */

    enum STATUS {
        RESERVEDEPOSITOR,
        RESERVESPENDER,
        RESERVETOKEN, 
        RESERVEMANAGER, 
        LIQUIDITYDEPOSITOR, 
        LIQUIDITYTOKEN, 
        LIQUIDITYMANAGER, 
        DEBTOR, 
        REWARDMANAGER, 
        SOHM 
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

    IOHMERC20 immutable OHM;
    IERC20 public sOHM;

    mapping( STATUS => address[] ) public registry;
    mapping( STATUS => mapping( address => bool ) ) public permissions;
    mapping( address => address ) public bondCalculator;

    mapping( address => uint ) public debtorBalance;
    
    uint public totalReserves;
    uint public totalDebt;

    Queue[] public permissionQueue;
    uint public immutable blocksNeededForQueue;

    bool public onChainGoverned;
    uint public onChainGovernanceTimelock;



    /* ========== CONSTRUCTOR ========== */

    constructor ( address _OHM, uint _timelock ) {
        require( _OHM != address(0) );
        OHM = IOHMERC20( _OHM );
        
        blocksNeededForQueue = _timelock;
    }



    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
        @notice allow approved address to deposit an asset for OHM
        @param _amount uint
        @param _token address
        @param _profit uint
        @return send_ uint
     */
    function deposit( uint _amount, address _token, uint _profit ) external returns ( uint send_ ) {
        if ( permissions[ STATUS.RESERVETOKEN ][ _token ] ) {
            require( permissions[ STATUS.RESERVEDEPOSITOR ][ msg.sender ], "Not approved" );
        } else if ( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
            require( permissions[ STATUS.LIQUIDITYDEPOSITOR ][ msg.sender ], "Not approved" );
        } else {
            revert("Not approved");
        }

        IERC20( _token ).safeTransferFrom( msg.sender, address(this), _amount );

        uint value = tokenValue( _token, _amount );
        // mint OHM needed and store amount of rewards for distribution
        send_ = value.sub( _profit );
        OHM.mint( msg.sender, send_ );

        totalReserves = totalReserves.add( value );

        emit Deposit( _token, _amount, value );
    }

    /**
        @notice allow approved address to burn OHM for reserves
        @param _amount uint
        @param _token address
     */
    function withdraw( uint _amount, address _token ) external {
        require( permissions[ STATUS.RESERVETOKEN ][ _token ], "Not accepted" ); // Only reserves can be used for redemptions
        require( permissions[ STATUS.RESERVESPENDER ][ msg.sender ] == true, "Not approved" );

        uint value = tokenValue( _token, _amount );
        OHM.burnFrom( msg.sender, value );

        totalReserves = totalReserves.sub( value );

        IERC20( _token ).safeTransfer( msg.sender, _amount );

        emit Withdrawal( _token, _amount, value );
    }

    /**
        @notice allow approved address to borrow reserves
        @param _amount uint
        @param _token address
     */
    function incurDebt( uint _amount, address _token ) external {
        require( permissions[ STATUS.DEBTOR ][ msg.sender ], "Not approved" );
        require( permissions[ STATUS.RESERVETOKEN ][ _token ], "Not accepted" );

        uint value = tokenValue( _token, _amount );
        require( value != 0 );

        uint availableDebt = sOHM.balanceOf( msg.sender ).sub( debtorBalance[ msg.sender ] );
        require( value <= availableDebt, "Exceeds debt limit" );

        debtorBalance[ msg.sender ] = debtorBalance[ msg.sender ].add( value );
        totalDebt = totalDebt.add( value );

        totalReserves = totalReserves.sub( value );

        IERC20( _token ).transfer( msg.sender, _amount );
        
        emit CreateDebt( msg.sender, _token, _amount, value );
    }

    /**
        @notice allow approved address to repay borrowed reserves with reserves
        @param _amount uint
        @param _token address
     */
    function repayDebtWithReserve( uint _amount, address _token ) external {
        require( permissions[ STATUS.DEBTOR ][ msg.sender ], "Not approved" );
        require( permissions[ STATUS.RESERVETOKEN ][ _token ], "Not accepted" );

        IERC20( _token ).safeTransferFrom( msg.sender, address(this), _amount );

        uint value = tokenValue( _token, _amount );
        debtorBalance[ msg.sender ] = debtorBalance[ msg.sender ].sub( value );
        totalDebt = totalDebt.sub( value );

        totalReserves = totalReserves.add( value );

        emit RepayDebt( msg.sender, _token, _amount, value );
    }

    /**
        @notice allow approved address to repay borrowed reserves with OHM
        @param _amount uint
     */
    function repayDebtWithOHM( uint _amount ) external {
        require( permissions[ STATUS.DEBTOR ][ msg.sender ], "Not approved" );

        OHM.burnFrom( msg.sender, _amount );

        debtorBalance[ msg.sender ] = debtorBalance[ msg.sender ].sub( _amount );
        totalDebt = totalDebt.sub( _amount );

        emit RepayDebt( msg.sender, address( OHM ), _amount, _amount );
    }

    /**
        @notice allow approved address to withdraw assets
        @param _token address
        @param _amount uint
     */
    function manage( address _token, uint _amount ) external {
        if( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
            require( permissions[ STATUS.LIQUIDITYMANAGER ][ msg.sender ], "Not approved" );
        } else {
            require( permissions[ STATUS.RESERVEMANAGER ][ msg.sender ], "Not approved" );
        }

        uint value = tokenValue( _token, _amount );
        require( value <= excessReserves(), "Insufficient reserves" );

        totalReserves = totalReserves.sub( value );

        IERC20( _token ).safeTransfer( msg.sender, _amount );

        emit ReservesManaged( _token, _amount );
    }

    /**
        @notice send epoch reward to staking contract
     */
    function mint( address _recipient, uint _amount ) external {
        require( permissions[ STATUS.REWARDMANAGER ][ msg.sender ], "Not approved" );
        require( _amount <= excessReserves(), "Insufficient reserves" );

        OHM.mint( _recipient, _amount );

        emit Minted( msg.sender, _recipient, _amount );
    } 



    /* ========== MANAGERIAL FUNCTIONS ========== */

    /**
        @notice takes inventory of all tracked assets
        @notice always consolidate to recognized reserves before audit
     */
    function auditReserves() external onlyOwner() {
        uint reserves;
        address[] memory reserveToken = registry[ STATUS.RESERVETOKEN ];
        for( uint i = 0; i < reserveToken.length; i++ ) {
            reserves = reserves.add ( 
                tokenValue( reserveToken[ i ], IERC20( reserveToken[ i ] ).balanceOf( address(this) ) )
            );
        }
        address[] memory liquidityToken = registry[ STATUS.LIQUIDITYTOKEN ];
        for( uint i = 0; i < liquidityToken.length; i++ ) {
            reserves = reserves.add (
                tokenValue( liquidityToken[ i ], IERC20( liquidityToken[ i ] ).balanceOf( address(this) ) )
            );
        }
        totalReserves = reserves;
        emit ReservesAudited( reserves );
    }

    /**
     * @notice enable permission from queue
     * @param _status STATUS
     * @param _address address
     * @param _calculator address
     */
    function enable( STATUS _status, address _address, address _calculator ) external onlyOwner() {
        require( onChainGoverned, "OCG Not Enabled: Use queueTimelock" );
        if ( _status == STATUS.SOHM ) { // 9
            sOHM = IERC20( _address );
        } else {
            registry[ _status ].push( _address );
            permissions[ _status ][ _address ] = true;
            
            if ( _status == STATUS.LIQUIDITYTOKEN ) { // 5
                bondCalculator[ _address ] = _calculator;
            }
        }
        emit Permissioned( _address, _status, true );
    }

    /**
     *  @notice disable permission from address
     *  @param _status STATUS
     *  @param _toDisable address
     */
    function disable( STATUS _status, address _toDisable ) external onlyOwner() {
        permissions[ _status ][ _toDisable ] = false;
        emit Permissioned( _toDisable, _status, false );
    }



    /* ========== TIMELOCKED FUNCTIONS ========== */

    // functions are used prior to enabling on-chain governance

    /**
        @notice queue address to receive permission
        @param _status STATUS
        @param _address address
     */
    function queueTimelock( STATUS _status, address _address, address _calculator ) external onlyOwner() {
        require( _address != address(0) );
        require( !onChainGoverned, "OCG Enabled: Use enable" );

        uint timelock = block.number.add( blocksNeededForQueue );
        if ( _status == STATUS.RESERVEMANAGER || _status == STATUS.LIQUIDITYMANAGER ) {
            timelock = block.number.add( blocksNeededForQueue.mul( 2 ) );
        }
        permissionQueue.push( Queue({
            managing: _status,
            toPermit: _address,
            calculator: _calculator,
            timelockEnd: timelock,
            nullify: false,
            executed: false
        } ) );
        emit PermissionQueued( _status, _address );
    }

    /**
     *  @notice enable queued permission
     *  @param _index uint
     */
    function execute( uint _index ) external {
        require( !onChainGoverned );

        Queue memory info = permissionQueue[ _index ];

        require( !info.nullify, "Action has been nullified" );
        require( !info.executed, "Action has already been executed" );
        require( block.number >= info.timelockEnd, "Timelock not complete" );

        if ( info.managing == STATUS.SOHM ) { // 9
            sOHM = IERC20( info.toPermit );
        } else {
            registry[ info.managing ].push( info.toPermit );
            permissions[ info.managing ][ info.toPermit ] = true;
            
            if ( info.managing == STATUS.LIQUIDITYTOKEN ) { // 5
                bondCalculator[ info.toPermit ] = info.calculator;
            }
        }
        permissionQueue[ _index ].executed = true;
        emit Permissioned( info.toPermit, info.managing, true );
    }

    /**
     * @notice cancel timelocked action
     * @param _index uint
     */
    function nullify( uint _index ) external onlyOwner() {
        permissionQueue[ _index ].nullify = true;
    }

    /**
     * @notice disables timelocked functions
     */
    function enableOnChainGovernance() external onlyOwner() {
        if( onChainGovernanceTimelock != 0 && onChainGovernanceTimelock <= block.number ) {
            onChainGoverned = true;
        } else {
            onChainGovernanceTimelock = block.number.add( blocksNeededForQueue.mul(7) ); // 7-day timelock
        }
    }



    /* ========== VIEW FUNCTIONS ========== */

    /**
        @notice returns excess reserves not backing tokens
        @return uint
     */
    function excessReserves() public view returns ( uint ) {
        return totalReserves.sub( OHM.totalSupply().sub( totalDebt ) );
    }

    /**
        @notice returns OHM valuation of asset
        @param _token address
        @param _amount uint
        @return value_ uint
     */
    function tokenValue( address _token, uint _amount ) public view returns ( uint value_ ) {
        value_ = _amount.mul( 10 ** IERC20Metadata( address(OHM) ).decimals() )
                    .div( 10 ** IERC20Metadata( _token ).decimals() );
        
        if ( permissions[ STATUS.LIQUIDITYTOKEN ][ _token ] ) {
            value_ = IBondingCalculator( bondCalculator[ _token ] ).valuation( _token, _amount );
        }
    }
}
