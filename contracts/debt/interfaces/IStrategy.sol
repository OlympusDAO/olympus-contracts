pragma solidity ^0.8.10;

interface IStrategy {
    function addLiquidity(
        bytes memory data,
        uint256 _ohmAmount,
        uint256 _pairTokenAmount,
        address _user
    )
        external
        returns (
            uint256 liquidity,
            uint256 ohmUnused,
            address lpTokenAddress
        );

    function removeLiquidity(
        bytes memory data,
        uint256 _liquidity,
        address _user
    ) external returns (uint256 ohmRecieved);
}
