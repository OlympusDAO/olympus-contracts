pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../interfaces/IBondDepository.sol";
import "../libraries/SafeERC20.sol";

contract FixedTermERC1155 is ERC1155 {
    using SafeERC20 for IERC20;

    /// @notice Olympus Bond Depository
    IBondDepository internal immutable bondDepository = IBondDepository(0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6);


    /// CONSTRUCTOR ///

    /// @param _name  Name of ERC1155 token
    constructor(string memory _name) ERC1155(_name){}


    /// USER FUNCTIONS ///

    /// @notice           Deposits into Olympus Bond Depo and mints token that represents the bond
    /// @param _bid       Bond ID that will be deposited
    /// @param _amount    Amount of tokens that are being bonded
    /// @param _maxPrice  Max price willing to purhcase bond
    /// @param _user      Address bond is redeemable for
    /// @param _referral  Address front end referral
    /// @param _token     Address of token being bonded
    function deposit(
        uint256 _bid,
        uint256 _amount,
        uint256 _maxPrice,
        address _user,
        address _referral,
        IERC20 _token
    ) 
        external 
    {

        _token.approve(address(bondDepository), _amount);
        bondDepository.deposit(_bid, _amount, _maxPrice, _user, _referral);


    }
}