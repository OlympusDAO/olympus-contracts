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
    using SafeMath for uint;
    using SafeERC20 for IERC20;

	address public immutable staking;
    address public immutable OHM;
    address public immutable sOHM;

    //mapping(address => uint) public principal;
    mapping(address => mapping (address => uint)) public principal;
    //mapping(address => address) public receiver;
    mapping(address => uint) public totalDebt;

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
        @notice Stakes OHM, records sender address and redirects yield to recipient
        @param _principal Amount of sOHM debt issued by user and owed by receiver
        @param _receiver Address to direct staking yield to
     */
    function redirectTo(uint _principal, address _receiver) external returns ( bool ) {
        require(_principal > 0, "Invalid deposit amount");
        require(_receiver != address(0), "Invalid recipient address");
        require(IERC20(sOHM).balanceOf(msg.sender) < _principal, "Not enough sOHM");

        uint agnosticValue = toAgnostic(_principal);

        // Record user's initial stake amount as flat value
        principal[msg.sender][_receiver] = principal[msg.sender][_receiver] + agnosticValue;

        // Add to receivers debt as flat value (for cross-reference)
        totalDebt[_receiver] = totalDebt[_receiver] + _principal;

        // TODO Stake donor's OHM on behalf of receiver (maybe not necessary if using sOHM)

        // Transfer sOHM to this contract
        IERC20(OHM).transferFrom(msg.sender, address(this), _principal);

        // TODO Issue vault shares to recipient

        return true;
    }

    /**
        @notice Get claimable balance of an address
     */
    function claimableBalance(address _who) public view returns (uint) {
        require(totalDebt[_who] == 0, "No claimable balance");

        return IsOHM(sOHM).balanceOf(address(this)) - toAgnostic(totalDebt[_who]);
    }

    function claim(address _who) public returns (uint) {
        require(totalDebt[_who] == 0, "No claimable balance");
        // TODO
    }

    function toAgnostic( uint amount_ ) public view returns ( uint ) {
        return amount_
            .mul( 10 ** decimals() )
            .div( IsOHM(sOHM).index() );
     }

     function fromAgnostic( uint amount_ ) public view returns ( uint ) {
        return amount_
            .mul( IsOHM(sOHM).index() )
            .div( 10 ** decimals() );
     }
}