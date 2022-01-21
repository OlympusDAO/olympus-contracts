pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../interfaces/IBondDepository.sol";
import "../libraries/SafeERC20.sol";

contract FixedTermERC1155 is ERC1155 {
    using SafeERC20 for IERC20;

    /// @notice Olympus Bond Depository
    IBondDepository internal immutable bondDepository = IBondDepository(0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6);

    struct IDDetails {
        uint256 payout;
        uint256 expiry;
        uint256 note;
    }
    mapping(uint256 => IDDetails) public idDetails;

    uint public nextID;


    /// CONSTRUCTOR ///

    constructor() ERC1155(""){}


    /// USER FUNCTIONS ///

    /// @notice           Deposits into Olympus Bond Depo and mints token that represents the bond
    /// @param _bid       Bond ID that will be deposited
    /// @param _amount    Amount of tokens that are being bonded
    /// @param _maxPrice  Max price willing to purhcase bond
    /// @param _user      Address NFT is sent to
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
        returns(uint256 id_)
    {
        _token.approve(address(bondDepository), _amount);
        (uint256 payout_, uint256 expiry_, uint256 note_) = bondDepository.deposit(_bid, _amount, _maxPrice, address(this), _referral);

        id_ = nextID;
        IDDetails memory idDetail;
        idDetail.payout = payout_;
        idDetail.expiry = expiry_;
        idDetail.note = note_;

        idDetails[id_] = idDetail;

        _mint(_user, id_, 1, "");

        nextID++;
    }
}