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
        uint256 bondId; // ID of bond in depository
        uint256 payout; // sOHM remaining to be paid. agnostic balance
        uint256 vested; // time when bond is vested
        uint256 created; // time bond was created
        uint256 redeemed; // time when bond was redeemed (0 if unredeemed)
    }

    /* ========== STATE VARIABLES ========== */

    address internal depository; // contract where users deposit bonds
    IStaking internal immutable staking; // contract to stake payout
    ITreasury internal immutable treasury;
    IERC20 internal immutable ohm;
    IsOHM internal immutable sOHM; // payment token
    address internal immutable dao; // receives fee

    mapping(address => Bond[]) public bonderInfo; // user data
    mapping(address => uint256[]) public indexesFor; // user bond indexes

    mapping(address => uint256) public rewards; // front end operator rewards
    uint256 public feReward; // percentage fee, 5 decimals
    uint256 public daoReward; // percentage fee, 5 decimals

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
     * @param _bonder address
     * @param _bid uint256
     * @param _payout uint256
     * @param _expires uint256
     * @param _feo address
     * @return index_ uint256
     */
    function newBond(
        address _bonder,
        uint256 _bid,
        uint256 _payout,
        uint256 _expires,
        address _feo
    ) external override onlyDepository returns (uint256 index_) {
        uint256 toFrontEnd = _payout * feReward / 1e5;
        uint256 toDAO = _payout * daoReward / 1e5;

        treasury.mint(address(this), _payout.add(toFrontEnd).add(toDAO));
        ohm.approve(address(staking), _payout);
        staking.stake(address(this), _payout, true, true);

        rewards[_feo] += toFrontEnd; // front end operator reward
        rewards[dao] += toDAO; // DAO fee

        index_ = bonderInfo[_bonder].length;

        // store bond & stake payout
        bonderInfo[_bonder].push(
            Bond({
                bondId: _bid,
                payout: sOHM.toG(_payout),
                vested: _expires,
                created: block.timestamp,
                redeemed: 0
            })
        );
    }

    /* ========== MUTABLE FUNCTIONS ========== */

    // for testing. ensure removal before mainnet.
    function setDepository(address _depository) external {
        depository = _depository;
    }

    /**
     *  @notice redeems all redeemable bonds. beware of gas, indexes can be queried off-chain.
     *  @param _bonder address
     *  @return uint256
     */
    function redeemAll(address _bonder) external override returns (uint256) {
        updateIndexesFor(_bonder);
        return redeem(_bonder, indexesFor[_bonder]);
    }

    /**
     *  @notice redeem bonds for user
     *  @param _bonder address
     *  @param _indexes calldata uint256[]
     *  @return uint256
     */
    function redeem(address _bonder, uint256[] memory _indexes) public override returns (uint256) {
        Bond[] storage info = bonderInfo[_bonder];
        uint256 dues;
        for (uint256 i = 0; i < _indexes.length; i++) {
            uint256 index = _indexes[i];
            if (vested(_bonder, index)) {
                info[index].redeemed = block.timestamp; // mark as redeemed
                dues += info[index].payout;
            }
        }
        dues = sOHM.fromG(dues);
        sOHM.safeTransfer(_bonder, dues);
        return dues;
    }

    /**
     * @notice pay reward to front end operator
     */
    function getReward() external override {
        require(rewards[msg.sender] > 0, "No rewards");
        ohm.safeTransfer(msg.sender, rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }

    /**
     *  @notice returns indexes of live bonds
     *  @param _bonder address
     */
    function updateIndexesFor(address _bonder) public override {
        delete indexesFor[_bonder];
        Bond[] memory info = bonderInfo[_bonder];
        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].redeemed == 0) {
                indexesFor[_bonder].push(i);
            }
        }
    }

    /* ========== OWNABLE FUNCTIONS ========== */

    // set reward for front end operator (4 decimals. 100 = 1%)
    function setRewards(uint256 _feReward, uint256 _daoFee) external onlyPolicy {
        feReward = _feReward;
        daoReward = _daoFee;
    }

    /* ========== VIEW FUNCTIONS ========== */

    // PAYOUT

    /**
     * @notice calculate amount of OHM available for claim for single bond
     * @param _bonder address
     * @param _index uint256
     * @return uint256
     */
    function vested(address _bonder, uint256 _index) public view override returns (bool) {
        if (bonderInfo[_bonder][_index].redeemed == 0 && bonderInfo[_bonder][_index].vested <= block.number) {
            return true;
        }
        return false;
    }

    /**
     * @notice calculate amount of OHM available for claim for array of bonds
     * @param _bonder address
     * @param _indexes uint256[]
     * @return pending_ uint256
     */
    function pendingForIndexes(
        address _bonder, 
        uint256[] memory _indexes
    ) public view override returns (uint256 pending_) {
        for (uint256 i = 0; i < _indexes.length; i++) {
            if (vested(_bonder, _indexes[i])) {
                pending_ += bonderInfo[_bonder][_indexes[i]].payout;
            }
        }
        pending_ = sOHM.fromG(pending_);
    }

    /**
     *  @notice total pending on all bonds for bonder
     *  @param _bonder address
     *  @return pending_ uint256
     */
    function totalPendingFor(address _bonder) public view override returns (uint256 pending_) {
        Bond[] memory info = bonderInfo[_bonder];
        for (uint256 i = 0; i < info.length; i++) {
            if (vested(_bonder, i)) {
                pending_ += info[i].payout;
            }
        }
        pending_ = sOHM.fromG(pending_);
    }

    // VESTING

    /**
     * @notice calculate how far into vesting a depositor is
     * @param _bonder address
     * @param _index uint256
     * @return uint256
     */
    function percentVestedFor(address _bonder, uint256 _index) public view override returns (uint256) {
        Bond memory bond = bonderInfo[_bonder][_index];

        uint256 timeSince = block.timestamp - bond.created;
        uint256 term = bond.vested - bond.created;

        return timeSince * 1e9 / term;
    }
}
