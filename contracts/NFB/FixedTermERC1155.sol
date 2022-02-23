pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../interfaces/IBondDepository.sol";
import "../interfaces/INoteKeeper.sol";
import "../interfaces/IgOHM.sol";
import "../libraries/SafeERC20.sol";

/// @title   ERC1155 Bond Wrapper
/// @notice  Mints an ERC1155 to reprsent a bond in the Olympus bond depository
/// @author  JeffX
contract OlympusERC1155BondWrapper is ERC1155 {
    using SafeERC20 for IERC20;

    /// ERRORS ///

    /// @notice Error for if bond has not yet matured
    error NotMatured();
    /// @notice Error for if when redeeming user does not have enough parts to redeem
    error NotEnoughParts();
    /// @notice Error for if trying to bond or redeem with no parts
    error NoParts();
    /// @notice Error if when trying to redeem id and parts are different lengths
    error DifferentLength();

    error NotFixedExpiration();


    /// STRUCTS ///

    /// @notice            Details of bond an ID represents
    /// @param payout      Payout in gOHM for bond
    /// @param expiry      Timestamp at which bond matures
    /// @param note        Index in bond contract that represents bond's payout
    /// @param totalParts  Amount of pieces bond was broken into
    struct IDDetails {
        uint256 payout;
        uint256 expiry;
        uint256 note;
        uint256 totalParts;
    }

    struct FixedExpirationIDs {
        uint256 bid;
        uint256 total;
        uint256 expiry;
    }


    /// STATE VARIABLES ///

    /// @notice Olympus Bond Depository
    address internal immutable bondDepository = 0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6;
    /// @notice Governance OHM
    address internal immutable gOHM = 0x0ab87046fBb341D058F17CBC4c1133F25a20a52f;
    /// @notice Staked OHM
    IERC20 internal immutable sOHM = IERC20(0x04906695D6D12CF5459975d7C3C03356E4Ccd460);

    /// @notice NFT ID to its bond details
    mapping(uint256 => IDDetails) public idDetails;

    /// @notice Fixed Expiration ID to its details
    mapping(uint256 => FixedExpirationIDs) public fixedExpirationDetails;

    mapping(uint256 => uint256) public fixedExpirationToID;

    /// @notice Next ID of NFT that will be minted
    uint public nextID;


    /// CONSTRUCTOR ///

    constructor() ERC1155(""){}


    /// USER FUNCTIONS ///

    function depositFixedExpiration(
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
        IBondDepository.Terms memory term = IBondDepository(bondDepository).terms(_bid);
        if(term.fixedTerm) revert NotFixedExpiration();

        FixedExpirationIDs memory fixedExpiration;
        id_ = fixedExpirationToID[_bid];

        _token.approve(bondDepository, _amount);
        (uint256 payout_, uint256 expiry_,) = IBondDepository(bondDepository).deposit(_bid, _amount, _maxPrice, address(this), _referral);

        if(id_ == 0) {
            id_ = nextID;
            fixedExpiration = fixedExpirationDetails[id_];
            fixedExpiration.bid = _bid;
            fixedExpiration.expiry = expiry_;
            fixedExpirationToID[_bid] = id_;
            nextID++;
        } else {
            fixedExpiration = fixedExpirationDetails[id_];
        }

        fixedExpiration.total += payout_;
        fixedExpirationDetails[id_] = fixedExpiration;

        _mint(_user, id_, payout_, "");
    }

    /// @notice           Deposits into Olympus Bond Depo and mints token that represents the bond
    /// @param _bid       Bond ID that will be deposited
    /// @param _amount    Amount of `_token` that are being bonded
    /// @param _parts     Amount of pieces bond will be broken into to
    /// @param _maxPrice  Max price willing to purhcase bond
    /// @param _user      Address ERC1155 is sent to
    /// @param _referral  Address for front end referral
    /// @param _token     Address of token being bonded
    /// @return id_       ID of NFT that has been minted for bond
    function deposit(
        uint256 _bid,
        uint256 _amount,
        uint256 _parts,
        uint256 _maxPrice,
        address _user,
        address _referral,
        IERC20 _token
    ) 
        external
        returns(uint256 id_)
    {
        if(_parts < 0) revert NoParts();

        _token.approve(bondDepository, _amount);
        (uint256 payout_, uint256 expiry_, uint256 note_) = IBondDepository(bondDepository).deposit(_bid, _amount, _maxPrice, address(this), _referral);

        id_ = nextID;
        IDDetails memory idDetail;
        idDetail.payout = payout_;
        idDetail.expiry = expiry_;
        idDetail.note = note_;
        idDetail.totalParts = _parts;

        idDetails[id_] = idDetail;

        _mint(_user, id_, _parts, "");

        nextID++;
    }

    /// @notice           Burns NFT and sends payout for bond to `_to`
    /// @param _id[]      Array of IDs to burn and redeem for
    /// @param _parts[]   Array of amounts of pieces to redeem
    /// @param _to        Address to send payout to
    /// @param _sendgOHM  Bool if to send payout in gOHM in sOHM
    /// @return payout_   Payout that was sent
    function redeem(
        uint256[] calldata _id,
        uint256[] calldata _parts,
        address _to,
        bool _sendgOHM
    ) 
        external
        returns(uint256 payout_)
    {
        if(_id.length != _parts.length) revert DifferentLength();

        for(uint i = 0; _id.length > i; i++) {
            IDDetails memory idDetail = idDetails[_id[i]];

            (uint256 pendingPayout_, bool matured_) = INoteKeeper(bondDepository).pendingFor(address(this), idDetail.note); 

            // Check if bond has either not been matured or has already been redeemed through bond contract itself
            if(pendingPayout_ > 0 && !matured_) {
                revert NotMatured(); 
            }
        }

        INoteKeeper(bondDepository).redeem(address(this), _id, _sendgOHM);

        for(uint i = 0; _id.length > i; i++) {
            if(balanceOf(msg.sender, _id[i]) < _parts[i]) revert NotEnoughParts();
            if(_parts[i] < 0) revert NoParts();

            _burn(msg.sender, _id[i], _parts[i]);

            IDDetails memory idDetail = idDetails[_id[i]];

            payout_ += idDetail.payout * _parts[i] / idDetail.totalParts;
        }

        // Check if user wants to be sent gOHM and if there is enough to send
        if(_sendgOHM && IERC20(gOHM).balanceOf(address(this)) >= payout_ || !_sendgOHM && sOHM.balanceOf(address(this)) < IgOHM(gOHM).balanceFrom(payout_)) {
            IERC20(gOHM).safeTransfer(_to, payout_);
        // Send sOHM
        } else {
            payout_ = IgOHM(gOHM).balanceFrom(payout_);
            sOHM.safeTransfer(_to, payout_);
        }
    }
}