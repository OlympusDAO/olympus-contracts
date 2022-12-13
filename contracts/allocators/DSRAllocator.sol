// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

// Import base contract
import "../types/BaseAllocator.sol";

// Import interfaces
import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

// Define DSR Interface
interface IDSR {
    // Returns user's DSR balance
    function pie(address user) external view returns (uint256);

    function chi() external view returns (uint256);

    function drip() external;

    function join(uint256 wad) external;

    function exit(uint256 wad) external;
}

contract DSRAllocator is BaseAllocator {
    // ========= STATE ========= //

    ITreasury public immutable treasury;

    IERC20 internal _dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    IDSR internal _dsr = IDSR(0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7);

    IERC20[] internal _rewardTokens;

    constructor(AllocatorInitData memory data, address treasury_) BaseAllocator(data) {
        treasury = ITreasury(treasury_);
        _dai.approve(address(_dsr), type(uint256).max);
    }

    // ========= BASE OVERRIDES ========= //

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        uint256 tokenIndex = tokenIds[id];

        // Deposit excess DAI into DSR
        uint256 daiBalance = _dai.balanceOf(address(this));
        if (daiBalance > 0) {
            uint256 wad = daiBalance / _dsr.chi();
            _dsr.drip();
            _dsr.join(wad);
        }

        uint256 balanceNow = _dsr.pie(address(this)) * _dsr.chi();
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (balanceNow >= last) gain = uint128(balanceNow - last);
        else loss = uint128(last - balanceNow);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        uint256 wad = amounts[0] / _dsr.chi();
        _dsr.drip();
        _dsr.exit(wad);
    }

    function _deactivate(bool panic) internal override {
        uint256 wad = _dsr.pie(address(this));
        _dsr.drip();
        _dsr.exit(wad);
        if (panic) {
            uint256 daiBalance = _dai.balanceOf(address(this));
            uint256 tokenValue = treasury.tokenValue(address(_dai), daiBalance);
            _dai.approve(address(treasury), daiBalance);
            treasury.deposit(daiBalance, address(_dai), tokenValue);
        }
    }

    function _prepareMigration() internal override {
        uint256 wad = _dsr.pie(address(this));
        _dsr.exit(wad);
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 wad = _dsr.pie(address(this));
        return wad * _dsr.chi();
    }

    function rewardTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory empty = new IERC20[](0);
        return empty;
    }

    function utilityTokens() public view override returns (IERC20[] memory) {
        IERC20[] memory utilTokens = new IERC20[](1);
        utilTokens[0] = _dai;
        return utilTokens;
    }

    function name() external pure override returns (string memory) {
        return "DSRAllocator";
    }
}
