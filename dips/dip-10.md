---
dip: 10
title: Diem ID Spec
authors: Andrey Chursin(@andll), Kevin Hurley (@kphfb), Sunmi Lee (@sunmilee), David Wolinsky (@davidiw)
status: Draft
type: Informational
created: 11/03/2020
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Summary

This DIP describes Diem ID - the human-readable identifier for user accounts.   

# Motivation
Diem ID provides a convenient method for identifying users within a VASP.
* For peer-2-peer payments, Diem ID allows users to exchange human-readable identifiers as either the sender or the recipient of peer-to-peer payments. Instead of sending a [dip-5 address](https://github.com/diem/dip/blob/master/dips/dip-5.md) (that ideally needs to be refreshed for each payment), the receiver can just share their Diem ID once. In this case Diem ID plays the role of an email address for payments. Benefits for this use case:
  * Privacy: There are concerns around leakage of PII when using subaddresses. Diem ID provides better privacy compared to sub-addresses, because unlike sub-addresses, Diem ID is intended to be used in tandem with an off-chain protocol. Hence, Diem ID does not need to expose PII to the chain 
  * Persistent Identifiers: Currently there is a lack of persistent user identifiers in the Diem ecosystem. while subaddresses need to be refreshed for each payment, Diem ID is a persistent identifier from a user's perspective. From the perspective of the chain, Diem IDs does not exist.

# End-to-End Experience
Below is an example of using Diem ID domain for transferring money from one user to another. 

## Prerequisite:
* VASPs get approval from association (via some offline process) on domain name
```
avasp, 0xf72589b71ff4f8d139674a3f7369c69b
bvasp, 0xc5ab123458df0003415689adbb47326d
```

## User Story: 
* Bob wants to receive funds from Alice
* Bob registers a Diem ID at VASP B: `bob@bvasp`
* Alice's Diem ID is registered at VASP A: `alice@avasp`
* Bob shares either this Diem ID, `bob@bvasp`, or a PaymentURI, `diem://bob@bvasp` with Alice
* Alice logs into VASP A, enters Bob’s identifier, an amount to pay, and submits payment
* Alice’s VASP (VASP A) contacts Bob’s VASP’s (VASP B) off-chain API with the sender identifier `alice@avasp` and requests a reference_id, `rb1`
* VASP A constructs a transaction with the specified amount and the reference_id `rb` and submits it to the diem network
* VASP B receives a transaction with metadata containing `rb1`, deposits the amount in his account, and attaches the relevant metadata (e.g., Alice’s Diem ID) to the transaction so Bob can confirm the transaction


# Diem ID Format
Diem defines globally unique identifiers to facilitate transacting on the Diem Payment Network. As Diem stores no PII on-chain, these identifiers are exchanged during the off-chain process between two VASPs to identify a distinct source and destinations within their respective VASPs in order to produce a reference_id that can be stored on-chain. The format for the identifiers follows:
`[user_identifier]@[vasp_domain_identifier]`

Example: `alice@avasp`

* `user_identifier` is a unique identifier meaningful only to a VASP that represents either the source or destination of a transaction. In practice, they are likely to be re-used and should be capable of both being the sender and recipient in a transaction. Their specific lifetime is undefined but should ideally be meaningful to the owner of the identifier. Specification:
  * Case insensitive
  * Valid regular expression: [a-zA-Z0-9]*
  * Maximum length: 64 characters
* `vasp_domain_identifier` is a well-known string that can be mapped to a VASP. Specification:
  * Case insensitive
  * Valid regular expression: [a-zA-Z0-9]*
  * Maximum length: 63 characters


# Naming Service (Off-Chain Lookup Service)
The Diem ID specifies that VASPs can receive payments at a vasp_domain_identifier. The intent is to eventually store these values on-chain. As an initial effort into this space, the Diem Association stores a file mapping domain name to account address. The account address should be a parent VASP. The VASP sending a payment can then obtain the DualAttestation::Credentials::base_url to perform the ReferenceID exchange. An example CSV is:
```
avasp, 0xf72589b71ff4f8d139674a3f7369c69b
bvasp, 0xc5ab123458df0003415689adbb47326d
```

# On-chain data
## Diem ID Domain

```
resource struct DiemIdDomains {
    domains: vector<DiemIdDomain>,
}

struct DiemIdDomain {
    domain: vector<u8>,  // Utf-8 encoded
}
```
* Fields definition:
   * `domain` - name of a Diem ID domain 
* The `DiemIdDomains` resource can only be published into an account with `Role == PARENT_VASP_ROLE_ID`.
* The `DiemIdDomains` contains a list of `DiemIdDomain` structs that are associated with a VASP. As such, it is possible to register more than one Diem ID Domain for a given VASP. We are providing this opportunity to support possible situations when two VASPs merge into one, or when a company wants to provide multiple wallet apps, while having only a single VASP parent account on the chain.
* Only special Treasury Compliance account (address `0xB1E55ED`) can manipulate DiemIdDomains resource:
  * Only TC account can create and publish `DiemIdDomains` resource
  * Only TC account can add, remove or update an `DiemIdDomain` within `DiemIdDomains` resource
* In order to register a Diem ID domain, a VASP needs to submit a request to Diem Association. LA will perform certain checks (out of scope of this document) before issuing an on-chain transaction to register a Diem ID Domain. These checks intend to mitigate irrelevant claims and enforce uniqueness
* The Diem ID domain can be created as part of creating a `ParentVASP` account.
* An entity (potentially the Association) may at some point choose to expose an open source application(*Indexer*) that will allow indexing available Diem IDs and could provide a convenient REST API for applications to fetch information about the domains. The API of such an indexer is out of scope of this RFC.

## Diem ID Domain Events

The Move contract that manages Diem ID domains must emit an event every time Diem ID domain is created, removed or updated. Those events are critical for applications to be able to efficiently index existing Diem ID domains.

While Diem ID domains are published into VASP accounts, Diem ID domain events are published under the Treasury Compliance account. We consolidate events under single account to allow indexers to follow single event stream.

To store events, `DiemIdDomainManager` resource is published under the Treasure Compliance account(address `0xB1E55ED`).

```
resource struct DiemIdDomainManager {
    /// Events are emmitted 
    diem_id_domain_events: Event::EventHandle<Self::DiemIdDomainEvent>,
}

struct DiemIdDomainEvent {
    removed: bool,
    domain: DiemIdDomain,
    address: address,
}
```  

* Fields definition:
  * `removed` - `true`, if DiemIdDomain was removed, `false` if it was created or updated
  * `domain` - exact copy of `DiemIdDomain` that was added/removed from `DiemIdDomains` resource of a VASP account
  * `address` - address of an account where `DiemIdDomain` was added or removed


# ReferenceID Exchange
The PaymentMetadata transactions require a ReferenceID in order to submit a transaction to the chain. PaymentMetadata transactions reveal nothing distinctly about either the sender or recipient and do not create a linkability between the sender or receiver across payments. Hence, the ReferenceID must be established off-chain and this protocol defines one such way to do so leveraging Diem ID.

## ReferenceID Command
A VASP intending to send a payment from one VASP to another when leveraging Diem IDs constructs a ReferenceIDCommand submits that to the recipient side. If the recipient knows the recipient Diem ID and can potentially accept payments, it returns a success. In the case it cannot, it returns an error indicating the reason.

In the case that the amount to be sent would exceed the limit of the travel rule, the sending party should follow this exchange with a PaymentCommand using the same reference_id and specify the sending and receiving subaddresses as all 0.

The format of the command is:
```
{
   "_ObjectType": "CommandRequestObject",
    "command_type": "ReferenceIDCommand",
    "command": {
	    "_ObjectType": "ReferenceIDCommand",
	    "sender": "alice@avasp",
	    "sender_address": "f72589b71ff4f8d139674a3f7369c69b",
	    "recipient": "bob@bvasp",
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
	    "_ObjectType": "ReferenceIDCommandResponse",
	    "recipient_address": "c5ab123458df0003415689adbb47326d",
    },
    "cid": "12ce83f6-6d18-0d6e-08b6-c00fdbbf085a",
}
```
