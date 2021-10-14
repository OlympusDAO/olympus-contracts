// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/ITreasury.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IERC20.sol";
import "./libraries/SafeERC20.sol";

interface IOHM is IERC20 {
    function vault() external view returns ( address ); // mint access --> treasury
}

contract Defender {

    using SafeERC20 for IERC20;

    struct Pool {
        IERC20 token;
        address token0;
        address token1;
        bool sushi;
    }

    address immutable DAO;
    IOHM immutable OHM;
    ITreasury immutable treasury;
    IUniswapV2Router immutable sushiRouter; 
    IUniswapV2Router immutable uniRouter;

    uint public reward;
    Pool[] public pools;
    
    constructor ( 
        address _OHM,
        address _treasury,
        address _sushiRouter,
        address _uniRouter,
        address _DAO
    ) {
        require( _OHM != address(0) );
        OHM = IOHM( _OHM );
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
        require( _sushiRouter != address(0) );
        sushiRouter = IUniswapV2Router( _sushiRouter );
        require( _uniRouter != address(0) );
        uniRouter = IUniswapV2Router( _uniRouter );
        require( _DAO != address(0) );
        DAO = _DAO;
    }

    /**
     * Function pulls all protocol owned liquidity and deposits assets into treasury.
     * ONLY EXECUTABLE IF the vault (minter) of the OHM token changes.
     * Third parties should be highly incentivized to run bots that will
     * trigger this function the moment the vault address changes. 
     */
    function guard() external {
        require( OHM.vault() != address(treasury), "all clear" );

        for( uint i = 0; i < pools.length; i++ ) {
            Pool memory pool = pools[i];

            uint balance = pool.token.balanceOf( address(treasury) );
            treasury.manage( address(pool.token), balance );

            if( pool.sushi ) {
                pool.token.approve(address(sushiRouter), balance);
                sushiRouter.removeLiquidity( pool.token0, pool.token1, balance, 0, 0, address(treasury), block.number + 15 );
            } else {
                pool.token.approve(address(uniRouter), balance);
                uniRouter.removeLiquidity( pool.token0, pool.token1, balance, 0, 0, address(treasury), block.number + 15 );
            }
        }

        IERC20(address(OHM)).safeTransferFrom( address(this), msg.sender, reward );
    }

    // send OHM then raise reward
    function incentivize( uint _amount ) external {
        require( _amount > reward );
        require( OHM.balanceOf( address(this) ) >= _amount );
        reward = _amount;
    }

    // add new liquidity pool tokens
    // specify if sushi or uni pool 
    function addPools( address[] memory _pools, address[] memory _token0, address[] memory _token1, bool[] memory _sushi ) external {
        require( msg.sender == DAO );

        for( uint i = 0; i < _pools.length; i++ ) {
            require( _pools[i] != address(0) );
            pools.push( Pool({
                token: IERC20( _pools[i] ),
                token0: _token0[i],
                token1: _token1[i],
                sushi: _sushi [i]
            }));
        }
    }
}