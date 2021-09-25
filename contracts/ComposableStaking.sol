// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./types/Ownable.sol";

import "./libraries/SafeERC20.sol";
import "./libraries/SafeMath.sol";

import "./interfaces/IERC20Metadata.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/ITreasury.sol";


interface sOHMInterface {
    function index() external view returns (uint);
}

interface IFacilitatorContract {
    function retriveUnderlying( address _asset, uint _amount ) external returns ( bool );
}

contract ComposableStaking is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint;

    address public immutable OHM;
    address public immutable sOHM;
    address public immutable treasury;
    address public immutable facilitatorContract;
    address public immutable staking;

    struct StakeInfo {
        mapping( address => uint) amountOfAsset;
        uint agnosticStake;
        uint debtTakenOn;
    }
    mapping( address => StakeInfo ) public stakeInfo;

    mapping( address => bool ) public approvedAsset;

    uint public profitFee;

    constructor( address _ohm, address _sOHM, address _treasury, address _facilitatorContract, address _staking ) {
        OHM = _ohm;
        sOHM = _sOHM;
        treasury = _treasury;
        facilitatorContract = _facilitatorContract;
        staking = _staking;
    }

    function toggleToken(address _token) external onlyOwner() {
        approvedAsset[_token] = !approvedAsset[_token];
    }

    function toAgnostic( uint amount_ ) public view returns ( uint ) {
        return amount_.mul( 10 ** IERC20Metadata( sOHM ).decimals() ).div( sOHMInterface( sOHM ).index() );
    }

    function fromAgnostic( uint amount_ ) public view returns ( uint ) {
        return amount_.mul( sOHMInterface( sOHM ).index() ).div( 10 ** IERC20Metadata( sOHM ).decimals() );
    }

    function addExposureTo( address _asset, uint _amountSOHM, uint _minimumToReceive, address _reserveToUse, address _router ) external returns ( bool ) {
        require( approvedAsset[ _asset ], "Asset not approved as underlying" );

        uint _amountReserve = _amountSOHM.mul( 10 ** IERC20Metadata( _reserveToUse ).decimals() ).div( 10 ** IERC20Metadata( sOHM ).decimals());

        IERC20Metadata( sOHM ).transferFrom( msg.sender, address(this), _amountSOHM ); // transfers in sOHM

        ITreasury( treasury ).incurDebt( _amountReserve, _reserveToUse ); // receives reserves of staked OHM

        IERC20Metadata( _reserveToUse ).approve( _router, _amountReserve ); 

        uint[] memory _amounts = IUniswapV2Router( _router ).swapExactTokensForTokens( // Swaps reserves for new asset
            _amountReserve, 
            _minimumToReceive,
            getPath( _reserveToUse, _asset ), 
            address(this), 
            10000000000000000
        );

        uint _amountOut = _amounts[ _amounts.length.sub(1) ];

        IERC20Metadata( _asset ).transfer( facilitatorContract, _amountOut );

        _updateStakeInfo( _asset, _amountSOHM, _amountOut, true );
        

        return true;
    }
 
    function removeExposureFrom( address _asset, uint _amountOfAsset, uint _minimumToReceive, address _reserveToUse, address _router ) external returns ( bool ) {
        require( approvedAsset[ _asset ], "Asset not approved as underlying" );
        require( stakeInfo[ msg.sender ].amountOfAsset[ _asset ] >= _amountOfAsset, "Not enough of asset");

        uint _userDebt = stakeInfo[ msg.sender ].debtTakenOn;

        IFacilitatorContract( facilitatorContract ).retriveUnderlying( _asset, _amountOfAsset );

        IERC20Metadata( _asset ).approve( _router, _amountOfAsset ); 

        uint[] memory _amounts = IUniswapV2Router( _router ).swapExactTokensForTokens( // Swaps asset for reserve
            _amountOfAsset, 
            _minimumToReceive,
            getPath( _asset, _reserveToUse ), 
            address(this), 
            10000000000000000
        );

        uint _amountOut = _amounts[ _amounts.length.sub(1) ];
        uint _amountOutInSOHM = _amountOut.mul( 10 ** IERC20Metadata( sOHM ).decimals() ).div( 10 ** IERC20Metadata( _reserveToUse ).decimals());

        if( _amountOutInSOHM <= _userDebt ) {
            _updateStakeInfo( _asset, _amountOutInSOHM, _amountOfAsset, false );
            IERC20Metadata( _reserveToUse ).approve( treasury, _amountOut ); 
            ITreasury( treasury ).repayDebtWithReserve( _amountOut, _reserveToUse );
            IERC20Metadata( sOHM ).transfer( msg.sender, _amountOutInSOHM ); // transfers out sOHM
        } else if ( _amountOutInSOHM > _userDebt && _userDebt != 0 ) {
            _updateStakeInfo( _asset, _userDebt, _amountOfAsset, false );
            uint _userDebtInDAI = _userDebt.mul( 10 ** IERC20Metadata( _reserveToUse ).decimals() ).div( 10 ** IERC20Metadata( sOHM ).decimals());
            uint _daiProfits = _amountOut.sub( _userDebtInDAI );

            IERC20Metadata( _reserveToUse ).approve( treasury, _amountOut ); 

            ITreasury( treasury ).repayDebtWithReserve( _userDebtInDAI, _reserveToUse );
            ITreasury( treasury ).deposit( msg.sender, _daiProfits, _reserveToUse, 0 );

            IERC20Metadata( sOHM ).transfer( msg.sender, _userDebt );
            IERC20Metadata( OHM ).transfer( msg.sender, _amountOutInSOHM.sub(_userDebt) );
        } else {
            IERC20Metadata( _reserveToUse ).approve( treasury, _amountOut ); 
            ITreasury( treasury ).deposit( msg.sender, _amountOut, _reserveToUse, 0 );
            IERC20Metadata( OHM ).transfer( msg.sender, _amountOutInSOHM );
        }

        return true;
    }

    function removeUndebtedSOHM( uint _amountToRemove ) external returns( bool ) {

        _updateStakeInfo ( address(0), _amountToRemove, 0, false );
        uint _undebtedSOHM = getUndebtedSOHM( msg.sender );

        require( _undebtedSOHM >= _amountToRemove, "Not enough undebtedSOHM");
        IERC20Metadata( sOHM ).transfer( msg.sender, _amountToRemove );

        return true;
    }

    function getPath( address _token0, address _token1 ) private pure returns ( address[] memory ) {
        address[] memory path = new address[](2);
        path[0] = _token0;
        path[1] = _token1;
        return path;
    }

    function getUndebtedSOHM( address _address ) public view returns ( uint ) {
        uint _userDebt = stakeInfo[ _address ].debtTakenOn;
        uint _amount = fromAgnostic( stakeInfo[ _address ].agnosticStake );
        
        return _amount.sub( _userDebt );
    }

    function _updateStakeInfo( address _asset, uint _amountSOHM, uint _amount, bool _staking ) internal returns ( bool ) {
        StakeInfo storage info = stakeInfo[ msg.sender ];

        uint _agnostic = toAgnostic( _amountSOHM );

        if( _staking ) {
            info.amountOfAsset[ _asset ] = info.amountOfAsset[ _asset ].add( _amount );
            info.agnosticStake = info.agnosticStake.add( _agnostic );
            info.debtTakenOn = info.debtTakenOn.add( _amountSOHM );
        } else {
            if( _asset == address(0) ) {
                info.agnosticStake = info.agnosticStake.sub( _agnostic );           
            } else {
                info.amountOfAsset[ _asset ] = info.amountOfAsset[ _asset ].sub( _amount );
                info.agnosticStake = info.agnosticStake.sub( _agnostic );
                info.debtTakenOn = info.debtTakenOn.sub( _amountSOHM );
            }
        }

        return true;
    }


}