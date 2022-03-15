// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.10;

import "../libraries/SafeERC20.sol";
import "../interfaces/IERC20.sol";
import "../types/BaseAllocator.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";
import "../interfaces/ITokemakRewards.sol";

interface ITokemakManager {
    function currentCycleIndex() external view returns (uint256);
}

interface ITokemaktALCX {
    function deposit(uint256 amount) external;

    function requestedWithdrawals(address addr) external view returns (uint256, uint256);

    function withdraw(uint256 requestedAmount) external;

    function requestWithdrawal(uint256 amount) external;
}

interface IStakingPools {
    function claim(uint256 _poolId) external;

    function exit(uint256 _poolId) external;

    function getStakeTotalDeposited(address _account, uint256 _poolId) external view returns (uint256);

    function getStakeTotalUnclaimed(address _account, uint256 _poolId) external view returns (uint256);

    function deposit(uint256 _poolId, uint256 _depositAmount) external;

    function withdraw(uint256 _poolId, uint256 _withdrawAmount) external;
}

/**
 *  Contract deploys Alchemix from treasury into the Tokemak tALCX pool,
 *  tALCX contract gives tALCX token in ratio 1:1 of Alchemix token deposited,
 *  Contract stake tALCX token on Alchemix staking pool and earn ALCX as reward,
 *  Contract claims reward and compound it,
 *  Contract withdraw funds from Alchemix staking pool and Tokemak tALCX pool,
 *  Sends back Alchemix token with accured reward to treasury.
 */

contract AlchemixAllocatorV2 is BaseAllocator {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;

    /* ======== STATE VARIABLES ======== */

    address public immutable alchemix;
    address public immutable treasury;
    address public immutable tokemakToken;
    address public immutable tokemakReward;
    address public immutable tokemakManager;

    ITokemaktALCX public immutable tALCX; // Tokemak tALCX deposit contract
    IStakingPools public immutable pool; // Alchemix staking contract

    uint256 public immutable poolID = 8; //pool id of tALCX on Alchemix staking pool

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _tALCX,
        address _pool,
        address _treasury,
        address _tokemakToken,
        address _tokemakReward,
        address _tokenmakManager,
        AllocatorInitData memory data
    ) BaseAllocator(data) {
        require(_tALCX != address(0));
        tALCX = ITokemaktALCX(_tALCX);

        require(_pool != address(0));
        pool = IStakingPools(_pool);

        alchemix = address(data.tokens[0]);
        treasury = _treasury;
        tokemakToken = _tokemakToken;
        tokemakReward = _tokemakReward;
        tokemakManager = _tokenmakManager;
    }

    /**
     *  @notice There is two step process to withdrawing from this allocator, first a withdrawal is requested and secondly
     * the tokens are actually withdrawn, but this takes time hence the request.
     *
     * @param _amounts Pass in _amounts[0] = 0 to claim, and _amounts[0] > 0 to request. All else is reverted. If _amounts[0]
     * is equal to type(uint256).max, then a request to withdraw all is made.
     */
    function deallocate(uint256[] memory _amounts) public override onlyGuardian {
        require(_amounts.length == 1, "invalid amounts length");

        if (_amounts[0] == 0) {
            (uint256 minCycle, ) = getRequestedWithdrawalInfo();
            uint256 currentCycle = ITokemakManager(tokemakManager).currentCycleIndex();

            require(minCycle <= currentCycle, "requested withdraw cycle not reached yet");
            withdraw();
        } else requestWithdraw(_amounts[0], false, _amounts[0] == type(uint256).max);
    }

    function claimTokemak(
        ITokemakRewards.Recipient calldata recipient,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyGuardian {
        ITokemakRewards(tokemakReward).claim(recipient, v, r, s);
        require(IERC20(tokemakToken).balanceOf(address(this)) > 0, "balance low");

        IERC20(tokemakToken).safeTransfer(treasury, IERC20(tokemakToken).balanceOf(address(this)));
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        if (alchemixToClaim() > 0) pool.claim(poolID);

        uint256 alcxBalance = IERC20(alchemix).balanceOf(address(this));

        if (alcxBalance > 0) {
            deposit(alcxBalance);
        }

        uint128 total = uint128(totaltAlcxDeposited());
        uint128 last = extender.getAllocatorPerformance(id).gain + uint128(extender.getAllocatorAllocated(id));

        if (total >= last) gain = total - last;
        else loss = last - total;
    }

    /**
     *  @notice Deposits asset into Tokemak tALCX, then deposits tALCX into Alchemix staking pool
     *  @param _amount amount to deposit
     */
    function deposit(uint256 _amount) internal {
        IERC20(alchemix).approve(address(tALCX), _amount); // approve tALCX pool to spend tokens
        tALCX.deposit(_amount);

        uint256 tALCX_balance = IERC20(address(tALCX)).balanceOf(address(this));

        IERC20(address(tALCX)).approve(address(pool), tALCX_balance); // approve to deposit to Alchemix staking pool
        pool.deposit(poolID, tALCX_balance); // deposit into Alchemix staking pool
    }

    /**
     *  @notice as structured by Tokemak before one withdraws you must first request withdrawal,
            unstake tALCX from Alchemix staking pool, depending on the nature of the function call, make a request on Tokemak tALCX pool.
     *  @param _amount amount to withdraw if _isEntireFunds is false
     *  @param _forMigration used to indicate if function call is for migration
     *  @param _isEntireFunds used to indicate if amount to with is the entire funds deposited
     */
    function requestWithdraw(
        uint256 _amount,
        bool _forMigration,
        bool _isEntireFunds
    ) internal {
        if (_forMigration) {
            pool.exit(poolID);
            return;
        }

        if (_isEntireFunds) {
            pool.exit(poolID);
        } else {
            pool.withdraw(poolID, _amount);
        }

        uint256 balance = IERC20(address(tALCX)).balanceOf(address(this));
        tALCX.requestWithdrawal(balance);
    }

    /**
     *  @notice withdraws ALCX from Tokemak tALCX pool to the contract address,
            ensures cycle for withdraw has been reached.
     */
    function withdraw() internal {
        (, uint256 requestedAmountToWithdraw) = getRequestedWithdrawalInfo();
        tALCX.withdraw(requestedAmountToWithdraw);
    }

    function _deactivate(bool panic) internal override {
        if (panic) {
            // If panic unstake everything
            requestWithdraw(0, true, true);
            IERC20(address(tALCX)).safeTransfer(treasury, IERC20(address(tALCX)).balanceOf(address(this)));
            IERC20(alchemix).safeTransfer(treasury, IERC20(alchemix).balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amount = new uint256[](1);
        require(totaltAlcxDeposited() == 0, "Active deposited funds");
        amount[0] = 0;
        deallocate(amount);
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice query all pending rewards
     *  @return uint
     */
    function alchemixToClaim() public view returns (uint256) {
        return pool.getStakeTotalUnclaimed(address(this), poolID);
    }

    /**
     *  @notice query all deposited tALCX in Alchemix staking pool
     *  @return uint
     */
    function totaltAlcxDeposited() public view returns (uint256) {
        return pool.getStakeTotalDeposited(address(this), poolID);
    }

    /**
     *  @notice query requested withdrawal info
     *  @return cycle eligible for withdrawal and amount
     */
    function getRequestedWithdrawalInfo() public view returns (uint256 cycle, uint256 amount) {
        (cycle, amount) = tALCX.requestedWithdrawals(address(this));
    }

    /**
     * @notice This returns the amount of ALCX allocated to the pool. Does not return how much ALCX deposited since that number is increasing and compounding.
     */
    function amountAllocated(uint256 id) public view override returns (uint256) {
        return extender.getAllocatorAllocated(id);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory rewards = new IERC20[](1);
        rewards[0] = IERC20(alchemix);
        return rewards;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](2);
        utility[0] = IERC20(alchemix);
        utility[1] = IERC20(address(tALCX));
        return utility;
    }

    function name() external pure override returns (string memory) {
        return "Alchemix Allocator";
    }
}
