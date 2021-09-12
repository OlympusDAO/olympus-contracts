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
    @title TycheYieldDirector 
    @notice This contract allows users to stake their OHM and redirect their
            rebases to an address (or NFT). Users will be able to withdraw their
            principal stake at any time. Donation recipients can also withdraw at
            any time.
    @dev User's deposited stake is recorded as agnostic values (value / index) for the user,
         but recipient debt is recorded as non-agnostic OHM value.
 */
contract TycheYieldDirector is ERC20 {
    using SafeERC20 for IERC20;

	address public immutable staking;
    address public immutable OHM;
    address public immutable sOHM;

    struct DonationInfo {
        address recipient;
        // TODO can be packed
        uint amount; // total non-agnostic amount deposited
        uint agnosticAmount; // cumulative agnostic value deposited
    }

    struct RecipientInfo {
        // TODO can be packed
        uint totalDebt; // Non-agnostic debt
        uint agnosticAmount;
        uint indexAtRedeem;
    }

    mapping(address => DonationInfo[]) public donationInfo;
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
                amount: _amount,
                agnosticAmount: _toAgnostic(_amount)
            }));
        } else {
            info[uint(recipientIndex)].amount += _amount;
            info[uint(recipientIndex)].agnosticAmount += _toAgnostic(_amount);
        }

        // Add to receivers balance as agnostic value and debt as flat value
        recipientInfo[_recipient].agnosticAmount += _toAgnostic(_amount);
        recipientInfo[_recipient].totalDebt += _amount;
    }

    /**
        @notice Get withdrawable flat sOHM amount for specific recipient
     */
    function withdrawableBalance(address _recipient) external view returns ( uint ) {
        DonationInfo[] storage donation = donationInfo[msg.sender];
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
        DonationInfo[] storage info = donationInfo[msg.sender];

        int recipientIndexSigned = _getRecipientIndex(info, _recipient);
        require(recipientIndexSigned > 0, "No donations to recipient");

        uint recipientIndex = uint(recipientIndexSigned);

        // Subtract flat sOHM amount from donor's principal
        info[uint(recipientIndex)].amount -= _amount;

        // Delete recipient from donor info if donated amount is 0
        if(info[uint(recipientIndex)].amount == 0)
            delete info[uint(recipientIndex)];

        bool recipientHasRedeemed = recipientInfo[_recipient].totalDebt != 0;
        if(recipientHasRedeemed) {
            // Give donor rebases since recipient redeemed
            uint agnosticValueAtRedeem = _toAgnosticAtIndex(_amount, recipientInfo[_recipient].indexAtRedeem);
            uint withdrawalAmount = _toAgnostic(_amount) - agnosticValueAtRedeem + info[recipientIndex].amount;

            IERC20(sOHM).safeTransferFrom(address(this), msg.sender, withdrawalAmount);
        } else {
            // Subtract agnostic amount and debt from recipient
            recipientInfo[_recipient].totalDebt -= _amount;
            recipientInfo[_recipient].agnosticAmount -= _toAgnostic(_amount);

            IERC20(sOHM).safeTransferFrom(address(this), msg.sender, _amount);
        }
    }

    /**
        @notice Withdraw from all donor positions
     */
    function withdrawAll() external {
        DonationInfo[] storage info = donationInfo[msg.sender];
        require(info.length != 0, "User not donating to anything");

        uint total = 0;
        for (uint index = 0; index < info.length; index++) {
            // TODO does this save an SLOAD?
            DonationInfo storage donatedTo = info[index];
            total += donatedTo.amount;

            // Subtract from recipient debt
            recipientInfo[donatedTo.recipient].totalDebt -= donatedTo.amount;
            recipientInfo[donatedTo.recipient].agnosticAmount -= _toAgnostic(donatedTo.amount);
        }

        delete donationInfo[msg.sender];

        // Transfer donor's total sOHM from vault back to donor
        IERC20(sOHM).safeTransferFrom(address(this), msg.sender, total);
    }

    /**
        @notice Return total amount of user's sOHM being donated
     */
    function totalDonated() external view returns ( uint ) {
        DonationInfo[] storage info = donationInfo[msg.sender];
        require(info.length != 0, "User is not donating");

        uint total = 0;
        for (uint index = 0; index < info.length; index++) {
            total += info[index].amount;
        }
        return total;
    }


    /************************
    * Recipient Functions
    ************************/

    /**
        @notice Get redeemable flat sOHM balance of an address
     */
    function recipientBalance(address _who) external view returns (uint) {
        RecipientInfo storage info = recipientInfo[_who];

        uint redeemable = info.agnosticAmount - _toAgnostic(info.totalDebt);

        return IsOHM(sOHM).balanceOf(address(this)) - _fromAgnostic(redeemable);
    }

    /**
        @notice Redeem recipient's full donated amount of sOHM
     */
    function redeem() external {
        RecipientInfo storage recipient = recipientInfo[msg.sender];

        require(recipient.totalDebt == 0, "No claimable balance");

        uint redeemable = _fromAgnostic(recipient.agnosticAmount) - recipient.totalDebt;

        // Clear out recipient balance
        recipient.totalDebt = 0;
        recipient.agnosticAmount = 0;

        // Record index when recipient redeemed
        recipient.indexAtRedeem = IsOHM(sOHM).index();

        // Transfer sOHM to recipient
        IERC20(sOHM).safeTransfer(msg.sender, redeemable);
    }

    /************************
    * Conversion Functions
    ************************/
    /**
        @notice Calculate withdrawable amount based on recipient state
        @return 
     */
    // TODO

    /**
        @notice Get array index of a particular recipient in a donor's donationInfo array.
        @param info Reference to sender's donationInfo array
        @param _recipient Recipient address to look for in array
        @return Array index of recipient address. If not present, return -1.
     */
    function _getRecipientIndex(DonationInfo[] storage info, address _recipient) internal view returns (int) {
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

    /**
        @notice Agnostic value earns rebases. Agnostic value is amount / rebase_index
     */
    function _toAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (10 ** decimals())
            / (IsOHM(sOHM).index());
    }

    function _toAgnosticAtIndex(uint _amount, uint _index) internal view returns ( uint ) {
        return _amount
            * (10 ** decimals())
            / _index;
    }

    function _fromAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (IsOHM(sOHM).index())
            / (10 ** decimals());
    }
}