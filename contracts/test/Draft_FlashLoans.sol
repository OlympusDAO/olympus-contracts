// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

interface IERC20 {
    function totalSupply() external view returns (uint supply);
    function balanceOf(address _owner) external view returns (uint balance);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint remaining);
}

interface IFlashBorrower {
    function executeFlashLoan(address underlying, uint256 amount, uint256 debt, bytes memory params) external;
}

// TODO needs SafeERC20
// @notice Any contract that inherits this contract becomes a flash lender
contract Flashlender {
    
    event FlashLoan(address who, address token, uint profit);
    
    /// @notice - fee denominated in ether
    /// @dev e.g.: 0.003e18 means 0.3% fee
    uint256 internal _flashFee;
    
    address public governor;
    
    /// @notice - is a given token lendable?
    mapping(address => bool) public isFlashLendable;
    

    /*
     *    @notice - change if a token is lendable or not
     *    @dev access controlled
     *    @param token - token on interest
     *    @param on - if token is lendable or not
     */
    // TODO needs access control
    function setLendable(address token, bool on) external {
        isFlashLendable[token] = on;
    }
    
    /*
     *    @notice - adjust
     *    @dev access controlled
     *    @param token - token on interest
     *    @param on - if token is lendable or not
     */
    // TODO needs access control
    function setFlashFee(uint flashFee) external {
        _flashFee = flashFee;
    }
    
    /*
     *    @notice - initiate a EIP-3156 flash laon on whitelisted tokens
     *    @dev reentrant calls allow for multiple assets in a single tx
     *    @param underlying - token that's getting flash loaned
     *    @param amount - amount of underlying getting borrowed
     *    @param params - arbitrary data that caller can pass in to customize callback
     */
    function flashLoan(address underlying, uint256 amount, bytes calldata params) external {
        require(isFlashLendable[underlying], "underlying not whitelisted");
        uint256 debt = amount + flashFee(amount);
        require(IERC20(underlying).transfer(msg.sender, amount), "borrow failed");
        IFlashBorrower(msg.sender).executeFlashLoan(underlying, amount, debt, params);
        require(IERC20(underlying).transferFrom(msg.sender, address(this), debt), "repayment failed");
        // optionally use tx.origin instead of msg.sender
        emit FlashLoan(msg.sender, underlying, flashFee(amount));
    }

    /*
     *   @notice - get flash fee given an amonut
     *   @param amount - amount being loaned
     *   @return - flash fee
     */
    function flashFee(uint amount) public view returns (uint256) {
        return amount * _flashFee / 1e18;
    }
    
    /*
     *   @notice - get max flash loan given an underlying token
     *   @param underlying - token that's getting flash loaned
     *   @return - max flash loan
     */
    function maxFlashLoan(address underlying) public view returns (uint) {
        return IERC20(underlying).balanceOf(address(this));
    }
}

interface IFlashLender {
    function flashLoan(address underlying, uint256 amount, bytes memory params) external;
}

contract FlashBorrower {
    
    // @notice emmited upon success
    event FlashLoan(IERC20 underlying, uint amount, uint debt, bytes params);

    // @notice lending contract
    IFlashlender public constant flashLender = Flashlender(address(0x0)); // interface lending contract, left empty for now

    /*
     *   @notice - start a flash loan
     *   @param underlying - token that's getting flash loaned
     *   @param amount - amount to be borrowed
     *   @param params - any params you may want to pass in
     */
    function initiateFlashLoan(address underlying, uint256 amount, bytes memory params) public { 
        flashLender.flashLoan(underlying, amount, params);
    }

    /*
     *   @notice - callback from lender
     *   @param underlying - token that's getting flash loaned
     *   @param amount - amount that's getting borrowed
     *   @param debt - amount borrowed plus loans fee
     *   @param params - any params you may have passed in
     */
    function executeFlashLoan(IERC20 underlying, uint256 amount, uint256 debt, bytes memory params) external {
        require(msg.sender == address(flashLender), "only lender can execute");
        onFlashLoan(underlying, amount, debt, params);
        require(underlying.approve(address(flashLender), debt), "repayment failed");
        emit FlashLoan(underlying, amount, debt, params);
    }
    
    
    function onFlashLoan(IERC20 underlying, uint amount, uint debt, bytes memory params) internal virtual {
        // 1. decode any params you have have passed in IE (...) = abi.decode(params, (...));
    
        // 2. add your logic here... 
        
        // 3. if this contracts underlying balance is greater than debt, the tx won't revert
        
        // 4. sucess, debts repaid and you're left with remaining tokens

    }
}
