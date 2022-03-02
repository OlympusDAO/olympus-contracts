// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
import "../interfaces/ITreasury.sol";
import "../interfaces/IERC20.sol";
import "../libraries/SafeERC20.sol";

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

    function withdraw() external;
}

interface IveFXSYieldDistributorV4 {
    /**
     * @notice transfers FXS earned by locking veFXS
     * @return the amount of FXS transferred
     */
    function getYield() external returns (uint256);

    /**
     * @notice returns the pending rewards for an address
     */
    function earned(address _address) external view returns (uint256);

    /* BELOW USED ONLY IN TESTS */

    /**
     * @notice forces an update of a user's rewards
     */
    function checkpointOtherUser(address _address) external;

    /**
     * @notice requests FXS rewards to pulled from msg.sender
     */
    function notifyRewardAmount(uint256 amount) external;

    /**
     * @notice allows an address to call notifyRewardAmount
     */
    function toggleRewardNotifier(address notifier_addr) external;

    /**
     * @notice returns the number of seconds until a reward is fully distributed
     */
    function yieldDuration() external returns (uint256);
}

error FxsAllocator_InvalidAddress();

contract FxsAllocatorV2 is BaseAllocator {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_TIME = 4 * 365 * 86400 + 1; // 4 years and 1 second
    ITreasury public treasury;
    IveFXS public veFXS;
    IveFXSYieldDistributorV4 public veFXSYieldDistributorV4;

    uint256 public lockEnd;

    constructor(
        AllocatorInitData memory data,
        address treasury_,
        address veFXS_,
        address veFXSYieldDistributorV4_
    ) BaseAllocator(data) {
        if (treasury_ == address(0) || veFXS_ == address(0) || veFXSYieldDistributorV4_ == address(0))
            revert FxsAllocator_InvalidAddress();

        treasury = ITreasury(treasury);
        veFXS = IveFXS(veFXS_);
        veFXSYieldDistributorV4 = IveFXSYieldDistributorV4(veFXSYieldDistributorV4_);

        IERC20(data.tokens[0]).approve(address(veFXS), type(uint256).max);
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 balance = _tokens[0].balanceOf(address(this));
        uint256 veBalance = veFXS.balanceOf(address(this));

        if (balance > 0 && veBalance == 0) {
            lockEnd = block.timestamp + MAX_TIME;
            veFXS.create_lock(balance, lockEnd);
        } else if (balance > 0 && veBalance > 0) {
            uint256 amount = veFXSYieldDistributorV4.getYield();
            veFXS.increase_amount(balance + amount);
            if (_canExtendLock()) {
                lockEnd = block.timestamp + MAX_TIME;
                veFXS.increase_unlock_time(block.timestamp + MAX_TIME);
            }
        }

        veBalance = veFXS.balanceOf(address(this));
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (veBalance > last) gain = uint128(veBalance - last);
        else loss = uint128(last - veBalance);
    }

    function deallocate(uint256[] memory amounts) public override {
        _onlyGuardian();
        veFXSYieldDistributorV4.getYield();

        if (block.timestamp >= veFXS.locked__end(address(this))) {
            veFXS.withdraw();
        }
    }

    function _deactivate(bool panic) internal override {
        uint256[] memory amounts = new uint256[](1);
        deallocate(amounts);

        if (panic) {
            _tokens[0].transfer(address(treasury), _tokens[0].balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {
        return veFXS.balanceOf(address(this));
    }

    function rewardTokens() public pure override returns (IERC20[] memory) {
        IERC20[] memory empty = new IERC20[](0);
        return empty;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utilTokens = new IERC20[](1);
        utilTokens[0] = IERC20(address(veFXS));

        return utilTokens;
    }

    function name() external pure override returns (string memory) {
        return "FxsAllocatorV2";
    }

    /* ======== VIEW FUNCTIONS ======== */
    function _canExtendLock() internal view returns (bool) {
        return lockEnd < block.timestamp + MAX_TIME - 7 * 86400;
    }
}