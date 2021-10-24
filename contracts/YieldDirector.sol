// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

//import "./types/ERC20.sol";
//import "./types/Ownable.sol";
//import "./libraries/SafeERC20.sol";
import "./interfaces/IYieldDirector.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// TODO replace with sOHM interface file
interface IsOHM {
    function rebase( uint256 ohmProfit_, uint epoch_) external returns (uint256);
    function circulatingSupply() external view returns (uint256);
    function balanceOf(address who) external view returns (uint256);
    function gonsForBalance( uint amount ) external view returns ( uint );
    function balanceForGons( uint gons ) external view returns ( uint );
    function index() external view returns ( uint );
}

/**
    @title YieldDirector (codename Tyche) 
    @notice This contract allows donors to deposit their sOHM and donate their rebases
            to any address. Donors will be able to withdraw their principal
            sOHM at any time. Donation recipients can also redeem accrued rebases at any time.
 */
contract YieldDirector is Ownable, IYieldDirector {
    using SafeERC20 for IERC20;

    address public immutable OHM;
    address public immutable sOHM;
    uint public immutable DECIMALS; // Decimals of OHM and sOHM

    bool public disableDeposits;
    bool public disableWithdaws;
    bool public disableRedeems;

    struct DonationInfo {
        address recipient;
        uint amount; // Total non-agnostic amount deposited
    }

    struct RecipientInfo {
        uint totalDebt; // Non-agnostic debt
        uint carry; // Total non-agnostic value donating to recipient
        uint agnosticAmount; // Total agnostic value of carry + debt
        uint indexAtLastChange; // Index when agnostic value changed
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    event Deposited(address _donor, address _recipient, uint _amount);
    event Withdrawn(address _donor, address _recipient, uint _amount);
    event AllWithdrawn(address _donor, uint _amount);
    event Redeemed(address _recipient, uint _amount);
    event EmergencyShutdown(bool active);

    constructor (
        address _OHM, 
        address _sOHM
    ) {
        require(_OHM != address(0));
        require(_sOHM != address(0));

        OHM = _OHM;
        sOHM = _sOHM;
        DECIMALS = ERC20(_sOHM).decimals();
    }

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Deposit sOHM, records sender address and assign rebases to recipient
        @param _amount Amount of sOHM debt issued from donor to recipient
        @param _recipient Address to direct staking yield and vault shares to
    */
    function deposit(uint _amount, address _recipient) external override {
        require(disableDeposits == false, "Deposits currently disabled");
        require(_amount > 0, "Invalid deposit amount");
        require(_recipient != address(0), "Invalid recipient address");
        require(IERC20(sOHM).balanceOf(msg.sender) >= _amount, "Not enough sOHM");

        // Transfer sOHM to this contract
        IERC20(sOHM).safeTransferFrom(msg.sender, address(this), _amount);

        // Record donors's issued debt to recipient address
        DonationInfo[] storage info = donationInfo[msg.sender];
        int recipientIndex = _getRecipientIndex(msg.sender, _recipient);

        if(recipientIndex == -1) {
            info.push(DonationInfo({
                recipient: _recipient,
                amount: _amount
            }));
        } else {
            info[uint(recipientIndex)].amount += _amount;
        }

        RecipientInfo storage recipient = recipientInfo[_recipient];

        // Calculate value carried over since last change
        uint index = IsOHM(sOHM).index();

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
    function withdraw(uint _amount, address _recipient) external override {
        require(disableWithdaws == false, "Withdraws currently disabled");
        DonationInfo[] storage donations = donationInfo[msg.sender];
        int recipientIndexSigned = _getRecipientIndex(msg.sender, _recipient);

        require(recipientIndexSigned >= 0, "No donations to recipient");

        uint recipientIndex = uint(recipientIndexSigned);
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

        uint sohmIndex = IsOHM(sOHM).index();
        uint total = 0;

        for (uint index = 0; index < donations.length; index++) {
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
    function donationsTo(address _recipient) external override view returns ( uint ) {
        int recipientIndex = _getRecipientIndex(msg.sender, _recipient);
        require(recipientIndex >= 0, "No donations to recipient");

        return donationInfo[msg.sender][uint(recipientIndex)].amount;
    }

    /**
        @notice Return total amount of user's sOHM being donated
     */
    function totalDonations() external override view returns ( uint ) {
        DonationInfo[] memory donations = donationInfo[msg.sender];
        require(donations.length != 0, "User is not donating");

        uint total = 0;
        for (uint index = 0; index < donations.length; index++) {
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
    function redeemableBalance(address _who) public override view returns (uint) {
        RecipientInfo memory recipient = recipientInfo[_who];

        uint redeemable = _fromAgnostic(recipient.agnosticAmount)
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

        uint redeemable = redeemableBalance(msg.sender);
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
    function _getRecipientIndex(address _donor, address _recipient) internal view returns (int) {
        DonationInfo[] storage info = donationInfo[_donor];

        int existingIndex = -1;
        for (uint i = 0; i < info.length; i++) {
            if(info[i].recipient == _recipient) {
                existingIndex = int(i);
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
    function _toAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (10 ** DECIMALS)
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (IsOHM(sOHM).index())
            / (10 ** DECIMALS);
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnosticAtIndex(uint _amount, uint _index) internal view returns ( uint ) {
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