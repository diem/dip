---
dip: 4
title: Transaction Metadata Specification
authors: Kevin Hurley (@kphfb)
status: Last Call
type: Informational
created: 06/26/2020
---

# Summary
---
Custodial wallets may want to identify specific users, such as merchants or individual consumers, that are the parties to an on-chain transaction. The Diem Payment Network leverages subaddressing to provide this functionality.

---
# Terminology
___
*subaddress:* Accounts on-chain are represented by an address.  To allow multiplexing of a single address into multiple wallets, custodial wallets may utilize “subaddresses” under the on-chain address for each underlying user.  Although these subaddresses represent the users, they will have meaning only to the custodial wallet. The mapping from subaddress to user is not presented on-chain, but rather is an internal mapping known only by the custodial wallet.  The best practice is to use subaddresses as a dynamic single-use address to prevent linkability.  In this way, subaddresses serve as a many-to-one mapping between subaddresses and a user - where ideally subaddresses are not re-used for more than one payment.

*referenced_event:* In the case where funds must be returned, referenced_event refers to the event sequence number of the original sender’s sent payment event.  Since refunds are just another form of p2p transfer, the referenced event field allows a refunded payment to refer back to the original payment.


---
# Abstract / Motivation
---

Custodial wallets may want to identify specific users, such as merchants or individual consumers, that are the parties to an on-chain transaction.  The Diem Payment Network leverages subaddressing to provide this functionality. This document describes an approach to supporting this functionality by defining a standard that supports subaddressing to enable multiplexing a single account address into multiple wallets, enabling custodial wallets to maintain a single address rather than maintain numerous addresses.

---
# Specification
---

# The Lifetime of a Transaction Containing Metadata

The first step to submitting a transaction is producing the metadata. The sender first produces a *Binary Canonical Serialization (BCS)* metadata_wrapper consisting of an BCS-serialized Metadata object:

```
enum Metadata {
  Undefined,
  GeneralMetadata(GeneralMetadata),
  TravelRuleMetadata(TravelRuleMetadata),
  UnstructuredBytesMetadata(UnstructuredBytesMetadata),
  RefundMetadata(RefundMetadat),
}

// Used for versioning of general metadata
enum GeneralMetadata {
    GeneralMetadataVersion0(GeneralMetadatav0),
}

struct GeneralMetadatav0 {
    // Subaddress to which the funds are being sent
    Option<Vec<u8>> to_subaddress,

    // Subaddress from which the funds are being sent
    Option<Vec<u8>> from_subaddress,

    // Event sequence number of the `SentPaymentEvent` that this transaction is refunding
    Option<u64> referenced_event,
}

// Used for versioning of travel rule metadata
enum TravelRuleMetadata {
    TravelRuleMetadataVersion0(TravelRuleMetadataV0),
}

struct TravelRuleMetadataV0 {
    // Off-chain reference_id.  Used when off-chain APIs are used.
    // Specifies the off-chain reference ID that was agreed upon in off-chain APIs.
    Option<String> off_chain_reference_id,
}

struct UnstructuredBytesMetadata {
    // Unstructured bytes metadata
    Option<Vec<u8>> metadata,
}

enum RefundMetadata {
  RefundMetadataV0(RefundMetadataV0),
}

struct RefundMetadataV0 {
  transaction_version: u64,
  reason: RefundReason,
}

enum RefundReason {
  OtherReason = 0,
  InvalidSubaddress = 1,
  UserInitiatedPartialRefund = 2,
  UserInitiatedFullRefund = 3,
}
```


Using the initial example described in the motivation, the merchant whose wallet's subaddress for this payment is "merch_a", is hosted by a custodial wallet with a public address of 0x1234 may post a URI for shoes that cost 20 microdiem.  The purchaser would then submit a transaction containing the following metadata:

```
0x01, 0x00, 01, "merch_a", 00, 00, 00
/* general_metadata, general_metadata_v0,
      to_subaddress_present, to_subaddress,
      from_subaddress_not_present,
      referenced_event_not_present */
```

## Submitting a transaction

With the metadata in hand, the sender can now submit a transaction to the Diem block chain via a [deposit call](https://github.com/diem/diem/blob/master/language/stdlib/transaction_scripts/doc/peer_to_peer_with_metadata.md) in Move. Note that metadata_signature must only be present for travel-rule cases between VASPs and is utilized for dual attestation.

## Processing the transaction

Much like any other funds transfer request, validators only verify that the sender has sufficient Diem Coins to support the transaction and that the transaction is properly formed and valid, and do not inspect or verify the correctness of the metadata.

The recipient custodial wallet should make an effort to refund (via issuing a transaction in the reverse direction for the received amount minus gas costs) in the case of malformed metadata or an invalid subaddress for the recipient.

# Transaction Examples

The following examples demonstrate how subaddressing and metadata are used in the transaction flow.  *Note that the terminology “NC” will mean non-custodial account and “C” will mean a custodial account. We note that as per the Diem Association non-custodial, unhosted wallets will not be permitted to transact on the Diem Payment Network at launch.*

## NC to NC transaction Flow

For NC to NC transactions, there is no usage of subaddressing/metadata.

## NC to C Transaction Flow

User A (address 0x1234) on a NC wallet wishes to send 100 microdiem to merchant B who is on a private custodial wallet (where the custodial wallet has a public address of 0x7777 and the merchant has a sub-account of 'bob').  User A's client now composes a raw transaction with the following relevant fields:

```
metadata = Metadata::GeneralMetadata(
  GeneralMetadata::GeneralMetadaVersion0(
    GeneralMetadataV0 {
      to_subaddress: 'bob',
})));

program = encode_peer_to_peer_with_metadata_script(
    "XDX" /*currency*/,
    0x7777 /*recipient*/,
    100 /*amount*/,
    bcs.serialize(metadata, Metadata),
    None /*metadata_signature*/);

RawTransaction {
    sender_account: 0x1234,
    program: program,
}
```

## C to NC transaction flow

User A who is on a custodial wallet (where the C wallet has a public address of 0x7777 and user A has a sub-account of 'alice') wishes to send 100 microdiem to merchant B who is on a NC wallet (with an address of 0x1234).  User A's wallet then composes a transaction via:

```
metadata = Metadata::GeneralMetadata(
  GeneralMetadata::GeneralMetadaVersion0(
    GeneralMetadataV0 {
      from_subaddress: 'alice',
})));

program = encode_peer_to_peer_with_metadata_script(
    "XDX" /*currency*/,
    0x1234 /*recipient*/,
    100 /*amount*/,
    bcs.serialize(metadata, Metadata),
    None /*metadata_signature*/);

RawTransaction {
    sender_account: 0x7777,
    program: program,
}
```


## Refunds

Diem has two approaches to refunds, Refund transactions and refunds via a peer-to-peer payment in reverse. Refund transactions primarily exist for payment violations, e.g., the recipient has no knowledge about the metadata contained within the transaction.

For human driven refunds, there are two cases two consider:
* *TravelRule:* All travel rule refunds must execute the off-chain protocol defined in DIP-1 and submit a TravelRule transaction to the chain.
* *General:* can either leverage a Refund transaction or submit follow up General payment swapping the subaddress 'to' and 'from' fields.

Refund transactions contain a RefundMetadata::RefundMetadataV0 object that contains the transaction version and a reason for the refund. The transaction version is a globally unique identifier for a transaction once it has been committed to the blockchain. The intent of the reason is to help support automated resolution on why a refund is being sent / received without off-chain interaction. The OtherReason is provided as a means to cover all possible refund types and to indicate that off-chain communication is likely required to resolve why a refund has been sent.

## C to C transaction flow

For transactions under the travel rule threshold, transaction metadata inclusive of both to_subaddress and from_subaddress should be composed.

For transactions over the travel rule limit, custodial to custodial transactions must exchange travel rule compliance data off-chain, so the suggested way to exchange the metadata is during this off-chain exchange. This information should not be exchanged using subaddressing.  An example of this data exchange can be seen in DIP-1.  Once the off-chain APIs have been utilized, there will be an off-chain reference ID which represents this transaction.  The on-chain transaction is now constructed.

User A who is on a custodial wallet (where the C wallet has a public address of 0x7777 and user A has a sub-account of 'alice') wishes to send 100 microdiem to merchant B who is on a C wallet (where the C wallet has a public address of 0x1234 and merchant B has a sub-account of 'bob').  User A's wallet then composes a transaction via (note that the to/from subaddresses are not included since they were shared via the off-chain API):

```
metadata = Metadata::TravelRuleMetadata(
  TravelRuleMetadata::TravelRuleMetadataVersion0(
    TravelRuleMetadataV0 {
      off_chain_reference_id: "123abc",
}));

bcs_metadata = bcs.serialize(metadata, Metadata);


// receiver_signature is passed to the sender via the off-chain APIs as per
// https://github.com/diem/dip/blob/master/dips/dip-1.mdx#recipient-signature

program = encode_peer_to_peer_with_metadata_script(
    "XDX" /*currency*/,
    0x1234 /*recipient*/,
    100 /*amount*/,
    bcs_metadata,
    receiver_signature);

RawTransaction {
    sender_account: 0x7777,
    program: program,
}
```

