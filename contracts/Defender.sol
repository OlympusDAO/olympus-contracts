// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/ITreasury.sol";
import "./interfaces/IUniswapV2Router.sol";

interface IOHM is IERC20 {
    function vault() external view returns ( address ); // mint access --> treasury
}

contract Defender {

    struct Pool {
        IERC20 token;
        bool sushi;
    }

    address immutable DAO;
    IOHM immutable OHM;
    ITreasury immutable treasury;
    IUniswapV2Router immutable router;

    uint public reward;
    Pool[] public pools;
    
    constructor ( 
        address _OHM,
        address _treasury,
        address _router,
        address _DAO
    ) {
        require( _OHM != address(0) );
        OHM = IOHM( OHM );
        require( _treasury != address(0) );
        treasury = ITreasury( _treasury );
        require( _router != address(0) );
        router = IUniswapV2Router( _router );
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
            treasury.manage( address(pool.token), amount );

            address token0;
            address token1;

            if( pool.sushi ) {
                (token0, token1) = sushiRouter.removeLiquidity( balance );
            } else {
                (token0, token1) = uniRouter.removeLiquidity( balance );
            }

            IERC20( token0 ).safeTransfer( address(treasury), IERC20( token0 ).balanceOf( address(this) ) );
            IERC20( token1 ).safeTransfer( address(treasury), IERC20( token1 ).balanceOf( address(this) ) );
        }

        OHM.safeTransferFrom( address(this), msg.sender, reward );
    }

    // send OHM then raise reward
    function incentivize( uint _amount ) external {
        require( _amount > reward );
        require( OHM.balanceOf( address(this) ) >= _amount );
        reward = _amount;
    }

    // add new liquidity pool tokens
    // specify if sushi or uni pool 
    function addPools( address[] memory _pools, bool[] memory _sushi ) external {
        require( msg.sender == DAO );

        for( uint i = 0; i < _pools.length; i++ ) {
            require( _pools[i] != address(0) );
            pools.push( Pool({
                token: IERC20( _pools[i] ),
                sushi: _sushi [i]
            }));
        }
    }
}