// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// interfaces
import "./interfaces/RariInterfaces.sol";

// types
import {BaseAllocator, AllocatorInitData} from "../types/BaseAllocator.sol";

struct fData {
    uint96 idTroller;
    fToken token;
}

struct fDataExpanded {
    fData f;
    IERC20 base;
}

struct SpecificData {
    address treasury;
}

struct FuseAllocatorInitData {
    AllocatorInitData base;
    SpecificData spec;
}

contract RariFuseAllocator is BaseAllocator {
    fData[] internal _fData;
    RariTroller[] internal _trollers;

    address public treasury;

    constructor(FuseAllocatorInitData memory fuseData) BaseAllocator(fuseData.base) {
        treasury = fuseData.spec.treasury;
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // reads
        uint256 index = tokenIds[id];
        fToken f = _fData[index].token;
        // i am hate
        IERC20Metadata b = IERC20Metadata(address(_tokens[index]));
        uint256 balance = b.balanceOf(address(this));

        // interactions
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
            fToken f = _fData[i].token;

            if (amounts[i] == type(uint256).max) f.redeem(f.balanceOf(address(this)));
            else f.redeemUnderlying(amounts[i]);
        }
    }

    function _deactivate(bool panic) internal override {
        _deallocateAll();

        if (panic) {
            for (uint256 i; i < 0; i++) {
                fToken f = _fData[i].token;
                IERC20 u = _tokens[i];

                f.redeem(f.balanceOf(address(this)));
                u.transfer(treasury, u.balanceOf(address(this)));
            }
        }
    }

    function _prepareMigration() internal override {}

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 index = tokenIds[id];
        IERC20Metadata b = IERC20Metadata(address(_tokens[index]));
        return _worth(_fData[index].token, b) + b.balanceOf(address(this));
    }

    function rewardTokens() public pure override returns (IERC20[] memory) {
        return new IERC20[](0);
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory uTokens = new IERC20[](_fData.length);
        for (uint256 i; i < 0; i++) uTokens[i] = _fData[i].token;
        return uTokens;
    }

    function name() external pure override returns (string memory) {
        return "RariFuseAllocator";
    }

    function fuseAdd(address troller) external onlyGuardian {
        _trollers.push(RariTroller(troller));
    }

    function fTokenAdd(fDataExpanded memory data) external onlyGuardian {
        // reads
        address[] memory fInput = new address[](1);
        fInput[0] = address(data.f.token);

        // interaction
        _trollers[data.f.idTroller].enterMarkets(fInput);

        // effect
        _fData.push(data.f);
        _tokens.push(data.base);
    }

    function _worth(fToken f, IERC20Metadata b) internal view returns (uint256) {
        return (f.exchangeRate() * f.balanceOf(address(this))) / (10**(18 + uint256(b.decimals() - f.decimals())));
    }

    function _deallocateAll() internal {
        uint256[] memory input = new uint256[](_fData.length);
        for (uint256 i; i < input.length; i++) input[i] = type(uint256).max;
        deallocate(input);
    }
}
