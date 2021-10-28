# Olympus Specifications

## NFB Specification

---

### Definitions

#### NFB
1. A **NFB** is a bond that's wrapped as an NFT. 

2. If you own a **NFB**, you own it's underlying bond ( *and therefore that bonds payout* ).

#### Bonders

1. **Bonder** is able to purchase a bond as usual, and they're minted an NFB.

2. **Bonder** can transfer the NFB, and the new holder will own the underlying bond that the NFB represents.

---

#### Technical Details

**NFBTeller** is a contract that sits on top V2's bonding infulstructure, and allows users to buy bonds in the form of NFTs. When a user purchases a bond/mints an NFB, under the hood the contracts is simply buying a bond for itself. The contract then delegates the ownership of said bond to whoever holds that newly minted NFT/NFB.

---

#### Testing

V2 Testing needs to be finalized before NFB testing can begin.

---

#### TODO

- Integrate SVG compatible URI for 100% on chain artwork.

---
