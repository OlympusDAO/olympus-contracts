// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "../libraries/SafeMath.sol";
import "../libraries/FixedPoint.sol";
import "../libraries/Address.sol";

import "../interfaces/IBondingCalculator.sol";
import "../interfaces/IXTokenWeth.sol";
import "../interfaces/INFTXLPStaking.sol";
import "../interfaces/INFTXVault.sol";
import "../interfaces/ITreasury.sol";

contract NFTXXTokenWethCalculator is IBondingCalculator {

    using FixedPoint for *;
    using SafeMath for uint256;

    INFTXLPStaking public nftxLpStaking;
    ITreasury public treasury;

    constructor(address _nftxLpStaking, address _treasury) {
        require(_nftxLpStaking != address(0), "Zero address: _nftxLpStaking");
        require(_treasury!= address(0), "Zero address: _treasury");
        nftxLpStaking = INFTXLPStaking(_nftxLpStaking);
        treasury = ITreasury(_treasury);
    }

    function valuation(address xTokenWeth_, uint256 amount_) external view override returns (uint256 _value) {
        IXTokenWeth _xTokenWeth = IXTokenWeth(xTokenWeth_);

        // Get the vault ID from the xToken address
        INFTXVault _nftxVault = INFTXVault(_xTokenWeth.target());
        uint256 _vaultId = _nftxVault.vaultId();

        // Return the Treasury value of the underlying SLP amount
        _value = treasury.tokenValue(_getStakingPool(_vaultId).stakingToken, amount_);
    }

    function _getStakingPool(uint256 _vaultId) internal view returns (INFTXLPStaking.StakingPool memory stakingPool) {
      stakingPool = nftxLpStaking.vaultStakingInfo(_vaultId);
    }
}
