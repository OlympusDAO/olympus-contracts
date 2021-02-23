// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "hardhat/console.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function burnFrom(address account_, uint256 amount_) external;

    function mint(address account_, uint256 ammount_) external;
}

/**
 * @dev Intended to act the controller for executing transactions for user seeking to buy or sell a mintableCurrency for a reserveCurrency as confrimed by the treasury.
 *  Implements functions to accept a payment token address for a desired token address to execute the transaction.
 *    Consults Treasury to confirm if a dicounted allotment is available.
 *    Completes as much of the transaction as possible using the descounted allotment from the Treasury.
 *    If no discounted allotment is available, or if proceeds remainf from buying discounted allotment will complete transaction using Sale module registered in the Treasury.
 *      Could be done using ERC1820 if there is time.
 */

contract Bursar {
    uint256 public totalOlyTokenToSellForTheNext8Hrs;
    uint256 public totalDAITokenToSellForTheNext8Hrs;
    uint256 public indicatorForTheNext8Hrs;

    address private OLY = 0xa2AAe53531752161D30E314ad7D25FBaaC3E6e27;

    address private DAI = 0x9Be2Bb1f46c3fE215F7359DCCa45F2dd2EA11a65;

    address private treasuryAddr = 0xa2AAe53531752161D30E314ad7D25FBaaC3E6e27;

    function setO(uint256 price) public {
        totalOlyTokenToSellForTheNext8Hrs = price;
    }

    function setD(uint256 price) public {
        totalDAITokenToSellForTheNext8Hrs = price;
    }

    function updateTokenToSellForTheNext8Hrs(
        uint256 amountToSell,
        uint256 indicator
    ) internal {
        if (indicator == 0) {
            indicatorForTheNext8Hrs = 0;
            totalOlyTokenToSellForTheNext8Hrs = amountToSell;

            if (totalDAITokenToSellForTheNext8Hrs > 0) {
                IERC20(DAI).transfer(
                    treasuryAddr,
                    totalDAITokenToSellForTheNext8Hrs
                );
            }

            totalDAITokenToSellForTheNext8Hrs = 0;
        }

        if (indicator == 1) {
            indicatorForTheNext8Hrs = 1;
            totalDAITokenToSellForTheNext8Hrs = amountToSell;

            if (totalOlyTokenToSellForTheNext8Hrs > 0) {
                IERC20(OLY).burnFrom(
                    address(this),
                    totalOlyTokenToSellForTheNext8Hrs
                );
            }

            totalOlyTokenToSellForTheNext8Hrs = 0;
        }
    }
}
