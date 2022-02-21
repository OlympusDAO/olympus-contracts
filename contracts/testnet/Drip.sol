// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../libraries/SafeMath.sol";
import "../types/Ownable.sol";

contract Drip is Ownable {
    using SafeMath for uint256;

    mapping(address => bool) public dripped;

    IERC20 public PUNK;
    IERC20 public PUNKWEETH;
    IERC20 public AFLOOR;
    IERC20 public WEETH;

    constructor(address _punk, address _punkWeeth, address _aFloor, address _weeth) {
      require(_punk != address(0), "Punk address not provided");
      require(_punkWeeth != address(0), "PunkWeeth address not provided");
      require(_aFloor != address(0), "aFloor address not provided");
      require(_weeth != address(0), "Weeth address not provided");

      PUNK = IERC20(_punk);
      PUNKWEETH = IERC20(_punkWeeth);
      AFLOOR = IERC20(_aFloor);
      WEETH = IERC20(_weeth);
    }

    function drip() public {
        require(!dripped[msg.sender], "Already dripped");
        dripped[msg.sender] = true;
        PUNK.transfer(msg.sender, 50_000_000_000_000_000); // 0.05 PUNK
        PUNKWEETH.transfer(msg.sender, 8_000_000_000_000_000); // .008 PUNKWEETH SLP
        AFLOOR.transfer(msg.sender, 20_000_000_000); // 20 AFLOOR
        WEETH.transfer(msg.sender, 1_000_000_000_000_000_000); // 1 WEETH
    }

    function withdraw() external onlyOwner() {
        PUNK.transfer(owner(), PUNK.balanceOf(address(this))); // 0.5 PUNK
        PUNKWEETH.transfer(owner(), PUNKWEETH.balanceOf(address(this))); // 8 PUNKWEETH SLP
        AFLOOR.transfer(owner(), AFLOOR.balanceOf(address(this))); // 1000 AFLOOR
        WEETH.transfer(owner(), WEETH.balanceOf(address(this))); // 10 WEETH
    }
}