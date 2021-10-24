// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.4;

interface IYieldDirector {
	function deposit(uint _amount, address _recipient) external;
	function withdraw(uint _amount, address _recipient) external;
	function withdrawAll() external;
	function donationsTo(address _recipient) external view returns ( uint );
	function totalDonations() external view returns ( uint );
	function redeem() external;
	function redeemableBalance(address _who) external view returns (uint);
}