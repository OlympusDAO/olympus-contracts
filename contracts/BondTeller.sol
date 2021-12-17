// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IOwnable.sol";
import "../interfaces/IsOHM.sol";
import "../interfaces/ITeller.sol";
import "../types/OlympusAccessControlled.sol";
import "../libraries/SafeERC20.sol";

contract BondTeller is ITeller, OlympusAccessControlled {
    
/* ========== DEPENDENCIES ========== */

    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;

/* ========== EVENTS =========== */

    event BondCreated(address indexed bonder, uint256 payout, uint256 expires);
    event Redeemed(address indexed bonder, uint256 payout);

/* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require(msg.sender == depository, "Only depository");
        _;
    }

/* ========== STRUCTS ========== */

    // Info for bond slip
    struct Slip {
        uint112 payout; // sOHM remaining to be paid. gOHM balance
        uint48 created; // time bond was created
        uint48 matured; // timestamp when bond is matured
        uint48 redeemed; // time bond was redeemed
    }

/* ========== STATE VARIABLES ========== */

    address internal immutable depository; // contract where users deposit bonds
    IStaking internal immutable staking; // contract to stake payout
    ITreasury internal immutable treasury;
    IERC20 internal immutable ohm;
    IsOHM internal immutable sOHM; // payment token
    address public dao; // receives fees on each bond

    mapping(address => Slip[]) public slips; // user data
    mapping(address => uint256) public rewards; // front end operator rewards
    uint256[2] public rewardRate;

/* ========== CONSTRUCTOR ========== */

    constructor(
        address _depository,
        address _staking,
        address _treasury,
        address _ohm,
        address _sOHM,
        address _authority
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        depository = _depository;
        staking = IStaking(_staking);
        treasury = ITreasury(_treasury);
        ohm = IERC20(_ohm);
        sOHM = IsOHM(_sOHM);
    }

/* ========== ONLY DEPOSITORY ========== */

    /**
     * @notice add new bond payout to user data
     * @param _bonder address
     * @param _payout uint256
     * @param _expires uint256
     * @param _referral address
     * @return index_ uint256
     */
    function newBond(
        address _bonder,
        uint256 _payout,
        uint256 _expires,
        address _referral
    ) external override onlyDepository returns (uint256 index_) {
        uint256 toDAO = _payout * rewardRate[1] / 1e4;
        uint256 toFrontEnd = _payout * rewardRate[0] / 1e4;

        treasury.mint(address(this), _payout + toDAO + toFrontEnd);

        ohm.approve(address(staking), _payout);
        staking.stake(address(this), _payout, true, true);

        rewards[dao] += toDAO;
        rewards[_referral] += toFrontEnd; // front end operator reward

        index_ = slips[_bonder].length;

        // store bond & stake payout
        slips[_bonder].push(
            Slip({
                payout: uint112(sOHM.toG(_payout)),
                created: uint48(block.timestamp),
                matured: uint48(_expires),
                redeemed: 0
            })
        );
    }

/* ========== USABLE ========== */

    /**
     *  @notice redeems all redeemable bonds
     *  @param _bonder address
     *  @return uint256
     */
    function redeemAll(address _bonder) external override returns (uint256) {
        return redeem(_bonder, indexesFor(_bonder));
    }

    function indexesFor(address _bonder) public view returns (uint256[] memory) {
        uint256 length;
        for (uint256 i = 0; i < slips[_bonder].length; i++) {
            if (slips[_bonder][i].redeemed == 0) {
                length++;
            }
        }
        uint256[] memory array = new uint256[](length);
        uint256 position;
        for (uint256 i = 0; i < slips[_bonder].length; i++) {
            if (slips[_bonder][i].redeemed == 0) {
                array[position] = i;
                position++;
            }
        }
        return array;
    }

    /**
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _indexes calldata uint256[]
     *  @return uint256
     */
    function redeem(address _bonder, uint256[] memory _indexes) public override returns (uint256) {
        uint256 dues;
        for (uint256 i = 0; i < _indexes.length; i++) {
            Slip memory info = slips[_bonder][_indexes[i]];
            if (pendingFor(_bonder, _indexes[i]) != 0) {
                slips[_bonder][_indexes[i]].redeemed = uint48(block.timestamp); // mark as redeemed
                dues += info.payout;
            }
        }
        dues = sOHM.fromG(dues);
        emit Redeemed(_bonder, dues);
        sOHM.safeTransfer(_bonder, dues);
        return dues;
    }

    // pay reward to front end operator
    function getReward() external override {
        ohm.safeTransfer(msg.sender, rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }

/* ========== OWNABLE ========== */

    // set reward for front end operator (4 decimals. 100 = 1%)
    function setRewards(uint256 _toFrontEnd, uint256 _toDAO) external override onlyPolicy {
        rewardRate[0] = _toFrontEnd;
        rewardRate[1] = _toDAO;
    }

    function setDAO(address _dao) external onlyPolicy {
        require(_dao != address(0), "Zero address");
        uint256 send = rewards[dao];
        rewards[dao] = 0;
        ohm.safeTransfer(dao, send);
        dao = _dao;
    }

/* ========== VIEW ========== */

    // PAYOUT

    /**
     * @notice calculate amount of OHM available for claim for single bond
     * @param _bonder address
     * @param _index uint256
     * @return uint256
     */
    function pendingFor(address _bonder, uint256 _index) public view override returns (uint256) {
        if (slips[_bonder][_index].redeemed == 0 && slips[_bonder][_index].matured <= block.timestamp) {
            return slips[_bonder][_index].payout;
        }
        return 0;
    }

    /**
     * @notice calculate amount of OHM available for claim for array of bonds
     * @param _bonder address
     * @param _indexes uint256[]
     * @return pending_ uint256
     */
    function pendingForIndexes(address _bonder, uint256[] memory _indexes) public view override returns (uint256 pending_) {
        for (uint256 i = 0; i < _indexes.length; i++) {
            pending_ += pendingFor(_bonder, i);
        }
        pending_ = sOHM.fromG(pending_);
    }

    /**
     *  @notice total pending on all bonds for bonder
     *  @param _bonder address
     *  @return pending_ uint256
     */
    function totalPendingFor(address _bonder) public view override returns (uint256 pending_) {
        Slip[] memory info = slips[_bonder];
        for (uint256 i = 0; i < info.length; i++) {
            pending_ += pendingFor(_bonder, i);
        }
        pending_ = sOHM.fromG(pending_);
    }
}