// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

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
contract OnsenAllocator is Ownable {
    /* ========== DEPENDENCIES ========== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    uint256[] public pids; // Pool IDs
    mapping(uint256 => address) public pools; // Pool Addresses index by PID

    address immutable sushi; // $SUSHI token
    address immutable xSushi; // $xSUSHI token

    address immutable masterChef; // Onsen contract

    address immutable treasury; // Olympus Treasury

    uint256 public totalValueDeployed; // Total RFV deployed

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _chef,
        address _treasury,
        address _sushi,
        address _xSushi
    ) {
        require(_chef != address(0));
        masterChef = _chef;
        require(_treasury != address(0));
        treasury = _treasury;
        require(_sushi != address(0));
        sushi = _sushi;
        require(_xSushi != address(0));
        xSushi = _xSushi;
    }

    /* ========== OPEN FUNCTIONS ========== */

    /**
     * @notice harvest Onsen rewards from all pools
     * @param _stake bool
     */
    function harvest(bool _stake) external {
        for (uint256 i = 0; i < pids.length; i++) {
            uint256 pid = pids[i];
            if (pid != 0) {
                // pid of 0 is invalid
                IMasterChef(masterChef).withdraw(pid, 0); // withdrawing 0 harvests rewards
            }
        }
        enterSushiBar(_stake);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @notice stake sushi rewards if enter is true. return funds to treasury.
     * @param _stake bool
     */
    function enterSushiBar(bool _stake) internal {
        uint256 balance = IERC20(sushi).balanceOf(address(this));
        if (balance > 0) {
            if (!_stake) {
                IERC20(sushi).safeTransfer(treasury, balance); // transfer sushi to treasury
            } else {
                IERC20(sushi).approve(xSushi, balance);
                ISushiBar(xSushi).enter(balance); // stake sushi

                uint256 xBalance = IERC20(xSushi).balanceOf(address(this));
                IERC20(xSushi).safeTransfer(treasury, xBalance); // transfer xSushi to treasury
            }
        }
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     *  @notice pending $SUSHI rewards
     *  @return uint
     */
    function pendingSushi() external view returns (uint256) {
        uint256 pending;
        for (uint256 i = 0; i < pids.length; i++) {
            uint256 pid = pids[i];
            if (pid != 0) {
                pending = pending.add(IMasterChef(masterChef).pendingSushi(pid, address(this)));
            }
        }
        return pending;
    }

    /* ========== POLICY FUNCTIONS ========== */

    /**
     * @notice deposit LP from treasury to Onsen and collect rewards
     * @param _amount uint
     * @param _stake bool
     */
    function deposit(
        uint256 _pid,
        uint256 _amount,
        bool _stake
    ) external onlyOwner {
        address LP = pools[_pid];
        require(LP != address(0));

        ITreasury(treasury).manage(LP, _amount); // retrieve LP from treasury

        IERC20(LP).approve(masterChef, _amount);
        IMasterChef(masterChef).deposit(_pid, _amount); // deposit into Onsen

        uint256 value = ITreasury(treasury).tokenValue(LP, _amount);
        totalValueDeployed = totalValueDeployed.add(value); // add to deployed value tracker

        enterSushiBar(_stake); // manage rewards
    }

    /**
     * @notice collect rewards and withdraw LP from Onsen and return to treasury.
     * @param _amount uint
     * @param _stake bool
     */
    function withdraw(
        uint256 _pid,
        uint256 _amount,
        bool _stake
    ) external onlyOwner {
        address LP = pools[_pid];
        require(LP != address(0));

        IMasterChef(masterChef).withdraw(_pid, _amount); // withdraw from Onsen

        uint256 value = ITreasury(treasury).tokenValue(LP, _amount);
        // remove from deployed value tracker
        if (value < totalValueDeployed) {
            totalValueDeployed = totalValueDeployed.sub(value);
        } else {
            // LP value grows from fees and may exceed total deployed
            totalValueDeployed = 0;
        }

        // approve and deposit LP into treasury
        IERC20(LP).approve(treasury, _amount);
        // use value for profit so that no OHM is minted
        ITreasury(treasury).deposit(_amount, LP, value);

        enterSushiBar(_stake); // manage rewards
    }

    /**
     * @notice withdraw Sushi from treasury and stake to xSushi
     * @param _amount uint
     */
    function enterSushiBarFromTreasury(uint256 _amount) external onlyOwner {
        ITreasury(treasury).manage(sushi, _amount); // retrieve $SUSHI from treasury

        enterSushiBar(true); // stake $SUSHI
    }

    /**
     * @notice withdraw xSushi from treasury and unstake to sushi
     * @param _amount uint
     */
    function exitSushiBar(uint256 _amount) external onlyOwner {
        ITreasury(treasury).manage(xSushi, _amount); // retrieve $xSUSHI from treasury

        ISushiBar(xSushi).leave(_amount); // unstake $xSUSHI

        IERC20(sushi).safeTransfer(treasury, IERC20(sushi).balanceOf(address(this))); // return $SUSHI to treasury
    }

    /**
     *  @notice add new PID and corresponding liquidity pool
     *  @param _pool address
     *  @param _pid uint
     */
    function addPool(address _pool, uint256 _pid) external onlyOwner {
        require(_pool != address(0));
        require(pools[_pid] == address(0));

        pids.push(_pid);
        pools[_pid] = _pool;
    }

    /**
     *  @notice remove liquidity pool and corresponding PID
     *  @param _pool address
     *  @param _index uint
     */
    function removePool(address _pool, uint256 _index) external onlyOwner {
        uint256 pid = pids[_index];
        require(pools[pid] == _pool);

        pids[_index] = 0;
        pools[pid] = address(0);
    }

    /**
     *  @notice withdraw liquidity without regard for rewards
     *  @param _pid uint
     */
    function emergencyWithdraw(uint256 _pid) external onlyOwner {
        address LP = pools[_pid];

        IMasterChef(masterChef).emergencyWithdraw(_pid); // withdraws LP without returning rewards

        uint256 balance = IERC20(LP).balanceOf(address(this));
        uint256 value = ITreasury(treasury).tokenValue(LP, balance);
        if (value < totalValueDeployed) {
            totalValueDeployed = totalValueDeployed.sub(value); // remove from value deployed tracker
        } else {
            // value increases with fees and would otherwise cause underflow
            totalValueDeployed = 0;
        }

        // approve and deposit LP into treasury
        IERC20(LP).approve(treasury, balance);
        // use value for profit so that no OHM is minted
        ITreasury(treasury).deposit(balance, LP, value);
    }
}
