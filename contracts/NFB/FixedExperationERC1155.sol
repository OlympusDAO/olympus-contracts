pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../interfaces/IBondDepository.sol";
import "../interfaces/INoteKeeper.sol";
import "../interfaces/IgOHM.sol";
import "../libraries/SafeERC20.sol";

contract FixedTermERC1155 is ERC1155 {
    using SafeERC20 for IERC20;

    error NotMatured();
    error NotOwner();

    /// @notice Olympus Bond Depository
    address internal immutable bondDepository = 0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6;
    /// @notice Staked OHM
    IERC20 internal immutable sOHM = IERC20(0x04906695D6D12CF5459975d7C3C03356E4Ccd460);
    /// @notice Governance OHM
    address internal immutable gOHM = 0x0ab87046fBb341D058F17CBC4c1133F25a20a52f;

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
        _token.approve(bondDepository, _amount);
        (uint256 payout_, uint256 expiry_, uint256 note_) = IBondDepository(bondDepository).deposit(_bid, _amount, _maxPrice, address(this), _referral);

        id_ = nextID;
        IDDetails memory idDetail;
        idDetail.payout = payout_;
        idDetail.expiry = expiry_;
        idDetail.note = note_;

        idDetails[id_] = idDetail;

        _mint(_user, id_, 1, "");

        nextID++;
    }

    function redeem(
        uint256 _id,
        address _to,
        bool _sendgOHM
    ) 
        external
        returns(uint256 payout_)
    {
        if(balanceOf(msg.sender, _id) != 1) revert NotOwner();

        IDDetails memory idDetail = idDetails[_id];

        payout_ = idDetail.payout;

        (uint256 pendingPayout_, bool matured_) = INoteKeeper(bondDepository).pendingFor(address(this), idDetail.note);

        uint[] memory ids = new uint[](1);
        ids[1] = _id;

        if(pendingPayout_ > 0 && !matured_) {
            revert NotMatured();
        } else if(matured_) {
            INoteKeeper(bondDepository).redeem(address(this), ids, _sendgOHM);
            if(_sendgOHM) {
                IERC20(gOHM).safeTransfer(_to, payout_);
            } else {
                payout_ = IgOHM(gOHM).balanceFrom(payout_);
                sOHM.safeTransfer(_to, payout_);
            }
        } else {
            if(_sendgOHM && IERC20(gOHM).balanceOf(address(this)) >= payout_) {
                IERC20(gOHM).safeTransfer(_to, payout_);
            } else {
                payout_ = IgOHM(gOHM).balanceFrom(payout_);
                sOHM.safeTransfer(_to, payout_);
            }
        }
    }
}