---
lip: 4
title: Transaction Metadata Specification
authors: Kevin Hurley (@kphfb)
status: Draft
type: Informational
created: 06/26/2020
---
# Summary
---
Custodial wallets may want to identify specific users, such as merchants or individual consumers, that are the parties to an on-chain transaction. The Libra Payment Network leverages subaddressing to provide this functionality.

---
# Terminology
___
*subaddress:* Accounts on-chain are represented by an address.  To allow multiplexing of a single address into multiple wallets, custodial wallets may utilize “subaddresses” under the on-chain address for each underlying user.  Although these subaddresses represent the users, they will have meaning only to the custodial wallet. The mapping from subaddress to user is not presented on-chain, but rather is an internal mapping known only by the custodial wallet.  The best practice is to use subaddresses as a dynamic single-use address to prevent linkability.  In this way, subaddresses serve as a many-to-one mapping between subaddresses and a user - where ideally subaddresses are not re-used for more than one payment.

*referenced_event:* In the case where funds must be returned, referenced_event refers to the event sequence number of the original sender’s sent payment event.  Since refunds are just another form of p2p transfer, the referenced event field allows a refunded payment to refer back to the original payment.


---
# Abstract / Motivation
---

Custodial wallets may want to identify specific users, such as merchants or individual consumers, that are the parties to an on-chain transaction.  The Libra Payment Network leverages subaddressing to provide this functionality. This document describes an approach to supporting this functionality by defining a standard that supports subaddressing to enable multiplexing a single account address into multiple wallets, enabling custodial wallets to maintain a single address rather than maintain numerous addresses.

---
# Specification
---

# The Lifetime of a Transaction Containing Metadata

The first step to submitting a transaction is producing the metadata. The sender first produces a *Libra Canonically Serialized (LCS)* metadata_wrapper consisting of an LCS-serialized MetadataType object:

```
enum MetadataType {
  Undefined,
  GeneralMetadataType(GeneralMetadata),
  TravelRuleMetadataType(TravelRuleMetadata),
  UnstructuredBytesMetadataType(UnstructuredBytesMetadata),
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
    TravelRuleMetadataVersion0(TravelRuleMetadatav0),
}

struct TravelRuleMetadatav0 {
    // Off-chain reference_id.  Used when off-chain APIs are used.
    // Specifies the off-chain reference ID that was agreed upon in off-chain APIs.
    Option<String> off_chain_reference_id,
}

struct UnstructuredBytesMetadata {
    // Unstructured bytes metadata
    Option<Vec<u8>> metadata,
}
```


Using the initial example described in the motivation, the merchant whose wallet's subaddress for this payment is "merch_a", is hosted by a custodial wallet with a public address of 0x1234 may post a URI for shoes that cost 20 microlibra.  The purchaser would then submit a transaction containing the following metadata:

```
0x01, 0x00, 01, "merch_a", 00, 00, 00
/* general_metadata_type, general_metadata_v0,
      to_subaddress_present, to_subaddress,
      from_subaddress_not_present,
      referenced_event_not_present */
```

## Submitting a transaction

With the metadata in hand, the sender can now submit a transaction to the Libra block chain via a [deposit call](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/doc/peer_to_peer_with_metadata.md) in Move. Note that metadata_signature must only be present for travel-rule cases between VASPs and is utilized for dual attestation.

## Processing the transaction

Much like any other funds transfer request, validators only verify that the sender has sufficient Libra Coins to support the transaction and that the transaction is properly formed and valid, they do not inspect or verify the correctness of the metadata.

The recipient custodial wallet should make an effort to refund in the case of malformed metadata or an invalid subaddress for the recipient.

# Transaction Examples

The following examples demonstrate how subaddressing and metadata are used in the transaction flow.  *Note that the terminology “NC” will mean non-custodial account and “C” will mean a custodial account. We note that Unhosted Wallets will not be permitted to transact on the Libra Payment Network at launch.*

## NC to NC transaction Flow

For NC to NC transactions, there is no usage of subaddressing/metadata.

## NC to C Transaction Flow

User A (address 0x1234) on a NC wallet wishes to send 100 microlibra to merchant B who is on a private custodial wallet (where the custodial wallet has a public address of 0x7777 and the merchant has a sub-account of 'bob').  User A's client now composes a raw transaction with the following relevant fields:

```
metadata = GeneralMetadatav0 {
  to_subaddress: 'bob',
};

program = encode_peer_to_peer_with_metadata_script(
    "LBR" /*currency*/,
    0x7777 /*recipient*/,
    100 /*amount*/,
    lcs(MetadataType::GeneralMetadataType(
        GeneralMetadata::GeneralMetadataVersion0(metadata))),
    None /*metadata_signature*/);

RawTransaction {
    sender_account: 0x1234,
    program: program,
}
```

## C to NC transaction flow

User A who is on a custodial wallet (where the C wallet has a public address of 0x7777 and user A has a sub-account of 'alice') wishes to send 100 microlibra to merchant B who is on a NC wallet (with an address of 0x1234).  User A's wallet then composes a transaction via:

```
metadata = GeneralMetadatav0 {
  from_subaddress: 'alice',
};

program = encode_peer_to_peer_with_metadata_script(
    "LBR" /*currency*/,
    0x1234 /*recipient*/,
    100 /*amount*/,
    lcs(MetadataType::GeneralMetadataType(
        GeneralMetadata::GeneralMetadataVersion0(metadata))),
    None /*metadata_signature*/);

RawTransaction {
    sender_account: 0x7777,
    program: program,
}
```


## Refunds

Merchant B now wishes to refund user A. But user A was sending from a custodial account so merchant B must send the funds back to the custodial account and include subaddress information so that the funds are directed back to user A.  Merchant B’s client now constructs a transaction via the following where referenced_event is the committed event sequence number under the sending account of the original sent payment event:

```
metadata = GeneralMetadatav0 {
  to_subaddress: 'alice',
  referenced_event: 123,
};

program = encode_peer_to_peer_with_metadata_script(
    "LBR" /*currency*/,
    0x7777 /*recipient*/,
    100 /*amount*/,
    lcs(MetadataType::GeneralMetadataType(
        GeneralMetadata::GeneralMetadataVersion0(metadata))),
    None /*metadata_signature*/);

RawTransaction {
    sender_account: 0x1234,
    program: program,
}
```

## C to C transaction flow

For transactions under the travel rule threshold, transaction metadata inclusive of both to_subaddress and from_subaddress should be composed.

For transactions over the travel rule limit, custodial to custodial transactions must exchange travel rule compliance data off-chain, so the suggested way to exchange the metadata is during this off-chain exchange. This information should not be exchanged using subaddressing.  An example of this data exchange can be seen in LIP-1.  Once the off-chain APIs have been utilized, there will be an off-chain reference ID which represents this transaction.  The on-chain transaction is now constructed.

User A who is on a custodial wallet (where the C wallet has a public address of 0x7777 and user A has a sub-account of 'alice') wishes to send 100 microlibra to merchant B who is on a C wallet (where the C wallet has a public address of 0x1234 and merchant B has a sub-account of 'bob').  User A's wallet then composes a transaction via (note that the to/from subaddresses are not included since they were shared via the off-chain API):

```
metadata = TravelRuleMetadatav0 {
  off_chain_reference_id: "123abc",
};

lcs_metadata = lcs(MetadataType::TravelRuleMetadataType(
        TravelRuleMetadata::TravelRuleMetadataVersion0(metadata))),

// receiver_signature is passed to the sender via the off-chain APIs as per
// https://github.com/libra/lip/blob/master/lips/lip-1.mdx#recipient-signature

program = encode_peer_to_peer_with_metadata_script(
    "LBR" /*currency*/,
    0x1234 /*recipient*/,
    100 /*amount*/,
    lcs_metadata,
    receiver_signature);

RawTransaction {
    sender_account: 0x7777,
    program: program,
}
```


