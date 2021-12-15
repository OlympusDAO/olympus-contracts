// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

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
}

contract  FraxSharesAllocator is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    uint256 constant private MAX_TIME = 4 * 365 * 86400;  // 4 years
    ITreasury public treasury;
    IERC20 public fxs; // $FXS token
    IveFXS public veFXS; // $veFXS token
    IveFXSYieldDistributorV4 public veFXSYieldDistributorV4;

    // uint256 public totalValueDeployed; // FXS isn't a reserve token, so will always be 0
    uint256 public totalAmountDeployed;

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
     * @notice harvest FXS rewards
     */
    function harvest() external {
        uint256 amount = veFXSYieldDistributorV4.getYield();

        totalAmountDeployed = totalAmountDeployed.add(amount);

        veFXS.increase_amount(amount);
        veFXS.increase_unlock_time(MAX_TIME);
    }
    
    /**
     *  @notice withdraws FXS from treasury, locks as veFXS for maximum time.
     *  @param _amount uint
     */
    function deposit(uint256 _amount) external onlyOwner {
        treasury.manage(address(fxs), _amount);

        uint256 prevAmount = totalAmountDeployed;
        totalAmountDeployed = totalAmountDeployed.add(_amount);

        if (prevAmount == 0) {
            veFXS.create_lock(_amount, MAX_TIME);
        } else {
            veFXS.increase_amount(_amount);
            veFXS.increase_unlock_time(MAX_TIME);
        }
    }

    /* ======== VIEW FUNCTIONS ======== */

    function getPendingRewards() public view returns (uint256) {
        return veFXSYieldDistributorV4.yields(address(this));
    }
}