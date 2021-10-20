// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IwsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IOwnable.sol";

import "../types/Ownable.sol";

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

interface IRouter {
    function addLiquidity(
        address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline
        ) external returns (uint amountA, uint amountB, uint liquidity);
        
    function removeLiquidity(
        address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline
        ) external returns (uint amountA, uint amountB);
}

interface IStakingV1 {
    function unstake( uint _amount, bool _trigger ) external;

    function index() external view returns ( uint );
}

contract Migrator is Ownable {

    using SafeMath for uint;
    using SafeERC20 for IERC20;
    using SafeERC20 for IgOHM;
    using SafeERC20 for IsOHM;

    /* ========== MIGRATION ========== */

    event TimelockStarted( uint block, uint end );
    event Migrated( address staking, address treasury );
    event Funded( uint amount );
    event Defunded( uint amount );

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable oldOHM;
    IsOHM public immutable oldsOHM;
    IwsOHM public immutable oldwsOHM;
    ITreasury public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IgOHM public gOHM;
    ITreasury public newTreasury;
    IStaking public newStaking;
    IERC20 public newOHM;

    IERC20 public immutable DAI;

    bool public ohmMigrated;
    uint public immutable timelockLength;
    uint public timelockEnd;

    uint public oldSupply;
    
    address public sushiRouter;
    address public uniRouter;

    constructor(
        address _oldOHM,
        address _oldsOHM,
        address _oldTreasury,
        address _oldStaking,
        address _oldwsOHM,
        address _DAI,
        address _sushi,
        address _uni,
        uint _timelock
    ) {
        require( _oldOHM != address(0) );
        oldOHM = IERC20( _oldOHM );
        require( _oldsOHM != address(0) );
        oldsOHM = IsOHM( _oldsOHM );
        require( _oldTreasury != address(0) );
        oldTreasury = ITreasury( _oldTreasury );
        require( _oldStaking != address(0) );
        oldStaking = IStakingV1( _oldStaking );
        require( _oldwsOHM != address(0) );
        oldwsOHM = IwsOHM( _oldwsOHM );
        require( _DAI != address(0) );
        DAI = IERC20( _DAI );
        require( _sushi != address(0) );
        sushiRouter = _sushi;
        require( _uni != address(0) );
        uniRouter = _uni;
        timelockLength = _timelock;
    }

    /* ========== MIGRATION ========== */

    enum TYPE { UNSTAKED, STAKED, WRAPPED }

    // migrate OHM, sOHM, or wsOHM for gOHM
    function migrate( uint _amount, TYPE _from ) external {
        uint sAmount = _amount;
        uint wAmount = oldwsOHM.sOHMTowOHM( _amount );

        if ( _from == TYPE.UNSTAKED ) {
            oldOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else if ( _from == TYPE.STAKED ) {
            oldsOHM.safeTransferFrom( msg.sender, address(this), _amount );
        } else if ( _from == TYPE.WRAPPED ) {
            oldwsOHM.transferFrom( msg.sender, address(this), _amount );
            wAmount = _amount;
            sAmount = oldwsOHM.wOHMTosOHM( _amount );
        }

        if( ohmMigrated ) {
            require( oldSupply >= oldOHM.totalSupply(), "OHMv1 minted" );
            gOHM.safeTransfer( msg.sender, wAmount );
        } else {
            gOHM.mint( msg.sender, wAmount );
        }
    }

    // bridge back to OHM, sOHM, or wsOHM
    function bridgeBack( uint _amount, TYPE _to ) external {
        gOHM.burn( msg.sender, _amount );

        uint amount = oldwsOHM.wOHMTosOHM( _amount );
        // error throws if contract does not have enough of type to send
        if ( _to == TYPE.UNSTAKED ) {
            oldOHM.safeTransfer( msg.sender, amount );
        } else if ( _to == TYPE.STAKED ) {
            oldsOHM.safeTransfer( msg.sender, amount );
        } else if ( _to == TYPE.WRAPPED ) {
            oldwsOHM.transfer( msg.sender, _amount );
        }
    }

    /* ========== OWNABLE ========== */

    // withdraw backing of migrated OHM
    function defund() external onlyOwner() {
        require( ohmMigrated && timelockEnd < block.number && timelockEnd != 0 );
        oldwsOHM.unwrap( oldwsOHM.balanceOf( address(this) ) );
        oldStaking.unstake( oldsOHM.balanceOf( address(this) ), false );

        uint balance = oldOHM.balanceOf( address(this) );

        oldSupply = oldSupply.sub( balance );

        oldTreasury.withdraw( balance.mul( 1e9 ), address(DAI) );
        DAI.safeTransfer( address(newTreasury), DAI.balanceOf( address(this) ) ); 

        emit Defunded( balance );
    }

    // start timelock to send backing to new treasury
    function startTimelock() external onlyOwner() {
        timelockEnd = block.number.add( timelockLength );

        emit TimelockStarted( block.number, timelockEnd );
    }

    // set gOHM address
    function setgOHM( address _gOHM ) external onlyOwner() {
        require( address(gOHM) == address(0) );
        require( _gOHM != address(0) );

        gOHM = IgOHM( _gOHM );
    }

    // migrate contracts
    function migrateContracts( 
        address _newTreasury, 
        address _newStaking, 
        address _newOHM, 
        address _newsOHM,
        address[] calldata _daiPairs, // [LPv1, LPv2, DAI]
        address[] calldata _lusdPairs, // [LPv1, LPv2, LUSD]
        address[] calldata _fraxPairs // [LPv1, LPv2, FRAX]
    ) external onlyOwner() {
        ohmMigrated = true;

        require( _newTreasury != address(0) );
        newTreasury = ITreasury( _newTreasury );
        require( _newStaking != address(0) );
        newStaking = IStaking( _newStaking );
        require( _newOHM != address(0) );
        newOHM = IERC20( _newOHM );

        oldSupply = oldOHM.totalSupply(); // log total supply at time of migration

        gOHM.migrate( _newStaking, _newsOHM ); // change gOHM minter

        MigrateLP( _daiPairs[0], _daiPairs[1], _daiPairs[2], false ); // migrate liquidity
        MigrateLP( _fraxPairs[0], _fraxPairs[1], _fraxPairs[2], true ); 
        MigrateLP( _lusdPairs[0], _lusdPairs[1], _lusdPairs[2], false ); 

        fund( oldsOHM.circulatingSupply() ); // fund with current staked supply for token migration
        
        emit Migrated( _newStaking, _newTreasury );
    }



    /* ========== INTERNAL FUNCTIONS ========== */

    // fund contract with gOHM 
    function fund( uint _amount ) internal {
        newTreasury.mint( address(this), _amount );
        newOHM.approve( address( newStaking ), _amount );
        newStaking.stake( _amount, address(this), false, true ); // stake and claim gOHM

        emit Funded( _amount );
    }

    // move liquidity from v1 to v2
    function MigrateLP( address _v1, address _v2, address _token, bool _uni ) internal {
        uint oldLPAmount = IERC20(_v1).balanceOf( address(oldTreasury) );

        oldTreasury.manage(_v1, oldLPAmount); // withdraw LP from v1 treasury

        address router = sushiRouter;
        if( _uni ) {
          router = uniRouter;
        }

        IERC20(_v1).approve(router, oldLPAmount);
        (uint amountA, uint amountB) = IRouter(router) // remove liquidity for ohmv1
                .removeLiquidity(_token, address(oldOHM), oldLPAmount, 0, 0, address(this), block.number + 15);
        
        oldTreasury.withdraw(amountB, _token); // withdraw backing from v1
        
        IERC20(_token).approve(address(newTreasury), amountB * 10 ** 9);
        newTreasury.deposit(amountB * 10 ** 9, _token, 0); // deposit backing to v2, minting ohmv2
        
        IERC20(_token).approve(uniRouter, amountA);
        newOHM.approve(uniRouter, amountB);
        
        (,, uint newLiquidity) = IRouter(uniRouter) // add liquidity for ohmv2
                .addLiquidity(_token, address(newOHM), amountA, amountB, 0, 0, address(this), block.number + 15);
        
        uint newLPValue = newTreasury.tokenValue(_v2, newLiquidity);
        
        IERC20(_v2).approve(address(newTreasury), newLPValue);
        
        newTreasury.deposit(newLiquidity, _v2, newLPValue); // deposit new LP into treasury
    }
}