// SPDX-License-Identifier: WTFPL  "Do What the Fuck You Want To Public License"

pragma solidity >=0.8.0;

// forked from solmate, added ERC777 hooks
contract ERC20 {
    
    /*/////////////////    STORAGE    /////////////////*/

    string public name;

    string public symbol;

    uint8 public immutable decimals;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    mapping(address => mapping(address => uint256)) public allowance;

    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(address => uint256) public nonces;
    
    /*/////////////////    EVENTS    /////////////////*/

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    /*/////////////////    INITIALIZATION    /////////////////*/

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /*/////////////////    ERC20 LOGIC    /////////////////*/
    
    function approve(address spender, uint256 value) external virtual returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(spender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external virtual returns (bool) {
        _beforeTransferHook(msg.sender, to, value);
        balanceOf[msg.sender] -= value;
        unchecked {balanceOf[to] += value;}
        _afterTransferHook(msg.sender, to, value);
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external virtual returns (bool) {
        _beforeTransferHook(msg.sender, to, value);
        if (allowance[from][msg.sender] != type(uint256).max) allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        unchecked {balanceOf[to] += value;}
        _afterTransferHook(from, to, value);
        emit Transfer(from, to, value);
        return true;
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external virtual {
        require(deadline >= block.timestamp, 
        "PERMIT_DEADLINE_EXPIRED");
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 
        "INVALID_PERMIT_SIGNATURE");
        allowance[recoveredAddress][spender] = value;
        emit Approval(spender, spender, value);
    }

    /*/////////////////    INTERNAL FUNCTIONS    /////////////////*/

    function _mint(address to, uint256 value) internal virtual {
        _beforeTransferHook(address(0), to, value);
        totalSupply += value;
        unchecked {balanceOf[to] += value;}
        _afterTransferHook(address(0), to, value);
        emit Transfer(address(0), to, value);
    }

    function _burn(address from, uint256 value) internal virtual {
        _beforeTransferHook(from, address(0), value);
        balanceOf[from] -= value;
        unchecked {totalSupply -= value;}
        _afterTransferHook(from, address(0), value);
        emit Transfer(from, address(0), value);
    }
    
    function _beforeTransferHook(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    function _afterTransferHook(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}
