// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "../interfaces/IERC20.sol";

contract MockTokemakReward {
    address public constant Tokemak = 0x2e9d63788249371f1DFC918a52f8d799F4a38C94;

    uint8 v;
    bytes32 r;
    bytes32 s;

    struct Recipient {
        uint256 chainId;
        uint256 cycle;
        address wallet;
        uint256 amount;
    }

    constructor() {}

    // only focused on transferring tokemak token here
    function claim(
        Recipient calldata _recipient,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public {
        IERC20(Tokemak).transfer(_recipient.wallet, IERC20(Tokemak).balanceOf(address(this)));
        v = _v;
        r = _r;
        s = _s;
    }
}
