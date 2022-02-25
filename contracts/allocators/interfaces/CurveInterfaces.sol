// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

interface ICurveAddressProvider {
    function get_registry() external view returns (address);

    function get_address(uint256 id) external view returns (address);
}

interface ICurveRegistry {
    function get_pool_from_lp_token(address lp_token) external view returns (address);

    function get_n_coins(address _pool) external view returns (uint256[2] memory);
}

interface ICurveFactory {
    function get_n_coins(address _pool) external view returns (uint256);

    function get_meta_n_coins(address _pool) external view returns (uint256, uint256);
}

interface ICurveDepositZap {
    function add_liquidity(
        address _pool,
        uint256[4] memory _deposit_amounts,
        uint256 _min_mint_amount
    ) external returns (uint256);

    function remove_liquidity(
        address _pool,
        uint256 _burn_amount,
        uint256[4] memory _min_amounts
    ) external returns (uint256[] memory);

    function remove_liquidity_one_coin(
        address _pool,
        uint256 _burn_amount,
        int128 i,
        uint256 _min_amount,
        address receiver
    ) external returns (uint256);

    function remove_liquidity_one_coin(
        address _pool,
        uint256 _burn_amount,
        int128 i,
        uint256 _min_amount
    ) external returns (uint256);

    function calc_token_amount(
        address _pool,
        uint256[4] memory _amounts,
        bool _is_deposit
    ) external view returns (uint256);

    function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external view returns (uint256);
}

// placeholder to make it clear this distinction exists but that only above is being used since it simplifies the process
interface ICurveMetapool {
    function calc_withdraw_one_coin(uint256 _burn_amount, int128 i) external view returns (uint256);
}

interface ICurveStableSwapPool {
    function add_liquidity(uint256[2] memory _amounts, uint256 _min_mint_amount) external returns (uint256);

    function add_liquidity(uint256[3] memory _amounts, uint256 _min_mint_amount) external returns (uint256);

    function add_liquidity(uint256[4] memory _amounts, uint256 _min_mint_amount) external returns (uint256);

    function remove_liquidity(uint256 _amount, uint256[2] memory _min_amounts) external returns (uint256[2] memory);

    function remove_liquidity(uint256 _amount, uint256[3] memory _min_amounts) external returns (uint256[3] memory);

    function remove_liquidity(uint256 _amount, uint256[4] memory _min_amounts) external returns (uint256[4] memory);

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 _min_amount
    ) external returns (uint256);

    function calc_token_amount(uint256[2] memory _amounts, bool _is_deposit) external view returns (uint256);

    function calc_token_amount(uint256[3] memory _amounts, bool _is_deposit) external view returns (uint256);

    function calc_token_amount(uint256[4] memory _amounts, bool _is_deposit) external view returns (uint256);

    function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external view returns (uint256);
}
