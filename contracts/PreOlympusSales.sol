// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "hardhat/console.sol";


import "../../dependencies/holyzeppelin/contracts/math/SafeMath.sol";
import "../../dependencies/holyzeppelin/contracts/security/access/Ownable.sol";
import "../../dependencies/holyzeppelin/contracts/token/ERC20/libraries/SafeERC20.sol";

contract PreOlympusSales is Ownable {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event SaleStarted( address indexed activator, uint256 timestamp );
  event SaleEnded( address indexed activator, uint256 timestamp );
  event SellerApproval( address indexed approver, address indexed seller, string indexed message );

  IERC20 public dai;

  IERC20 public pOly;

  address private _saleProceedsAddress;

  uint256 public pOlyPrice;

  bool public initialized;

  mapping( address => bool ) public approvedBuyers;

  constructor() {}
    
  function initialize( 
    address pOly_, 
    address dai_,
    uint256 pOlyPrice_,
    address saleProceedsAddress_
  ) external onlyOwner {
    console.log( "Contract:PreOlympusToken:initialize:1 Checking is contract has already been initialized." );
    require( !initialized );
    console.log( "Contract:PreOlympusToken:initialize:2 Contract is initialized.", initialized );

    console.log( "Contract:PreOlympusToken:initialize:3 Setting pOly address to %s.", pOly_ );
    pOly = IERC20( pOly_ );
    console.log( "Contract:PreOlympusToken:initialize:4 Set pOly address to %s.", address(pOly) );
    
    console.log( "Contract:PreOlympusToken:initialize:5 Setting dai address to %s.", dai_ );
    dai = IERC20( dai_ );
    console.log( "Contract:PreOlympusToken:initialize:6 Set dai address to %s.", address(dai) );

    console.log( "Contract:PreOlympusToken:initialize:7 Seting pOly price %s.", pOlyPrice_ );
    pOlyPrice = pOlyPrice_;
    console.log( "Contract:PreOlympusToken:initialize:8 Set pOly price to %s.", pOlyPrice );
    
    console.log( "Contract:PreOlympusToken:initialize:9 Setting sales proceeds address to %s.", saleProceedsAddress_ );
    _saleProceedsAddress = saleProceedsAddress_;
    console.log( "Contract:PreOlympusToken:initialize:10 Set sales proceeds address to %s.", _saleProceedsAddress );
    
    console.log( "Contract:PreOlympusToken:initialize:11 Returning true to indicated success." );
    initialized = true;
  }

  function setPOlyPrice( uint256 newPOlyPrice_ ) external onlyOwner() returns ( uint256 ) {
    console.log( "Contract:PreOlympusToken:setPOlyPrice:1 Setting pOlyPrice to %s.", newPOlyPrice_ );
    pOlyPrice = newPOlyPrice_;
    console.log( "Contract:PreOlympusToken:setPOlyPrice:2 Set pOlyPrice to %s.", pOlyPrice );
    console.log( "Contract:PreOlympusToken:setPOlyPrice:3 Returning new pOlyPrice." );
    return pOlyPrice;
  }

  function _approveBuyer( address newBuyer_ ) internal onlyOwner() returns ( bool ) {
    console.log( "Contract:PreOlympusToken:approveBuyer:1 Approving %s to buy POly.", newBuyer_ );
    approvedBuyers[newBuyer_] = true;
    console.log( "Contract:PreOlympusToken:approveBuyer:2 Approved %s to buy POly; %s.", newBuyer_, approvedBuyers[newBuyer_] );
    console.log( "Contract:PreOlympusToken:approveBuyer:3 Returning new approval." );
    return approvedBuyers[newBuyer_];
  }

  function approveBuyer( address newBuyer_ ) external onlyOwner() returns ( bool ) {
    console.log( "Contract:PreOlympusToken:approveBuyer:1 Approving %s to buy POly from external call.", newBuyer_ );
    return _approveBuyer( newBuyer_ );
  }

  function approveBuyers( address[] calldata newBuyers_ ) external onlyOwner() returns ( uint256 ) {
    console.log( "Contract:PreOlympusToken:approveBuyer:1 Approving %s buyers to buy POly.", newBuyers_.length );
    for( uint256 iteration_ = 0; newBuyers_.length > iteration_; iteration_++ ) {
      _approveBuyer( newBuyers_[iteration_] );
    }
    console.log( "Contract:PreOlympusToken:approveBuyer:2 Approved %s to buy POly; %s.", newBuyers_.length );
    console.log( "Returning total number of approved buyers." );
    return newBuyers_.length;
  }

  function _calculateAmountPurchased( uint256 amountPaid_ ) internal returns ( uint256 ) {
    console.log( "Contract:PreOlympusToken:_calculateAmountPurchased:1 %s POly bought based on %s paid.", amountPaid_.mul( pOlyPrice ), amountPaid_ );
    return amountPaid_.mul( pOlyPrice );
  }

  function buyPOly( uint256 amountPaid_ ) external returns ( bool ) {
    console.log( "Contract::PreOlympusSale::buyPoly:1 Checking that buyer is approved." );
    require( approvedBuyers[msg.sender], "Buyer not approved." );
    console.log( "Contract::PreOlympusSale::buyPoly:2 Checked that buyer is approved." );

    console.log( "Contract::PreOlympusSale::buyPoly:3 %s is paying %s DAI to buy pOly at price.", msg.sender, amountPaid_, pOlyPrice );
    uint256 pOlyAmountPurchased_ = _calculateAmountPurchased( amountPaid_ );
    console.log( "Contract::PreOlympusSale::buyPoly:4 %s is buying %s poly with %s DAI.", msg.sender, pOlyAmountPurchased_, amountPaid_ );

    // console.log( "Contract::PreOlympusSale::buyPoly:5 Deducting %s from approved purchase amount of %s for buyer %s.", msg.sender, pOlyAmountPurchased_, amountPaid_ );
    // approvedPurchaseAmount[msg.sender] = approvedPurchaseAmount[msg.sender].sub( pOlyAmountPurchased_ );
    // console.log( "Contract::PreOlympusSale::buyPoly:6 Buyer now approved to buy % POly.", approvedPurchaseAmount[msg.sender] );

    console.log( "Contract::PreOlympusSale::buyPoly:7 Sale proceeds address DAI balance before transfering payment is %s.", dai.balanceOf( _saleProceedsAddress ) );
    console.log( "Contract::PreOlympusSale::buyPoly:8 Buyer address DAI balance before transfering payment is %s.", dai.balanceOf( msg.sender ) );
    console.log( "Contract::PreOlympusSale::buyPoly:9 Attempting to trasfer %s DAI from buyer by %s to %s.", amountPaid_, address( this ), _saleProceedsAddress );
    dai.safeTransferFrom( msg.sender, _saleProceedsAddress, amountPaid_ );
    console.log( "Contract::PreOlympusSale::buyPoly:10 Trasfered %s DAI frombuyer by %s to %s.", amountPaid_, address( this ), _saleProceedsAddress );
    console.log( "Contract::PreOlympusSale::buyPoly:11 Sale proceeds address DAI balance after transfering payment is %s.", dai.balanceOf( _saleProceedsAddress ) );
    console.log( "Contract::PreOlympusSale::buyPoly:12 Buyer address DAI balance after transfering payment is %s.", dai.balanceOf( msg.sender ) );

    console.log( "Contract::PreOlympusSale::buyPoly:13 Buyer address pOly balance before transfering payment is %s.", dai.balanceOf( _saleProceedsAddress ) );
    console.log( "Contract::PreOlympusSale::buyPoly:14 Attempting to transfer %s pOLY from %s to %s.", amountPaid_, address( this ), msg.sender );
    pOly.safeTransfer( msg.sender, pOlyAmountPurchased_ );
    console.log( "Contract::PreOlympusSale::buyPoly:15 Transfered %s pOLY from %s to %s.", amountPaid_, address( this ), msg.sender );
    console.log( "Contract::PreOlympusSale::buyPoly:16 Buyer address pOly balance after transfering DAI is %s.", pOly.balanceOf(  msg.sender ) );

    console.log( "Contract::PreOlympusSale::buyPoly:17 Returning true to indicate success." );
    return true;
  }

  function withdrawTokens( address tokenToWithdraw_ ) external onlyOwner() returns ( bool ) {
    console.log( "Contract::PreOlympusSale::withdrawTokens:1 Withdrawing %s of token %s." );
    IERC20( tokenToWithdraw_ ).safeTransfer( msg.sender, IERC20( tokenToWithdraw_ ).balanceOf( address( this ) ) );
    console.log( "Contract::PreOlympusSale::withdrawTokens:2 Withdrew %s of token %s." );
    
    console.log( "Contract::PreOlympusSale::withdrawTokens:3 Returning true to indicate success." );
    return true;
  }
} 