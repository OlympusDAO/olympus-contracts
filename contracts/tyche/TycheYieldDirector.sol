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
contract TycheYieldDirector is ERC20 {
    //using SafeMath for uint;
    using SafeERC20 for IERC20;

	address public immutable staking;
    address public immutable OHM;
    address public immutable sOHM;


    // Info for donation recipient
    struct RecipientInfo {
        uint totalDebt;
        uint agnosticValue;
    }

    struct DonorInfo {
        address recipient;
        uint amount;
    }

    // Donor principal amount
    mapping(address => mapping (address => uint)) public principal;
    //mapping(address => uint) public donorIndex;
    //DonorInfo[][] public donorInfo;
    mapping(address => DonorInfo[]) public donorInfo;

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
        //principal[msg.sender][_recipient] += _amount;

        DonorInfo[] storage info = donorInfo[msg.sender];

        // Record new donor info or update existing data
        int recipientIndex = _getRecipientIndex(info, _recipient);
        if(recipientIndex == -1) {
            info.push(DonorInfo({
                recipient: _recipient,
                amount: _amount
            }));
        } else {
            info[uint(recipientIndex)].amount += _amount;
        }

        // Add to receivers balance as agnostic value and debt as flat value
        recipientInfo[_recipient].agnosticValue += _toAgnostic(_amount);
        recipientInfo[_recipient].totalDebt += _amount;
    }

    /**
        @notice Withdraw donor's sOHM from vault and subtracts debt from recipient
        @param _amount Non-agnostic sOHM amount to withdraw
        @param _recipient Donee address
     */
    function withdraw(uint _amount, address _recipient) external {
        DonorInfo[] storage info = donorInfo[msg.sender];
        int recipientIndex = _getRecipientIndex(info, _recipient);
        require(recipientIndex > 0, "No donations to recipient");

        // Subtract agnostic amount and debt from recipient
        recipientInfo[_recipient].totalDebt -= _amount;
        recipientInfo[_recipient].agnosticValue -= _toAgnostic(_amount);

        // Subtract flat sOHM amount from donor's principal
        info[uint(recipientIndex)].amount -= _amount;

        // Delete recipient from donor info if amount is 0
        if(info[uint(recipientIndex)].amount == 0)
            delete info[uint(recipientIndex)];

        // Transfer sOHM from vault back to donor
        IERC20(sOHM).safeTransferFrom(address(this), msg.sender, _amount);
    }

    /**
        @notice Withdraw from all donor positions
     */
    function withdrawAll() external {
        DonorInfo[] storage info = donorInfo[msg.sender];
        require(info.length != 0, "User not donating to anything");

        uint total = 0;
        for (uint index = 0; index < info.length; index++) {
            // TODO check if this is actually more efficient
            DonorInfo storage donatedTo = info[index];
            total += donatedTo.amount;

            // Subtract from recipient debt
            recipientInfo[donatedTo.recipient].totalDebt -= donatedTo.amount;
            recipientInfo[donatedTo.recipient].agnosticValue -= _toAgnostic(donatedTo.amount);
        }

        delete donorInfo[msg.sender];

        // Transfer donor's total sOHM from vault back to donor
        IERC20(sOHM).safeTransferFrom(address(this), msg.sender, total);
    }

    /**
        @notice Return total amount of user's sOHM being donated
     */
    function totalDonated() external view returns ( uint ) {
        DonorInfo[] storage info = donorInfo[msg.sender];
        require(info.length != 0, "User not donating to anything");

        uint total = 0;
        for (uint index = 0; index < info.length; index++) {
            // TODO check if this is actually more efficient
            total += info[index].amount;
        }
        return total;
    }


    /************************
    * Donor Functions
    ************************/

    /**
        @notice Get redeemable flat sOHM balance of an address
     */
    function redeemableBalance(address _who) external view returns (uint) {
        RecipientInfo storage info = recipientInfo[_who];

        uint redeemable = info.agnosticValue - _toAgnostic(info.totalDebt);

        return IsOHM(sOHM).balanceOf(address(this)) - _fromAgnostic(redeemable);
    }

    /**
        @notice Redeem recipient's full amount of sOHM
     */
    function redeem() external {
        RecipientInfo storage info = recipientInfo[msg.sender];

        require(info.totalDebt == 0, "No claimable balance");

        uint redeemable = info.agnosticValue - _toAgnostic(info.totalDebt);

        // Clear out recipient balance
        info.totalDebt = 0;
        info.agnosticValue = 0;

        // Transfer sOHM to recipient
        IERC20(sOHM).safeTransfer(msg.sender, _fromAgnostic(redeemable));
    }

    function _getRecipientIndex(DonorInfo[] storage info, address _recipient) internal view returns( int ) {
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
        @notice Agnostic value maintains rebases. Agnostic value is amount / index
     */
    function _toAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (10 ** decimals())
            / (IsOHM(sOHM).index());
    }

    function _fromAgnostic(uint _amount) internal view returns ( uint ) {
        return _amount
            * (IsOHM(sOHM).index())
            / (10 ** decimals());
    }
}