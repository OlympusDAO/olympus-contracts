// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IOwnable.sol";
import "./interfaces/IsOHM.sol";
import "./interfaces/ITeller.sol";

import "./types/OlympusAccessControlled.sol";

contract BondTeller is ITeller, OlympusAccessControlled {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IsOHM;

    /* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require(msg.sender == depository, "Only depository");
        _;
    }

    /* ========== STRUCTS ========== */

    // Info for bond holder
    struct Bond {
        uint16 bondId; // ID of bond in depository
        uint48 vested; // time when bond is vested
        uint48 redeemed; // time when bond was redeemed (0 if unredeemed)
        uint128 payout; // sOHM remaining to be paid. gOHM balance
    }

    /* ========== STATE VARIABLES ========== */

    address internal immutable depository; // contract where users deposit bonds
    IStaking internal immutable staking; // contract to stake payout
    ITreasury internal immutable treasury;
    IERC20 internal immutable ohm;
    IsOHM internal immutable sOHM; // payment token
    address public immutable dao; 

    mapping(address => Bond[]) public bonderInfo; // user data

    mapping(address => uint256) public rewards; // front end operator rewards
    uint256[2] public reward; // reward to [front end operator, dao] (9 decimals)

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _depository,
        address _staking,
        address _treasury,
        address _ohm,
        address _sOHM,
        address _dao,
        address _authority
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        require(_depository != address(0), "Zero address: Depository");
        depository = _depository;
        require(_staking != address(0), "Zero address: Staking");
        staking = IStaking(_staking);
        require(_treasury != address(0), "Zero address: Treasury");
        treasury = ITreasury(_treasury);
        require(_ohm != address(0), "Zero address: OHM");
        ohm = IERC20(_ohm);
        require(_sOHM != address(0), "Zero address: sOHM");
        sOHM = IsOHM(_sOHM);
        require(_dao != address(0), "Zero address: DAO");
        dao = _dao;
    }

    /* ========== DEPOSITORY ========== */

    /**
     * @notice add new bond payout to user data
     * @param _payout uint256
     * @param _bid uint16
     * @param _expires uint48
     * @param _bonder address
     * @param _feo address
     * @return index_ uint16
     */
    function newBond(
        uint256 _payout,
        uint16 _bid,
        uint48 _expires,
        address _bonder,
        address _feo
    ) external override onlyDepository returns (uint16 index_) {
        uint256 toFEO = _payout.mul(reward[0]).div(1e9);
        uint256 toDAO = _payout.mul(reward[1]).div(1e9);

        treasury.mint(address(this), _payout.add(toFEO.add(toDAO)));
        ohm.approve(address(staking), _payout);
        staking.stake(address(this), _payout, true, true);

        rewards[_feo] += toFEO; // front end operator reward
        rewards[dao] += toDAO; // dao reward

        index_ = uint16(bonderInfo[_bonder].length);

        // store bond & stake payout
        bonderInfo[_bonder].push(
            Bond({
                bondId: _bid,
                payout: uint128(sOHM.toG(_payout)),
                vested: _expires,
                redeemed: 0
            })
        );
    }

    /* ========== MUTABLE FUNCTIONS ========== */

    /**
     *  @notice redeems all redeemable bonds
     *  @param _bonder address
     *  @return uint256
     */
    function redeemAll(address _bonder) external override returns (uint256) {
        return redeem(_bonder, indexesFor(_bonder));
    }

    /**
     *  @notice redeem bonds for user
     *  @param _bonder address
     *  @param _indexes calldata uint256[]
     *  @return uint256
     */
    function redeem(address _bonder, uint16[] memory _indexes) public override returns (uint256) {
        Bond[] storage info = bonderInfo[_bonder];
        uint256 dues;
        for (uint256 i = 0; i < _indexes.length; i++) {
            if (vested(_bonder, _indexes[i])) {
                info[_indexes[i]].redeemed = uint48(block.timestamp); // mark as redeemed
                dues += info[_indexes[i]].payout;
            }
        }
        dues = sOHM.fromG(dues);
        require(dues > 0, "Zero redemption error");
        sOHM.safeTransfer(_bonder, dues);
        return dues;
    }

    /**
     * @notice pay reward to front end operator
     */
    function getReward() external override {
        ohm.safeTransfer(msg.sender, rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice all un-redeemed indexes for address
     * @param _bonder address
     * @return indexes_ uint256[] memory
     */
    function indexesFor(address _bonder) public view override returns (uint16[] memory indexes_) {
        Bond[] memory info = bonderInfo[_bonder];
        for (uint16 i = 0; i < info.length; i++) {
            if (info[i].redeemed == 0) {
                indexes_[indexes_.length - 1] = i;
            }
        }
    }

    // check if bonder's bond is claimable
    function vested(address _bonder, uint16 _index) public view override returns (bool) {
        if (bonderInfo[_bonder][_index].redeemed == 0 && bonderInfo[_bonder][_index].vested <= block.timestamp) {
            return true;
        }
        return false;
    }

    // calculate amount of OHM available for claim for array of bonds
    function pendingForIndexes(
        address _bonder, 
        uint16[] memory _indexes
    ) public view override returns (uint256 pending_) {
        for (uint256 i = 0; i < _indexes.length; i++) {
            if (vested(_bonder, _indexes[i])) {
                pending_ += bonderInfo[_bonder][_indexes[i]].payout;
            }
        }
        pending_ = sOHM.fromG(pending_);
    }

    // get total ohm available for claim by bonder
    function totalPendingFor(address _bonder) public view override returns (uint256 pending_) {
        uint16[] memory indexes = indexesFor(_bonder);
        for (uint256 i = 0; i < indexes.length; i++) {
            if (vested(_bonder, indexes[i])) {
                pending_ += bonderInfo[_bonder][i].payout;
            }
        }
        pending_ = sOHM.fromG(pending_);
    }

    /* ========== OWNABLE FUNCTIONS ========== */

    // set reward for front end operator (9 decimals)
    function setReward(bool _fe, uint256 _reward) external override onlyPolicy {
        if (_fe) {
            reward[0] = _reward;
        } else {
            reward[1] = _reward;
        }
    }
}