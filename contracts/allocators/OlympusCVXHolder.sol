// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "../types/OlympusAccessControlled.sol";
import "../libraries/Address.sol";
import "../libraries/SafeERC20.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IDelegation.sol";
import "../interfaces/IRewardStaking.sol";
import "../interfaces/ILockedCvx.sol";
import "../interfaces/ICrvDepositor.sol";
import "../interfaces/IOlympusAuthority.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IDistributor.sol";
import "../interfaces/IOlympusTokenMIgrator.sol";

//Basic functionality to integrate with locking cvx
contract BasicCvxHolder is OlympusAccessControlled {
    using SafeERC20 for IERC20;
    using Address for address;


    address public constant cvxCrv = address(0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7);
    address public constant cvxcrvStaking = address(0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e);
    address public constant cvx = address(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    address public constant crv = address(0xD533a949740bb3306d119CC777fa900bA034cd52);
    address public constant crvDeposit = address(0x8014595F2AB54cD7c604B00E9fb932176fDc86Ae);
    ITreasury public treasury;
    IMigrator public migrator; // updates treasury address

    address public operator;
    ILockedCvx public immutable cvxlocker;

    constructor(address _cvxlocker, address _treasury, address _migrator, address _authority) 
    OlympusAccessControlled(IOlympusAuthority(_authority)) {
        require(_cvxlocker != address(0));
        cvxlocker = ILockedCvx(_cvxlocker);
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);
        require(_migrator != address(0));
        migrator = IMigrator(_migrator);
        operator = msg.sender;
    }

    function setApprovals() external {
        IERC20(cvxCrv).safeApprove(cvxcrvStaking, 0);
        IERC20(cvxCrv).safeApprove(cvxcrvStaking, type(uint256).max);

        IERC20(cvx).safeApprove(address(cvxlocker), 0);
        IERC20(cvx).safeApprove(address(cvxlocker), type(uint256).max);

        IERC20(crv).safeApprove(crvDeposit, 0);
        IERC20(crv).safeApprove(crvDeposit, type(uint256).max);
    }

    function setDelegate(address _delegateContract, address _delegate) external onlyGuardian {
        // IDelegation(_delegateContract).setDelegate(keccak256("cvx.eth"), _delegate);
        IDelegation(_delegateContract).setDelegate("cvx.eth", _delegate);
    }

    function lock(uint256 _amount, uint256 _spendRatio) external onlyGuardian {
        if(_amount > 0){
            treasury.manage(cvx, _amount);
        }
        _amount = IERC20(cvx).balanceOf(address(this));

        cvxlocker.lock(address(this),_amount,_spendRatio);
    }

    function processExpiredLocks(bool _relock, uint256 _spendRatio) external onlyGuardian {
        cvxlocker.processExpiredLocks(_relock, _spendRatio, address(this));
    }

    function processRewards() external onlyGuardian {
        cvxlocker.getReward(address(this), true);
        IRewardStaking(cvxcrvStaking).getReward(address(this), true);

        uint256 crvBal = IERC20(crv).balanceOf(address(this));
        if (crvBal > 0) {
            ICrvDepositor(crvDeposit).deposit(crvBal, true);
        }

        uint cvxcrvBal = IERC20(cvxCrv).balanceOf(address(this));
        if(cvxcrvBal > 0){
            IRewardStaking(cvxcrvStaking).stake(cvxcrvBal);
        }
    }

    function withdrawCvxCrv(uint256 _amount) external onlyGuardian {
        IRewardStaking(cvxcrvStaking).withdraw(_amount, true);
        uint cvxcrvBal = IERC20(cvxCrv).balanceOf(address(this));
        if(cvxcrvBal > 0){
            IERC20(cvxCrv).safeTransfer(address(treasury), cvxcrvBal);
        }
    }
    
    function withdraw(IERC20 _asset, uint256 _amount) external onlyGuardian {
        _asset.safeTransfer(address(treasury), _amount);
    }

    function updateTreasury() external onlyGuardian {
        require(address(migrator.newTreasury()) != address(0));
        require(migrator.newTreasury() != treasury);
        treasury = migrator.newTreasury();
    }

    function execute(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyGuardian returns (bool, bytes memory) {
        (bool success, bytes memory result) = _to.call{value:_value}(_data);

        return (success, result);
    }

}