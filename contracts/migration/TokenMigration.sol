pragma solidity 0.7.5;

interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IOldTreasury {
    function withdraw( uint _amount, address _token ) external;

    function mint( address _recipient, uint _amount ) external;
    
    function manage( address _token, uint _amount ) external;
}

interface INewTreasury {
    function deposit( address _from, uint _amount, address _token, uint _profit ) external returns ( uint send_ );
    
    function valueOf( address _token, uint _amount ) external view returns ( uint value_ );
}

interface IRouter {
    function addLiquidity(
        address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline
        ) external returns (uint amountA, uint amountB, uint liquidity);
        
    function removeLiquidity(
        address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline
        ) external returns (uint amountA, uint amountB);
}



contract OlympusLPMigration {
    address public DAI;
    address public oldOHM;
    address public newOHM;
    
    address public sushiRouter;
    
    address public oldOHMDAISLP;
    address public newOHMDAISLP;
    
    address public oldTreasury;
    address public newTreasury;
    
    function  migrate() external {
        uint oldLPAmount = IERC20(oldOHMDAISLP).balanceOf(oldTreasury);
        IOldTreasury(oldTreasury).manage(oldOHMDAISLP, oldLPAmount);
        
        IERC20(oldOHMDAISLP).approve(sushiRouter, oldLPAmount);
        
        (uint amountA, uint amountB) = IRouter(sushiRouter).removeLiquidity(DAI, oldOHM, oldLPAmount, 0, 0, address(this), block.number + 15);
        
        IOldTreasury(oldTreasury).withdraw(amountB, DAI);
        
        IERC20(DAI).approve(newTreasury, amountB * 10 ** 9);
        
        INewTreasury(newTreasury).deposit(address(this), amountB * 10 ** 9, DAI, 0);
        
        IERC20(DAI).approve(sushiRouter, amountA);
        IERC20(newOHM).approve(sushiRouter, amountB);
        
        (,, uint _newLiquidity) = IRouter(sushiRouter).addLiquidity(DAI, newOHM, amountA, amountB, 0, 0, address(this), block.number + 15);
        
        uint _newLPValue = INewTreasury(newTreasury).valueOf(newOHMDAISLP, _newLiquidity);
        
        IERC20(newOHMDAISLP).approve(newTreasury, _newLPValue);
        
        INewTreasury(newTreasury).deposit(address(this), _newLiquidity, newOHMDAISLP, _newLPValue);
    }
}