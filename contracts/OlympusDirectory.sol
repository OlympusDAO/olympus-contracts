// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/IDirectory.sol";

contract OlympusDirectory is IOlympusDirectory {
    // TESTNET ADDRESSES

    IOHM public override ohm = IOHM(0x1e630a578967968eb02EF182a50931307efDa7CF); // Liquidity token
    IsOHM public override sOHM = IsOHM(0x5EcEb3Af0DDB7892917CaFb2ec83b64521c6B035); // Staked rebasing token
    IgOHM public override gOHM = IgOHM(0x93Cf43A7013DE26a558f1fEDb667d2b934Bb3f68); // Staked static balance token
    ITreasury public override treasury = ITreasury(0xe2AACD013bac3AD4bdf92E1D826AE855b04DB07f); // Funds owner and OHM minter
    IStaking public override staking = IStaking(0x28FB3b5Bd5fdf8d2656496280F93F1516Bb015Ae); // OHM <> sOHM <> gOHM router
    IOlympusAuthority public override auth = IOlympusAuthority(0x8C487a6531D555602b72c0D4E3d7aBdf9AEaAc3a); // Modifiers
    address public override dao = 0x1E09E2001220701dEFC69005ff243A9bb23FA759; // DAO multisig
    constructor() {}
}