// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;


contract UniswapV2PairMock {

    address token0Address;
    address token1Address;
    uint112 token0Reserve;
    uint112 token1Reserve;

    constructor(address _token0, address _token1, uint112 _reserve0, uint112 _reserve1) {
        token0Address = _token0;
        token1Address = _token1;

        token0Reserve = _reserve0;
        token1Reserve = _reserve1;
    }

    function token0() external view returns (address) {
        return token0Address;
    }

    function token1() external view returns (address) {
        return token1Address;
    }

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
        reserve0 = token0Reserve;
        reserve1 = token1Reserve;
        blockTimestampLast = 1644839839;
    }

    function totalSupply() external view returns (uint256 supply) {
        supply = 10000000;
    }

}