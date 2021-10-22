// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain`call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return _functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    // function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
    //     require(address(this).balance >= value, "Address: insufficient balance for call");
    //     return _functionCallWithValue(target, data, value, errorMessage);
    // }
    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _functionCallWithValue(address target, bytes memory data, uint256 weiValue, string memory errorMessage) private returns (bytes memory) {
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: weiValue }(data);
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

  /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.3._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.3._
     */
    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }

    function addressToString(address _address) internal pure returns(string memory) {
        bytes32 _bytes = bytes32(uint256(_address));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _addr = new bytes(42);

        _addr[0] = '0';
        _addr[1] = 'x';

        for(uint256 i = 0; i < 20; i++) {
            _addr[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _addr[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }

        return string(_addr);

    }
}








import "./interfaces/ICauldron.sol";
import "./interfaces/IfToken.sol";
import "./interfaces/IOwnable.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IwsOHM.sol";
import "./interfaces/IERC20.sol";

import "./types/Ownable.sol";
import "./types/SafeERC20.sol";
import "./types/SafeMath.sol";

contract RepoFacility is Ownable {

    using SafeMath for uint;
    using SafeERC20 for IERC20;



    /* ========== STRUCTS ========== */

    struct Debt {
        uint current; // current debt
        uint max; // maximum repayment in period
        uint decayInBlocks; // speed to decay debt
        uint lastBlock; // last decay
    }

    struct Info {
        address OHM; // token to burn
        address sOHM; // Fuse collateral
        IwsOHM wsOHM; // Abra collateral

        ICauldron cauldron; // Abra debt facility
        address MIM; // Abra debt token

        address repayment; // token to withdraw from treasury

        IStaking staking; // Olympus staking
        ITreasury treasury; // Olympus treasury

        uint bounty; // function executor bounty
        uint minLiquidation; // minimum size loan to liquidate
    }



    /* ========== STATE VARIABLES ========== */

    Debt public debt;
    Info public info;

    mapping( address => address ) public fTokenForToken; // fuse tokens



    /* ========== CONSTRUCTOR ========== */

    constructor( 
        address _OHM,
        address _sOHM, 
        address _wsOHM,
        address _cauldron,
        address _MIM, 
        address _LUSD,
        address _staking,
        address _treasury, 
        uint _bounty,
        uint _minLiquidation
    ) {
        require( _OHM != address(0) );
        info.OHM = _OHM;
        require( _sOHM != address(0) );
        info.sOHM = _sOHM;
        require( _wsOHM != address(0) );
        info.wsOHM = IwsOHM( _wsOHM );

        require( _cauldron != address(0) );
        info.cauldron = ICauldron( _cauldron );
        require( _MIM != address(0) );
        info.MIM = _MIM;

        require( _LUSD != address(0) );
        info.repayment = _LUSD;

        require( _staking != address(0) );
        info.staking = IStaking( _staking );
        require( _treasury != address(0) );
        info.treasury = ITreasury( _treasury );

        info.bounty = _bounty;
        info.minLiquidation = _minLiquidation;
    }



    /* ========== MUTABLE FUNCTIONS ========== */

    // repay a loan on Fuse and burn collateral
    function repayFuse( address token, address borrower, uint amount ) external {
        require( amount >= info.minLiquidation, "Liquidation too small" );

        decayDebt(); // refresh debt (limits frequency of liquidation)
        require( debt.current.add( amount ) <= debt.max, "Debt overflow" );

        _swap( info.token, amount ); // swap to required token

        fToken( fTokenForToken[ token ] ).liquidateBorrow( borrower, amount, info.sOHM ); // liquidate borrower

        pay( false );
    }

    // repay loans on Abracadabra and burn collateral
    function repayAbra( address[] calldata borrowers, uint[] calldata amounts ) external {
        require( amount >= info.minLiquidation, "Liquidation too small" );

        uint total = getTotal( amounts );

        decayDebt(); // refresh debt (limits frequency of liquidation)
        require( debt.current.add( total ) <= debt.max, "Debt overflow" );

        _swap( info.MIM, total ); // swap to required token

        info.cauldron.liquidate( borrowers, amounts, address(this), address(0) ); // liquidate

        pay( true );
    }



    /* ========== OWNABLE FUNCTIONS ========== */

    // set bounty for liquidation
    function setBounty( uint newBounty, uint newMin ) external onlyOwner() {
        info.bounty = newBounty;
        info.minLiquidation = newMin;
    }

    // set fToken for Token
    function setfToken( address token, address fToken ) external onlyOwner() {
        fTokenForToken[ token ] = fToken;
    }



    /* ========== VIEW FUNCTIONS ========== */

    // current debt liquidated after decay
    function currentDebt() public view returns ( uint debt_ ) {
        if ( debt.lastBlock < debt.decayInBlocks ) {
            debt_ = debt.current.sub( debt.current.mul( debt.lastBlock ).div( debt.decayInBlocks ) );
        } else {
            debt_ = 0;
        }
    }

    function getTotal( uint[] calldata amounts ) public view returns ( uint total_ ) {
        for( uint i = 0; i < amounts.length; i++ ) {
            require( amounts[i] >= info.minLiquidation );

            total_ = total_.add( amounts[i] );
        }
    }



    /* ========== INTERNAL FUNCTIONS ========== */

    // refresh debt
    function decayDebt() internal {
        debt.current = currentDebt();
        debt.lastBlock = block.number;
    }

    function pay( bool fromWrapped ) internal {
        if( fromWrapped ) {
            info.wsOHM.unwrap( IERC20( address(info.wsOHM) ).balanceOf( address(this) ) ); // unwrap collateral
        }

        IERC20( info.sOHM ).safeTransfer( msg.sender, info.bounty ); // pay liquidator

        uint amount = IERC20( info.sOHM ).balanceOf( address(this) );
        info.staking.unstake( amount, false ); // unstake seized collateral
        IERC20( info.OHM ).burn( amount ); // burn seized OHM
    }

    function _swap( address tokenTo, uint amountBack ) internal {
        // treasury.manage( info.repayment, total ); // manage LUSD needed

        // swap to tokenTo, for exact amountBack
    }
}