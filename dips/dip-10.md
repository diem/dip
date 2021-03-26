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
Diem ID provides a convenient method for identifying users within a VASP. Diem ID allows users to exchange human-readable identifiers as either the sender or the recipient of peer-to-peer payments, and plays the role of an email address for payments. The benefits of using a Diem ID are:
* Privacy: Diem ID needs to be used in tandem with an off-chain protocol between VASPs in order exchange information about the end user corresponding to the Diem ID. Hence, Diem ID eliminates the need to directly include user information in a transaction and expose personally identifiable information (PII) on the chain 
* Persistent Identifiers: Currently there is a lack of persistent user identifiers in the Diem ecosystem. Diem ID is a persistent identifier from a user's perspective. From the perspective of the chain, Diem IDs do not exist.

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
* Bob shares the Diem ID, `bob@bvasp` with Alice
* Alice logs into VASP A, enters Bob’s identifier, an amount to pay, and submits payment
* Alice’s VASP (VASP A) contacts Bob’s VASP’s (VASP B) off-chain API with the sender identifier `alice@avasp` and requests a reference_id, `rb1`
* VASP A constructs a transaction with the specified amount and the reference_id `rb` and submits it to the Diem network
* VASP B receives a transaction with metadata containing `rb`, deposits the amount in Bob's account, and attaches the relevant metadata (e.g., Alice’s Diem ID) to the internally stored transaction so Bob can confirm the transaction


# Diem ID Format
Diem defines globally unique identifiers to facilitate transacting on the Diem Payment Network. As Diem stores no PII on-chain, these identifiers are exchanged during the off-chain process between two VASPs to identify a distinct source and destinations within their respective VASPs in order to produce a reference_id that can be stored on-chain. The format for the identifiers follows:
`[user_identifier]@[vasp_domain_identifier]`

Example: `alice@avasp`

* `user_identifier` is a reusable identifier that represents either the source or destination end-user of a payment transaction. It is unique to per user at VASP level. Specification:
  * Case insensitive
  * Valid regular expression: [a-zA-Z0-9]+
  * Maximum length: 64 characters
* `vasp_domain_identifier` is a unique string that is mapped to a VASP. Specification:
  * Case insensitive
  * Valid regular expression: [a-zA-Z0-9]+
  * Maximum length: 63 characters


# Naming Service (Off-Chain Lookup Service)
The intent is to eventually store Diem ID domains on-chain; however, the Diem Association will initially store and distribute a CSV file mapping domain name to account address. The account address should be a parent VASP. The VASP sending a payment can then obtain the DualAttestation::Credentials::base_url to perform the ReferenceID exchange. An example CSV is:
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
* The `DiemIdDomains` contains a list of `DiemIdDomain` structs that are associated with a VASP. As such, it is possible to register more than one Diem ID Domain for a given VASP
* Only special Treasury Compliance account (address `0xB1E55ED`) can manipulate DiemIdDomains resource:
  * Only TC account can create and publish `DiemIdDomains` resource
  * Only TC account can add, remove or update an `DiemIdDomain` within `DiemIdDomains` resource
* `DiemIDDomains` resource will be created in an empty state as part of creating a `ParentVASP` account resource, and existing `ParentVASP` accounts without `DiemIDDomains` will have the resource instantiated by the DiemRoot account.
* In order to register a Diem ID domain, a VASP needs to submit a request to Diem Association. Diem Association will perform certain checks (out of scope of this document) before issuing an on-chain transaction to register a Diem ID Domain. These checks intend to mitigate irrelevant claims and enforce uniqueness

## Diem ID Domain Events

The Move contract that manages Diem ID domains must emit an event every time Diem ID domain is created, removed or updated. Those events are critical for applications to be able to efficiently index existing Diem ID domains.
An application can be built to listen for these events to construct a mapping of Diem ID domains to VASP accounts for lookup of onchain addresses given a Diem ID domain.
While Diem ID domains are published into VASP account resource, Diem ID domain events are published under the Treasury Compliance account. We consolidate events under single account to allow indexers to follow a single event stream.

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

# Diem ID or Subaddress?
[DIP-5](https://github.com/diem/dip/blob/master/dips/dip-5.md) defines subaddresses as a way of defining a user address. Between subaddress and Diem ID, the recommended way of representing a user address is to use a Diem ID, as Diem ID provides clear benefits over subaddresses:  
* Subaddresses are ideally one-time use addresses, and need to be refreshed for each payment. However, a Diem ID can be shared once and will be a persistent identifier from a user's perspective.
* There are concerns around leakage of PII when using subaddresses, because the subaddress has to be included in the on-chain transaction metadata. Diem ID provides better privacy, because Diem ID is exchanged off-chain.
