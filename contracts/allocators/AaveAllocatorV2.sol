pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

interface ILendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

interface IStakedTokenIncentivesController {
    function claimRewards(
        address[] memory assets,
        uint256 amount,
        address to
    ) external;

    function claimRewardsOnBehalf(
        address[] memory assets,
        uint256 amount,
        address user,
        address to
    ) external;

    function getRewardsBalance(address[] memory assets, address user) external view returns (uint256);
}

contract AaveAllocatorV2 is BaseAllocator {
    address public constant treasury = 0x9A315BdF513367C0377FB36545857d12e85813Ef;

    // stkAave incentive controller
    IStakedTokenIncentivesController public immutable incentives =
        IStakedTokenIncentivesController(0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5);

    // Aave Lending Pool
    ILendingPool public immutable pool = ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    IERC20[] internal _aTokens;

    uint16 public referralCode;

    constructor(AllocatorInitData memory data) BaseAllocator(data) {}

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 tokenId = tokenIds[id];
        IERC20 token = _tokens[tokenId];
        IERC20 aToken = _aTokens[tokenId];
        uint256 balance = token.balanceOf(address(this));

        // interactions
        if (balance > 0) {
            token.approve(address(pool), balance);
            pool.deposit(address(token), balance, address(this), referralCode);
        }

        uint256 aBalance = aToken.balanceOf(address(this));
        uint256 allocated = extender.getAllocatorAllocated(id);

        // we can do this because aToken is 1:1 with deposited
        if (aBalance >= allocated) {
            gain = uint128(aBalance - allocated);
        } else {
            loss = uint128(allocated - aBalance);
        }
    }

    function deallocate(uint256[] memory amounts) public override {
        // checks
        _onlyGuardian();

        for (uint256 i; i < amounts.length; i++) {
            uint256 amount = amounts[i];
            if (amount > 0) {
                IERC20 token = _tokens[i];
                IERC20 aToken = _aTokens[i];

                aToken.approve(address(pool), amount);
                pool.withdraw(address(token), amount, address(this));
            }
        }
    }

    function _deactivate(bool panic) internal override {
        _deallocateAll();

        if (panic) {
            for (uint256 i; i < _tokens.length; i++) {
                IERC20 token = _tokens[i];
                token.transfer(treasury, token.balanceOf(address(this)));
            }
        }
    }

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {
        return _aTokens[tokenIds[id]].balanceOf(address(this));
    }

    function rewardTokens() public pure override returns (IERC20[] memory) {
        IERC20[] memory empty = new IERC20[](0);
        return empty;
    }

    function name() external pure override returns (string memory) {
        return "AaveAllocatorV2";
    }

    function addToken(address token) external {
        _onlyGuardian();
        _tokens.push(IERC20(token));
        IERC20(token).approve(address(extender), type(uint256).max);
    }

    function addAToken(address aToken) external {
        _onlyGuardian();
        _aTokens.push(IERC20(aToken));
        IERC20(aToken).approve(address(extender), type(uint256).max);
    }

    function setReferralCode(uint16 code) external {
        _onlyGuardian();
        referralCode = code;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        return _aTokens;
    }

    function _deallocateAll() internal {
        // reads
        uint256[] memory amounts = new uint256[](_tokens.length);

        // interactions
        for (uint256 i; i < _tokens.length; i++) {
            amounts[i] = _aTokens[i].balanceOf(address(this));
        }

        deallocate(amounts);
    }
}
