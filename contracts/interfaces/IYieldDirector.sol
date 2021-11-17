// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface IYieldDirector {
	function deposit(uint amount_, address recipient_) external;
	function withdraw(uint amount_, address recipient_) external;
	function withdrawAll() external;
	function donationsTo(address donor_, address recipient_) external view returns ( uint256 );
	function totalDonations(address donor_) external view returns ( uint256 );
	function redeem() external;
	function redeemableBalance(address recipient_) external view returns ( uint256 );
}