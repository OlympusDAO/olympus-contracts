# Allocators v1 Guide

The following is a guide for interacting with the treasury as a reserve allocator.

A reserve allocator is a contract that deploys funds into external strategies, such as Aave, Curve, etc.

Treasury Address: `0x31F8Cc382c9898b273eff4e0b7626a6987C846E8`

### Managing

The first step is withdraw funds from the treasury via the "manage" function. "Manage" allows an approved address to withdraw excess reserves from the treasury.

**NOTE**: This contract must have the "reserve manager" permission, and that withdrawn reserves decrease the treasury's ability to mint new OHM (since backing has been removed).

Pass in the token address and the amount to manage. The token will be sent to the contract calling the function.

```solidity
function manage(address _token, uint256 _amount) external;

```

Managing treasury assets should look something like this:

```solidity
treasury.manage( DAI, amountToManage );
```

### Returning

The second step is to return funds after the strategy has been closed.
We utilize the `deposit` function to do this. Deposit allows an approved contract to deposit reserve assets into the treasury, and mint OHM against them. In this case however, we will NOT mint any OHM. This will be explained shortly.

**NOTE**: The contract must have the "reserve depositor" permission, and that deposited reserves increase the treasury's ability to mint new OHM (since backing has been added).

Pass in the address sending the funds (most likely the allocator contract), the amount to deposit, and the address of the token. The final parameter, profit, dictates how much OHM to send. send\_, the amount of OHM to send, equals the value of amount minus profit.

```solidity
function deposit(
    address _from,
    uint256 _amount,
    address _token,
    uint256 _profit
) external returns (uint256 send_);

```

To ensure no OHM is minted, we first get the value of the asset, and pass that in as profit.
Pass in the token address and amount to get the treasury value.

```solidity
function valueOf(address _token, uint256 _amount) public view returns (uint256 value_);

```

All together, returning funds should look something like this:

```solidity
treasury.deposit( address(this), amountToReturn, DAI, treasury.valueOf( DAI, amountToReturn ) );
```