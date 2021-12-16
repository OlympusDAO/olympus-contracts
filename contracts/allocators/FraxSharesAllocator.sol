// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";
import "hardhat/console.sol";

interface IveFXS is IERC20 {
    /**
     * @notice Deposit `_value` tokens for `msg.sender` and lock until `_unlock_time`
     * @param _value Amount to deposit
     * @param _unlock_time Epoch time when tokens unlock, rounded down to whole weeks
     */
    function create_lock(uint256 _value, uint256 _unlock_time) external;

    /**
     * @notice Deposit `_value` additional tokens for `msg.sender` without modifying the unlock time
     * @param _value Amount of tokens to deposit and add to the lock
     */
    function increase_amount(uint256 _value) external;

    /**
     * @notice Extend the unlock time for `msg.sender` to `_unlock_time`
     * @param _unlock_time New epoch time for unlocking 
     */
    function increase_unlock_time(uint256 _unlock_time) external;

    /**
     * @notice Get timestamp when `_addr`'s lock finishes
     * @param _addr wallet address
     * @return Epoch time of the lock end
     */
     function locked__end(address _addr) external view returns (uint256);
}

interface IveFXSYieldDistributorV4 {
    /**
     * @notice transfers FXS earned by locking veFXS
     * @return the amount of FXS transferred
     */
    function getYield() external returns (uint256);

    /**
     * @notice returns pending FXS yields for address
     * @param _address staker address
     * @return the number of FXS
     */
    function yields(address _address) external view returns (uint256);

    function earned(address _address) external view returns (uint256);

    function checkpointOtherUser(address _address) external;

    function notifyRewardAmount(uint256 amount) external;

    function toggleRewardNotifier(address notifier_addr) external;

    function yieldDuration() external returns(uint256);

    function sync() external;
}

contract  FraxSharesAllocator is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    uint256 constant private MAX_TIME = 4 * 365 * 86400 + 1;  // 4 years and 1 second
    ITreasury public treasury;
    IERC20 public fxs; // $FXS token
    IveFXS public veFXS; // $veFXS token
    IveFXSYieldDistributorV4 public veFXSYieldDistributorV4;

    // uint256 public totalValueDeployed; // FXS isn't a reserve token, so will always be 0
    uint256 public totalAmountDeployed;
    uint256 public lockEnd;

    constructor(
        address _treasury,
        address _fxs,
        address _veFXS,
        address _veFXSYieldDistributorV4
    ) {
        require(_treasury != address(0), "zero treasury address");
        treasury = ITreasury(_treasury);

        require(_fxs != address(0), "zero FXS address");
        fxs = IERC20(_fxs);

        require(_veFXS != address(0), "zero veFXS address");
        veFXS = IveFXS(_veFXS);

        require(_veFXSYieldDistributorV4 != address(0), "zero veFXSYieldDistributorV4 address");
        veFXSYieldDistributorV4 = IveFXSYieldDistributorV4(_veFXSYieldDistributorV4);

        totalAmountDeployed = 0;
    }

    /**
     * @notice harvest FXS rewards, will relock all veFXS for the maximum amount of time (4 years)
     */
    function harvest() external {
        uint256 amount = veFXSYieldDistributorV4.getYield();

        if (amount > 0) {
            totalAmountDeployed = totalAmountDeployed.add(amount);

            fxs.safeApprove(address(veFXS), amount);
            veFXS.increase_amount(amount);
            if (_canExtendLock()) {
                veFXS.increase_unlock_time(block.timestamp + MAX_TIME);
            }
        }
    }
    
    /**
     *  @notice withdraws FXS from treasury, locks as veFXS for maximum time (4 years).
     *  @param _amount uint
     */
    function deposit(uint256 _amount) external onlyOwner {
        treasury.manage(address(fxs), _amount);

        uint256 prevAmount = totalAmountDeployed;
        totalAmountDeployed = totalAmountDeployed.add(_amount);

        fxs.safeApprove(address(veFXS), _amount);
        if (prevAmount == 0) {
            lockEnd = block.timestamp + MAX_TIME;
            veFXS.create_lock(_amount, lockEnd);
        } else {
            veFXS.increase_amount(_amount);
            if (_canExtendLock()) {
                veFXS.increase_unlock_time(block.timestamp + MAX_TIME);
            }
        }
    }

    function _canExtendLock() internal view returns (bool) {
        return lockEnd < block.timestamp + MAX_TIME - 7 * 86400;
    }

    /* ======== VIEW FUNCTIONS ======== */

    function getPendingRewards() public view returns (uint256) {
        return veFXSYieldDistributorV4.earned(address(this));
    }
}