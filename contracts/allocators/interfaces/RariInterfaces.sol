// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../../interfaces/IERC20Metadata.sol";

// if you don't call the function the compiler won't bloat code
// so just take the entire interface so people don't have to add later
interface fToken is IERC20Metadata {
    function mint(uint256 mintAmount) external;

    function mint() external payable; // ether

    function redeem(uint256 redeemTokens) external returns (uint256);

    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);

    function borrow(uint256 borrowAmount) external returns (uint256);

    function repayBorrow(uint256 repayAmount) external returns (uint256);

    function repayBorrow() external payable; // ether

    function repayBorrowBehalf(address borrower, uint256 repayAmount) external returns (uint256);

    function repayBorrowBehalf(address borrower) external payable; // ether

    function liquidateBorrow(
        address borrower,
        uint256 amount,
        address collateral
    ) external returns (uint256);

    function exchangeRateCurrent() external returns (uint256);

    function exchangeRateStored() external view returns (uint256);

    function getCash() external view returns (uint256);

    function totalBorrowsCurrent() external view returns (uint256);

    function borrowBalanceCurrent(address account) external view returns (uint256);

    function borrowRatePerBlock() external view returns (uint256);

    function balanceOfUnderlying(address account) external view returns (uint256);

    function supplyRatePerBlock() external view returns (uint256);

    function totalReserves() external view returns (uint256);

    function reserveFactorMantissa() external view returns (uint256);
}

interface RariTroller {
    function enterMarkets(address[] calldata fTokens) external returns (uint256[] memory);

    function allMarkets(uint256) external view returns (address);

    function getAllMarkets() external view returns (address[] memory);

    function exitMarket(address fToken) external returns (uint256);

    function getAssetsIn(address account) external view returns (address[] memory);

    function markets(address fTokenAddress)
        external
        view
        returns (
            bool,
            uint256,
            bool
        );

    function getAccountLiquidity(address account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function closeFactorMantissa() external view returns (uint256);

    function liquidationIncentiveMantissa() external view returns (uint256);
}

struct FusePool {
    string name;
    address creator;
    address comptroller;
    uint256 blockPosted;
    uint256 timestampPosted;
}

interface FusePoolDirectory {
    function pools(uint256)
        external
        view
        returns (
            string memory name,
            address creator,
            address comptroller,
            uint256 blockPosted,
            uint256 timestampPosted
        );

    function getPoolsByAccount(address account) external returns (uint256[] memory, FusePool[] memory);
}

struct FusePoolAsset {
    address fToken;
    address underlyingToken;
    string underlyingName;
    string underlyingSymbol;
    uint256 underlyingDecimals;
    uint256 underlyingBalance;
    uint256 supplyRatePerBlock;
    uint256 borrowRatePerBlock;
    uint256 totalSupply;
    uint256 totalBorrow;
    uint256 supplyBalance;
    uint256 borrowBalance;
    uint256 liquidity;
    bool membership;
    uint256 exchangeRate;
    uint256 underlyingPrice;
    address oracle;
    uint256 collateralFactor;
    uint256 reserveFactor;
    uint256 adminFee;
    uint256 fuseFee;
}

struct FusePoolUser {
    address account;
    uint256 totalBorrow;
    uint256 totalCollateral;
    uint256 health;
    FusePoolAsset[] assets;
}

struct CTokenOwnership {
    address cToken;
    address admin;
    bool adminHasRights;
    bool fuseAdminHasRight;
}

// frankly useless for us I don't understand why former wasn't documented
interface FusePoolLens {
    function getPublicPoolsWithData()
        external
        view
        returns (
            uint256[] memory,
            FusePool[] memory,
            uint256[] memory,
            uint256[] memory,
            address[][] memory,
            string[][] memory,
            bool[] memory
        );

    function getPoolsByAccountWithData(address account)
        external
        view
        returns (
            uint256[] memory,
            FusePool[] memory,
            uint256[] memory,
            uint256[] memory,
            address[][] memory,
            string[][] memory,
            bool[] memory
        );

    function getPoolSummary(address comptroller)
        external
        view
        returns (
            uint256,
            uint256,
            address[] memory,
            string[] memory
        );

    function getPoolAssetsWithData(address comptroller) external view returns (FusePoolAsset[] memory);

    function getPublicPoolUsersWithData(uint256 maxHealth)
        external
        view
        returns (
            address[] memory,
            FusePoolUser[][] memory,
            uint256[] memory,
            uint256[] memory,
            bool
        );

    function getPoolUsersWithData(address comptroller, uint256 maxHealth)
        external
        view
        returns (
            FusePoolUser[] memory,
            uint256,
            uint256
        );

    function getPoolsBySupplier(address account) external view returns (uint256[] memory, FusePool[] memory);

    function getPoolsBySupplierWithData(address account)
        external
        view
        returns (
            uint256[] memory,
            FusePool[] memory,
            uint256[] memory,
            uint256[] memory,
            address[][] memory,
            string[][] memory,
            bool[] memory
        );

    function getUserSummary(address account)
        external
        view
        returns (
            uint256,
            uint256,
            bool
        );

    function getPoolUserSummary(address comptroller, address account) external view returns (uint256, uint256);

    function getWhitelistedPoolsByAccount(address account) external view returns (uint256[] memory, FusePool[] memory);

    function getWhitelistedPoolsByAccountWithData(address account)
        external
        returns (
            uint256[] memory,
            FusePool[] memory,
            uint256[] memory,
            uint256[] memory,
            address[][] memory,
            string[][] memory,
            bool[] memory
        );

    function getPoolOwnership(address comptroller)
        external
        returns (
            address,
            bool,
            bool,
            CTokenOwnership[] memory
        );
}

// TRIBE rewards
interface RewardsDistributorDelegate {
    function claimRewards(address holder) external;

    function compAccrued(address) external returns (uint256);
}
