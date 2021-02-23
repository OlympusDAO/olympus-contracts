// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../../dependencies/holyzeppelin/contracts/protocols/exchanges/uniswap/v2/periphery/libraries/UniswapV2Library.sol";
import '../../dependencies/holyzeppelin/contracts/math/Babylonian.sol';

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract OlyBonding {
    using SafeMath for uint;
    
    uint256 public BCV;
    uint256 public lastTWAP;
    address internal UNISWAP_FACTORY_ADDRESS = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address internal UNISWAP_PAIR_ADDRESS = 0x4ac871b4f3eF67c9a5c921329f5A5FccCAabD8F8;
    address LP;
    address OLY;
    IUniswapV2Pair public uniswapV2Pair;
    uint256 vestingPeriod;
    
    struct UserInfo{
        uint256 blockLockUpDuration;
        uint256 OlyToReceiveAfterVesting;
        uint256 depositBalance;
        bool isVesting;
    }
    
    mapping(address => UserInfo) public userinfo;
    
    constructor() {
        uniswapV2Pair = IUniswapV2Pair(UNISWAP_PAIR_ADDRESS);
    }
    
    function vestingDuration(uint blockDuration) external  {
        vestingPeriod = blockDuration;
    }
    
    function setBCV(uint input) external  {
        BCV = input;
    }
    
    function setLP(address input) external  {
        LP = input;
    }

    function setOLY(address input) external  {
        OLY = input;
    }
    
	function updateTWAP() internal {
	    uint result;//gotten from oracle
	    lastTWAP = result;
	}
	
	function sellLP(uint amount, address tokenA, address tokenB) external {
	    require(!userinfo[msg.sender].isVesting, 'already vesting');
        IERC20(LP).transferFrom(msg.sender,address(this),amount);
        
        uint LPaverage = amount.mul(1e18) / uniswapV2Pair.totalSupply();
        
        uint k = (Babylonian.sqrt(getConstant(tokenA, tokenB))).mul(2);
        
        uint RFV = (LPaverage.mul(k)) / 1e18;
                    
        uint EV = lastTWAP.mul(BCV).add(RFV).mul(1 - BCV);
        
        userinfo[msg.sender].blockLockUpDuration = block.number.add(vestingPeriod);
        userinfo[msg.sender].OlyToReceiveAfterVesting = EV;
        userinfo[msg.sender].depositBalance = amount;
        userinfo[msg.sender].isVesting = true;
    }
    
    function withdrawLP() external {
        require(userinfo[msg.sender].isVesting && userinfo[msg.sender].depositBalance > 0, 'no LP to withdraw');
        
        uint amount = userinfo[msg.sender].depositBalance;
        IERC20(LP).transfer(msg.sender, amount);
        userinfo[msg.sender].depositBalance = 0;
        userinfo[msg.sender].isVesting = false;
        userinfo[msg.sender].blockLockUpDuration = 0;
        userinfo[msg.sender].OlyToReceiveAfterVesting = 0;
    }
    
    // function getPercenntFee(uint vestingDurationPercentNotDone) internal returns(uint fee) {
    //     if(vestingDurationPercentNotDone >= 80) {
    //         fee = 80;
    //     }else if(vestingDurationPercentNotDone < 80 && vestingDurationPercentNotDone > 60) {
    //         fee = 60;
    //     }else if(vestingDurationPercentNotDone < 60 && vestingDurationPercentNotDone > 40) {
    //         fee = 40;
    //     }else if(vestingDurationPercentNotDone < 40 && vestingDurationPercentNotDone > 20) {
    //         fee = 20;
    //     }
    // }
    
    function redeemOly() external {
        require( userinfo[msg.sender].blockLockUpDuration > 0, 'user has no OLY to redeem');
        uint hundred = 100;
        if( userinfo[msg.sender].blockLockUpDuration <= block.number) {
            uint amount = userinfo[msg.sender].OlyToReceiveAfterVesting;
            IERC20(OLY).transfer(msg.sender, amount);
            
        }else{
            uint vestingDurationLeft = userinfo[msg.sender].blockLockUpDuration.sub(block.number);
            uint vestingDurationPercentLeft = (vestingDurationLeft.mul(hundred))/(vestingPeriod);
            uint amountToDeduct = (userinfo[msg.sender].OlyToReceiveAfterVesting.mul(vestingDurationPercentLeft))/(hundred);
            uint amountToSend = userinfo[msg.sender].OlyToReceiveAfterVesting.sub(amountToDeduct);
            IERC20(OLY).transfer(msg.sender, amountToSend);
        }
        
        userinfo[msg.sender].blockLockUpDuration = 0;
        userinfo[msg.sender].OlyToReceiveAfterVesting = 0;
        userinfo[msg.sender].depositBalance = 0;
        userinfo[msg.sender].isVesting = false;
    }
    
    
    function getConstant(address tokenA, address tokenB) view internal returns(uint CP) {
        (uint amount1, uint amount2) = UniswapV2Library.getReserves(UNISWAP_FACTORY_ADDRESS, tokenA, tokenB);
        CP = amount1.mul(amount2);
    }
}