// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

/**
    @title IStrategy
    @notice This interface is implemented by strategy contracts to provide liquidity on behalf of incurdebt contract.
 */
interface IStrategy {
    /**
        @notice Add liquidity to the dex using this strategy.
        @dev Some strategies like uniswap will have tokens left over which is either sent back to 
        incur debt contract (OHM) or back to LPer's wallet address (pair token). Other strategies like
        curve will have no leftover tokens.
        This function is also only for LPing for pools with two tokens. Do not use this for pools with more than 2 tokens.
        @param _data Data needed to input into external call to add liquidity. Different for different strategies.
        @param _ohmAmount amount of OHM to LP 
        @param _user address of user that called incur debt function to do this operation.
        @return liquidity : total amount of lp tokens gained.
        ohmUnused : total amount of ohm unused in LP process and sent back to incur debt address.
        lpTokenAddress : address of LP token gained.
    */
    function addLiquidity(
        bytes memory _data,
        uint256 _ohmAmount,
        address _user
    )
        external
        returns (
            uint256 liquidity,
            uint256 ohmUnused,
            address lpTokenAddress
        );

    /**
        @notice Remove liquidity to the dex using this strategy.
        @param _data Data needed to input into external call to remove liquidity. Different for different strategies.
        @param _liquidity amount of LP tokens to remove liquidity from.
        @param _lpTokenAddress address of LP token to remove.
        @param _user address of user that called incur debt function to do this operation.
        @return ohmRecieved : total amount of ohm recieved from removing the LP. Send back to incurdebt contract.
    */
    function removeLiquidity(
        bytes memory _data,
        uint256 _liquidity,
        address _lpTokenAddress,
        address _user
    ) external returns (uint256 ohmRecieved);
}
