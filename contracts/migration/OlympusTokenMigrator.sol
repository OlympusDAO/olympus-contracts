// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IwsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IOwnable.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IStakingV1.sol";
import "../interfaces/ITreasuryV1.sol";

import "../types/OlympusAccessControlled.sol";

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

contract OlympusTokenMigrator is OlympusAccessControlled {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IgOHM;
    using SafeERC20 for IsOHM;
    using SafeERC20 for IwsOHM;

    /* ========== MIGRATION ========== */

    event TimelockStarted(uint256 block, uint256 end);
    event Migrated(address staking, address treasury);
    event Funded(uint256 amount);
    event Defunded(uint256 amount);

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable oldOHM;
    IsOHM public immutable oldsOHM;
    IwsOHM public immutable oldwsOHM;
    ITreasuryV1 public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IUniswapV2Router public immutable sushiRouter;
    IUniswapV2Router public immutable uniRouter;

    IgOHM public gOHM;
    ITreasury public newTreasury;
    IStaking public newStaking;
    IERC20 public newOHM;

    bool public ohmMigrated;
    bool public shutdown;

    uint256 public immutable timelockLength;
    uint256 public timelockEnd;

    uint256 public oldSupply;

    constructor(
        address _oldOHM,
        address _oldsOHM,
        address _oldTreasury,
        address _oldStaking,
        address _oldwsOHM,
        address _sushi,
        address _uni,
        uint256 _timelock,
        address _authority
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        require(_oldOHM != address(0), "Zero address: OHM");
        oldOHM = IERC20(_oldOHM);
        require(_oldsOHM != address(0), "Zero address: sOHM");
        oldsOHM = IsOHM(_oldsOHM);
        require(_oldTreasury != address(0), "Zero address: Treasury");
        oldTreasury = ITreasuryV1(_oldTreasury);
        require(_oldStaking != address(0), "Zero address: Staking");
        oldStaking = IStakingV1(_oldStaking);
        require(_oldwsOHM != address(0), "Zero address: wsOHM");
        oldwsOHM = IwsOHM(_oldwsOHM);
        require(_sushi != address(0), "Zero address: Sushi");
        sushiRouter = IUniswapV2Router(_sushi);
        require(_uni != address(0), "Zero address: Uni");
        uniRouter = IUniswapV2Router(_uni);
        timelockLength = _timelock;
    }

    /* ========== MIGRATION ========== */

    enum TYPE {
        UNSTAKED,
        STAKED,
        WRAPPED
    }

    // migrate OHMv1, sOHMv1, or wsOHM for OHMv2, sOHMv2, or gOHM
    function migrate(
        uint256 _amount,
        TYPE _from,
        TYPE _to
    ) external {
        require(!shutdown, "Shut down");

        uint256 wAmount = oldwsOHM.sOHMTowOHM(_amount);

        if (_from == TYPE.UNSTAKED) {
            require(ohmMigrated, "Only staked until migration");
            oldOHM.safeTransferFrom(msg.sender, address(this), _amount);
        } else if (_from == TYPE.STAKED) {
            oldsOHM.safeTransferFrom(msg.sender, address(this), _amount);
        } else {
            oldwsOHM.safeTransferFrom(msg.sender, address(this), _amount);
            wAmount = _amount;
        }

        if (ohmMigrated) {
            require(oldSupply >= oldOHM.totalSupply(), "OHMv1 minted");
            _send(wAmount, _to);
        } else {
            gOHM.mint(msg.sender, wAmount);
        }
    }

    // migrate all olympus tokens held
    function migrateAll(TYPE _to) external {
        require(!shutdown, "Shut down");

        uint256 ohmBal = 0;
        uint256 sOHMBal = oldsOHM.balanceOf(msg.sender);
        uint256 wsOHMBal = oldwsOHM.balanceOf(msg.sender);

        if (oldOHM.balanceOf(msg.sender) > 0 && ohmMigrated) {
            ohmBal = oldOHM.balanceOf(msg.sender);
            oldOHM.safeTransferFrom(msg.sender, address(this), ohmBal);
        }
        if (sOHMBal > 0) {
            oldsOHM.safeTransferFrom(msg.sender, address(this), sOHMBal);
        }
        if (wsOHMBal > 0) {
            oldwsOHM.safeTransferFrom(msg.sender, address(this), wsOHMBal);
        }

        uint256 wAmount = wsOHMBal.add(oldwsOHM.sOHMTowOHM(ohmBal.add(sOHMBal)));
        if (ohmMigrated) {
            require(oldSupply >= oldOHM.totalSupply(), "OHMv1 minted");
            _send(wAmount, _to);
        } else {
            gOHM.mint(msg.sender, wAmount);
        }
    }

    // send preferred token
    function _send(uint256 wAmount, TYPE _to) internal {
        if (_to == TYPE.WRAPPED) {
            gOHM.safeTransfer(msg.sender, wAmount);
        } else if (_to == TYPE.STAKED) {
            newStaking.unwrap(msg.sender, wAmount);
        } else if (_to == TYPE.UNSTAKED) {
            newStaking.unstake(msg.sender, wAmount, false, false);
        }
    }

    // bridge back to OHM, sOHM, or wsOHM
    function bridgeBack(uint256 _amount, TYPE _to) external {
        if (!ohmMigrated) {
            gOHM.burn(msg.sender, _amount);
        } else {
            gOHM.safeTransferFrom(msg.sender, address(this), _amount);
        }

        uint256 amount = oldwsOHM.wOHMTosOHM(_amount);
        // error throws if contract does not have enough of type to send
        if (_to == TYPE.UNSTAKED) {
            oldOHM.safeTransfer(msg.sender, amount);
        } else if (_to == TYPE.STAKED) {
            oldsOHM.safeTransfer(msg.sender, amount);
        } else if (_to == TYPE.WRAPPED) {
            oldwsOHM.safeTransfer(msg.sender, _amount);
        }
    }

    /* ========== OWNABLE ========== */

    // halt migrations (but not bridging back)
    function halt() external onlyPolicy {
        require(!ohmMigrated, "Migration has occurred");
        shutdown = !shutdown;
    }

    // withdraw backing of migrated OHM
    function defund(address reserve) external onlyGovernor {
        require(ohmMigrated, "Migration has not begun");
        require(timelockEnd < block.number && timelockEnd != 0, "Timelock not complete");

        oldwsOHM.unwrap(oldwsOHM.balanceOf(address(this)));

        uint256 amountToUnstake = oldsOHM.balanceOf(address(this));
        oldsOHM.approve(address(oldStaking), amountToUnstake);
        oldStaking.unstake(amountToUnstake, false);

        uint256 balance = oldOHM.balanceOf(address(this));

        if (balance > oldSupply) {
            oldSupply = 0;
        } else {
            oldSupply -= balance;
        }

        uint256 amountToWithdraw = balance.mul(1e9);
        oldOHM.approve(address(oldTreasury), amountToWithdraw);
        oldTreasury.withdraw(amountToWithdraw, reserve);
        IERC20(reserve).safeTransfer(address(newTreasury), IERC20(reserve).balanceOf(address(this)));

        emit Defunded(balance);
    }

    // start timelock to send backing to new treasury
    function startTimelock() external onlyGovernor {
        require(timelockEnd == 0, "Timelock set");
        timelockEnd = block.number.add(timelockLength);

        emit TimelockStarted(block.number, timelockEnd);
    }

    // set gOHM address
    function setgOHM(address _gOHM) external onlyGovernor {
        require(address(gOHM) == address(0), "Already set");
        require(_gOHM != address(0), "Zero address: gOHM");

        gOHM = IgOHM(_gOHM);
    }

    // call internal migrate token function
    function migrateToken(address token) external onlyGovernor {
        _migrateToken(token, false);
    }

    /**
     *   @notice Migrate LP and pair with new OHM
     */
    function migrateLP(
        address pair,
        bool sushi,
        address token,
        uint256 _minA,
        uint256 _minB
    ) external onlyGovernor {
        uint256 oldLPAmount = IERC20(pair).balanceOf(address(oldTreasury));
        oldTreasury.manage(pair, oldLPAmount);

        IUniswapV2Router router = sushiRouter;
        if (!sushi) {
            router = uniRouter;
        }

        IERC20(pair).approve(address(router), oldLPAmount);
        (uint256 amountA, uint256 amountB) = router.removeLiquidity(
            token,
            address(oldOHM),
            oldLPAmount,
            _minA,
            _minB,
            address(this),
            block.timestamp
        );

        newTreasury.mint(address(this), amountB);

        IERC20(token).approve(address(router), amountA);
        newOHM.approve(address(router), amountB);

        router.addLiquidity(
            token,
            address(newOHM),
            amountA,
            amountB,
            amountA,
            amountB,
            address(newTreasury),
            block.timestamp
        );
    }

    // Failsafe function to allow owner to withdraw funds sent directly to contract in case someone sends non-ohm tokens to the contract
    function withdrawToken(
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external onlyGovernor {
        require(tokenAddress != address(0), "Token address cannot be 0x0");
        require(tokenAddress != address(gOHM), "Cannot withdraw: gOHM");
        require(tokenAddress != address(oldOHM), "Cannot withdraw: old-OHM");
        require(tokenAddress != address(oldsOHM), "Cannot withdraw: old-sOHM");
        require(tokenAddress != address(oldwsOHM), "Cannot withdraw: old-wsOHM");
        require(amount > 0, "Withdraw value must be greater than 0");
        if (recipient == address(0)) {
            recipient = msg.sender; // if no address is specified the value will will be withdrawn to Owner
        }

        IERC20 tokenContract = IERC20(tokenAddress);
        uint256 contractBalance = tokenContract.balanceOf(address(this));
        if (amount > contractBalance) {
            amount = contractBalance; // set the withdrawal amount equal to balance within the account.
        }
        // transfer the token from address of this contract
        tokenContract.safeTransfer(recipient, amount);
    }

    // migrate contracts
    function migrateContracts(
        address _newTreasury,
        address _newStaking,
        address _newOHM,
        address _newsOHM,
        address _reserve
    ) external onlyGovernor {
        require(!ohmMigrated, "Already migrated");
        ohmMigrated = true;
        shutdown = false;

        require(_newTreasury != address(0), "Zero address: Treasury");
        newTreasury = ITreasury(_newTreasury);
        require(_newStaking != address(0), "Zero address: Staking");
        newStaking = IStaking(_newStaking);
        require(_newOHM != address(0), "Zero address: OHM");
        newOHM = IERC20(_newOHM);

        oldSupply = oldOHM.totalSupply(); // log total supply at time of migration

        gOHM.migrate(_newStaking, _newsOHM); // change gOHM minter

        _migrateToken(_reserve, true); // will deposit tokens into new treasury so reserves can be accounted for

        _fund(oldsOHM.circulatingSupply()); // fund with current staked supply for token migration

        emit Migrated(_newStaking, _newTreasury);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    // fund contract with gOHM
    function _fund(uint256 _amount) internal {
        newTreasury.mint(address(this), _amount);
        newOHM.approve(address(newStaking), _amount);
        newStaking.stake(address(this), _amount, false, true); // stake and claim gOHM

        emit Funded(_amount);
    }

    /**
     *   @notice Migrate token from old treasury to new treasury
     */
    function _migrateToken(address token, bool deposit) internal {
        uint256 balance = IERC20(token).balanceOf(address(oldTreasury));

        uint256 excessReserves = oldTreasury.excessReserves();
        uint256 tokenValue = oldTreasury.valueOf(token, balance);

        if (tokenValue > excessReserves) {
            tokenValue = excessReserves;
            balance = excessReserves * 10**9;
        }

        oldTreasury.manage(token, balance);

        if (deposit) {
            IERC20(token).safeApprove(address(newTreasury), balance);
            newTreasury.deposit(balance, token, tokenValue);
        } else {
            IERC20(token).safeTransfer(address(newTreasury), balance);
        }
    }
}
