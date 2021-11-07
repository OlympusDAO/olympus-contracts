// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IwsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IOwnable.sol";

import "../types/Ownable.sol";

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

interface IUniswapV2Router {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);
}

interface IStakingV1 {
    function unstake(uint256 _amount, bool _trigger) external;

    function index() external view returns (uint256);
}

contract OlympusTokenMigrator is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IgOHM;
    using SafeERC20 for IsOHM;

    /* ========== MIGRATION ========== */

    event TimelockStarted(uint256 block, uint256 end);
    event Migrated(address staking, address treasury);
    event Funded(uint256 amount);
    event Defunded(uint256 amount);

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable oldOHM;
    IsOHM public immutable oldsOHM;
    IwsOHM public immutable oldwsOHM;
    ITreasury public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IUniswapV2Router public immutable sushiRouter;
    IUniswapV2Router public immutable uniRouter;

    IgOHM public gOHM;
    ITreasury public newTreasury;
    IStaking public newStaking;
    IERC20 public newOHM;

    bool public ohmMigrated;
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
        uint256 _timelock
    ) {
        require(_oldOHM != address(0));
        oldOHM = IERC20(_oldOHM);
        require(_oldsOHM != address(0));
        oldsOHM = IsOHM(_oldsOHM);
        require(_oldTreasury != address(0));
        oldTreasury = ITreasury(_oldTreasury);
        require(_oldStaking != address(0));
        oldStaking = IStakingV1(_oldStaking);
        require(_oldwsOHM != address(0));
        oldwsOHM = IwsOHM(_oldwsOHM);
        require(_sushi != address(0));
        sushiRouter = IUniswapV2Router(_sushi);
        require(_uni != address(0));
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
    function migrate(uint256 _amount, TYPE _from, TYPE _to) external {
        uint256 sAmount = _amount;
        uint256 wAmount = oldwsOHM.sOHMTowOHM(_amount);

        if (_from == TYPE.UNSTAKED) {
            oldOHM.safeTransferFrom(msg.sender, address(this), _amount);
        } else if (_from == TYPE.STAKED) {
            oldsOHM.safeTransferFrom(msg.sender, address(this), _amount);
        } else if (_from == TYPE.WRAPPED) {
            oldwsOHM.transferFrom(msg.sender, address(this), _amount);
            wAmount = _amount;
            sAmount = oldwsOHM.wOHMTosOHM(_amount);
        }

        if (ohmMigrated) {
            require(oldSupply >= oldOHM.totalSupply(), "OHMv1 minted");
            _send(wAmount, _to);
        } else {
            gOHM.mint(msg.sender, wAmount);
        }
    }

    // migrate all tokens held
    function migrateAll(TYPE _to) external {
        uint ohmBal = oldOHM.balanceOf(msg.sender);
        uint sOHMBal = oldsOHM.balanceOf(msg.sender);
        uint wsOHMBal = oldwsOHM.balanceOf(msg.sender);

        if(ohmBal > 0) {
            oldOHM.safeTransferFrom(msg.sender, address(this), ohmBal);
        }
        if(sOHMBal > 0) {
            oldsOHM.safeTransferFrom(msg.sender, address(this), sOHMBal);
        }
        if(wsOHMBal > 0) {
            oldwsOHM.safeTransferFrom(msg.sender, address(this), wsOHMBal);
        }

        uint wAmount = wsOHMBal.add( oldwsOHM.sOHMTowOHM( ohmBal.add(sOHMBal) ) );
        if (ohmMigrated) {
            require(oldSupply >= oldOHM.totalSupply(), "OHMv1 minted");
            _send(wAmount, _to);
        } else {
            gOHM.mint(msg.sender, wAmount);
        }
    }

    // send preferred token
    function _send(uint wAmount, TYPE _to) internal {
        if(_to == TYPE.WRAPPED) {
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
            oldwsOHM.transfer(msg.sender, _amount);
        }
    }

    /* ========== OWNABLE ========== */

    // withdraw backing of migrated OHM
    function defund(address reserve) external onlyOwner {
        require(ohmMigrated && timelockEnd < block.number && timelockEnd != 0);
        oldwsOHM.unwrap(oldwsOHM.balanceOf(address(this)));

        uint256 amountToUnstake = oldsOHM.balanceOf(address(this));
        oldsOHM.approve(address(oldStaking), amountToUnstake);
        oldStaking.unstake(amountToUnstake, false);

        uint256 balance = oldOHM.balanceOf(address(this));

        oldSupply = oldSupply.sub(balance);

        uint256 amountToWithdraw = balance.mul(1e9);
        oldOHM.approve(address(oldTreasury), amountToWithdraw);
        oldTreasury.withdraw(amountToWithdraw, reserve);
        IERC20(reserve).safeTransfer(address(newTreasury), IERC20(reserve).balanceOf(address(this)));

        emit Defunded(balance);
    }

    // start timelock to send backing to new treasury
    function startTimelock() external onlyOwner {
        timelockEnd = block.number.add(timelockLength);

        emit TimelockStarted(block.number, timelockEnd);
    }

    // set gOHM address
    function setgOHM(address _gOHM) external onlyOwner {
        require(address(gOHM) == address(0));
        require(_gOHM != address(0));

        gOHM = IgOHM(_gOHM);
    }

    // call internal migrate token function
    function migrateToken( address token ) external onlyOwner() {
        _migrateToken(token, false);
    }

    /**
     *   @notice Migrate LP and pair with new OHM
     */
    function migrateLP( address pair, bool sushi, address token ) external onlyOwner() {
        uint256 oldLPAmount = IERC20(pair).balanceOf(address(oldTreasury));
        oldTreasury.manage(pair, oldLPAmount);

        IUniswapV2Router router = sushiRouter;
        if( !sushi ) {
            router = uniRouter;
        }

        IERC20(pair).approve(address(router), oldLPAmount);
        (uint256 amountA, uint256 amountB) = router.removeLiquidity(token, address(oldOHM), oldLPAmount, 0, 0, address(this), 1000000000000);

        newTreasury.mint( address(this), amountB );

        IERC20(token).approve(address(router), amountA);
        newOHM.approve(address(router), amountB);

        router.addLiquidity(token, address(newOHM), amountA, amountB, amountA, amountB, address(newTreasury), 100000000000);
    }

    // migrate contracts
    function migrateContracts(
        address _newTreasury,
        address _newStaking,
        address _newOHM,
        address _newsOHM,
        address _reserve
    ) external onlyOwner {
        ohmMigrated = true;

        require(_newTreasury != address(0));
        newTreasury = ITreasury(_newTreasury);
        require(_newStaking != address(0));
        newStaking = IStaking(_newStaking);
        require(_newOHM != address(0));
        newOHM = IERC20(_newOHM);

        oldSupply = oldOHM.totalSupply(); // log total supply at time of migration

        gOHM.migrate(_newStaking, _newsOHM); // change gOHM minter

        _migrateToken( _reserve, true );  // will deposit tokens into new treasury so reserves can be accounted for

        fund(oldsOHM.circulatingSupply()); // fund with current staked supply for token migration

        emit Migrated(_newStaking, _newTreasury);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    // fund contract with gOHM
    function fund(uint256 _amount) internal {
        newTreasury.mint(address(this), _amount);
        newOHM.approve(address(newStaking), _amount);
        newStaking.stake(address(this), _amount, false, true); // stake and claim gOHM

        emit Funded(_amount);
    }

    /**
     *   @notice Migrate token from old treasury to new treasury
     */
    function _migrateToken( address token, bool deposit ) internal {
        uint256 balance = IERC20(token).balanceOf(address(oldTreasury));

        uint256 excessReserves = oldTreasury.excessReserves();
        uint256 tokenValue = newTreasury.tokenValue(token, balance);

        if (tokenValue > excessReserves) {
            tokenValue = excessReserves;
            balance = excessReserves * 10**9;
        }

        oldTreasury.manage(token, balance);

        if(deposit) {
            IERC20(token).safeApprove(address(newTreasury), balance);
            newTreasury.deposit(balance, token, tokenValue);
        } else {
            IERC20(token).transfer(address(newTreasury), balance);
        }
    }
}
