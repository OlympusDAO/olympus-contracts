// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;
import "../libraries/Address.sol";
// import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasuryExtender.sol";

// types
import "../types/BaseAllocator.sol";

interface IMasterChef {
    function pendingSushi(uint256 _pid, address _user) external view returns (uint256);

    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function emergencyWithdraw(uint256 _pid) external;
}

interface ISushiBar {
    function enter(uint256 _amount) external;

    function leave(uint256 _share) external;
}

/**
 *  Contract deploys liquidity from treasury into the Onsen program,
 *  earning $SUSHI that can be staked and/or deposited into the treasury.
 */
contract OnsenAllocator is BaseAllocator {
    
    /* ========== STATE VARIABLES ========== */    

    address immutable sushi; // $SUSHI token
    address immutable xSushi; // $xSUSHI token

    address immutable masterChef; // Onsen contract

    // address immutable treasury; 
    address public constant treasury = 0x9A315BdF513367C0377FB36545857d12e85813Ef; // Olympus Treasury    

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _chef,        
        address _sushi,
        address _xSushi,
        AllocatorInitData memory data
    ) BaseAllocator(data)
    {
        require(_chef != address(0));
        masterChef = _chef;        
        require(_sushi != address(0));
        sushi = _sushi;
        require(_xSushi != address(0));
        xSushi = _xSushi;
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 index = tokenIds[id];
        IERC20 LPtoken = _tokens[index];
        uint256 balance = LPtoken.balanceOf(address(this));

        // interactions

        if (balance > 0) {
            IERC20(LPtoken).approve(masterChef, balance);
            IMasterChef(masterChef).deposit(id, balance); // deposit into Onsen
        }

        // How should we handle the sushi rewards and what would be the strategy to calculate gains from the sushi rewards if there is any?
        // Should we swap it to the current LP token and return that as the gains?        
        // Should we just stake any sushi and compare 
   
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        for (uint256 i; i < amounts.length; i++) {
            uint256 amount = amounts[i];
            if (amount > 0) {
                IERC20 token = _tokens[i];
                IMasterChef(masterChef).withdraw(tokenIds[i], amount); // withdraw from Onsen                
            }
        }
    }

    function _deactivate(bool panic) internal override {
        _deallocateAll();

        if (panic) {
            for (uint256 i; i < _tokens.length; i++) {
                IERC20 token = _tokens[i];
                token.transfer(treasury, token.balanceOf(address(this)));
            }
        }
    }

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {
        return _tokens[tokenIds[id]].balanceOf(address(this));
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory rewards = new IERC20[](1);
        rewards[0] = IERC20(sushi);
        return rewards;
    }    

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](2);
        utility[0] = IERC20(sushi);
        utility[1] = IERC20(xSushi);
        return utility;
    }

    function name() external pure override returns (string memory) {
        return "OnsenAllocator";
    }

    /* ========== INTERNAL FUNCTIONS ========== */       
    

    function _deallocateAll() internal {
        // reads
        uint256[] memory amounts = new uint256[](_tokens.length);

        // interactions
        for (uint256 i; i < _tokens.length; i++) {
            amounts[i] = _tokens[i].balanceOf(address(this));
        }

        deallocate(amounts);
    }    
}
