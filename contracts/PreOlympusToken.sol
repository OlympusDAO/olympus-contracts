// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "hardhat/console.sol";

import "../../abstract/Divine.sol";
import "../../dependencies/holyzeppelin/contracts/math/SafeMath.sol";

contract PreOlympusToken is Divine {

  using SafeMath for uint256;

  bool public requireSellerApproval;
  bool public allowMinting;

  mapping( address => bool ) public isApprovedSeller;
    
  constructor() Divine( "PreOlympus", "pOLY", 18 ) {
    console.log("Contract::PreOlympusToken::constructor:1 Instantiating PreOlympusToken");

    console.log("Contract::PreOlympusToken::constructor:2 Setting initial supply for later minting.");
    uint256 initialSupply_ = 1000000000 * 1e18;
    console.log("Contract::PreOlympusToken::constructor:3 Set initial supply to %s for later minting.", initialSupply_ );

    console.log("Contract::PreOlympusToken::constructor:4 Setting requireSellerApproval.");
    requireSellerApproval = true;
    console.log("Contract::PreOlympusToken::constructor:5 Set requireSellerApproval to %s.", requireSellerApproval );

    console.log("Contract::PreOlympusToken::constructor:6 Setting allowMinting.");
    allowMinting = true;
    console.log("Contract::PreOlympusToken::constructor:7 Set allowMinting to %s.", allowMinting );

    console.log("Contract::PreOlympusToken::constructor:8 Approving token address of %s for selling.", address(this) );
    _addApprovedSeller( address(this) );
    console.log("Contract::PreOlympusToken::constructor:9 Approved token address %s for selling: %s.", address(this), isApprovedSeller[address(this)] );

    console.log("Contract::PreOlympusToken::constructor:10 Approving msg.sender address of %a for selling.", msg.sender);
    _addApprovedSeller( msg.sender );
    console.log("Contract::PreOlympusToken::constructor:11 Approved msg.sender address %s for selling: %s.", msg.sender, isApprovedSeller[msg.sender] );
  
    console.log( "Contract::PreOlympusToken::constructor:12 Minting %s pOLY to %s", initialSupply_, owner() );
    _mint( owner(), initialSupply_ );
    console.log( "Contract::PreOlympusToken::constructor:13 Minted %s pOLY to $s", balanceOf( owner() ), owner() );

    console.log( "Contract::PreOlympusToken::constructor:14 Instantiated PreOlympusToken" );
  }

  function allowOpenTrading() external onlyOwner() returns ( bool ) {
    console.log( "Contract::PreOlympusToken::allowOpenTrading:1 Disabling limit that PreOlympus can only be transfered by approved sellers." );
    requireSellerApproval = false;
    console.log( "Contract::PreOlympusToken::allowOpenTrading:2 Disabled limit that PreOlympus can only be transfered by approved sellers." );
    console.log( "Contract::PreOlympusToken::allowOpenTrading:3 Returning changed value." );
    return requireSellerApproval;
  }

  function disableMinting() external onlyOwner() returns ( bool ) {
    console.log( "Contract::PreOlympusToken::disableMinting:1 Diasabling owner ability to mint without having to renounce ownership." );
    console.log( "Contract::PreOlympusToken::disableMinting:2 Minting is allowable: %s.", allowMinting );
    allowMinting = false;
    console.log( "Contract::PreOlympusToken::disableMinting:3 Minting is allowable: %s.", allowMinting );
    console.log( "Contract::PreOlympusToken::disableMinting:4 Diasabled owner ability to mint without having to renounce ownership." );
    console.log( "Contract::PreOlympusToken::disableMinting:5 Returning changed value." );
    return allowMinting;
  }

  function _addApprovedSeller( address approvedSeller_ ) internal {
    console.log( "Contract::PreOlympusToken::_addApprovedSeller:1 Approving %s for selling from internal call.", approvedSeller_ );
    console.log( "Contract::PreOlympusToken::_addApprovedSeller:2 %s is approved for selling: %s.", approvedSeller_, isApprovedSeller[approvedSeller_] );
    isApprovedSeller[approvedSeller_] = true;
    console.log( "Contract::PreOlympusToken::_addApprovedSeller:3 %s is approved for selling: %s.", approvedSeller_, isApprovedSeller[approvedSeller_] );
    console.log( "Contract::PreOlympusToken::_addApprovedSeller:4 Approved %s for selling from internal call.", approvedSeller_ );
  }

  function addApprovedSeller( address approvedSeller_ ) external onlyOwner() returns ( bool ) {
    console.log( "Contract::PreOlympusToken::addApprovedSeller:1 Approving %s for selling from external call.", approvedSeller_);
    _addApprovedSeller( approvedSeller_ );
    console.log( "Contract::PreOlympusToken::addApprovedSeller:2 Approved %s for selling from external call.", approvedSeller_);
    console.log( "Contract::PreOlympusToken::addApprovedSeller:3 Returning changed value." );
    return isApprovedSeller[approvedSeller_];
  }

  function addApprovedSellers( address[] calldata approvedSellers_ ) external onlyOwner() returns ( bool ) {
    console.log( "Approving %s address for selling from external call.", approvedSellers_.length );

    for( uint256 iteration_; approvedSellers_.length > iteration_; iteration_++ ) {
      console.log( "Approving %s for selling from external call from external call from array index %s.", approvedSellers_[iteration_], iteration_ );
      _addApprovedSeller( approvedSellers_[iteration_] );
      console.log( "Approved %s for selling from external call from external call from array index %s.", approvedSellers_[iteration_], iteration_ );
    }
    console.log( "Approved %s address for selling from external call.", approvedSellers_.length );
    return true;
  }

  function _removeApprovedSeller( address disapprovedSeller_ ) internal {
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:1 Removing approval for %s to sell from internal call.", disapprovedSeller_ );
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:2 %s is disapproved for selling.", disapprovedSeller_ );
    isApprovedSeller[disapprovedSeller_] = false;
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:3 %s is disapproved for selling.", isApprovedSeller[disapprovedSeller_] );
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:4 Removed approval for %s to sell from internal call.", disapprovedSeller_ );
  }

  function removeApprovedSeller( address disapprovedSeller_ ) external onlyOwner() returns ( bool ) {
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:1 Approving %s for selling from external call.", disapprovedSeller_);
    _removeApprovedSeller( disapprovedSeller_ );
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:2 Approved %s for selling from external call.", disapprovedSeller_);
    console.log( "Contract::PreOlympusToken::_removeApprovedSeller:3 Returning changed value." );
    return isApprovedSeller[disapprovedSeller_];
  }

  function removeApprovedSellers( address[] calldata disapprovedSellers_ ) external onlyOwner() returns ( bool ) {
    console.log( "Contract::PreOlympusToken::removeApprovedSellers:1 Disapproving %s address for selling from external call.", disapprovedSellers_.length );

    for( uint256 iteration_; disapprovedSellers_.length > iteration_; iteration_++ ) {
      console.log( "Contract::PreOlympusToken::removeApprovedSellers:1 Disapproving %s for selling from external call from external call from array index %s.", disapprovedSellers_[iteration_], iteration_ );
      _removeApprovedSeller( disapprovedSellers_[iteration_] );
      console.log( "Contract::PreOlympusToken::removeApprovedSellers:2 Disapproved %s for selling from external call from external call from array index %s.", disapprovedSellers_[iteration_], iteration_ );
    }
    console.log( "Contract::PreOlympusToken::removeApprovedSellers:3 Disapproved %s address for selling from external call.", disapprovedSellers_.length );
    return true;
  }

  /*
   * PreOlympus is a private option token. The option comes with the limitation that is can only be traded with existing holders.
   * Because this limit may need to be removed in the future, thisis checked on each transfer.
   */
  function _beforeTokenTransfer(address from_, address to_, uint256 amount_ ) internal override {
    console.log( "Contract::PreOlympusToken::_beforeTokenTransfer:1 Checking if transfers are limited between existing holder and approved sellers to new buyers." );
    if ( requireSellerApproval ) {
      console.log( "Contract::PreOlympusToken::_beforeTokenTransfer:2 Transfers are limited." );
      require( (_balances[to_] > 0 || isApprovedSeller[from_] == true), "Account not approved to transfer pOLY." );
      // console.log( "Contract::PreOlympusToken::_beforeTokenTransfer:1 %s has a balance of % and/or %s is approved seller: %s", to_, uint256( _balances[to_] ), from_, bool( isApprovedSeller[from_] ) );
    } else{
      console.log( "Contract::PreOlympusToken::_beforeTokenTransfer:3 Transfers and sales are not limited." );
    }
  }

  /**
  * @dev Destroys `amount` tokens from the caller.
  *
  * See {ERC20-_burn}.
  */
  function mint( address recipient_, uint256 amount_) public virtual onlyOwner() {
    console.log( "Contract::PreOlympusToken::mint:1 Checking if mitning is allowed." );
    require( allowMinting, "Minting has been disabled." );
    console.log( "Contract::PreOlympusToken::mint:2 Minting is allowed." );
    console.log( "Contract::PreOlympusToken::mint:3 Minting %s to address %s.", amount_, _owner );
    _mint( recipient_, amount_ );
    console.log( "Contract::PreOlympusToken::mint:4 Minted %s to address %s.", amount_, _owner );
  }

  /**
   * @dev Destroys `amount` tokens from the caller.
   *
   * See {ERC20-_burn}.
   */
   function burn(uint256 amount_) public virtual {
    console.log( "Contract::PreOlympusToken::burn:1 Burning %s for address %.", amount_, msg.sender );
    _burn( msg.sender, amount_ );
    console.log( "Contract::PreOlympusToken::burn:2 Burned %s to address %.", amount_, msg.sender );
  }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom( address account_, uint256 amount_ ) public virtual {
      console.log( "Contract::PreOlympusToken::burnFrom:1 Burning %s from $s.", amount_, account_ );
      _burnFrom( account_, amount_ );
      console.log( "Contract::PreOlympusToken::burnFrom:2 Burned %s from $s.", amount_, account_ );
    }

    function _burnFrom( address account_, uint256 amount_ ) internal virtual {
      console.log( "Contract::PreOlympusToken::_burnFrom:1 Burning from an address from external call." );

      console.log( "Contract::PreOlympusToken::_burnFrom:2 Calculating amount by which to decrese allowance for address %s from address %.", msg.sender, account_ );
      uint256 decreasedAllowance_ = allowance( account_, msg.sender ).sub( amount_, "ERC20: burn amount exceeds allowance");
      console.log( "Contract::PreOlympusToken::_burnFrom:3 Calculating amount of %s by which to decrese allowance for address %s from address %.", decreasedAllowance_, msg.sender, account_ );

      console.log( "Contract::PreOlympusToken::_burnFrom:4 Setting approval to %s for address %s on address %s.", decreasedAllowance_, msg.sender, account_ );
      _approve( account_, msg.sender, decreasedAllowance_ );
      console.log( "Contract::PreOlympusToken::_burnFrom:5 Set approval to %s for address %s on address %s.", decreasedAllowance_, msg.sender, account_ );

      console.log( "Contract::PreOlympusToken::_burnFrom:6 Burning %s from $s.", amount_, account_ );
      _burn( account_, amount_ );
      console.log( "Contract::PreOlympusToken::_burnFrom:7 Burned %s from $s.", amount_, account_ );
      
      console.log( "Contract::PreOlympusToken::_burnFrom:8 Burned from an address from external call." );
    }
}