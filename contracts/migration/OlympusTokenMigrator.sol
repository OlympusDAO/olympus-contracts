// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/IwsOHM.sol";
import "../interfaces/IgOHM.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IOwnable.sol";
import "../interfaces/IUniswapV2Router.sol";

import "../types/Ownable.sol";

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

interface IRouter {
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

    struct Token {
        address token;
        bool reserveToken;
    }

    struct LPToken {
        address token;
        address tokenA;
        address tokenB;
        bool sushi;
    }

    Token[] public tokens;
    LPToken[] public lpTokens;

    IERC20 public immutable oldOHM;
    IsOHM public immutable oldsOHM;
    IwsOHM public immutable oldwsOHM;
    ITreasury public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IRouter public immutable sushiRouter;
    IRouter public immutable uniRouter;

    IgOHM public gOHM;
    ITreasury public newTreasury;
    IStaking public newStaking;
    IERC20 public newOHM;

    IERC20 public immutable DAI;

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
        address _DAI,
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
        require(_DAI != address(0));
        DAI = IERC20(_DAI);
        require(_sushi != address(0));
        sushiRouter = IRouter(_sushi);
        require(_uni != address(0));
        uniRouter = IRouter(_uni);
        timelockLength = _timelock;
    }

    /* ========== MIGRATION ========== */

    enum TYPE {
        UNSTAKED,
        STAKED,
        WRAPPED
    }

    // migrate OHM, sOHM, or wsOHM for gOHM
    function migrate(uint256 _amount, TYPE _from) external {
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
            gOHM.safeTransfer(msg.sender, wAmount);
        } else {
            gOHM.mint(msg.sender, wAmount);
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

    /**
     *   @notice adds tokens to tokens array
     *   @param _tokens address[]
     *   @param _reserveToken bool[]
     */
    function addTokens(address[] memory _tokens, bool[] memory _reserveToken) external onlyOwner {
        require(_tokens.length == _reserveToken.length, "token array lengths do not match");

        for (uint256 i = 0; i < _tokens.length; i++) {
            tokens.push(Token({token: _tokens[i], reserveToken: _reserveToken[i]}));
        }
    }

    /**
     *   @notice adds tokens to tokens array
     *   @param _tokens address[]
     *   @param _tokenA address[]
     *   @param _tokenB address[]
     *   @param _sushi bool[]
     */
    function addLPTokens(
        address[] memory _tokens,
        address[] memory _tokenA,
        address[] memory _tokenB,
        bool[] memory _sushi
    ) external onlyOwner {
        require(_tokens.length == _sushi.length, "token array lengths do not match");

        for (uint256 i = 0; i < _tokens.length; i++) {
            lpTokens.push(LPToken({token: _tokens[i], tokenA: _tokenA[i], tokenB: _tokenB[i], sushi: _sushi[i]}));
        }
    }

    // withdraw backing of migrated OHM
    function defund() external onlyOwner {
        require(ohmMigrated && timelockEnd < block.number && timelockEnd != 0);
        oldwsOHM.unwrap(oldwsOHM.balanceOf(address(this)));

        oldsOHM.approve(address(oldStaking), oldsOHM.balanceOf(address(this)));
        oldStaking.unstake(oldsOHM.balanceOf(address(this)), false);

        uint256 balance = oldOHM.balanceOf(address(this));

        oldSupply = oldSupply.sub(balance);

        oldOHM.approve(address(oldTreasury), balance);
        oldTreasury.withdraw(balance.mul(1e9), address(DAI));
        DAI.safeTransfer(address(newTreasury), DAI.balanceOf(address(this)));

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

    // migrate contracts
    function migrateContracts(
        address _newTreasury,
        address _newStaking,
        address _newOHM,
        address _newsOHM
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

        _migrateLP();
        _migrateTokens();

        fund(oldsOHM.circulatingSupply()); // fund with current staked supply for token migration

        emit Migrated(_newStaking, _newTreasury);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    // fund contract with gOHM
    function fund(uint256 _amount) internal {
        newTreasury.mint(address(this), _amount);
        newOHM.approve(address(newStaking), _amount);
        newStaking.stake(_amount, address(this), false, true); // stake and claim gOHM

        emit Funded(_amount);
    }

    /**
     *   @notice Migrates tokens from old treasury to new treasury
     */
    function _migrateTokens() internal {
        for (uint256 i = 0; i < tokens.length; i++) {
            Token memory _token = tokens[i];

            uint256 balance = IERC20(_token.token).balanceOf(address(oldTreasury));

            uint256 excessReserves = oldTreasury.excessReserves();
            uint256 tokenValue = newTreasury.tokenValue(_token.token, balance);

            if (tokenValue > excessReserves) {
                tokenValue = excessReserves;
                balance = excessReserves * 10**9;
            }

            oldTreasury.manage(_token.token, balance);

            if (_token.reserveToken) {
                IERC20(_token.token).approve(address(newTreasury), balance);
                newTreasury.deposit(balance, _token.token, tokenValue);
            } else {
                IERC20(_token.token).transfer(address(newTreasury), balance);
            }
        }
    }

    /**
     *   @notice Migrates LPs to be paired with new OHM and is sent to new treasury
     */
    function _migrateLP() internal {
        for (uint256 i = 0; i < lpTokens.length; i++) {
            LPToken memory _token = lpTokens[i];

            uint256 oldLPAmount = IERC20(_token.token).balanceOf(address(oldTreasury));
            oldTreasury.manage(_token.token, oldLPAmount);

            if (_token.sushi) {
                IERC20(_token.token).approve(address(sushiRouter), oldLPAmount);
                (uint256 amountA, uint256 amountB) = sushiRouter.removeLiquidity(
                    _token.tokenA,
                    _token.tokenB,
                    oldLPAmount,
                    0,
                    0,
                    address(this),
                    1000000000000
                );

                oldOHM.approve(address(oldTreasury), amountB);
                oldTreasury.withdraw(amountB * 10**9, _token.tokenA);

                IERC20(_token.tokenA).approve(address(newTreasury), amountB * 10**9);
                newTreasury.deposit(amountB * 10**9, _token.tokenA, 0);

                IERC20(_token.tokenA).approve(address(sushiRouter), amountA);
                newOHM.approve(address(sushiRouter), amountB);

                sushiRouter.addLiquidity(_token.tokenA, address(newOHM), amountA, amountB, amountA, amountB, address(newTreasury), 100000000000);
            } else {
                IERC20(_token.token).approve(address(uniRouter), oldLPAmount);
                (uint256 amountA, uint256 amountB) = uniRouter.removeLiquidity(
                    _token.tokenA,
                    _token.tokenB,
                    oldLPAmount,
                    0,
                    0,
                    address(this),
                    1000000000000
                );

                oldOHM.approve(address(oldTreasury), amountB);
                oldTreasury.withdraw(amountB * 10**9, _token.tokenA);

                IERC20(_token.tokenA).approve(address(newTreasury), amountB * 10**9);
                newTreasury.deposit(amountB * 10**9, _token.tokenA, 0);

                IERC20(_token.tokenA).approve(address(uniRouter), amountA);
                newOHM.approve(address(uniRouter), amountB);

                uniRouter.addLiquidity(_token.tokenA, address(newOHM), amountA, amountB, amountA, amountB, address(newTreasury), 100000000000);
            }
        }
    }
}
