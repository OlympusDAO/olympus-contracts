// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/drafts/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IsOHM {
    function rebase( uint256 ohmProfit_, uint epoch_) external returns (uint256);

    function circulatingSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function gonsForBalance( uint amount ) external view returns ( uint );

    function balanceForGons( uint gons ) external view returns ( uint );
    
    function index() external view returns ( uint );
}

interface IStaking {
    function stake( uint _amount, address _recipient ) external returns ( bool );
    function claim( address _recipient ) external;
}

/**
    @title RebaseDirector 
    @notice This contract allows users to stake their OHM and redirect their
            rebases to an address (or NFT). Users will be able to withdraw their
            principal stake at any time. Donation recipients can also withdraw at
            any time.
    @dev User's deposited stake is recorded as agnostic values (value / index) for the user,
         but recipient debt is recorded as non-agnostic OHM value.
 */
contract RebaseDirector is ERC20 {
    //using SafeMath for uint;
    using SafeERC20 for IERC20;

	address public immutable staking;
    address public immutable OHM;
    address public immutable sOHM;

    // Agnostic value of vault sOHM balance
    uint public agnosticBalance;

    // Info for donation recipient
    struct RecipientInfo {
        uint256 shares;
        uint256 totalDebt;
    }

    // Donor principal amount
    mapping(address => mapping (address => uint)) public principal;

    // All recipient information
    mapping(address => RecipientInfo) public recipientInfo;

    constructor (
		address _staking,
        address _OHM, 
        address _sOHM
    )
        ERC20("Olympus donor vault", "dOHM")
    {
        require(_staking != address(0));
        require(_OHM != address(0));
        require(_sOHM != address(0));
        // TODO add governance address

        staking = _staking;
        OHM = _OHM;
        sOHM = _sOHM;
    }

    // TODO Override decimals function if needed

    /**
        @notice Stakes OHM, records sender address and issue shares to recipient
        @param _principal Amount of sOHM debt issued by user and owed by recipient
        @param _recipient Address to direct staking yield and vault shares to
     */
    function deposit(uint _principal, address _recipient) external returns ( bool ) {
        require(_principal > 0, "Invalid deposit amount");
        require(_recipient != address(0), "Invalid recipient address");
        require(IERC20(sOHM).balanceOf(msg.sender) < _principal, "Not enough sOHM");

        // Transfer sOHM to this contract
        IERC20(sOHM).transferFrom(msg.sender, address(this), _principal);

        uint agnosticPrincipal = _toAgnostic(_principal);

        // Add to total vault balance
        agnosticBalance = agnosticBalance + agnosticPrincipal;

        // Record user's initial stake amount as agnostic value
        principal[msg.sender][_recipient] = principal[msg.sender][_recipient] + agnosticPrincipal;

        // Add to receivers debt as flat value
        recipientInfo[_recipient].totalDebt = recipientInfo[_recipient].totalDebt + _principal;

        // TODO Issue vault shares to recipient

        return true;
    }

    /**
        @notice Get claimable balance of an address
     */
    function claimableBalance(address _who) public view returns (uint) {
        require(recipientInfo[_who].totalDebt == 0, "No claimable balance");

        return IsOHM(sOHM).balanceOf(address(this)) - _toAgnostic(recipientInfo[_who].totalDebt);
    }

    /**
        @notice Redeem vault shares for underlying sOHM
     */
    function redeem(address _who) public returns (uint) {
        //require(totalDebt[_who] == 0, "No claimable balance");
        // TODO
    }

    /************************
    * Conversion Functions  *
    ************************/

    // TODO replace with governance's toWOHM
    /**
        @notice Agnostic value maintains rebases. Agnostic value is amount / index
     */
    function _toAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (10 ** decimals())
            / (IsOHM(sOHM).index());
     }

    // TODO replace with governance's fromWOHM
     function _fromAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (IsOHM(sOHM).index())
            / (10 ** decimals());
     }

    /**
        @notice Get share value for some amount
            shares = amount * totalSupply / assets_under_management
     */
    function _shareValue(uint _shares) internal view returns ( uint ) {
        uint agnosticAmount = (_shares * agnosticBalance) / totalSupply();

        return _fromAgnostic(agnosticAmount);
    }

    /**
        @notice shares / totalSupply = amount / assets_under_management
     */
    function _sharesForAmount( uint _amount ) internal view returns ( uint ) {
        uint shares = (_toAgnostic(_amount) * totalSupply()) / agnosticBalance;

        return shares;
    }
}