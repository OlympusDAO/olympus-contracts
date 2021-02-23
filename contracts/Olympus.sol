// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "hardhat/console.sol";

import "../../abstract/Divine.sol";
import "../../dependencies/holyzeppelin/contracts/math/SafeMath.sol";

contract OlympusERC20TOken is Divine {
    using SafeMath for uint256;

    constructor() Divine("Olympus", "OLY", 18) {
        console.log(
            "Contract::olympus::token::OlympusToken::constructor:01 Instantiating OlympusToken."
        );
        console.log(
            "Contract::olympus::token::OlympusToken::constructor:01 Instantiated OlympusToken."
        );
    }

    function mint(address account_, uint256 ammount_) external onlyOwner() {
        console.log(
            "Contract::olympus::token::OlympusToken::mint:01 Minting %a OlympusToken on call from %s to %s.",
            ammount_,
            msg.sender,
            account_
        );
        _mint(account_, ammount_);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) public virtual {
        _burn(msg.sender, amount);
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
    function burnFrom(address account_, uint256 amount_) public virtual {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) public virtual {
        uint256 decreasedAllowance_ =
            allowance(account_, msg.sender).sub(
                amount_,
                "ERC20: burn amount exceeds allowance"
            );

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }

    // Code snippet kept from previous implementation attempt.
    // bytes32 public DOMAIN_SEPARATOR;

    // // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    // bytes32 public constant PERMIT_TYPEHASH =
    //     0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    // mapping(address => uint256) public nonces;

    // constructor() ERC777("Olympus", "OLY", new address[](0)) {
    //     _mint(msg.sender, 10000 * 10**18, "", "");

    //     uint256 chainId;

    //     assembly {
    //         chainId := chainid()
    //     }

    //     DOMAIN_SEPARATOR = keccak256(
    //         abi.encode(
    //             keccak256(
    //                 "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    //             ),
    //             keccak256(bytes(name())),
    //             keccak256(bytes("1")),
    //             chainId,
    //             address(this)
    //         )
    //     );
    // }

    // function mint(address to, uint256 value) external onlyOwner() {
    //     _mint(to, value, "", "");
    //     emit Transfer(address(0), to, value);
    // }

    // function permit(
    //     address owner,
    //     address spender,
    //     uint256 value,
    //     uint256 deadline,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) external {
    //     require(deadline >= block.timestamp, "Olympus: EXPIRED");

    //     bytes32 digest =
    //         keccak256(
    //             abi.encodePacked(
    //                 "\x19\x01",
    //                 DOMAIN_SEPARATOR,
    //                 keccak256(
    //                     abi.encode(
    //                         PERMIT_TYPEHASH,
    //                         owner,
    //                         spender,
    //                         value,
    //                         nonces[owner]++,
    //                         deadline
    //                     )
    //                 )
    //             )
    //         );

    //     address recoveredAddress = ecrecover(digest, v, r, s);
    //     require(
    //         recoveredAddress != address(0) && recoveredAddress == owner,
    //         "Olympus: INVALID_SIGNATURE"
    //     );

    //     _approve(owner, spender, value);
    // }
}
