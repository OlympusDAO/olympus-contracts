// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
import "../libraries/Address.sol";
import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

import "../interfaces/IERC20.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IAllocator.sol";

import "../types/Ownable.sol";

interface IGroDepositHandler {
    // deposit DAI to Gro
    function depositPwrd(
        uint256[3] memory inAmounts,
        uint256 minAmount,
        address _referral
    ) external;
}

interface IGroWithdrawHandler {
    // withdraw DAI from Gro
    function withdrawAllSingle(
        bool pwrd,
        uint256 index,
        uint256 minAmount
    ) external;
}

/**
 *  Contract deploys reserves from treasury into the Gro
 */

contract GroDAIAllocator is Ownable {
    /* ======== DEPENDENCIES ======== */

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ======== STATE VARIABLES ======== */

    IGroDepositHandler public immutable groDepositHandler; // GRO deposit handler
    IGroWithdrawHandler public immutable groWithdrawHandler; // GRO withdraw handler
    ITreasury public immutable treasury;

    address public immutable DAI;

    uint256 public totalValueDeployed; // total RFV deployed into lending pool
    uint256 public deployed;
    uint256 public limit;
    uint256 public newLimit;
    uint256 public limitChangeTimelockEnd;
    uint256 public immutable timelockInBlocks; // timelock to raise deployment limit

    /* ======== CONSTRUCTOR ======== */

    constructor(
        address _treasury,
        address _groDepositHandler,
        address _groWithdrawHandler,
        address _DAI,
        uint256 _timelockInBlocks,
        uint256 _limit
    ) {
        require(_treasury != address(0));
        treasury = ITreasury(_treasury);

        require(_groDepositHandler != address(0));
        groDepositHandler = IGroDepositHandler(_groDepositHandler);

        require(_groWithdrawHandler != address(0));
        groWithdrawHandler = IGroWithdrawHandler(_groWithdrawHandler);

        require(_DAI != address(0));
        DAI = _DAI;

        timelockInBlocks = _timelockInBlocks;

        limit = _limit;
    }

    /* ======== POLICY FUNCTIONS ======== */

    /**
     *  @notice withdraws asset from treasury, deposits asset into Gro
     *  @param amount uint
     *  @param minAmount uint
     */
    function deposit(uint256 amount, uint256 minAmount) public onlyOwner {
        require(!exceedsLimit(amount)); // ensure deposit is within bounds

        treasury.manage(DAI, amount); // retrieve amount of asset from treasury

        // account for deposit
        uint256 value = treasury.tokenValue(DAI, amount);
        accountingFor(amount, value, true);

        IERC20(DAI).approve(address(groDepositHandler), amount); // approve Gro deposit handler to spend tokens

        groDepositHandler.depositPwrd([amount, 0, 0], minAmount, address(0)); // deposit into Gro
    }

    /**
     *  @notice withdraws DAI from Gro, then deposits asset into treasury
     *  @param minAmount uint
     */
    function withdraw(uint256 minAmount) public onlyOwner {
        groWithdrawHandler.withdrawAllSingle(true, 0, minAmount); // withdraw from Gro

        uint256 balance = IERC20(DAI).balanceOf(address(this)); // balance of asset withdrawn

        // account for withdrawal
        uint256 value = treasury.tokenValue(DAI, balance);
        accountingFor(balance, value, false);

        IERC20(DAI).approve(address(treasury), balance); // approve to deposit asset into treasury
        treasury.deposit(balance, DAI, value); // deposit using value as profit so no OHM is minted
    }

    /**
     *  @notice lowers max can be deployed for asset (no timelock)
     *  @param newMax uint
     */
    function lowerLimit(uint256 newMax) external onlyOwner {
        require(newMax < limit);
        require(newMax > deployed); // cannot set limit below what has been deployed already
        limit = newMax;
    }

    /**
     *  @notice starts timelock to raise max allocation for asset
     *  @param newMax uint
     */
    function queueRaiseLimit(uint256 newMax) external onlyOwner {
        limitChangeTimelockEnd = block.number.add(timelockInBlocks);
        newLimit = newMax;
    }

    /**
     *  @notice changes max allocation for asset when timelock elapsed
     */
    function raiseLimit() external onlyOwner {
        require(block.number >= limitChangeTimelockEnd, "Timelock not expired");
        require(limitChangeTimelockEnd != 0, "Timelock not started");

        limit = newLimit;
        newLimit = 0;
        limitChangeTimelockEnd = 0;
    }

    /* ======== INTERNAL FUNCTIONS ======== */

    /**
     *  @notice accounting of deposits/withdrawals of assets
     *  @param amount uint
     *  @param value uint
     *  @param add bool
     */
    function accountingFor(
        uint256 amount,
        uint256 value,
        bool add
    ) internal {
        if (add) {
            deployed = deployed.add(amount); // track amount allocated into pool

            totalValueDeployed = totalValueDeployed.add(value); // track total value allocated into pools
        } else {
            // track amount allocated into pool
            if (amount < deployed) {
                deployed = deployed.sub(amount);
            } else {
                deployed = 0;
            }

            // track total value allocated into pools
            if (value < totalValueDeployed) {
                totalValueDeployed = totalValueDeployed.sub(value);
            } else {
                totalValueDeployed = 0;
            }
        }
    }

    /* ======== VIEW FUNCTIONS ======== */

    /**
     *  @notice checks to ensure deposit does not exceed max allocation for asset
     *  @param amount uint
     */
    function exceedsLimit(uint256 amount) public view returns (bool) {
        uint256 willBeDeployed = deployed.add(amount);

        return (willBeDeployed > limit);
    }
}
