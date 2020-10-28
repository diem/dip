---
lip: 5
title: Address formatting
authors: Dmitry Pimenov (@dpim), Kevin Hurley (@kphfb)
status: Last Call
type: Informational
created: 07/08/2020
---
# Summary
Libra Payment Network wallets benefit from consistent standards for serializing addresses and transaction requests. Such standards will enable an evolving set of interoperable payments scenarios across digital wallet clients. This proposal outlines an initial set of address formats.

# Terminology
* **on-chain account address**: Account addresses on the Libra blockchain are 16 bytes in length. The on-chain accounts corresponding to these blockchain addresses are containers that can hold Move resources including coin balances. We expect that many custodial wallets will choose to use a single or small set of on-chain accounts to act as an omnibus for their users. An example of an on-chain account address is `0xf72589b71ff4f8d139674a3f7369c69b`.

* **subaddress**: Accounts on-chain are represented by an address.  To allow multiplexing of a single address into multiple wallets, custodial wallets may use “subaddresses” under the on-chain address for each underlying user.  While custodians can keep an internal ledger for mapping subaddresses, these mapping ledgers are not stored as resources on the Libra blockchain. It is a best practice for VASPs on Libra to use subaddresses as a single-use address to remove linkability.  In this way, subaddresses serve as a many-to-one mapping between subaddresses and a user - where subaddresses are not re-used for more than one payment.

* **account identifier**:  An account identifier is a base-32 encoded string that captures 1) the network version the address is intended for, 2) the address type (with or without subaddress) and 3) the underlying address components. This identifier uses the bech32 encoding which consists of a human readable prefix, delimiter, serialized payload (account address, subaddress) and checksum. An example of an account identifier is `lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t`.

* **intent identifier**: An intent identifier is a URI-serialized string that couples an *account identifier* with optional query parameters that specify preferences for an on-chain action. Initially, intent identifiers will be used for specifying transaction requests. In the fullness of time, we can expect using intent identifiers for sharing richer transaction metadata or identity information. an example of an intent identifier is `libra://lbr11q8mjtzdhrl6035feva9r7umfc6du7ezz300tv2hj7v5pyg?am=1000000&c=LBR`

# Abstract / Motivation
For a range of peer-to-peer and peer-to-merchant use cases, merchants and wallets will need to coordinate an information exchange about the intended recipient and transaction payload. Standardizing the format of this payment envelope promotes interoperability across the client ecosystem. This proposal covers standards for several related identifiers.

A common pattern to a cross-wallet transaction would be:

1) The recipient generates a *intent identifier* consisting of their account identifier, and payment metadata
2) The recipient shares this information with a would-be sender over some communication channel (e.g., SMS, Email, QR code)
3) The sender's wallet deserializes this information and populates a transaction for the sending user to authorize
4) The sending user authorizes the request and their wallet submits the transaction to the Libra blockchain
5) The recipient wallet monitors on-chain events for its accounts. Upon seeing relevant events, the recipient wallet can filter by the sender information and whether a unique recipient subaddress was passed in the transaction's metadata fields. When such an event is detected, both parties can confirm the funds have been transferred successfully. 

Examples of cross-wallet payment scenarios include:

* A user may want to share a compact identifier over traditional communication channels (e.g., SMS) and receive a payment from a user of a different wallet
    * The recipient user may want to specify a currency preference
    * The recipient user may want to specify a concrete amount they'd like to receive
* A merchant may want to present a predefined payment request via QR code so that a customer would only need to authorize the funds


# Specification

## Account identifiers
For communicating account identity, we propose using a compact, versioned and case-insensitive identifier. To meet this criteria, we selected the Bech32 encoding implementation used in Bitcoin Segwit ([BIP 0173](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)) excluding the Segwit byte known-length restrictions.

### Desired attributes
- Consistent - Users can build a muscle memory for identifying and using these account addresses
- Atomic - The string identifier feels like a single unit. Users shouldn’t try to separate or truncate the string
- Versioned - The format contains human readable information about how to interpret the payload, preventing subtle errors and reserving space for future identifier schemes
- Error detecting - Bech32 checksums help clients validate input and reduce risk of bad transactions due to mistypings and truncations

### Constraints for subaddresses
- Fixed length at 8 bytes (we don’t accept other sizes, strictly 8 bytes).
- Unique to their custodial wallet/on-chain account: subaddresses must be non-ambiguous (i.e., Recipient VASPs should not issue the same subaddress to multiple users).
- By convention, 8 zero bytes (`0x0000000000000000`) is reserved to denote the root (VASP owned) account.
- Subaddresses should be single-use and should not use personal information, such as name, email address, government-issued identification number, to generate.

### Format
The Libra Account Identifier consists of
* A prefix (also known as hrp (human readable part) which identifies the network version this address is intended for
  * “lbr” for Mainnet addresses
  * “tlb” for Testnet addresses
  * "plb" for Pre-Mainnet addresses
* A Bech32 delimiter
  * The character “1” (one)
* A Bech32 version identifier
  * The character “p” (version = 1) for on-chain with subaddress
* A Bech32 encoded payload
  * For version 1, is Libra account address + subaddress (16 + 8 bytes)
* The last 6 characters correspond to the Bech32 checksum

Overall address format: *prefix* | *delimiter* | *version* | *encoded payload* | *checksum*

### Example with explicit subaddress
Identifier information
* Prefix (string)
  * Network: `lbr`
* Address type (version prefix): `01` (letter p in Bech32 alphabet)
* Address payload (in hex)
  * Address: `0xf72589b71ff4f8d139674a3f7369c69b`
  * Subaddress: `0xcf64428bdeb62af2`
* Checksum: `w5p72t`

**Result**: `lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t`

### Example without explicit subaddress (root account)
Identifier information
* Prefix (string)
  * Network: `lbr`
* Address type (version prefix): `01` (letter p in Bech32 alphabet)
* Address payload (in hex)
  * Address: `0xf72589b71ff4f8d139674a3f7369c69b`
  * Subaddress: `0x0000000000000000`
* Checksum: `flf8ma`

**Result**: `lbr1p7ujcndcl7nudzwt8fglhx6wxnvqqqqqqqqqqqqqflf8ma`

### Looking ahead
In the future, we plan to define additional Account Identifier versions to support other forms of identity, such as more compact subaddress formats. These would leverage a similar overall structure but would have a different version identifier, preventing naming collisions.

## Intent identifiers
In addition to the Account Identifier standard, we propose a common serialization format for denoting specific actions involving an on-chain account. This format is intended to evolve and support a broad range of user-to-user and user-to-merchant scenarios.

### Desired attributes
- Familiar - define standards that are easy to understand and implement (by merchant, exchange and wallet developers)
- Interoperable - a single integration can support all wallets without vendor-specific setup
- Extensible - a versioned protocol with room for supporting new capabilities

### Format
The Intent Identifier consists of
* A prefix
  * `libra://` to explicitly specify how the identifier should be interpreted
* A base URI
  * Defines what resource the requested action is for
  * Initially, these will be account identifiers
* Query parameters
  * Provides details for how the request should be fulfilled
  * Initially, currency code and amount to specify transaction request preferences
    * currency uses the 'c' key, with the value encoded as a 3-letter currency code (ex. LBR)
    * amount uses the 'am' key, with the value encoded in micro units (10e-6)

### Example of request intent
This intent represents a request to receive funds at a given address. Since neither the amount nor currency are prefilled, the sender will define these fields.

Identifier information
* Prefix
  * `libra://`
* Base URI
  * Account Identifier: `lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t`
* Query parameters
  * none

**Result**: `libra://lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t`

### Example of request intent with currency specified
This intent represents a request to receive funds in a specific currency at a given address. The amount is defined by the sender.

Identifier information
* Prefix
  * `libra://`
* Base URI
  * Account Identifier: `lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t`
* Query parameters
  * `c=LBR` (currency preference is LBR composite token)

**Result**: `libra://lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t?c=LBR`

### Example of request intent with currency and amount specified
This intent represents a request to receive a specific amount in a specific currency for a given address.

Identifier information
* Prefix
  * `libra://`
* Base URI
  * Address: `lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t`
* Query parameters
  * `c=LBR&am=1000000` (request for 1 LBR, currency preference is LBR composite token, amount is 1000000 µ-units)

**Result**: `libra://lbr1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4usw5p72t?c=LBR&am=1000000`

### Looking ahead
We expect to evolve the Intent Identifier to support a broader range of payment and identity scenarios. These may range from sharing stable identity information to supporting richer payment metadata.
