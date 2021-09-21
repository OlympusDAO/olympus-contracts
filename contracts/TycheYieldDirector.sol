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

    struct DonationInfo {
        address recipient;
        // TODO can be packed
        uint amount; // total non-agnostic amount deposited
    }

    struct RecipientInfo {
        // TODO can be packed
        uint totalDebt; // Non-agnostic debt
        uint agnosticAmount;
        uint indexAtLastRedeem;
    }

    mapping(address => DonationInfo[]) public donationInfo;
    mapping(address => RecipientInfo) public recipientInfo;

    // TODO Add events
    event Deposit();
    event Withdrawal();
    event Redeem();

    constructor (
		//address _staking,
        address _OHM, 
        address _sOHM
    ) {
        //require(_staking != address(0));
        require(_OHM != address(0));
        require(_sOHM != address(0));
        // TODO add governance address

        OHM = _OHM;
        sOHM = _sOHM;
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

        int recipientIndex = _getRecipientIndex(info, _recipient);
        if(recipientIndex == -1) {
            info.push(DonationInfo({
                recipient: _recipient,
                amount: _amount
            }));
        } else {
            info[uint(recipientIndex)].amount += _amount;
        }

        // Add to receivers balance as agnostic value and debt as flat value
        recipientInfo[_recipient].agnosticAmount += _toAgnostic(_amount);
        recipientInfo[_recipient].totalDebt += _amount;
    }

    /**
        @notice Get withdrawable flat sOHM amount for specific recipient
     */
    function withdrawableBalance(address _recipient) external view returns ( uint ) {
        DonationInfo[] memory donation = donationInfo[msg.sender];
        int recipientIndex = _getRecipientIndex(donation, _recipient);
        require(recipientIndex > 0, "No donations to recipient");

        return donation[uint(recipientIndex)].amount;
    }

    /**
        @notice Withdraw donor's sOHM from vault and subtracts debt from recipient
        @param _amount Non-agnostic sOHM amount to withdraw
        @param _recipient Donee address
     */
    function withdraw(uint _amount, address _recipient) external {
        DonationInfo[] storage donations = donationInfo[msg.sender];

        int recipientIndexSigned = _getRecipientIndex(donations, _recipient);
        require(recipientIndexSigned > 0, "No donations to recipient");

        uint recipientIndex = uint(recipientIndexSigned);

        // Subtract flat sOHM amount from donor's principal
        donations[recipientIndex].amount -= _amount;

        // Delete recipient from donor info if donated amount is 0
        if(donations[recipientIndex].amount == 0)
            delete donations[recipientIndex];

        // Subtract agnostic amount and debt from recipient if they have not yet redeemed
        if(recipientInfo[_recipient].totalDebt > 0) {
            recipientInfo[_recipient].totalDebt -= _amount;
            recipientInfo[_recipient].agnosticAmount -= _toAgnostic(_amount);
        }

        IERC20(sOHM).safeTransferFrom(address(this), msg.sender, _amount);
    }


    /**
        @notice Withdraw from all donor positions
     */
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
                recipientInfo[donation.recipient].agnosticAmount -= _toAgnostic(donation.amount);
            }
        }

        // Delete donor's entire donations array
        delete donationInfo[msg.sender];

        IERC20(sOHM).safeTransferFrom(address(this), msg.sender, total);
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
        @notice Get redeemable flat sOHM balance of an address
     */
    function recipientBalance(address _who) public view returns (uint) {
        RecipientInfo memory recipient = recipientInfo[_who];

        uint redeemable = _fromAgnostic(recipient.agnosticAmount)
            - _fromAgnosticAtIndex(recipient.agnosticAmount, recipient.indexAtLastRedeem)
            - recipient.totalDebt;

        return redeemable;
    }

    /**
        @notice Redeem recipient's full donated amount of sOHM at current index
        @dev Note that a recipient redeeming their vault shares effectively pays back all
             sOHM debt to donors at the time of redeem. Any future incurred debt will
             be accounted for with a subsequent redeem or a withdrawal by the specific donor.
     */
    function redeem() external {
        RecipientInfo storage recipient = recipientInfo[msg.sender];

        require(recipient.totalDebt == 0, "No claimable balance");

        uint redeemable = recipientBalance(msg.sender);

        // Clear out recipient balance
        recipient.totalDebt = 0;
        recipient.agnosticAmount = 0;

        // Record index when recipient redeemed
        recipient.indexAtLastRedeem = IsOHM(sOHM).index();

        // Transfer sOHM to recipient
        IERC20(sOHM).safeTransfer(msg.sender, redeemable);
    }

    /************************
    * Conversion Functions
    ************************/

    /**
        @notice Get array index of a particular recipient in a donor's donationInfo array.
        @param info Reference to sender's donationInfo array
        @param _recipient Recipient address to look for in array
        @return Array index of recipient address. If not present, return -1.
     */
    function _getRecipientIndex(DonationInfo[] memory info, address _recipient) internal pure returns (int) {
        int existingIndex = -1;
        for (uint i = 0; i < info.length; i++) {
            if(info[i].recipient == _recipient) {
                existingIndex = int(i);
                break;
            }
        }
        return existingIndex;
    }

    /************************
    * Conversion Functions
    ************************/

    // TODO These can be replaced with wsOHM contract functions

    /**
        @notice Convert flat sOHM value to agnostic value at current index
        @param _amount Non-agnostic value to convert from

        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _toAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (10 ** ERC20(sOHM).decimals())
            / (IsOHM(sOHM).index());
    }

    /**
        @notice Convert flat sOHM value to agnostic value at current index
        @param _amount Agnostic value to convert from

        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (IsOHM(sOHM).index())
            / (10 ** ERC20(sOHM).decimals());
    }

    /**
        @notice Convert flat sOHM value to agnostic value at a given index value
        @param _amount Amount of sOHM to convert
        @param _index Index used for conversion to agnostic value

        @dev Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _fromAgnosticAtIndex(uint _amount, uint _index) internal view returns ( uint ) {
        return _amount
            * _index
            / (10 ** ERC20(sOHM).decimals());
    }
}