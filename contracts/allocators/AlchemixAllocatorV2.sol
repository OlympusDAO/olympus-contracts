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
 *  which in turn gives tALCX in ratio 1:1 of Alchemix token deposited and TOKE rewards,
 *  The contract stakes tALCX in the Alchemix staking pool and earns ALCX as rewards,
 *  The contract withdraws funds from the Alchemix staking pool and Tokemak tALCX pool,
 *  It sends back Alchemix token with accrued reward to treasury.
 */
contract AlchemixAllocatorV2 is BaseAllocator {
    using SafeERC20 for IERC20;

    address public immutable alcx;
    address public immutable toke;

    // Tokemak tALCX deposit contract
    ITokemaktALCX public immutable tALCX;

    // Alchemix staking contract
    IStakingPools public immutable pool;

    // pool id of tALCX for the Alchemix staking pool
    uint256 public immutable poolID = 8;

    address public rewards;
    address public manager;
    address public treasury;

    constructor(
        address _tALCX,
        address _pool,
        address _treasury,
        address _toke,
        address _rewards,
        address _manager,
        AllocatorInitData memory data
    ) BaseAllocator(data) {
        require(_tALCX != address(0));
        require(_pool != address(0));

        tALCX = ITokemaktALCX(_tALCX);
        pool = IStakingPools(_pool);

        alcx = address(data.tokens[0]);
        treasury = _treasury;
        toke = _toke;
        rewards = _rewards;
        manager = _manager;

        // approve for safety, yes toke is being instantly sent to treasury and that is fine
        // but to be absolutely safe this one approve won't hurt
        IERC20(_toke).approve(address(extender), type(uint256).max);
        IERC20(_tALCX).approve(address(extender), type(uint256).max);
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        if (alcxToClaim() > 0) pool.claim(poolID);

        uint256 alcxBalance = IERC20(alcx).balanceOf(address(this));

        if (alcxBalance > 0) {
            deposit(alcxBalance);
        }

        uint128 total = uint128(amountAllocated(0));
        uint128 last = extender.getAllocatorPerformance(id).gain + uint128(extender.getAllocatorAllocated(id));

        if (total >= last) gain = total - last;
        else loss = last - total;
    }

    /**
     *  @notice There is two step process to withdraw from this allocator, first a withdrawal is requested and secondly
     * the tokens are actually withdrawn, but this takes time hence the request.
     *
     * @param _amounts Pass in _amounts[0] = 0 to claim, and _amounts[0] > 0 to request. Everything else is reverted.
     * If _amounts[0] is equal to type(uint256).max, then a request to withdraw all is made.
     */
    function deallocate(uint256[] memory _amounts) public override onlyGuardian {
        require(_amounts.length == 1, "invalid amounts length");

        if (_amounts[0] == 0) {
            (uint256 minCycle, ) = getRequestedWithdrawalInfo();
            uint256 currentCycle = ITokemakManager(manager).currentCycleIndex();

            require(minCycle <= currentCycle, "requested withdraw cycle not reached yet");
            withdraw();
        } else requestWithdraw(_amounts[0]);
    }

    function _deactivate(bool panic) internal override {
        if (panic) {
            // If panic unstake everything
            requestWithdraw(type(uint256).max);
            IERC20(address(tALCX)).safeTransfer(treasury, IERC20(address(tALCX)).balanceOf(address(this)));
            IERC20(alcx).safeTransfer(treasury, IERC20(alcx).balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amount = new uint256[](1);
        require(amountAllocated(0) == 0, "tAlcx deposited, call deallocate");
        amount[0] = 0;
        deallocate(amount);
    }

    /**
     * @notice Returns amount of currently allocated ALCX.
     */
    function amountAllocated(uint256) public view override returns (uint256) {
        return pool.getStakeTotalDeposited(address(this), poolID);
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory rewards = new IERC20[](1);
        rewards[0] = IERC20(alcx);
        return rewards;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](2);
        utility[0] = IERC20(alcx);
        utility[1] = IERC20(address(tALCX));
        return utility;
    }

    function name() external pure override returns (string memory) {
        return "AlchemixAllocatorV2";
    }

    // allocator specific

    /**
     *  @notice Refer to docs for this function and check out scripts in the repository, tokemak has special logic in regards to claiming so it needs to be handled like this and can't be handled under normal working conditions.
     */
    function claimTokemak(
        ITokemakRewards.Recipient calldata recipient,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyGuardian {
        ITokemakRewards(rewards).claim(recipient, v, r, s);
        require(IERC20(toke).balanceOf(address(this)) > 0, "balance low");

        IERC20(toke).safeTransfer(treasury, IERC20(toke).balanceOf(address(this)));
    }

    /**
     * @notice Set the address of one of the dependencies (external contracts) this contract uses.
     * @param contractNumber 0 for `treasury`, 1 for `manager` and all else is for `rewards`
     */
    function setExternalContract(address newAddress, uint256 contractNumber) external onlyGuardian {
        if (contractNumber == 0) treasury = newAddress;
        else if (contractNumber == 1) manager = newAddress;
        else rewards = newAddress;
    }

    /**
     *  @notice query all pending rewards
     *  @return uint
     */
    function alcxToClaim() public view returns (uint256) {
        return pool.getStakeTotalUnclaimed(address(this), poolID);
    }

    /**
     *  @notice query requested withdrawal info
     *  @return cycle eligible for withdrawal and amount
     */
    function getRequestedWithdrawalInfo() public view returns (uint256 cycle, uint256 amount) {
        (cycle, amount) = tALCX.requestedWithdrawals(address(this));
    }

    /**
     *  @notice Deposits asset into Tokemak tALCX, then deposits tALCX into Alchemix staking pool
     *  @param _amount amount to deposit
     */
    function deposit(uint256 _amount) internal {
        IERC20(alcx).approve(address(tALCX), _amount); // approve tALCX pool to spend tokens
        tALCX.deposit(_amount);

        uint256 tALCX_balance = IERC20(address(tALCX)).balanceOf(address(this));

        IERC20(address(tALCX)).approve(address(pool), tALCX_balance); // approve to deposit to Alchemix staking pool
        pool.deposit(poolID, tALCX_balance); // deposit into Alchemix staking pool
    }

    /**
     *  @notice as structured by Tokemak before one withdraws you must first request withdrawal, unstake tALCX from Alchemix staking pool, depending on the nature of the function call, make a request on Tokemak tALCX pool.
     *  @param _amount amount to withdraw, if uint256 max then take all
     */
    function requestWithdraw(uint256 _amount) internal {
        if (_amount == type(uint256).max) {
            pool.exit(poolID);
        } else {
            pool.withdraw(poolID, _amount);
        }

        uint256 balance = IERC20(address(tALCX)).balanceOf(address(this));
        tALCX.requestWithdrawal(balance);
    }

    /**
     *  @notice withdraws ALCX from Tokemak tALCX pool to the contract address, ensures cycle for withdraw has been reached.
     */
    function withdraw() internal {
        (, uint256 requestedAmountToWithdraw) = getRequestedWithdrawalInfo();
        tALCX.withdraw(requestedAmountToWithdraw);
    }
}
