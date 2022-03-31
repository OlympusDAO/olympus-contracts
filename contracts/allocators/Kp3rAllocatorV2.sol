// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";
import "hardhat/console.sol";

// interfaces
interface IKp3rVault {
    function checkpoint() external;

    function create_lock(uint256 value_, uint256 unlockTime_) external;

    function increase_amount(uint256 value_) external;

    function increase_unlock_time(uint256 unlockTime_) external;

    function locked(address addr_) external view returns (uint128, uint256);

    function locked__end(address addr_) external view returns (uint256);

    function withdraw() external;
}

interface IGauge {
    function vote(address[] calldata tokenVote_, uint256[] calldata weights_) external;
}

interface IClaim {
    function approve(address spender_, uint amount_) external returns (bool);

    function claim() external returns (uint256);

    function redeem(uint256 id_) external;

    struct option {
        uint256 amount;
        uint256 strike;
        uint256 expirty;
        bool exercised;
    }

    function options(uint256 id_) external view returns (option memory);
}

// errors
error Kp3rAllocatorV2_InvalidAddress();
error Kp3rAllocatorV2_LowUSDCLimits();

contract Kp3rAllocatorV2 is BaseAllocator {
    uint256 private constant MAX_TIME = 4 * 365 * 86400 + 1;

    ITreasury public treasury;

    IKp3rVault public kp3rVault;
    IGauge public gauge;
    IClaim public distributor;
    IClaim public rKp3r;

    uint256 lockEnd;
    uint128 usdcUsed;

    constructor(
        AllocatorInitData memory data,
        address treasury_,
        address kp3rVault_,
        address gauge_,
        address distributor_,
        address rKp3r_
    ) BaseAllocator(data) {
        if (
            treasury_ == address(0) ||
            kp3rVault_ == address(0) ||
            gauge_ == address(0) ||
            distributor_ == address(0) ||
            rKp3r_ == address(0)
        ) revert Kp3rAllocatorV2_InvalidAddress();

        treasury = ITreasury(treasury_);

        kp3rVault = IKp3rVault(kp3rVault_);
        gauge = IGauge(gauge_);
        distributor = IClaim(distributor_);
        rKp3r = IClaim(rKp3r_);

        // approve veKP3R
        _tokens[0].approve(address(kp3rVault), type(uint256).max);
        _tokens[1].approve(address(rKp3r), type(uint256).max);

        // approve extender
        _tokens[0].approve(address(treasury), type(uint256).max);
        _tokens[1].approve(address(treasury), type(uint256).max);
        rKp3r.approve(address(treasury), type(uint256).max);
    }

    function _activate() internal override {
        if (extender.getAllocatorLimits(2).loss < 50000000000) revert Kp3rAllocatorV2_LowUSDCLimits();
    }

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        if (id == 2) {
            loss = usdcUsed;
        } else {
            uint256 balance = _tokens[0].balanceOf(address(this));
            (uint256 lockedBalance, ) = kp3rVault.locked(address(this));

            if (balance > 0 && lockedBalance == 0) {
                lockEnd = block.timestamp + MAX_TIME;

                kp3rVault.create_lock(balance, lockEnd);
                kp3rVault.checkpoint();
            } else if (balance > 0 || lockedBalance > 0) {
                // claim rKP3R and exercise option
                _claimAndExercise();

                balance = _tokens[0].balanceOf(address(this));

                if (balance > 0) {
                    kp3rVault.increase_amount(balance);

                    if (_canExtendLock()) {
                        lockEnd = block.timestamp + MAX_TIME;
                        kp3rVault.increase_unlock_time(lockEnd);
                    }
                }
            }

            (lockedBalance, ) = kp3rVault.locked(address(this));
            uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

            if (lockedBalance >= last) gain = uint128(lockedBalance - last);
            else loss = uint128(last - lockedBalance);
        }
    }

    function deallocate(uint256[] memory amounts) public override {
        _onlyGuardian();

        // claim rKp3r and exercise option
        _claimAndExercise();

        // If lock is up, claim KP3R out of  veKP3R
        if (block.timestamp >= kp3rVault.locked__end(address(this))) {
            console.log("withdrawing");
            kp3rVault.withdraw();
        }
    }

    function _deactivate(bool panic) internal override {
        uint256[] memory amounts = new uint256[](1);
        deallocate(amounts);

        if (panic) {
            _tokens[0].transfer(address(treasury), _tokens[0].balanceOf(address(this)));
        }
    }

    function _prepareMigration() internal override {
        uint256[] memory amounts = new uint256[](1);
        deallocate(amounts);
    }

    /************************
     * View Functions
     ************************/

    function amountAllocated(uint256 id) public view override returns (uint256) {
        (uint256 amount, ) = kp3rVault.locked(address(this));
        uint256 kp3rBalance = _tokens[0].balanceOf(address(this));

        return amount + kp3rBalance;
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory rewards = new IERC20[](1);
        rewards[0] = IERC20(address(rKp3r));

        return rewards;
    }

    // Can't put veKP3R in here as it's not transferable and thus would break
    // BaseAllocator's migrate function
    function utilityTokens() public view override returns (IERC20[] memory) {
        // KP3R and USDC
        IERC20[] memory utility = _tokens;

        return utility;
    }

    function name() external view override returns (string memory) {
        return "Kp3rAllocatorV2";
    }

    /************************
     * Utility Functions
     ************************/

    function _claimAndExercise() internal {
        // claim rKP3R and exercise option
        distributor.claim();
        uint256 okp3rId = rKp3r.claim();

        IClaim.option memory option = rKp3r.options(okp3rId);
        uint256 amount = option.strike;

        console.log(amount);

        rKp3r.redeem(okp3rId);

        usdcUsed = uint128(amount);
    }

    function _canExtendLock() internal view returns (bool) {
        return lockEnd < block.timestamp + MAX_TIME - 7 * 86400;
    }

    // allows us to continue to vote in Fixed Forex Gauge despite allocating
    function vote(address[] calldata tokenVote_, uint256[] calldata weights_) external {
      _onlyGuardian();

      gauge.vote(tokenVote_, weights_);
    }

    /************************
     * IERC721 Receiver
     ************************/
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns(bytes4) {
        return this.onERC721Received.selector;
    }
}
