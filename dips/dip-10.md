---
dip: 10
title: DiemID
authors: Sunmi Lee (@sunmilee), David Wolinsky (@davidiw), Andrey Chursin(@andll), Kevin Hurley (@kphfb)
status: Draft
type: Informational
created: 11/03/2020
last_updated: 04/28/2021
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
