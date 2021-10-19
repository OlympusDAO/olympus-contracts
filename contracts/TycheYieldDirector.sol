// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

//import "./types/ERC20.sol";
//import "./types/Ownable.sol";
//import "./libraries/SafeERC20.sol";
//import "./libraries/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//import "./interfaces/IsOHM.sol";

import "hardhat/console.sol";

interface IsOHM {
    function rebase( uint256 ohmProfit_, uint epoch_) external returns (uint256);
    function circulatingSupply() external view returns (uint256);
    function balanceOf(address who) external view returns (uint256);
    function gonsForBalance( uint amount ) external view returns ( uint );
    function balanceForGons( uint gons ) external view returns ( uint );
    function index() external view returns ( uint );
}

/**
    @title TycheYieldDirector 
    @notice This contract allows users to stake their OHM and redirect their
            rebases to an address (or NFT). Users will be able to withdraw their
            principal stake at any time. Donation recipients can also withdraw at
            any time.
    @dev User's deposited stake is recorded as agnostic values (value / index) for the user,
         but recipient debt is recorded as non-agnostic OHM value.
 */
contract TycheYieldDirector {
    using SafeERC20 for IERC20;
    //using SafeMath for uint;

    //address public immutable staking;
    address public immutable OHM;
    address public immutable sOHM;

    uint public immutable DECIMALS; // Decimals of OHM and sOHM

    struct DonationInfo {
        address recipient;
        // TODO can be packed
        uint amount; // total non-agnostic amount deposited
    }

    struct RecipientInfo {
        // TODO can be packed
        uint totalDebt; // Non-agnostic debt
        uint carry; // Total non-agnostic value donating to recipient
        uint agnosticAmount; // Total agnostic value of carry + debt
        uint indexAtLastChange; // Index when agnostic value changed
        uint firstEpoch;
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    event Deposited(address _donor, address _recipient, uint _amount);
    event Withdrawal(address _donor, address _recipient, uint _amount);
    event Redeemed(address _recipient, uint _amount);

    constructor (
        address _OHM, 
        address _sOHM
    ) {
        require(_OHM != address(0));
        require(_sOHM != address(0));
        // TODO add governance address

        OHM = _OHM;
        sOHM = _sOHM;
        DECIMALS = 10 ** ERC20(_sOHM).decimals();
    }

    /************************
    * Donor Functions
    ************************/

    /**
        @notice Stakes OHM, records sender address and issue shares to recipient
        @param _amount Amount of sOHM debt issued from donor to recipient
        @param _recipient Address to direct staking yield and vault shares to
    */
    function deposit(uint _amount, address _recipient) external {
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
        @notice Get withdrawable flat sOHM amount for specific recipient
        TODO should this allow choosing donor (not default to msg.sender)?
     */
    function withdrawableBalance(address _recipient) external view returns ( uint ) {
        int recipientIndex = _getRecipientIndex(msg.sender, _recipient);
        require(recipientIndex >= 0, "No donations to recipient");

        return donationInfo[msg.sender][uint(recipientIndex)].amount;
    }

    // TODO
    function _withdrawable(address _donor, address _recipient) internal view returns ( uint ) {
        int recipientIndex = _getRecipientIndex(_donor, _recipient);
        require(recipientIndex >= 0, "No donations to recipient");

        return donationInfo[_donor][uint(recipientIndex)].amount;
    }

    /**
        @notice Withdraw donor's sOHM from vault and subtracts debt from recipient
        @param _amount Non-agnostic sOHM amount to withdraw
        @param _recipient Donee address
        @dev note on withdrawal:
            Agnostic value of _amount is different from when it was deposited. The remaining
            amount is left with the recipient so they can keep receiving rebases on the remaining amount.
     */
    function withdraw(uint _amount, address _recipient) external {
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

        emit Withdrawal(msg.sender, _recipient, _amount);
    }

    /**
        @notice Withdraw from all donor positions
     */
     // TODO Update with new withdrawal logic
    function withdrawAll() external {
        DonationInfo[] storage donations = donationInfo[msg.sender];
        require(donations.length != 0, "User not donating to anything");

        uint total = 0;
        for (uint index = 0; index < donations.length; index++) {
            DonationInfo memory donation = donations[index];
            total += donation.amount;

            // Subtract from recipient debts if recipient has not redeemed
            if(recipientInfo[donation.recipient].totalDebt > 0) {
                recipientInfo[donation.recipient].totalDebt -= donation.amount;
            }
            recipientInfo[donation.recipient].agnosticAmount -= _toAgnostic(donation.amount);
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(sOHM).safeTransfer(msg.sender, total);
        // TODO emit `WithdrawAll` event
    }

    /**
        @notice Return total amount of user's sOHM being donated
     */
    function totalDonations() external view returns ( uint ) {
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
        @notice Get redeemable flat sOHM balance of a recipient address
     */
    function redeemableBalance(address _who) public view returns (uint) {
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
    function redeem() external {
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
            * DECIMALS
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert agnostic value at current index to flat sOHM value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (IsOHM(sOHM).index())
            / DECIMALS;
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnosticAtIndex(uint _amount, uint _index) internal view returns ( uint ) {
        return _amount
            * _index
            / DECIMALS;
    }
}