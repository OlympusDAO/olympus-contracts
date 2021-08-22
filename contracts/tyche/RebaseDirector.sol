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
contract TycheRebaseDirector is ERC20 {
    //using SafeMath for uint;
    using SafeERC20 for IERC20;

	address public immutable staking;
    address public immutable OHM;
    address public immutable sOHM;

    // Agnostic value of vault sOHM balance
    uint public totalAgnosticBalance;

    // Info for donation recipient
    struct RecipientInfo {
        uint256 shares;
        uint256 totalDebt;
        uint256 agnosticBalance;
    }

    // Donor principal amount
    mapping(address => mapping (address => uint)) public principal;

    // All recipient information
    mapping(address => RecipientInfo) public recipientInfo;

    // TODO Add events

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

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Stakes OHM, records sender address and issue shares to recipient
        @param _amount Amount of sOHM debt issued from donor to recipient
        @param _recipient Address to direct staking yield and vault shares to

        @dev Agnostic values are used for *some* accounting, but not all. This is to
             account for edge cases. For example, if the recipient redeems their shares
             before the donor withdraws, then the donor should recieve the remaining rebases.
             TODO
     */
    function deposit(uint _amount, address _recipient) public {
        require(_amount > 0, "Invalid deposit amount");
        require(_recipient != address(0), "Invalid recipient address");
        require(IERC20(sOHM).balanceOf(msg.sender) < _amount, "Not enough sOHM");

        // TODO should it take sOHM or OHM??

        // Transfer sOHM to this contract
        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), _amount);

        uint agnosticAmount = _toAgnostic(_amount);

        // Add to total agnostic vault balance
        totalAgnosticBalance = totalAgnosticBalance + agnosticAmount;

        // Record donors's issued debt to recipient address
        principal[msg.sender][_recipient] = principal[msg.sender][_recipient] + _amount;

        // Add to receivers balance as agnostic value and debt as flat value
        recipientInfo[_recipient].totalDebt = recipientInfo[_recipient].totalDebt + _amount;
        recipientInfo[_recipient].agnosticBalance = recipientInfo[_recipient].agnosticBalance + agnosticAmount;

        // Issue vault shares to recipient
        uint sharesToIssue = _sharesForAmount(_amount);
        _mint(_recipient, sharesToIssue);
    }

    /**
        @notice Deposit all of caller's sOHM and issue shares to the recipient
     */
    function depositAll(address _recipient) external {
        deposit(IERC20(sOHM).balanceOf(msg.sender), _recipient);
    }

    /**
        @notice Withdraw donor's sOHM from vault and subtracts debt from recipient
        @param _amount Non-agnostic sOHM amount to withdraw
        @param _recipient Donee address
     */
    function withdraw(uint _amount, address _recipient) external {
        uint totalPrincipal = principal[msg.sender][_recipient];

        require(totalPrincipal > 0, "Donation amount is 0");

        uint beforeBalance = totalAgnosticBalance;

        uint agnosticAmount = _toAgnostic(_amount);

        // Remove agnostic value and debt from recipient
        recipientInfo[_recipient].totalDebt = recipientInfo[_recipient].totalDebt - _amount;
        recipientInfo[_recipient].agnosticBalance = recipientInfo[_recipient].agnosticBalance - agnosticAmount;

        // Remove agnostic value and debt from vault
        totalAgnosticBalance = totalAgnosticBalance - agnosticAmount;

        // Subtract flat sOHM amount from donor's principal
        principal[msg.sender][_recipient] = principal[msg.sender][_recipient] - _amount;

        // Transfer sOHM from vault back to donor
        IERC20(sOHM).safeTransferFrom(address(this), msg.sender, _amount);

        // TODO verify this is accurate
        // Adjust recipient vault shares balance
        _burn(_recipient, _sharesForAmount(_amount));
    }

    // TODO WithdrawAll
    // TODO use EnumerableMap to loop through all recipients and withdraw

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Get claimable balance of an address
     */
    function claimableBalance(address _who) public view returns (uint) {
        uint recipientDebt = recipientInfo[_who].totalDebt;

        require(recipientDebt == 0, "No claimable balance");

        return IsOHM(sOHM).balanceOf(address(this)) - _toAgnostic(recipientDebt);
    }

    /**
        @notice Redeem vault shares for underlying sOHM
        // TODO Recipient debts only get cleared when shares are redeemed
     */
    function redeem(uint _shares) public {
        //require(totalDebt[_who] == 0, "No claimable balance");

        //require(balanceOf(msg.sender) > 0, );

        //uint sohmAmount = _shareValue(_shares);
        //_burn(msg.sender, _shares);
    }

    /************************
    * Conversion Functions
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
        uint agnosticAmount = (_shares * totalAgnosticBalance) / totalSupply();

        return _fromAgnostic(agnosticAmount);
    }

    /**
        @notice shares / totalSupply = amount / assets_under_management
        @notice Calculate shares for some 
     */
    function _sharesForAmount( uint _amount ) internal view returns ( uint ) {
        uint totalSupply = totalSupply();

        if (totalSupply > 0) {
            uint shares = (_toAgnostic(_amount) * totalSupply) / totalAgnosticBalance;
            return shares;
        } else {
            return 0;
        }
    }
}