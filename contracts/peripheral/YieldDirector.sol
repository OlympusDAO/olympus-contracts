// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

//import "./types/ERC20.sol";
//import "./types/Ownable.sol";
//import "./libraries/SafeERC20.sol";
import "../interfaces/IYieldDirector.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// TODO replace with sOHM interface file
interface IsOHM {
    function index() external view returns ( uint256 );
}

interface IgOHM {
  function mint(address _to, uint256 _amount) external;

  function burn(address _from, uint256 _amount) external;

  function balanceFrom(uint256 _amount) external view returns (uint256);

  function balanceTo(uint256 _amount) external view returns (uint256);
}

/**
    @title YieldDirector (codename Tyche) 
    @notice This contract allows donors to deposit their sOHM and donate their rebases
            to any address. Donors will be able to withdraw their principal
            sOHM at any time. Donation recipients can also redeem accrued rebases at any time.
 */
contract YieldDirector is Ownable, IYieldDirector {
    using SafeERC20 for IERC20;

    address public immutable sOHM;
    uint256 public immutable DECIMALS; // Decimals of OHM and sOHM

    bool public disableDeposits;
    bool public disableWithdaws;
    bool public disableRedeems;

    struct DonationInfo {
        address recipient;
        uint256 amount; // Total non-agnostic amount deposited
    }

    struct RecipientInfo {
        uint256 totalDebt; // Non-agnostic debt
        uint256 carry; // Total non-agnostic value donating to recipient
        uint256 agnosticAmount; // Total agnostic value of carry + debt
        uint256 indexAtLastChange; // Index when agnostic value changed
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    event Deposited(address _donor, address _recipient, uint256 _amount);
    event Withdrawn(address _donor, address _recipient, uint256 _amount);
    event AllWithdrawn(address _donor, uint256 _amount);
    event Redeemed(address _recipient, uint256 _amount);
    event EmergencyShutdown(bool active);

    constructor (
        address _sOHM
    ) {
        require(_sOHM != address(0));

        sOHM = _sOHM;
        DECIMALS = ERC20(_sOHM).decimals();

        disableDeposits = false;
        disableWithdaws = false;
        disableRedeems = false;
    }

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Deposit sOHM, records sender address and assign rebases to recipient
        @param _amount Amount of sOHM debt issued from donor to recipient
        @param _recipient Address to direct staking yield and vault shares to
    */
    function deposit(uint256 _amount, address _recipient) external override {
        require(disableDeposits == false, "Deposits currently disabled");
        require(_amount > 0, "Invalid deposit amount");
        require(_recipient != address(0), "Invalid recipient address");
        require(IERC20(sOHM).balanceOf(msg.sender) >= _amount, "Not enough sOHM");

        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), _amount);

        // Record donors's issued debt to recipient address
        DonationInfo[] storage info = donationInfo[msg.sender];
        int256 recipientIndex = _getRecipientIndex(msg.sender, _recipient);

        if(recipientIndex == -1) {
            info.push(DonationInfo({
                recipient: _recipient,
                amount: _amount
            }));
        } else {
            info[uint256(recipientIndex)].amount += _amount;
        }

        RecipientInfo storage recipient = recipientInfo[_recipient];

        // Calculate value carried over since last change
        uint256 index = IsOHM(sOHM).index();

        recipient.carry = redeemableBalance(_recipient);
        recipient.totalDebt += _amount;
        recipient.agnosticAmount = _toAgnostic(recipient.totalDebt + recipient.carry);
        recipient.indexAtLastChange = index;

        emit Deposited(msg.sender, _recipient, _amount);
    }


    /**
        @notice Withdraw donor's sOHM from vault and subtracts debt from recipient
        @param _amount sOHM amount to withdraw
        @param _recipient Recipient address
     */
    function withdraw(uint256 _amount, address _recipient) external override {
        require(disableWithdaws == false, "Withdraws currently disabled");
        DonationInfo[] storage donations = donationInfo[msg.sender];
        int256 recipientIndexSigned = _getRecipientIndex(msg.sender, _recipient);

        require(recipientIndexSigned >= 0, "No donations to recipient");

        uint256 recipientIndex = uint256(recipientIndexSigned);
        require(donations[recipientIndex].amount >= _amount, "Amount to withdraw is greater than deposited");

        donations[recipientIndex].amount -= _amount;

        if(donations[recipientIndex].amount == 0) {
            delete donations[recipientIndex];
        }

        RecipientInfo storage recipient = recipientInfo[_recipient];
        recipient.carry = redeemableBalance(_recipient);
        recipient.totalDebt -= _amount;
        recipient.agnosticAmount = _toAgnostic(recipient.totalDebt + recipient.carry);
        recipient.indexAtLastChange = IsOHM(sOHM).index();

        IERC20(sOHM).safeTransfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _recipient, _amount);
    }

    /**
        @notice Withdraw from all donor positions
     */
    function withdrawAll() external override {
        require(disableWithdaws == false, "Withdraws currently disabled");

        DonationInfo[] storage donations = donationInfo[msg.sender];
        require(donations.length != 0, "User not donating to anything");

        uint256 sohmIndex = IsOHM(sOHM).index();
        uint256 total = 0;

        for (uint256 index = 0; index < donations.length; index++) {
            DonationInfo memory donation = donations[index];
            total += donation.amount;

            RecipientInfo storage recipient = recipientInfo[donation.recipient];
            recipient.carry = redeemableBalance(donation.recipient);
            recipient.totalDebt -= donation.amount;
            recipient.agnosticAmount = _toAgnostic(recipient.totalDebt + recipient.carry);
            recipient.indexAtLastChange = sohmIndex;
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(sOHM).safeTransfer(msg.sender, total);

        emit AllWithdrawn(msg.sender, total);
    }

    /**
        @notice Get withdrawable sOHM amount for specific recipient
        TODO should this allow choosing donor (not default to msg.sender)?
     */
    function donationsTo(address _recipient) external override view returns ( uint256 ) {
        int256 recipientIndex = _getRecipientIndex(msg.sender, _recipient);
        require(recipientIndex >= 0, "No donations to recipient");

        return donationInfo[msg.sender][uint256(recipientIndex)].amount;
    }

    /**
        @notice Return total amount of user's sOHM being donated
     */
    function totalDonations() external override view returns ( uint256 ) {
        DonationInfo[] memory donations = donationInfo[msg.sender];
        require(donations.length != 0, "User is not donating");

        uint256 total = 0;
        for (uint256 index = 0; index < donations.length; index++) {
            total += donations[index].amount;
        }
        return total;
    }


    /************************
    * Recipient Functions
    ************************/

    /**
        @notice Get redeemable sOHM balance of a recipient address
     */
    function redeemableBalance(address _who) public override view returns (uint256) {
        RecipientInfo memory recipient = recipientInfo[_who];

        uint256 redeemable = _fromAgnostic(recipient.agnosticAmount)
            - _fromAgnosticAtIndex(recipient.agnosticAmount, recipient.indexAtLastChange)
            + recipient.carry;

        return redeemable;
    }

    /**
        @notice Redeem recipient's full donated amount of sOHM at current index
        @dev Note that a recipient redeeming their vault shares effectively pays back all
             sOHM debt to donors at the time of redeem. Any future incurred debt will
             be accounted for with a subsequent redeem or a withdrawal by the specific donor.
     */
    function redeem() external override {
        require(disableRedeems == false, "Redeems currently disabled");

        uint256 redeemable = redeemableBalance(msg.sender);
        require(redeemable > 0, "No redeemable balance");

        RecipientInfo storage recipient = recipientInfo[msg.sender];
        recipient.agnosticAmount = _toAgnostic(recipient.totalDebt);
        recipient.carry = 0;
        recipient.indexAtLastChange = IsOHM(sOHM).index();

        IERC20(sOHM).safeTransfer(msg.sender, redeemable);

        emit Redeemed(msg.sender, redeemable);
    }

    /************************
    * Utility Functions
    ************************/

    /**
        @notice Get array index of a particular recipient in a donor's donationInfo array.
        @return Array index of recipient address. If not present, return -1.
     */
    function _getRecipientIndex(address _donor, address _recipient) internal view returns (int256) {
        DonationInfo[] storage info = donationInfo[_donor];

        int256 existingIndex = -1;
        for (uint256 i = 0; i < info.length; i++) {
            if(info[i].recipient == _recipient) {
                existingIndex = int256(i);
                break;
            }
        }
        return existingIndex;
    }

    // TODO These can be replaced with wsOHM contract functions
    /**
        @notice Convert flat sOHM value to agnostic value at current index
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _toAgnostic(uint256 _amount) internal view returns ( uint256 ) {
        return _amount
            * (10 ** DECIMALS)
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnostic(uint256 _amount) internal view returns ( uint256 ) {
        return _amount
            * (IsOHM(sOHM).index())
            / (10 ** DECIMALS);
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnosticAtIndex(uint256 _amount, uint256 _index) internal view returns ( uint256 ) {
        return _amount
            * _index
            / (10 ** DECIMALS);
    }

    /************************
    * Emergency Functions
    ************************/

    function emergencyShutdown(bool _active) external onlyOwner {
        disableDeposits = _active;
        disableWithdaws = _active;
        disableRedeems = _active;
        emit EmergencyShutdown(_active);
    }

    function shutdownDeposits(bool _active) external onlyOwner {
        disableDeposits = _active;
    }

    function shutdownWithdrawals(bool _active) external onlyOwner {
        disableWithdaws = _active;
    }

    function shutdownRedeems(bool _active) external onlyOwner {
        disableRedeems = _active;
    }
}