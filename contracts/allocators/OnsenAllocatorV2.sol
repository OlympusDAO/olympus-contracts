// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.10;
import "../libraries/Address.sol";

///  ========== TYPES ==========
import "../types/BaseAllocator.sol";

///  ========== INTERFACES ==========
import "./interfaces/IMasterChef.sol";
import "./interfaces/ISushiBar.sol";

struct PoolData {
    bool poolActive;
    uint256 id;
}

/**
 *  @notice Contract deploys liquidity from treasury into the Onsen program,
 *  earning $SUSHI that can be staked and/or deposited into the treasury.
 *  Set the Onsen Pool Id for the LP tokens that will be processed ahead of time by calling setLPTokenOnsenPoolId
 */
contract OnsenAllocatorV2 is BaseAllocator {
    using SafeERC20 for IERC20;

    /// ========== STATE VARIABLES ==========

    address public sushi; /// $SUSHI token
    address public xSushi; /// $xSUSHI token
    address public masterChef; /// Onsen contract

    address public treasury; /// Olympus Treasury

    mapping(address => PoolData) internal _lpToOnsenId;

    /// ========== CONSTRUCTOR ==========

    constructor(
        address _chef,
        address _sushi,
        address _xSushi,
        address _treasury,
        AllocatorInitData memory data
    ) BaseAllocator(data) {
        require(_chef != address(0));
        masterChef = _chef;
        require(_sushi != address(0));
        sushi = _sushi;
        require(_xSushi != address(0));
        xSushi = _xSushi;
        require(_treasury != address(0));
        treasury = _treasury;

        /**  @dev approve for safety, sushi is being staked and xsushi is being instantly sent to treasury and that is fine
         *   but to be absolutely safe this one approve won't hurt
         */
        IERC20(sushi).approve(address(extender), type(uint256).max);
        IERC20(xSushi).approve(address(extender), type(uint256).max);
    }

    /**
     * @notice Find out which LP tokens to be deposited into onsen, then deposit it into onsen pool and stake the sushi tokens that are returned.
     * 1- Based on the LP token to be deposited, find out the Onsen Pool Id
     * 2- Deposit LP token into onsen, if deposit is succesfull we should get in return sushi tokens
     * 2- Stake the Sushi rewards tokens returned from deposit LP tokens and as rewards form onsen LP stake, we should get in return xSushi tokens
     * 3- Keep the xSushi on the allocator contract for easily deallocation
     * 4- Calculate gains/loss based on the LP balance on the Onsen Pool.
     */
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 index = tokenIds[id];
        IERC20 LPtoken = _tokens[index];
        uint256 balance = LPtoken.balanceOf(address(this));

        /// Find out if there is a Onsen Pool for the LPToken
        (bool onsenLPFound, uint256 onsenPoolId) = _findPoolByLP(address(LPtoken));

        /// Deposit LP token into onsen, if deposit succesfull this address should have in return sushi tokens
        if (balance > 0) {
            if (onsenLPFound) {
                /// Approve and deposit balance into onsen Pool
                LPtoken.approve(masterChef, balance);
                IMasterChef(masterChef).deposit(onsenPoolId, balance, address(this));
            } else {
                /// If no Onsen pool was found for the LP token then return LP token to the treasury.
                LPtoken.safeTransfer(treasury, balance);
            }
        } else {
            /// If LP token balance is 0, then harvest any pending Sushi rewards for it to be stake.
            IMasterChef(masterChef).harvest(onsenPoolId, address(this));
        }

        /// Stake the sushi tokens
        _stakeSushi();

        ///Calculate gains/loss
        /// Retrieve current balance for pool and address
        UserInfo memory currentUserInfo = IMasterChef(masterChef).userInfo(onsenPoolId, address(this));

        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (currentUserInfo.amount >= last) {
            gain = uint128(currentUserInfo.amount - last);
        } else {
            loss = uint128(last - currentUserInfo.amount);
        }
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        for (uint256 i; i < amounts.length; i++) {
            uint256 amount = amounts[i];
            if (amount > 0) {
                /// Get the LPToken
                IERC20 token = _tokens[i];

                /// Get the onsen pool Id
                (bool onsenLPFound, uint256 onsenPoolId) = _findPoolByLP(address(token));

                if (onsenLPFound) {
                    /// Withdraw LP Token from Onsen Pool
                    IMasterChef(masterChef).withdrawAndHarvest(onsenPoolId, amount, address(this));
                }
            }
        }
    }

    function _deactivate(bool panic) internal override {
        /// If Panic transfer LP tokens to the treasury
        if (panic) {
            /// Get amounts by LP to unstake and then deallocate (unstake) each token.
            _deallocateAll();
            _unstakeSushi();

            for (uint256 i; i < _tokens.length; i++) {
                IERC20 token = _tokens[i];
                token.safeTransfer(treasury, token.balanceOf(address(this)));
            }

            /// And transfer Sushi tokens (rewards) to treasury
            IERC20(sushi).safeTransfer(treasury, IERC20(sushi).balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {
        /// Get amounts by LP to unstake and then deallocate (unstake) each token.
        _deallocateAll();
        _unstakeSushi();
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        /// Find the LP token which amount allocated is requested
        uint256 index = tokenIds[id];
        IERC20 LPtoken = _tokens[index];
        PoolData memory pd = _lpToOnsenId[address(LPtoken)];

        if (pd.poolActive) {
            UserInfo memory currentUserInfo = IMasterChef(masterChef).userInfo(pd.id, address(this));
            return currentUserInfo.amount;
        } else {
            return 0;
        }
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory rewards = new IERC20[](2);
        rewards[0] = IERC20(sushi);
        rewards[1] = IERC20(xSushi);
        return rewards;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utility = new IERC20[](1);
        utility[0] = IERC20(sushi);
        return utility;
    }

    function name() external pure override returns (string memory) {
        return "OnsenAllocator";
    }

    function setTreasury(address treasuryAddress) external onlyGuardian {
        treasury = treasuryAddress;
    }

    function setSushi(address sushiAddress) external onlyGuardian {
        sushi = sushiAddress;
    }

    function setXSushi(address xSushiAddress) external onlyGuardian {
        xSushi = xSushiAddress;
    }

    function setMasterChefAddress(address masterChefAddress) external onlyGuardian {
        masterChef = masterChefAddress;
    }

    /**
     * @notice Set Onsen Pool Id for LP token
     * @param lpToken address of the LP token
     * @param onsenPoolId Pool id from onsen sushi
     */
    function setLPTokenOnsenPoolId(address lpToken, uint256 onsenPoolId) external onlyGuardian {
        PoolData memory pd = _lpToOnsenId[lpToken];
        pd.poolActive = true;
        pd.id = onsenPoolId;
    }

    /**
     * @notice Get the stored Onsen Pool id based on the LP token address
     * @param lpToken address of the LP token
     * @return first value will show if the value is stored , second value show the Onsen Pool Id stored locally.
     */
    function getLPTokenOnsenPoolId(address lpToken) external view returns (bool, uint256) {
        /// Check if the id is already stored in the local variable
        PoolData memory pd = _lpToOnsenId[lpToken];

        /// If the pool is active return the id else search for the pool id
        if (pd.poolActive) {
            return (pd.poolActive, pd.id);
        } else {
            return (false, 0);
        }
    }

    /// ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice stake sushi rewards
     */
    function _stakeSushi() internal {
        uint256 balance = IERC20(sushi).balanceOf(address(this));
        if (balance > 0) {
            IERC20(sushi).approve(xSushi, balance);
            ISushiBar(xSushi).enter(balance); // stake sushi
        }
    }

    /**
     * @notice unStake sushi rewards
     */
    function _unstakeSushi() internal {
        uint256 balance = IERC20(xSushi).balanceOf(address(this));
        if (balance > 0) {
            ISushiBar(xSushi).leave(balance); // unstake $xSUSHI
        }
    }

    /**
     * @notice Find out pool Id from Onsen based on the LP token
     * according to Onsen documentation there shouldn't be more than pool by LPToken, so we are going
     * to use the first ocurrence of the LPToken in the Onsen pools
     * @return [bool, uint256], first value shows if value was found, second value the id for the pool
     */
    function _findPoolByLP(address LPToken) internal returns (bool, uint256) {
        /// Check if the id is already stored in the local variable
        PoolData memory pd = _lpToOnsenId[LPToken];

        /// If the pool is active return the id else search for the pool id
        if (pd.poolActive) {
            return (pd.poolActive, pd.id);
        } else {
            /// Call the poolLength function from sushi masterchef v2 and compare against the LP token passed as parameter
            uint256 poolsLength = IMasterChef(masterChef).poolLength();

            for (uint256 i; i < poolsLength; i++) {
                /// If found, return the the pool Id from Onsen for the current LPToken.
                if (LPToken == (address)(IMasterChef(masterChef).lpToken(i))) {
                    pd = _lpToOnsenId[LPToken];
                    pd.poolActive = true;
                    pd.id = i;
                    return (true, i);
                }
            }

            /// If the LPToken was not found return 0 and indicate that the token was not found
            return (false, 0);
        }
    }

    function _deallocateAll() internal {
        /// Find the Onsen Pools Id for each token and withdraw and harvest each pool.
        for (uint256 i; i < _tokens.length; i++) {
            (bool onsenLPFound, uint256 onsenPoolId) = _findPoolByLP(address(_tokens[i]));
            if (onsenLPFound) {
                /// Retrieve current balance for pool and address
                UserInfo memory currentUserInfo = IMasterChef(masterChef).userInfo(onsenPoolId, address(this));
                if (currentUserInfo.amount > 0) {
                    IMasterChef(masterChef).withdrawAndHarvest(onsenPoolId, currentUserInfo.amount, address(this));
                }
            }
        }
    }
}
