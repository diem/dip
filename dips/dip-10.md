---
dip: 10
title: DiemID
authors: Sunmi Lee (@sunmilee), David Wolinsky (@davidiw), Andrey Chursin(@andll), Kevin Hurley (@kphfb)
status: Draft
type: Informational
created: 11/03/2020
last_updated: 06/15/2021
issue: https://github.com/diem/dip/issues/156
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Summary

This DIP describes DiemID, a human-readable identifier for user accounts, and a protocol standard for pre-flight exchange using DiemID to form payment transactions.

# Motivation
DiemID provides a convenient method for identifying users within a VASP. DiemID allows users to exchange human-readable identifiers as either the sender or the receiver of peer-to-peer payments, and plays the role of an email address for payments. The benefits of using a DiemID are:
* Privacy: DiemID's do not appear on-chain. The standard uses a pre-flight off-chain exchange between VASPs to agree on a reference ID. The sending VASP can then submit an on-chain transaction containing only this reference ID and without any potentially identifiable user information.
* Persistent Identifiers: Currently there are no persistent user identifiers in the Diem ecosystem. DiemID establishes a persistent identifier from a user's perspective which are not used publicly on-chain.

# End-to-End Experience
Below is an example of using DiemID for transferring money from one user to another.

## Prerequisite:
* VASPs get approval from association (via some offline process) on domain name.
* VASPs have access to a storage solution mapping domain IDs to parent VASP address
```
avasp, 0xf72589b71ff4f8d139674a3f7369c69b
bvasp, 0xc5ab123458df0003415689adbb47326d
```

## An Example P2P Transaction Flow:
* Bob wants to receive funds from Alice
* Alice has an account with VASP A: `alice@avasp`
* Bob has an account with VASP B: `bob@bvasp`
* Bob shares the DiemID, `bob@bvasp` with Alice
* Alice logs into VASP A, enters Bob’s identifier, an amount to pay, and submits payment
* VASP A contacts VASP B via an off-chain API with the sender identifier `alice@avasp` and requests a reference_id, `rb`
* VASP A constructs a transaction with the specified amount and the reference_id `rb` and submits it to the Diem network
* VASP B receives a transaction with metadata containing `rb`, deposits the amount in Bob's account. (VASP B may use Alice’s DiemID for its own record keeping or seek receipt confirmation from Bob.)


# DiemID Format
Diem defines globally unique identifiers to facilitate transacting on the Diem Payment Network. As Diem stores no personally identifiable information on-chain, these identifiers are exchanged during the off-chain process between two VASPs to identify a distinct source and destinations within their respective VASPs in order to produce a reference_id that can be stored on-chain. The format of identifiers is `[user_identifier]@[vasp_domain_identifier]`

Example: `alice@avasp`

* `user_identifier` is a reusable identifier that represents either the source or destination end-user of a payment transaction. It is unique to per user at VASP level. Specification:
  * Case insensitive
  * Valid regular expression: `^[a-zA-Z0-9][a-zA-Z0-9.]*$`
  * Maximum length: 64 characters
* `vasp_domain_identifier` is a unique string that is mapped to a VASP defined in [DIP-182](https://github.com/diem/dip/blob/main/dips/dip-182.md)

We are starting with a small character set to keep it compatible with most naming schemes, but may add on to the set in the future.

# On-chain Domain Resolution
Given a receiver's DiemID, `bob@bvasp`, the sender VASP uses its `vasp_domain_identifier` (`bvasp`) to look up the receiving VASP's on-chain address using the on-chain domain resolution process defined in [DIP-182](https://github.com/diem/dip/blob/main/dips/dip-182.md).

The sender VASP may build an application to listen for domain events to construct a mapping of DiemID domains to VASP on-chain addresses to lookup onchain addresses given a DiemID domain.


# ReferenceID Exchange
Once the sender VASP gets the receiving VASP's address using on-chain domain lookup, the sender VASP initiates a reference ID exchange as defined in [DIP-183](https://github.com/diem/dip/blob/main/dips/dip-183.md)
in order settle on a unique reference ID and submit the transaction on-chain.

The format of the command is:

```
{
   "_ObjectType": "CommandRequestObject",
    "command_type": "SenderInitiatedReferenceIDExchange",
    "command": {
	    "_ObjectType": "SenderInitiatedReferenceIDExchange",
	    "sender": "alice@avasp",
	    "sender_address": "dm1pptdxvfjck4jyw3rkfnm2mnd2t5qqqqqqqqqqqqq305frg",
	    "receiver": "bob@bvasp",
	    "reference_id": "5b8403c9-86f5-3fe0-7230-1fe950d030cb", 
    },
    "cid": "12ce83f6-6d18-0d6e-08b6-c00fdbbf085a",
}
```

The format of the success response is:
```
{
   "_ObjectType": "CommandResponseObject",
    "status": "success",
    "result": {
	    "_ObjectType": "SenderInitiatedReferenceIDExchangeResponse",
	    "receiver_address": "dm1p7ujcndcl7nudzwt8fglhx6wxn08kgs5tm6mz4us2vfufk",
    },
    "cid": "12ce83f6-6d18-0d6e-08b6-c00fdbbf085a",
}
```

Once the reference ID exchange is done and two VASPs have settled on a reference ID, the sender VASP uses that reference ID to create a p2p transaction with [PaymentMetadata](https://github.com/diem/dip/blob/main/dips/dip-183.md#on-chain-transaction-settlement) and submits the transaction on-chain. 