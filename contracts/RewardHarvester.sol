// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

interface IOwnable {
  function policy() external view returns (address);

  function renounceManagement() external;
  
  function pushManagement( address newOwner_ ) external;
  
  function pullManagement() external;
}

contract Ownable is IOwnable {

    address internal _owner;
    address internal _newOwner;

    event OwnershipPushed(address indexed previousOwner, address indexed newOwner);
    event OwnershipPulled(address indexed previousOwner, address indexed newOwner);

    constructor () {
        _owner = msg.sender;
        emit OwnershipPushed( address(0), _owner );
    }

    function policy() public view override returns (address) {
        return _owner;
    }

    modifier onlyPolicy() {
        require( _owner == msg.sender, "Ownable: caller is not the owner" );
        _;
    }

    function renounceManagement() public virtual override onlyPolicy() {
        emit OwnershipPushed( _owner, address(0) );
        _owner = address(0);
    }

    function pushManagement( address newOwner_ ) public virtual override onlyPolicy() {
        require( newOwner_ != address(0), "Ownable: new owner is the zero address");
        emit OwnershipPushed( _owner, newOwner_ );
        _newOwner = newOwner_;
    }
    
    function pullManagement() public virtual override {
        require( msg.sender == _newOwner, "Ownable: must be new owner to pull");
        emit OwnershipPulled( _owner, _newOwner );
        _owner = _newOwner;
    }
}

interface IOnsenAllocator {
    function harvest( bool _stake ) external;
}

interface IAllocator {
    function harvest() external;
}

// @notice contract will claim rewards from multiple allocators in one function call
contract RewardHarvester is Ownable {

    /* ======== STATE VARIABLES ======== */

    address public immutable onsenAllocator;
    address[] public allocators;

    /* ======== CONSTRUCTOR ======== */

    constructor(address _onsenAllocator, address[] memory _allocators) {
        require( _onsenAllocator != address(0) );
        onsenAllocator = _onsenAllocator;
        for(uint i; i < _allocators.length; i++) {
            require(_allocators[i] != address(0));
        }
        allocators = _allocators;
    }

    /* ======== PUBLIC FUNCTION ======== */

    /**
     *  @notice harvest rewards from allocators
     *  @param _useOnsen bool
     */
    function harvest(bool _useOnsen) external {
        for(uint i; i < allocators.length; i++) {
            IAllocator(allocators[i]).harvest();
        }
        if( _useOnsen ) {
            IOnsenAllocator(onsenAllocator).harvest(true);
        }
    }

    /* ======== POLICY FUNCTION ======== */

    /**
     *  @notice update array of allocators
     *  @param _allocators address[]
     */
    function updateAllocator(address[] calldata _allocators) external onlyPolicy() {
        allocators = _allocators;
    }

}