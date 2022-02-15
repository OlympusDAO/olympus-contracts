// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "../types/FrontEndRewarder.sol";

import "../interfaces/IgFLOOR.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/INoteKeeper.sol";

abstract contract NoteKeeper is INoteKeeper, FrontEndRewarder {

  event CreateNote(address user, uint48 bondId, uint256 index, uint256 payout, uint48 expiry);
  event PushNote(address oldUser, address newUser, uint256 oldIndex, uint256 newIndex);
  event RedeemNote(address user, uint256[] indexes);

  mapping(address => Note[]) public notes; // user deposit data
  mapping(address => mapping(uint256 => address)) private noteTransfers; // change note ownership

  IgFLOOR internal immutable gFLOOR;
  IStaking internal immutable staking;
  ITreasury internal treasury;

  constructor (
    IFloorAuthority _authority,
    IERC20 _floor,
    IgFLOOR _gfloor, 
    IStaking _staking,
    ITreasury _treasury
  ) FrontEndRewarder(_authority, _floor) {
    gFLOOR = _gfloor;
    staking = _staking;
    treasury = _treasury;
  }

  // if treasury address changes on authority, update it
  function updateTreasury() external {
    require(
      msg.sender == authority.governor() ||
      msg.sender == authority.guardian() ||
      msg.sender == authority.policy(),
      "Only authorized"
    );
    treasury = ITreasury(authority.vault());
  }

/* ========== ADD ========== */

  /**
   * @notice             adds a new Note for a user, stores the front end & DAO rewards, and mints & stakes payout & rewards
   * @param _user        the user that owns the Note
   * @param _payout      the amount of FLOOR due to the user
   * @param _expiry      the timestamp when the Note is redeemable
   * @param _marketID    the ID of the market deposited into
   * @return index_      the index of the Note in the user's array
   */
  function addNote(
    address _user, 
    uint256 _payout, 
    uint48 _expiry, 
    uint48 _marketID,
    address _referral
  ) internal returns (uint256 index_) {
    // the index of the note is the next in the user's array
    index_ = notes[_user].length;

    // the new note is pushed to the user's array
    notes[_user].push(
      Note({
        payout: gFLOOR.balanceTo(_payout),
        created: uint48(block.timestamp),
        matured: _expiry,
        redeemed: 0,
        marketID: _marketID
      })
    );

    // front end operators can earn rewards by referring users
    uint256 rewards = _giveRewards(_payout, _referral);

    // mint and stake payout
    treasury.mint(address(this), _payout + rewards);

    // note that only the payout gets staked (front end rewards are in FLOOR)
    staking.stake(address(this), _payout, false, true);

    emit CreateNote(_user, _marketID, index_, gFLOOR.balanceTo(_payout), _expiry);
  }

/* ========== REDEEM ========== */

  /**
   * @notice             redeem notes for user
   * @param _user        the user to redeem for
   * @param _indexes     the note indexes to redeem
   * @param _sendgFLOOR  send payout as gFLOOR or sFLOOR
   * @return payout_     sum of payout sent, in gFLOOR
   */
  function redeem(address _user, uint256[] memory _indexes, bool _sendgFLOOR) public override returns (uint256 payout_) {
    uint48 time = uint48(block.timestamp);

    for (uint256 i = 0; i < _indexes.length; i++) {
      (uint256 pay, bool matured) = pendingFor(_user, _indexes[i]);
      require(matured, "Depository: note not matured");
      if (matured) {
        notes[_user][_indexes[i]].redeemed = time; // mark as redeemed
        payout_ += pay;
      }
    }

    if (_sendgFLOOR) {
      gFLOOR.transfer(_user, payout_); // send payout as gFLOOR
    } else {
      staking.unwrap(_user, payout_); // unwrap and send payout as sFLOOR
    }

    emit RedeemNote(_user, _indexes);
  }

/* ========== TRANSFER ========== */

  /**
   * @notice             approve an address to transfer a note
   * @param _to          address to approve note transfer for
   * @param _index       index of note to approve transfer for
   */ 
  function pushNote(address _to, uint256 _index) external override {
    require(notes[msg.sender][_index].created != 0, "Depository: note not found");
    noteTransfers[msg.sender][_index] = _to;
  }

  /**
   * @notice             transfer a note that has been approved by an address
   * @param _from        the address that approved the note transfer
   * @param _index       the index of the note to transfer (in the sender's array)
   */ 
  function pullNote(address _from, uint256 _index) external override returns (uint256 newIndex_) {
    require(noteTransfers[_from][_index] == msg.sender, "Depository: transfer not found");
    require(notes[_from][_index].redeemed == 0, "Depository: note redeemed");

    newIndex_ = notes[msg.sender].length;
    notes[msg.sender].push(notes[_from][_index]);

    delete notes[_from][_index];

    emit PushNote(_from, msg.sender, _index, newIndex_);
  }

/* ========== VIEW ========== */

  // Note info

  /**
   * @notice             all pending notes for user
   * @param _user        the user to query notes for
   * @return             the pending notes for the user
   */
  function indexesFor(address _user) public view override returns (uint256[] memory) {
    Note[] memory info = notes[_user];

    uint256 length;
    for (uint256 i = 0; i < info.length; i++) {
        if (info[i].redeemed == 0 && info[i].payout != 0) length++;
    }

    uint256[] memory indexes = new uint256[](length);
    uint256 position;

    for (uint256 i = 0; i < info.length; i++) {
        if (info[i].redeemed == 0 && info[i].payout != 0) {
            indexes[position] = i;
            position++;
        }
    }

    return indexes;
  }

  /**
   * @notice             calculate amount available for claim for a single note
   * @param _user        the user that the note belongs to
   * @param _index       the index of the note in the user's array
   * @return payout_     the payout due, in gFLOOR
   * @return matured_    if the payout can be redeemed
   */
  function pendingFor(address _user, uint256 _index) public view override returns (uint256 payout_, bool matured_) {
    Note memory note = notes[_user][_index];

    payout_ = note.payout;
    matured_ = note.redeemed == 0 && note.matured <= block.timestamp && note.payout != 0;
  }
}