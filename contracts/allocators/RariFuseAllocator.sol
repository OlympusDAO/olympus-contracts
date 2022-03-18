// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// interfaces
import "./interfaces/RariInterfaces.sol";

// types
import {BaseAllocator, AllocatorInitData} from "../types/BaseAllocator.sol";

/// @dev function argument
struct fData {
    fToken f;
    uint96 idTroller;
    IERC20 base;
    IERC20 rT;
}

struct ProtocolSpecificData {
    address treasury;
    address rewards;
}

struct FuseAllocatorInitData {
    AllocatorInitData base;
    ProtocolSpecificData spec;
}

contract RariFuseAllocator is BaseAllocator {
    address public treasury;

    RewardsDistributorDelegate internal _rewards;

    fToken[] internal _fTokens;
    IERC20[] internal _rewardTokens;

    RariTroller[] internal _trollers;

    constructor(FuseAllocatorInitData memory fuseData) BaseAllocator(fuseData.base) {
        _rewards = RewardsDistributorDelegate(fuseData.spec.rewards);
        treasury = fuseData.spec.treasury;
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 index = tokenIds[id];
        fToken f = _fTokens[index];
        IERC20Metadata b = IERC20Metadata(address(_tokens[index]));
        RewardsDistributorDelegate rewards = _rewards;
        uint256 balance = b.balanceOf(address(this));

        // interactions
        if (rewards.compAccrued(address(this)) > 0) rewards.claimRewards(address(this));

        if (balance > 0) {
            b.approve(address(f), balance);
            f.mint(balance);
        }

        // effects
        uint256 former = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;
        uint256 current = _worth(f, b);

        if (current >= former) gain = uint128(current - former);
        else loss = uint128(former - current);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        uint256 length = amounts.length;

        for (uint256 i; i < length; i++) {
            fToken f = _fTokens[i];

            uint256 balance = f.balanceOf(address(this));

            if (balance > 0) {
                if (amounts[i] == type(uint256).max) f.redeem(f.balanceOf(address(this)));
                else f.redeemUnderlying(amounts[i]);
            }
        }
    }

    function _deactivate(bool panic) internal override {
        _deallocateAll();

        if (panic) {
            uint256 length = _fTokens.length;

            for (uint256 i; i < length; i++) {
                fToken f = _fTokens[i];
                IERC20 u = _tokens[i];
                uint256 balance = f.balanceOf(address(this));

                if (balance > 0) {
                    f.redeem(balance);
                    u.transfer(treasury, u.balanceOf(address(this)));
                }
            }

            length = _rewardTokens.length;

            for (uint256 i; i < length; i++) {
                IERC20 rT = _rewardTokens[i];
                uint256 balance = rT.balanceOf(address(this));
                if (balance > 0) {
                    rT.transfer(treasury, balance);
                }
            }
        }
    }

    function _prepareMigration() internal override {
        RewardsDistributorDelegate rewards = _rewards;
        if (rewards.compAccrued(address(this)) > 0) rewards.claimRewards(address(this));
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 index = tokenIds[id];
        IERC20Metadata b = IERC20Metadata(address(_tokens[index]));
        fToken f = _fTokens[index];
        return _worth(f.exchangeRateStored(), f.balanceOf(address(this)), b) + b.balanceOf(address(this));
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        return _rewardTokens;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        uint256 length = _fTokens.length;
        IERC20[] memory uTokens = new IERC20[](length);
        for (uint256 i; i < length; i++) uTokens[i] = _fTokens[i];
        return uTokens;
    }

    function name() external pure override returns (string memory) {
        return "RariFuseAllocator";
    }

    //// start of functions specific for allocator

    function setTreasury(address newTreasury) external onlyGuardian {
        treasury = newTreasury;
    }

    function setRewards(address newRewards) external onlyGuardian {
        _rewards = RewardsDistributorDelegate(newRewards);
    }

    /// @notice Add a fuse pool by adding the troller.
    /// @dev The troller is a comptroller, which is a contract that has all the data and allows entering markets in regards to a fuse pool.
    /// @param troller the trollers' address
    function fusePoolAdd(address troller) external onlyGuardian {
        _trollers.push(RariTroller(troller));
    }

    /// @notice Add data for depositing an underlying token in a fuse pool.
    /// @dev The data fields are described above in the struct `fData` specific for this contract.
    /// @param data the data necessary for another token to be allocated, check the struct in code
    function fDataAdd(fData calldata data) external onlyGuardian {
        // reads
        address[] memory fInput = new address[](1);
        fInput[0] = address(data.f);

        // interaction
        _trollers[data.idTroller].enterMarkets(fInput);

        data.base.approve(address(extender), type(uint256).max);
        data.f.approve(address(extender), type(uint256).max);

        // effect
        _fTokens.push(data.f);
        _tokens.push(data.base);

        if (data.rT != IERC20(address(0))) {
            _rewardTokens.push(data.rT);
            data.rT.approve(address(extender), type(uint256).max);
        }
    }

    /// @dev logic is directly from fuse docs
    function _worth(fToken f, IERC20Metadata b) internal returns (uint256) {
        return (f.exchangeRateCurrent() * f.balanceOf(address(this))) / (10**uint256(b.decimals()));
    }

    function _worth(
        uint256 exchangeRate,
        uint256 fBalance,
        IERC20Metadata b
    ) internal view returns (uint256) {
        return (exchangeRate * fBalance) / (10**uint256(b.decimals()));
    }

    function _deallocateAll() internal {
        uint256[] memory input = new uint256[](_fTokens.length);
        for (uint256 i; i < input.length; i++) input[i] = type(uint256).max;
        deallocate(input);
    }
}
