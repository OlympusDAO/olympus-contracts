// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "../interfaces/IProNoteKeeper.sol";

contract ProVesting {
    address internal immutable depository;
    
    constructor() {
      depository = msg.sender;
    }

    function transfer(address token, address to, uint256 amount) external {
        require(msg.sender == depository, "Vesting: Only depository");
        IERC20(token).transfer(to, amount);
    }
}

interface IVesting {
  function transfer(address token, address to, uint256 amount) external;
}

abstract contract ProNoteKeeper is IProNoteKeeper {

  mapping(address => Note[]) public notes; // user deposit data
  mapping(address => mapping(uint256 => address)) private noteTransfers; // change note ownership

  IVesting public immutable vestingContract;

  constructor () {
    vestingContract = IVesting(address(new ProVesting()));
  }

/* ========== REDEEM ========== */

  /**
   * @notice             redeem notes for user
   * @param _user        the user to redeem for
   * @param _indexes     the note indexes to redeem
   */
  function redeem(address _user, uint256[] memory _indexes) public override {
    uint48 time = uint48(block.timestamp);

    for (uint256 i = 0; i < _indexes.length; i++) {
      Note storage note = notes[_user][_indexes[i]];

      bool matured = note.redeemed == 0 && note.matured <= block.timestamp && note.payout != 0;

      if (matured) {
        note.redeemed = time; // mark as redeemed
        vestingContract.transfer(note.token, _user, note.payout);
      }
    }
  }

  /**
   * @notice             redeem all redeemable markets for user
   * @dev                if possible, query indexesFor() off-chain and input in redeem() to save gas
   * @param _user        user to redeem all notes for
   */ 
  function redeemAll(address _user) external override {
    return redeem(_user, indexesFor(_user));
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
  }

/* ========== VIEW ========== */

  // Note info

  /**
   * @notice             all pending notes for user
   * @param _user        the user to query notes for
   * @return indexes_    the pending notes for the user
   */
  function indexesFor(address _user) public view override returns (uint256[] memory indexes_) {
    Note[] memory info = notes[_user];

    uint256 length;
    for (uint256 i = 0; i < info.length; i++) {
      if (info[i].redeemed == 0 && info[i].payout != 0) length++;
    }

    indexes_ = new uint256[](length);
    uint256 position;

    for (uint256 i = 0; i < info.length; i++) {
      if (info[i].redeemed == 0 && info[i].payout != 0) {
        indexes_[position] = i;
        position++;
      }
    }
  }

  /**
   * @notice             calculate amount available for claim for a single note
   * @param _user        the user that the note belongs to
   * @param _index       the index of the note in the user's array
   * @return payout_     the payout due
   * @return matured_    if the payout can be redeemed
   */
  function pendingFor(address _user, uint256 _index) public view override returns (uint256 payout_, bool matured_) {
    Note memory note = notes[_user][_index];

    payout_ = note.payout;
    matured_ = note.redeemed == 0 && note.matured <= block.timestamp && note.payout != 0;
  }
}
