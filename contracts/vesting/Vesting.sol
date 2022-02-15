// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
pragma abicoder v2;

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../types/Ownable.sol";
import "../types/FloorAccessControlled.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IgFLOOR.sol";
import "../interfaces/IStaking.sol";

/**
 *  This contract allows FloorDAO seed investors and advisors to claim tokens.
 *  It has been revised to consider claims as staked immediately for accounting purposes.
 *  This ensures that network ownership does not exceed disclosed levels.
 *  Claimants remain protected from network dilution that may arise, but claim and stake
 *  does not allow them to grow ownership beyond predefined levels. This change also penalizes
 *  sellers, since the tokens sold are still considered staked within this contract. This  
 *  step was taken to ensure fair distribution of exposure in the network.  
 */
contract VestingClaim is Ownable, FloorAccessControlled {

    /* ========== DEPENDENCIES ========== */

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STRUCTS ========== */

    struct Term {
        uint256 percent; // 4 decimals ( 5000 = 0.5% )
        uint256 gClaimed; // rebase-agnostic number
        uint256 max; // maximum nominal FLOOR amount can claim, 9 decimal
    }

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable FLOOR;
    IERC20 public immutable WETH;
    IgFLOOR public immutable gFLOOR;
    ITreasury private immutable treasury;
    IStaking private immutable staking;

    // tracks address info
    mapping( address => Term ) public terms;

    // facilitates address change
    mapping( address => address ) public walletChange;

    // as percent of supply (4 decimals: 10000 = 1%)
    uint256 public totalAllocated;

    // maximum portion of supply can allocate. == 4%
    uint256 public maximumAllocated = 40000; 

    constructor(
      address _floor,
      address _weth,
      address _gFLOOR,
      address _treasury,
      address _staking,
      address _authority
    ) FloorAccessControlled(IFloorAuthority(_authority)) {
        require(_floor != address(0), "Zero address: FLOOR");
        FLOOR = IERC20(_floor);
        require(_weth != address(0), "Zero address: WETH");
        WETH = IERC20(_weth);
        require(_gFLOOR != address(0), "Zero address: gFLOOR");
        gFLOOR = IgFLOOR(_gFLOOR);
        require(_treasury != address(0), "Zero address: Treasury");
        treasury = ITreasury(_treasury);
        require(_staking != address(0), "Zero address: Staking");
        staking = IStaking(_staking);
    }

    /* ========== MUTABLE FUNCTIONS ========== */
    
    /**
     * @notice allows wallet to claim FLOOR. We multiply be 1e6 as we convert the FLOOR from
     * a WETH finney.
     * @param _to address The address that is claiming
     * @param _amount uint256 The amount being claimed in FLOOR (9 decimals)
     */
    function claim(address _to, uint256 _amount) external {
        // Convert our FLOOR input to WETH decimal accuracy
        FLOOR.safeTransfer(_to, _claim(_amount.mul(1e6)));
    }

    /**
     * @notice allows wallet to claim FLOOR and stake. set _claim = true if warmup is 0.
     * @param _to address
     * @param _amount uint256
     * @param _rebasing bool
     * @param _claimFromStaking bool
     */
    function stake(address _to, uint256 _amount, bool _rebasing, bool _claimFromStaking) external {
        staking.stake(_to, _claim(_amount), _rebasing, _claimFromStaking);
    }

    /**
     * @notice logic for claiming FLOOR
     * @param _amount uint256 The amount being claimed in WETH (18 decimals)
     * @return toSend_ uint256
     */
    function _claim(uint256 _amount) internal returns (uint256 toSend_) {
        Term memory info = terms[msg.sender];

        // Get our total redeemable
        uint256 redeemableForValue = redeemableFor(msg.sender);

        // Sense check the amount requested
        require(_amount > 0, "Nothing to claim");
        require(redeemableForValue.mul(1e6) >= _amount, "Claim more than vested");

        // Transfer WETH from sender to treasury
        WETH.safeTransferFrom(msg.sender, address(this), _amount);
        toSend_ = treasury.deposit(_amount, address(WETH), 0);

        // Ensure our amount to send is valid
        require(toSend_ > 0, "Nothing to claim");
        require(redeemableForValue >= toSend_, "Claim more than vested");
        require(info.max.sub(claimed(msg.sender)) >= toSend_, "Claim more than max");

        // Track claimed amount for sender
        terms[msg.sender].gClaimed = info.gClaimed.add(gFLOOR.balanceTo(toSend_));
    }

    /**
     * @notice allows address to push terms to new address
     * @param _newAddress address
     */
    function pushWalletChange(address _newAddress) external {
        require(terms[msg.sender].percent != 0, "No wallet to change");
        walletChange[msg.sender] = _newAddress;
    }
    
    /**
     * @notice allows new address to pull terms
     * @param _oldAddress address
     */
    function pullWalletChange(address _oldAddress) external {
        require(walletChange[_oldAddress] == msg.sender, "Old wallet did not push");
        require(terms[msg.sender].percent != 0, "Wallet already exists");
        
        walletChange[_oldAddress] = address(0);
        terms[msg.sender] = terms[_oldAddress];
        delete terms[_oldAddress];
    }

    /**
     * @notice mass approval saves gas
     */
    function approve() external {
        FLOOR.approve(address(staking), 1e33);
        WETH.approve(address(treasury), 1e33);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice view FLOOR claimable for address. WETH decimals (18).
     * @param _address address
     * @return uint256
     */
    function redeemableFor(address _address) public view returns (uint256) {
        Term memory info = terms[_address];
        uint256 max = circulatingSupply().mul(info.percent).div(1e6);
        if (max > info.max) max = info.max;
        return max.sub(claimed(_address));
    }

    /**
     * @notice view FLOOR claimed by address. FLOOR decimals (9).
     * @param _address address
     * @return uint256
     */
    function claimed(address _address) public view returns (uint256) {
        return gFLOOR.balanceFrom(terms[_address].gClaimed);
    }

    /**
     * @notice view circulating supply of FLOOR
     * @notice calculated as total supply minus DAO holdings
     * @return uint256
     */
    function circulatingSupply() public view returns (uint256) {
        return treasury.baseSupply().sub(FLOOR.balanceOf(authority.governor()));
    }  

    /* ========== OWNER FUNCTIONS ========== */

    /**
     *  @notice set terms for new address
     *  @notice cannot lower for address or exceed maximum total allocation
     *  @param _address address
     *  @param _percent uint256
     *  @param _gClaimed uint256
     *  @param _max uint256
     */
    function setTerms(
        address _address, 
        uint256 _percent, 
        uint256 _gClaimed, 
        uint256 _max
    ) public onlyOwner {
        require(terms[_address].max == 0, "address already exists");
        terms[_address] = Term({
            percent: _percent,
            gClaimed: _gClaimed,
            max: _max
        });
        require(totalAllocated.add(_percent) <= maximumAllocated, "Cannot allocate more");
        totalAllocated = totalAllocated.add(_percent);
    }
}