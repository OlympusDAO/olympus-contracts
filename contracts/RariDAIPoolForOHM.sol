// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./SafeMath.sol";

interface IRariFundManager {
    function balanceOf(address) external returns (uint256);
    function deposit(string calldata, uint256) external;
    function withdraw(string calldata, uint256) external;
}

interface Vault {
    function deposit( uint amount_, address token_ ) external returns ( bool );
}

interface IERC20 {
    function transferFrom( address from, address to, uint amount ) external returns ( bool );
    function transfer( address to, uint amount ) external returns ( bool );
    function balanceOf(address addr ) external returns ( uint );
    
}

contract DaiPool {
    
    using SafeMath for uint;
    
    uint public interestGained;
    uint public lastRewardBlock;
    uint public DAI_DEPOSITED;
    uint public accDAIPerShare;
    
    address public DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public OHM = 0x383518188C0C6d7730D91b2c03a03C837814a899;
    address public vault = 0x886CE997aa9ee4F8c2282E182aB72A705762399D;
    address public rariFundManger = 0xB465BAF04C087Ce3ed1C266F96CA43f4847D9635;
    
    struct UserInfo{
        uint amountDeposited;
        uint rewardDebt;
    }
    
    mapping( address => UserInfo ) public userDepositInfo;
    
    constructor(uint _blocksToWait) {
        lastRewardBlock = block.number.add( _blocksToWait );
    }
    
    function depositDAI( uint amount ) external {
        updatePool();
        IERC20(DAI).transferFrom(msg.sender, address(this), amount);
        
        IRariFundManager(rariFundManger).deposit('DAI', amount);
        DAI_DEPOSITED = DAI_DEPOSITED.add(amount);
        
        userDepositInfo[msg.sender].amountDeposited = userDepositInfo[msg.sender].amountDeposited.add(amount);
        userDepositInfo[msg.sender].rewardDebt = userDepositInfo[msg.sender].amountDeposited.mul(accDAIPerShare).div(1e18);
    }
    
    function claimReward() public {
        UserInfo storage user = userDepositInfo[msg.sender];
        updatePool();
        
        require( pendingRewards() > 0, 'no reward to claim');
        
        IERC20(OHM).transfer( msg.sender, pendingRewards() );
        user.rewardDebt = user.amountDeposited.mul(accDAIPerShare).div(1e18);
        
    }
    
    function withdrawDAI( uint amount ) external {
        UserInfo storage user = userDepositInfo[msg.sender];
        require( user.amountDeposited > 0 && user.amountDeposited >= amount, 'user has no deposited amount' );
        
        claimReward();
        IRariFundManager(rariFundManger).withdraw('DAI', amount);
        
        //RGT in contract
        
        DAI_DEPOSITED = DAI_DEPOSITED.sub(amount);
        user.amountDeposited = user.amountDeposited.sub(amount);
        
        IERC20(DAI).transfer( msg.sender, amount );
        user.rewardDebt = user.amountDeposited.mul(accDAIPerShare).div(1e18);
        
    }
    
    // Function that returns User's pending rewards
    function pendingRewards() public view returns(uint256) {

        return userDepositInfo[msg.sender].amountDeposited.mul(accDAIPerShare).div(1e18).sub(userDepositInfo[msg.sender].rewardDebt);
    }
    
    // Function that updates DAI RariFund pool
    function updatePool() public returns ( bool ) {
        if (block.number <= lastRewardBlock) {
            return true;
        }

        if (DAI_DEPOSITED == 0) {
            lastRewardBlock = block.number;
            return true;
        }
        
        lastRewardBlock = block.number;
        
        if (DAI_DEPOSITED > 0) {
            uint balanceInPool = IRariFundManager(rariFundManger).balanceOf(address(this));
            uint GAIN_ACCRUED = balanceInPool.sub(DAI_DEPOSITED);
            
            IRariFundManager(rariFundManger).withdraw('DAI', GAIN_ACCRUED);
            Vault(vault).deposit(GAIN_ACCRUED, DAI);//RGT
            accDAIPerShare = accDAIPerShare.add( GAIN_ACCRUED.mul(1e18).div(DAI_DEPOSITED));
        }

        return true;
    }
}
