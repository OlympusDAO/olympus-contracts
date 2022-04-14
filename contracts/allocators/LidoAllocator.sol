// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

// types
import "../types/BaseAllocator.sol";

// interfaces
import "../interfaces/ITreasury.sol";

interface IstETH {
  function submit(address _referral) external payable returns (uint256);
}

error LidoAllocator_InvalidAddress();

contract LidoAllocator is BaseAllocator {
  ITreasury public treasury;
  IstETH public lido;

  constructor(AllocatorInitData memory data, address treasury_, address lido_) BaseAllocator(data) {
    if (treasury_ == address(0) || lido_ == address(0))
      revert LidoAllocator_InvalidAddress();

    treasury = ITreasury(treasury_);
    lido = IstETH(lido_);
  }

    /*************************************
     * Allocator Operational Functions
     *************************************/
    function _update(uint256 id) internal override returns (uint128 gain, uint128 loss) {
      uint256 balance = address(this).balance;

      if (balance > 0) {
        // I'm not sure if this is the right way to handle a referrer
        lido.submit(address(this)){ value: balance};
      }
    }
}