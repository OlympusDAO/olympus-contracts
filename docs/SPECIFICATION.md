# Olympus Specifications

## Tyche Specification

### Definitions

- Donor: User donating sOHM rebases to a particular recipient address.
- Recipient: User recieving sOHM rebases from donors.

### Yield Director Vault Specification

#### Donors
1. Donor is able to deposit sOHM into vault with a target recipient address.
2. Donor is able to withdraw deposited sOHM at any time and shall receive the amount deposited (without rebases).
3. Donor is able to deposit and donate sOHM rebases to multiple target recipient addresses.

#### Recipients
1. Recipient shall receive rebases of all sOHM deposited with the recipient as its target address.
2. Recipient is able to redeem their vault position at any time, transferring all donated rebases from the vault to the recipient's address.

#### Technical Details
All accounting inside the Tyche vault is easiest to understand by evaluating everything with respect to the rebase index.

- V_a: Agnostic OHM value (# of OHM / current_index)
- Di: Index at time of donor deposit
- Wi: Index at time of donor withdrawal
- Ri_n: Index at nth redemption by recipient

For Donors:
```
Withdrawal Amount = V_a * Wi
```

For Recipient:
```
Redeem Amount
	= V_a (Ri_n - Ri_{n-1} - Di)
							
	= V_a Ri_n - V_a Ri_{n-1} - V_a Di
		where V_a Di is the sOHM amount deposited by donor
```

---