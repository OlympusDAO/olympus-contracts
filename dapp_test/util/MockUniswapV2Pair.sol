pragma solidity 0.7.5;

import "../../contracts/interfaces/IUniswapV2Pair.sol";
import "../../contracts/interfaces/IERC20Metadata.sol";

// TODO explore using https://github.com/gnosis/mock-contract
contract MockUniswapV2Pair{


    uint public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    address public factory;

    address public  token0;
    address public  token1;

    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves
    uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

    uint public price0CumulativeLast;
    uint public price1CumulativeLast;
    uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    //IUniswapV2Pair
//    function token0() external view  returns (address){
//        return token0;
//    }
//    function token1() external view  returns (address){
//        return token1;
//    }
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external   {}
//    function getReserves() external view   returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast){}
    function mint(address to) external   returns (uint liquidity){}
    function sync() external {}

    // IUniswapV2ERC20
    function name() external pure   returns (string memory){ return "Mock";}
    function symbol() external pure   returns (string memory){ return "MOCK";}
    function decimals() external pure   returns (uint8){ return 18;}
    function totalSupply() external view   returns (uint){}
    function balanceOf(address owner) external view   returns (uint){}
    function allowance(address owner, address spender) external view   returns (uint){}

    function approve(address spender, uint value) external  returns (bool){}
    function transfer(address to, uint value) external   returns (bool){}
    function transferFrom(address from, address to, uint value) external   returns (bool){}


    function DOMAIN_SEPARATOR() external view  returns (bytes32){}
    function PERMIT_TYPEHASH() external pure  returns (bytes32){}
    function nonces(address owner) external view  returns (uint){}

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external {}

    function getReserves() public  view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    function _safeTransfer(address token, address to, uint value) private {
//        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
//        require(success && (data.length == 0 || abi.decode(data, (bool))), 'UniswapV2: TRANSFER_FAILED');
    }

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    constructor(address _token0, address _token1, uint112 _reserve0, uint112 _reserve1) public {
        factory = msg.sender;
        token0 = _token0;
        token1 = _token1;
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }

}
