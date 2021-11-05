// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.9;

import {ITreasury} from "./interfaces/OlympusInterfaces.sol";
import {IgOHM} from "./interfaces/OlympusInterfaces.sol";
import {ITeller} from "./interfaces/OlympusInterfaces.sol";
import {IStaking} from "./interfaces/OlympusInterfaces.sol";

import "./libraries/SafeERC20.sol";

contract BondTeller is ITeller {

    /* ========== DEPENDENCIES ========== */

    using SafeERC20 for IERC20;


    /* ========== MODIFIERS ========== */

    modifier onlyDepository() {
        require(msg.sender == depository, "Only depository");
        _;
    }
    

    /* ========== STATE VARIABLES ========== */

    address depository; // contract where users deposit bonds
    IStaking immutable staking; // contract to stake payout
    ITreasury immutable treasury;
    IERC20 immutable OHM;
    IERC20 immutable sOHM; // payment token
    IgOHM immutable gOHM;

    mapping(address => Bond[]) public bonderInfo; // user data
    mapping(address => uint256[]) public indexesFor; // user bond indexes

    mapping(address => uint256) public FERs; // front end operator rewards
    uint256 public feReward;

    address public policy;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _depository,
        address _staking,
        address _treasury,
        address _OHM,
        address _sOHM,
        address _gOHM
    ) {
        require(_depository != address(0));
        require(_staking != address(0));
        require(_treasury != address(0));
        require(_OHM != address(0));
        require(_sOHM != address(0));
        require(_gOHM != address(0));

        depository = _depository;
        staking = IStaking(_staking);
        treasury = ITreasury(_treasury);
        OHM = IERC20(_OHM);
        sOHM = IERC20(_sOHM);
        gOHM = IgOHM(_gOHM);

        IERC20(_OHM).approve(_staking, 1e27); // saves gas
    }

    /* ========== DEPOSITORY FUNCTIONS ========== */

    /**
     * @notice add new bond payout to user data
     * @param _bonder address
     * @param _principal address
     * @param _principalPaid uint
     * @param _payout uint
     * @param _expires uint
     * @param _feo address
     * @return index_ uint
     */
    function newBond(
        address _bonder,
        address _principal,
        uint256 _principalPaid,
        uint256 _payout,
        uint256 _expires,
        address _feo
    ) external onlyDepository returns (uint256 index_) {

        uint256 mintAmount = _payout + feReward;
        treasury.mint( address(this), mintAmount );

        OHM.approve(address(staking), _payout); // approve staking payout

        staking.stake(_payout, address(this), true, true);

        FERs[_feo] += feReward; // FE operator takes fee

        index_ = bonderInfo[_bonder].length;

        // store bond & stake payout
        bonderInfo[_bonder].push(Bond({
            principal: _principal, 
            principalPaid: _principalPaid, 
            payout: gOHM.balanceTo(_payout), 
            vested: _expires, 
            created: block.timestamp, 
            redeemed: 0
        }));
    }

    /* ========== INTERACTABLE FUNCTIONS ========== */

    /**
     *  @notice redeems all redeemable bonds
     *  @param _bonder address
     *  @return uint
     */
    function redeemAll(address _bonder) external returns (uint256) {
        updateIndexesFor(_bonder);
        return redeem(_bonder, indexesFor[_bonder]);
    }

    /**
     *  @notice redeem bond for user
     *  @param _bonder address
     *  @param _indexes calldata uint[]
     *  @return uint
     */
    function redeem(address _bonder, uint256[] memory _indexes) public returns (uint256) {
        uint256 dues;
        for (uint256 i = 0; i < _indexes.length; i++) {
            Bond memory info = bonderInfo[_bonder][_indexes[i]];

            if (pendingFor(_bonder, _indexes[i]) != 0) {
                bonderInfo[_bonder][_indexes[i]].redeemed = block.timestamp; // mark as redeemed

                dues += info.payout;
            }
        }

        dues = gOHM.balanceFrom(dues);

        emit Redeemed(_bonder, dues);
        pay(_bonder, dues);

        return dues;
    }

    /* ========== OWNABLE FUNCTIONS ========== */

    function setFEReward(uint256 reward) external {
        require(msg.sender == policy, "Only policy");

        feReward = reward;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     *  @notice send payout
     *  @param _amount uint
     */
    function pay(address _bonder, uint256 _amount) internal {
        sOHM.transfer(_bonder, _amount);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     *  @notice returns indexes of live bonds
     *  @param _bonder address
     */
    function updateIndexesFor(address _bonder) public {
        Bond[] memory info = bonderInfo[_bonder];
        delete indexesFor[_bonder];

        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].redeemed == 0) {
                indexesFor[_bonder].push(i);
            }
        }
    }

    // PAYOUT

    /**
     * @notice calculate amount of OHM available for claim for single bond
     * @param _bonder address
     * @param _index uint
     * @return uint
     */
    function pendingFor(address _bonder, uint256 _index) public view returns (uint256) {
        if (bonderInfo[_bonder][_index].redeemed == 0 && bonderInfo[_bonder][_index].vested <= block.number) {
            return bonderInfo[_bonder][_index].payout;
        }
        return 0;
    }

    /**
     * @notice calculate amount of OHM available for claim for array of bonds
     * @param _bonder address
     * @param _indexes uint[]
     * @return pending_ uint
     */
    function pendingForIndexes(address _bonder, uint256[] memory _indexes) public view returns (uint256 pending_) {
        for (uint256 i = 0; i < _indexes.length; i++) {
            pending_ = pending_ + pendingFor(_bonder, i);
        }
        pending_ = gOHM.balanceFrom(pending_);
    }

    /**
     *  @notice total pending on all bonds for bonder
     *  @param _bonder address
     *  @return pending_ uint
     */
    function totalPendingFor(address _bonder) public view returns (uint256 pending_) {
        Bond[] memory info = bonderInfo[_bonder];

        for (uint256 i = 0; i < info.length; i++) {
            pending_ = pending_ + pendingFor(_bonder, i);
        }

        pending_ = gOHM.balanceFrom(pending_);
    }

    // VESTING

    /**
     * @notice calculate how far into vesting a depositor is
     * @param _bonder address
     * @param _index uint
     * @return percentVested_ uint
     */
    function percentVestedFor(address _bonder, uint256 _index) public view returns (uint256 percentVested_) {
        Bond memory bond = bonderInfo[_bonder][_index];

        uint256 timeSince = block.timestamp - bond.created;
        uint256 term = bond.vested - bond.created;

        percentVested_ = timeSince * 1e9 / term;
    }
}
