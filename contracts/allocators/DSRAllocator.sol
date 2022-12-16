// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.15;

// Import base contract
import "../types/BaseAllocator.sol";

// Import interfaces
import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";

import "hardhat/console.sol";

// Define DS Proxy Factory Interface
interface IDSProxyFactory {
    function build(address owner) external returns (address);
}

// Define DS Proxy Interface
interface IDSProxy {
    function execute(
        address _target,
        bytes calldata _data
    ) external payable returns (bytes32 response);

}

// Define DSR Interface
interface IDSR {
    function pie(address user) external view returns (uint256);

    function chi() external view returns (uint256);
}

contract DSRAllocator is BaseAllocator {
    // ========= STATE ========= //

    ITreasury public immutable treasury;

    // Maker Proxy System

    IDSProxy public proxy;

    IDSProxyFactory internal _proxyFactory = IDSProxyFactory(0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4);

    // Maker Interaction Contracts

    IDSR internal _dsr = IDSR(0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7);

    address internal _dsrProxyActions = 0x07ee93aEEa0a36FfF2A9B95dd22Bd6049EE54f26;

    address internal _mcdJoinDai = 0x9759A6Ac90977b93B58547b4A71c78317f391A28;

    // Tokens

    IERC20 internal _dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    IERC20[] internal _rewardTokens;

    constructor(AllocatorInitData memory data, address treasury_) BaseAllocator(data) {
        treasury = ITreasury(treasury_);

        // Create DS Proxy
        proxy = IDSProxy(_proxyFactory.build(address(this)));
        _dai.approve(address(proxy), type(uint256).max);
    }

    // ========= BASE OVERRIDES ========= //

    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
        // Deposit excess DAI into DSR
        uint256 daiBalance = _dai.balanceOf(address(this));
        if (daiBalance > 0) _join(daiBalance);

        uint256 balanceNow = amountAllocated(id);
        uint256 last = extender.getAllocatorAllocated(id) + extender.getAllocatorPerformance(id).gain;

        if (balanceNow >= last) gain = uint128(balanceNow - last);
        else loss = uint128(last - balanceNow);
    }

    function deallocate(uint256[] memory amounts) public override onlyGuardian {
        _exit(amounts[0]);
    }

    function _deactivate(bool panic) internal override {
        _exitAll();

        if (panic) {
            // We will need to manually reset reserves after this. treasury.deposit cannot
            // be called without changing the vault on the authority contract so it must be
            // done by a batch. Instead we just transfer the DAI to the treasury.
            uint256 daiBalance = _dai.balanceOf(address(this));
            _dai.transfer(address(treasury), daiBalance);
        }
    }

    function _prepareMigration() internal override {
        _exitAll();
    }

    function amountAllocated(uint256 id) public view override returns (uint256) {
        uint256 amount = _dsr.pie(address(proxy)) * _dsr.chi() / 1e27;
        return amount;
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

    // ========= INTERNAL FUNCTIONS ========= //

    function _join(uint256 amount_) internal {
        proxy.execute(
            _dsrProxyActions,
            abi.encodeWithSignature(
                "join(address,address,uint256)",
                _mcdJoinDai,
                address(_dsr),
                amount_
            )
        );
    }

    function _exit(uint256 amount_) internal {
        proxy.execute(
            _dsrProxyActions,
            abi.encodeWithSignature(
               "exit(address,address,uint256)",
                _mcdJoinDai,
                address(_dsr),
                amount_
            )
        );
    }

    function _exitAll() internal {
        proxy.execute(
            _dsrProxyActions,
            abi.encodeWithSignature(
                "exitAll(address,address)",
                _mcdJoinDai,
                address(_dsr)
            )
        );
    }
}
