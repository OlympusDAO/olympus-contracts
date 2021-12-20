// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IOwnable.sol";
import "./interfaces/IgOHM.sol";
import "./interfaces/ITeller.sol";
import "./types/OlympusAccessControlled.sol";
import "./libraries/SafeERC20.sol";
import "./libraries/SafeMath.sol";

contract BondTeller is ITeller, OlympusAccessControlled {
    
/* ========== DEPENDENCIES ========== */

    using SafeERC20 for IERC20;
    using SafeERC20 for IgOHM;
    using SafeMath for uint256;

/* ========== EVENTS =========== */

    event BondCreated(address indexed bonder, uint256 payout, uint256 expires);
    event Redeemed(address indexed bonder, uint256 payout);

/* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require(msg.sender == depository, "Only depository");
        _;
    }

/* ========== STRUCTS ========== */

    // Info for bond note
    struct Note {
        uint112 payout; // gOHM remaining to be paid
        uint48 created; // time bond was created
        uint48 matured; // timestamp when bond is matured
        uint48 redeemed; // time bond was redeemed
    }

/* ========== STATE VARIABLES ========== */

    address internal immutable depository; // contract where users deposit bonds
    IStaking internal immutable staking; // contract to stake payout
    ITreasury internal immutable treasury;
    IERC20 internal immutable ohm;
    IgOHM internal immutable gOHM; // payment token
    address public immutable dao; // receives fees on each bond

    mapping(address => Note[]) public notes; // user data
    mapping(address => uint256) public rewards; // front end operator rewards
    mapping(address => bool) public whitelisted; // whitelisted status for operators
    uint256[2] public rewardRate;

/* ========== CONSTRUCTOR ========== */

    constructor(
        address _depository,
        address _staking,
        address _treasury,
        address _ohm,
        address _gOHM,
        address _dao,
        address _authority
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        depository = _depository;
        staking = IStaking(_staking);
        treasury = ITreasury(_treasury);
        ohm = IERC20(_ohm);
        gOHM = IgOHM(_gOHM);
        dao = _dao;
        whitelisted[_dao] = true;
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
        // compute dao and front end referrer bonuses
        uint256 toDAO = _payout.mul(rewardRate[1]).div(1e4);
        uint256 toReferrer = _payout.mul(rewardRate[0]).div(1e4);
        // mint OHM and stake payout
        treasury.mint(address(this), _payout.add(toDAO).add(toReferrer));
        ohm.approve(address(staking), _payout);
        staking.stake(address(this), _payout, true, false);
        // log rewards
        if (whitelisted[_referral]) {
            rewards[_referral] = rewards[_referral].add(toReferrer);
            rewards[dao] = rewards[dao].add(toDAO);
        } else { // DAO receives both rewards if referrer is not whitelisted
            rewards[dao] = rewards[dao].add(toDAO.add(toReferrer));
        }
        // store info
        index_ = notes[_bonder].length;
        notes[_bonder].push(
            Note({
                payout: uint112(gOHM.balanceTo(_payout)),
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

    /**
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _indexes calldata uint256[]
     *  @return uint256
     */
    function redeem(address _bonder, uint256[] memory _indexes) public override returns (uint256) {
        uint256 dues;
        for (uint256 i = 0; i < _indexes.length; i++) {
            Note memory info = notes[_bonder][_indexes[i]];
            if (pendingFor(_bonder, _indexes[i]) != 0) {
                notes[_bonder][_indexes[i]].redeemed = uint48(block.timestamp); // mark as redeemed
                dues += info.payout;
            }
        }
        emit Redeemed(_bonder, dues);
        gOHM.safeTransfer(_bonder, dues);
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

    // add or remove address from the whitelist
    // whitelisted addresses can earn referral fees by operating a front end
    function whitelist(address _operator) external override onlyPolicy {
        require(_operator != dao, "Can not blacklist DAO");
        whitelisted[_operator] = !whitelisted[_operator];
    }

/* ========== VIEW ========== */

    // all pending indexes for bonder
    function indexesFor(address _bonder) public view returns (uint256[] memory) {
        uint256 length;
        for (uint256 i = 0; i < notes[_bonder].length; i++) {
            if (notes[_bonder][i].redeemed == 0) {
                length++;
            }
        }
        uint256[] memory array = new uint256[](length);
        uint256 position;
        for (uint256 i = 0; i < notes[_bonder].length; i++) {
            if (notes[_bonder][i].redeemed == 0) {
                array[position] = i;
                position++;
            }
        }
        return array;
    }

    /**
     * @notice calculate amount of OHM available for claim for single bond
     * @param _bonder address
     * @param _index uint256
     * @return uint256
     */
    function pendingFor(address _bonder, uint256 _index) public view override returns (uint256) {
        if (notes[_bonder][_index].redeemed == 0 && notes[_bonder][_index].matured <= block.timestamp) {
            return notes[_bonder][_index].payout;
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
    }

    /**
     *  @notice total pending on all bonds for bonder
     *  @param _bonder address
     *  @return pending_ uint256
     */
    function totalPendingFor(address _bonder) public view override returns (uint256 pending_) {
        uint256[] memory indexes = indexesFor(_bonder);
        for (uint256 i = 0; i < indexes.length; i++) {
            pending_ += pendingFor(_bonder, indexes[i]);
        }
    }
}