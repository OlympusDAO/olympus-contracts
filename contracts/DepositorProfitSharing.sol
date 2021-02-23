// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../../../dependencies/holyzeppelin/contracts/token/ERC20/interfaces/IERC20.sol";
import "../../../dependencies/holyzeppelin/contracts/math/SafeMath.sol";
import "../../../dependencies/holyzeppelin/contracts/GSN/Context.sol";
import "../../../dependencies/holyzeppelin/contracts/datatypes/primitives/Address.sol";

import "hardhat/console.sol";

/**
 * @dev Intended to handle the deposit of a mintableCurrency to receive a portion of profits in the mintableCurrency.
 *  Implements a function to accept deposits.
 *    Uses the shares model from PaymentSplitter to credit users with a portion of profits made available since they deposited.
 *    Must account for not allowing new depositors to claim previously deposited profits due to other depsitors.
 *  Implements a function to allow users to withdraw their available profit allotment.
 *  Implements a function to allow users to withdraw their deposited mintableCurrency and also transfer the depositors available profits.
 *  Implements a function to return the profit allotment amount a user may withdraw for a deposited mintableCurrency.
 *  Accepts tokens for deposit that are listed as a mintableCurrency by the Treasury.
 */

 interface IsOLY {
    function rebase(uint256 epoch, uint256 olyProfit) external returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function circulatingSupply() external view returns (uint);    
 }

contract DepositorProfitSharing is Context {
    using SafeMath for uint;
    using Address for address;

    struct Depositer {
        uint _timeOfStake;
        uint _olyStaked;
        uint _olyWithdrawn;
    }

    address public OLY;
    address public sOLY;    

    address public owner;

    uint256 private _totalShares;
    uint256 private _totalReleased;

    IsOLY private sOLYInterface;

    uint public epochTime = 8 hours;

    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);

    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _released;
    address[] private _payees;

    mapping(address => Depositer) depositer;
    
    constructor(address _OLY, address _owner) {
        OLY = _OLY;
        owner = _owner;
    }

    function setSOLY(address _sOLY) external {
        require(_msgSender() == owner, "Not Owner");
        sOLY = _sOLY;
        sOLYInterface = IsOLY(_sOLY);
    }

    function setOwner(address _owner) external {
        require(_msgSender() == owner, "Not Owner");
        owner = _owner;
    }

    function getEpochTime() public view returns (uint) {
        return epochTime;
    }
    
    function stakeOLY(uint _amountToStake) external {
        require(IERC20(OLY).balanceOf(_msgSender()) >= _amountToStake, "Not enough to stake");

        require(IERC20(OLY).transferFrom(_msgSender(), address(this), _amountToStake));

        sOLYInterface.transfer(_msgSender(), _amountToStake);

        depositer[_msgSender()]._timeOfStake = block.timestamp;
        depositer[_msgSender()]._olyStaked = depositer[_msgSender()]._olyStaked.add(_amountToStake);
    }
    
    function unstakeOLY(uint _amountToWithdraw) external {
        require(IERC20(sOLY).balanceOf(_msgSender()) >= _amountToWithdraw, "Not enough to unstake");
        require(depositer[_msgSender()]._timeOfStake.add(epochTime) > block.timestamp, "Not in for one epoch");
        require(IERC20(OLY).transfer(_msgSender(), _amountToWithdraw), "Claim Failed");

        sOLYInterface.transferFrom(_msgSender(), address(this), _amountToWithdraw);

        depositer[_msgSender()]._olyWithdrawn = depositer[_msgSender()]._olyWithdrawn.add(_amountToWithdraw);

    }

    function distribute(uint _amountOLY) external {
        require(_msgSender() == owner, "Not Owner");
        require(IERC20(OLY).transferFrom(_msgSender(), address(this), _amountOLY), "OLY transfer failed");

        uint256 _olyBalance = IERC20(OLY).balanceOf(address(this));
        uint256 _solySupply = sOLYInterface.circulatingSupply();

        uint256 olyProfit = _olyBalance.sub(_solySupply);

        //sOLYInterface.rebase(1, _rebaseAmount);

        uint circ = sOLYInterface.circulatingSupply();
        
        (bool success,) = sOLY.call(abi.encodeWithSignature("rebase(uint256)", olyProfit));
        require(success == true, "rebase call failed");

    }

    function forfeit() external {
        if(depositer[_msgSender()]._olyWithdrawn >= depositer[_msgSender()]._olyStaked) {
            depositer[_msgSender()]._olyWithdrawn = 0;
            depositer[_msgSender()]._olyStaked = 0;
        }

        else {
            uint _olyToSend = depositer[_msgSender()]._olyStaked.sub(depositer[_msgSender()]._olyWithdrawn);
            depositer[_msgSender()]._olyWithdrawn = 0;
            depositer[_msgSender()]._olyStaked = 0;
            require(IERC20(OLY).transfer(_msgSender(), _olyToSend), "Forfeit Failed");
        }
    }

}