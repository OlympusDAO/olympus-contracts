pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../interfaces/IBondDepository.sol";
import "../interfaces/INoteKeeper.sol";
import "../interfaces/IgOHM.sol";
import "../libraries/SafeERC20.sol";

/// @title   ERC20 Clone Bond Wrapper
/// @notice  Clones a new ERC20 to reprsent a bond in the Olympus bond depository
/// @author  JeffX
contract FixedExperationERC20 {
    using SafeERC20 for IERC20;

}