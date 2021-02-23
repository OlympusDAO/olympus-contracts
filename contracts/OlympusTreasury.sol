// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "hardhat/console.sol";

import "../sale/Bursar.sol";
import "../../dependencies/holyzeppelin/contracts/datatypes/collections/EnumerableSet.sol";
import "../../dependencies/holyzeppelin/contracts/security/access/Ownable.sol";
import "../../dependencies/holyzeppelin/contracts/math/SafeMath.sol";

/**
 * @dev Intended to act as the treasury for Olympus.
 *  Intended to be able to mint any currency set by governance and controlled through Ownable.
 *    Confirms it's ownership when Governance adds token.
 *  Tracks it's approved balance of all governance approved reserve currencies.
 *  Implemeents a function that returns the intrinsic value of a mintable currency and a reservcurrency
 *  Implements a function that checks the TWAP Oracle when calculating a mintQuote to determine if it should update its mint or burn allotment for the epoch.
 *    Will calculate new allotment when the epoch has ended, but it has not updated the lastEpochTimestamp since that end.
 *  Implements view function check if supply adjustment transaction is available. This is intended to be the quote function.
 */

contract Treasury is Ownable, Bursar {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal _mintableCurrencies;

    EnumerableSet.AddressSet internal _reserveCurrencies;

    EnumerableSet.AddressSet internal _approvedSender;

    uint256 public lastTWAP;
    uint256 public totalSupply;
    uint256 public amountToSellForTheNext8Hrs;
    uint256 public icv;
    uint256 public dcv;
    uint256 public lastEpoch;

    address public bursarContract;
    address public DAI;
    address public OLY;

    mapping(address => uint256) public reserveCurrencyAddressForApprovedBalance;

    constructor() {}

    function getIV(address _token) private view returns (uint256 IV) {
        IV = reserveCurrencyAddressForApprovedBalance[_token].div(totalSupply);
    }

    function setBursarAddress(address addr) external {
        bursarContract = addr;
    }

    function setIcv(uint256 input) external {
        icv = input;
    }

    function setDcv(uint256 input) external {
        dcv = input;
    }

    function updateTWAP() internal {
        uint256 result; //gotten from oracle
        lastTWAP = result;
    }

    function addMMintableCurrency(address _token) external onlyOwner() {
        _mintableCurrencies.add(_token);
    }

    function removeMintableCurrency(address _token) external onlyOwner() {
        _mintableCurrencies.remove(_token);
    }

    function isMintableCurrency(address _token) public view returns (bool) {
        return _mintableCurrencies.contains(_token);
    }

    function addReserveCurrency(address _token) external onlyOwner() {
        _reserveCurrencies.add(_token);
    }

    function removeReserveCurrency(address _token) external onlyOwner() {
        _reserveCurrencies.remove(_token);
    }

    function isReserveCurrency(address _token) public view returns (bool) {
        return _reserveCurrencies.contains(_token);
    }

    function addSender(address _token) external onlyOwner() {
        _approvedSender.add(_token);
    }

    function removeSender(address _token) external onlyOwner() {
        _approvedSender.remove(_token);
    }

    function isSender(address _token) public view returns (bool) {
        return _approvedSender.contains(_token);
    }

    function deposit(address _token, uint256 amount) external {
        require(
            isReserveCurrency(_token) && isSender(msg.sender),
            "token or sender is not approved"
        );
        uint256 approvedBalance =
            reserveCurrencyAddressForApprovedBalance[_token];
        approvedBalance = approvedBalance.add(amount);
        //dai is transferred from busar contract

        if (block.number >= lastEpoch) {
            startNewEpoch(_token);
        }
    }

    function startNewEpoch(address _token) private {
        updateTWAP();
        mintOrBurnOly(_token, totalSupply);
        lastEpoch = block.number.add(8 hours);
    }

    function mintOrBurnOly(address _token, uint256 _totalSupply) private {
        if (lastTWAP > getIV(_token)) {
            amountToSellForTheNext8Hrs = (
                (lastTWAP - getIV(_token)).mul(_totalSupply)
            )
                .mul(icv);
            IERC20(OLY).mint(bursarContract, amountToSellForTheNext8Hrs);
            uint256 indicator = 0;
            updateTokenToSellForTheNext8Hrs(
                amountToSellForTheNext8Hrs,
                indicator
            );
        } else {
            int256 amount =
                int256(((lastTWAP - getIV(_token)).mul(_totalSupply)).mul(dcv));
            amountToSellForTheNext8Hrs = uint256(amount * (-1));
            IERC20(DAI).transfer(bursarContract, amountToSellForTheNext8Hrs);
            uint256 approvedBalance =
                reserveCurrencyAddressForApprovedBalance[_token];
            approvedBalance = approvedBalance.sub(amountToSellForTheNext8Hrs);
            uint256 indicator = 1;
            updateTokenToSellForTheNext8Hrs(
                amountToSellForTheNext8Hrs,
                indicator
            );
            //burn of leftovers from last epoch (if any) is done in busar contract
        }
    }
}
