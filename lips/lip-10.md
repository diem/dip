---
lip: 10
title: Libra ID Spec
authors: Andrey Chursin(@andll), Kevin Hurley (@kphfb)
status: Draft
type: Standard
created: 11/03/2020
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Summary

This LIP describes Libra ID - the human-readable identifier for user accounts.   

In addition to describing the format of the Libra ID, this LIP also describes the off-chain protocol for the peer-2-peer payment with Libra ID.

# Motivation
Libra ID provides a convenient way to identify a user's account within a VASP. There are two main use cases for Libra ID:
* For peer-2-peer payments, Libra ID allows a user to provide a human-readable ‘identifier’ to the sender. Basically, instead of sending a [lip-5 address](https://github.com/libra/lip/blob/master/lips/lip-5.md) (that needs to be refreshed for each payment, ideally), the receiver can just share their Libra ID once. In this case Libra ID plays the role of an email address for payments. Benefits for this use case:
  * The Libra ID resolution process can facilitate the exchange of rich information(e.g. nicknames, profile picture, etc.) about both the sender and receiver of the payment
  * Libra ID provides better privacy compared to using sub-addresses, because Libra ID is not shared on the chain and will always use a single-use identifier for the on-chain ID
  * From a user's perspective, Libra ID is a persistent identifier.  But from the perspective of the chain, Libra IDs do not exist and instead transactions are have a single-use ID to identify them. By contrast, from the viewpoint of both a user and the chain, a sub-address is an ephemeral user identifier that should be recycled frequently to preserve privacy, but appears on-chain and could thus be used to link payments if it isn't recycled upon each usage.

# User story
Below is an example of using Libra ID domain for transferring money from one user to another. 

* Receiver shares their Libra ID with the sender (outside the scope of this document)
* Sender enters receiver's Libra ID and other relevant information into their wallet application
* Sender's wallet attempts to fetch the receiver's profile picture and full name along with a confirmation dialog
* Sender confirms the identity of the recipient
* Sender presses ‘send’ button
* Receiver's account is credited the amount in the transaction
* Receiver's wallet displays recent transactions and their senders

# Libra ID format
Libra ID is a string in format `<user-id>$<libra-id-domain>`.

Example: `andrey$novi`

* **user-id**, identifies an account within a VASP:
  * Case insensitive
  * Regex: `^[a-zA-Z0-9][a-zA-Z0-9-_+.]*$`
  * Maximum length: 64 characters
  * Stored internally in the VASP. Not published on the chain, there is no way for an external entity to list all the users within VASP.
  * Defined by the VASP - user selected, auto-generated, etc.
* **libra-id-domain** identifies a VASP:
  * Case insensitive
  * Regex: `^[a-zA-Z0-9][a-zA-Z0-9-]+$`
  * Maximum length: 63 characters
  * Association between libra id and VASP is published on the chain 

## Libra ID domains
Each Libra ID domain is associated with a single VASP. This information is stored on the block chain in a `LibraIdDomains` resource published in a parent VASP's on-chain account.

```
resource struct LibraIdDomains {
    domains: vector<LibraIdDomain>,
}

struct LibraIdDomain {
    domain: vector<u8>,  // Utf-8 encoded
}
```
* Fields definition:
   * `domain` - name of a Libra ID domain 
* The `LibraIdDomains` resource can only be published into an account with `Role == PARENT_VASP_ROLE_ID`.
* The `LibraIdDomains` contains a list of `LibraIdDomain` structs that are associated with a VASP. As such, it is possible to register more than one Libra ID Domain for a given VASP. We are providing this opportunity to support possible situations when two VASPs merge into one, or when a company wants to provide multiple wallet apps, while having only a single VASP parent account on the chain.
* Only special Treasury Compliance account (address `0xB1E55ED`) can manipulate LibraIdDomains resource:
  * Only TC account can create and publish `LibraIdDomains` resource
  * Only TC account can add, remove or update an `LibraIdDomain` within `LibraIdDomains` resource
* In order to register a Libra Id domain, a VASP needs to submit a request to Libra Association. LA will perform certain checks (out of scope of this document) before issuing an on-chain transaction to register a Libra Id Domain. These checks intend to mitigate irrelevant claims and enforce uniqueness
* The Libra ID domain can be created as part of creating a `ParentVASP` account.
* An entity (potentially the Association) may at some point choose to expose an open source application(*Indexer*) that will allow indexing available Libra IDs and could provide a convenient REST API for applications to fetch information about the domains. The API of such an indexer is out of scope of this RFC.

# Off-chain protocol

**TODO: This section may change in the future as we update LIP 1**

<img alt="Payment flow" src={useBaseUrl('img/libra-id-flow.png')} />

In order to support peer-2-peer payments, VASPs need to implement two Libra ID endpoints:

* **Info endpoint** for querying optional information about the receiver. VASPs can provide this endpoint to improve UX and security of payment, but they are not obligated to - VASPs may choose not to share any information about the user via this endpoint, including whether the user exists or not.
  * *For example*: VASP can define a 'contact list' and only share information if the sender is in receiver's contacts
* **Payment endpoint** to perform actual money transfer.

## Info endpoint

**Info endpoint** is used by the **Sender** to request information about the **Receiver** before submitting an actual payment.

Info endpoint takes both sender and receiver Libra IDs as arguments. Receiver VASP might decide to share more(or less) information based on sender ID, for example if the wallet supports some kind of contact list, they might decide to share more information if the sender is in the contact list of the receiver.

**Request:**
```json
{
   "sender": "<User Object>",
   "receiver_id": "<Receiver Libra ID>"
}
```

| Field 	   | Type 	     | Required? 	| Description 	           |
|-------	   |------	     |-----------	|-------------	           |
|sender        |[User Object](https://github.com/libra/lip/blob/master/lips/lip-10.md#user-object)  | Y            | Information about the sender |
|receiver_id   |str          | Y            | Libra ID of the receiver |

**Response:**
```json
{
   "receiver": "<User Object>"
}
```

| Field 	   | Type 	     | Required? 	| Description 	             |
|-------	   |------	     |-----------	|-------------	             |
|receiver      |[User Object](https://github.com/libra/lip/blob/master/lips/lip-10.md#user-object)  | Y            | Information about the receiver |

* Receiver Libra ID domain must belong to the Receiver VASP. Otherwise, Receiver VASP must return the `400` error code.
* Sender Libra ID must have a Libra ID domain that belongs to Sender VASP. If this is not the case, the Receiver VASP should return the `400` error code 
* Receiver VASP may optionally choose how much information to share based on the sender Libra ID. If Receiver VASP decides to not share data, it should return an empty `User Object` with only `libra_id` field set
* If user is not found, the VASP should return error code `404`  

## Pay endpoint

**TODO: This endpoint is going to be merged into LIP 1**

**Pay endpoint** is used when a user is willing to make a money transfer.

**Request:**
```json
{
   "sender": "<User Object>",
   "receiver_id": "<Receiver_Libra_ID>",
   "amount": "<amount>",
   "currency": "<currency>"
}
```

| Field 	   | Type 	     | Required? 	| Description 	           |
|-------	   |------	     |-----------	|-------------	           |
|sender        |[User Object](https://github.com/libra/lip/blob/master/lips/lip-10.md#user-object)  | Y            | Information about the sender |
|receiver_id   |str          | Y            | Libra ID of the receiver |
|amount        |integer      | Y            | Amount of coins to transfer |
|currency      |str          | Y            | Name of the coin |

**Response:**
```json
{
   "receiver_address": "<Receiver VASP on-chain account address>",
   "reference_id": "<Payment_Reference_ID>",
   "receiver": "<User Object>"
}
```

| Field 	      | Type       | Required? 	| Description 	           |
|-------	      |------      |-----------	|-------------	           |
|receiver_address |str         | Y            | On-chain account address for receiving the payment. This address must be encoded as a [Bech32 account identifier](https://github.com/libra/lip/blob/master/lips/lip-5.md#account-identifiers) **without** subaddress |
|reference_id     |str         | Y            | Reference ID to be included into payment metadata |
|receiver         |[User Object](https://github.com/libra/lip/blob/master/lips/lip-10.md#user-object) | Y            | Information about the receiver |

* Pay endpoint is used to exchange details of the payment such as information about Sender and Receiver off the chain, and negotiate `Payment_Reference_ID`

* Once the sender learns Payment_Reference_ID, it will submit an on-chain transaction including the `Payment_Reference_ID` as a metadata. Receiver will use the `Payment_Reference_ID` in the transaction to link the on-chain transaction to the payment.

* Sender will submit a transaction to the `receiver_address` on-chain account in the response. This account address can be either Parent VASP, or any of Child VASP accounts of the receiver VASP. This is needed to allow the receiver VASP to manage load between different on-chain accounts.

* `Payment_Reference_ID` must be unique for each payment, it must not be reused in any way to avoid leaking privacy information on-chain.

* `Payment_Reference_ID` returned by this endpoint is not signed for KYC purposes. This means that payment above KYC threshold can not be submitted right away using the provided Payment_Reference_ID. Instead, sender VASP needs to proceed to KYC endpoint to negotiate the signed Reference ID.

* KYC endpoint API will be updated to accept `Payment_Reference_ID` returned by the Libra ID endpoint instead of address/subaddress.

## User Object
User Object defines reach information about the user.

All fields, except for `libra_id`, in this object are optional - VASP can choose to share either of those fields or none.

Additionally, all fields in this object are informational - **they must not be used for KYC and only intended for UI purposes**.
```json
{
   "libra_id": "<Libra_ID>",
   "display_name": "<Display name>",
   "profile_picture": "<profile_picture_uri>"
}
```

| Field 	      | Type  | Required? 	| Description 	           |
|-------	      |------ |-----------	|-------------	           |
|libra_id         |str    | Y           | Libra ID of the user |
|display_name     |str    | N           | Display name of the user. Usually a full name |
|profile_picture  |str    | N           | Profile picture URL(see below) |

If a user does not exist, VASP can choose to return an HTTP error, or the empty User Object, depending on it’s privacy choices.

## Profile Picture URI
Profile picture URI is a URI that represents a profile picture of a user. Wallet app must support two possible URI schemas for profile picture.

* **Https schema.** If URI starts with https:, wallet must attempt to fetch profile picture from the HTTP URI provided. When fetching this URI wallet app will not provide any authentication. Wallet app will use GET method to fetch the profile picture specified using https schema.
  * Ex.: *https://novi.com/pictures/alice.png*
* **Data schema.** If URI starts with data:, wallet must interpret the URI as a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) that contains profile picture encoded.
  * Ex.: *data:image/gif;base64,AAAAAAAA*
* **Unencrypted http** schema must not be used to share profile pictures.
