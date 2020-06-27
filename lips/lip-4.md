---
lip: 4
title: Transaction Metadata Specification
author: Kevin Hurley (@kphfb)
status: Draft
type: Informational
created: 06/26/2020
---
# Summary
---
Merchants and wallet holders may rely on third parties to maintain custody of their wallet and may optionally want to receive additional data in transactions.  Libra leverages subaddressing to provide this functionality.

---
# Terminology
___
*subaddress:* Accounts on-chain are represented by an address.  To allow multiplexing of a single address into multiple wallets, custodial wallets may utilize “subaddresses” under the on-chain address for each underlying user.  These subaddresses represent the users and may have meaning only to the custodian - but the mapping from subaddress to user is not known on-chain, but rather is an internal mapping known by the custodian.
*referenced_event:* In the case where funds must be returned, referenced_event refers to the event sequence number of the sender’s original sent payment event.  Since refunds are just another form of p2p transfer, the referenced event field allows a refunded payment to refer back to the original payment.


---
# Abstract / Motivation
---

Merchants and wallet holders may rely on third parties to maintain custody of their wallet and may optionally want to receive additional data in transactions.  Libra leverages subaddressing to provide this functionality.  This document describes an approach to supporting transactions like this by defining a standard that supports:

* Subaddressing to support multiplexing a single account address into multiple wallets, enabling custodial wallets to maintain a single address rather than maintain numerous addresses.

As an example, assume a recipient account provides custodial wallets. To send funds to this wallet within Libra:

* The recipient crafts a QR code containing a URI that references the account hosting the custodial wallet, or the host, and a reference to their wallet.
* The consumer scans the QR code and constructs a transaction and includes within it the subaddress.
* Once the transaction has been submitted and committed to the blockchain, the host notifies the recipient of the transaction.

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
  UnstructuredStringMetadataType(UnstructuredStringMetadata),
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
    
    // Event sequence number of referenced payment
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

struct UnstructuredStringMetadata {
    // Unstructured string metadata
    Option<String> metadata,
}
```


Using the initial example described in the motivation, the merchant whose wallet, 0x5678, is hosted by 0x1234 may post a URI for shoes that cost 20 microlibra.  The purchaser would then submit a transaction containing the following metadata:

```
0x01, 0x00, 01, 0x5678, 00, 00, 00
/* general_metadata_type, general_metadata_v0, 
      to_subaddress_present, to_subaddress,  
      from_subaddress_not_present, 
      referenced_event_not_present */
```

## Submitting a transaction

With the metadata in hand, the sender can now submit a transaction to the Libra block chain via a deposit call in Move:

```
deposit<LBR>(
    recipient_address, 
    amount, 
    metadata, 
    metadata_signature);
```

In the case of the example above, 0x1234 would be the recipient and 20 LBR would be the amount.  Note that metadata_signature must only be present for travel-rule cases between VASPs.

## Processing the transaction

Much like any other funds transfer request, validators only verify that the sender has the sufficient libra to support the transaction and that the transaction is properly formed and valid, they do not inspect or verify the correctness of the metadata.

# Transaction Examples

The following examples demonstrate how subaddressing and metadata are used in the transaction flow.  *Note that the terminology “NC” will mean non-custodial account and “C” will mean a custodial account.*

## NC to NC transaction Flow

For NC to NC transactions, there is no usage of subaddressing/metadata.

## NC to C Transaction Flow

User A (address 0x1234) on a NC wallet wishes to send 100 microlibra to merchant B who is on a private custodial wallet (Where the custodial wallet has a public address of 0x7777 and the merchant has a sub-account of 0x987).  User A's client now composes a raw transaction with the following relevant fields:

```
metadata = GeneralMetadatav0 {
  to_subaddress: 0x987,
};

program = deposit<LBR>(
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

User A who is on a custodial wallet (Where the C wallet has a public address of 0x7777 and user A has a sub-account of 0x987) wishes to send 100 microlibra to merchant B who is on a NC wallet (with an address of 0x1234).  User A's wallet then composes a transaction via:

```
metadata = GeneralMetadatav0 {
  from_subaddress: 0x987,
};

program = deposit<LBR>(
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

Merchant B now wishes to refund user A. But user A was sending from a custodial account so merchant B must send the funds back to the custodial account and include subaddress information so that the funds are directed back to user A.  Merchant B’s client now constructs a transaction via the following where referenced_event is the committed event sequence number under the sending account of the original send payment event:

```
metadata = GeneralMetadatav0 {
  to_subaddress: 0x987,
  referenced_event: 123,
};

program = deposit<LBR>(
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

For transactions over the travel rule limit, custodial to custodial transactions must follow the off-chain API specification, so the suggested way to exchange the metadata is during this off-chain exchange rather than using purely subaddressing.  More details can be seen at: https://fb.quip.com/aVekANHLI8Up#IMWACAtaegP.  Once the off-chain APIs have been utilized, there will be an off-chain reference ID which represents this transaction.  The on-chain transaction is now constructed.

User A who is on a custodial wallet (Where the C wallet has a public address of 0x7777 and user A has a sub-account of 0x987) wishes to send 100 microlibra to merchant B who is on a C wallet (where the C wallet has a public address of 0x1234 and merchant B has a sub-account of 0x567).  User A's wallet then composes a transaction via (note that the to/from subaddresses are not included since they were passed via the off-chain API):

```
metadata = TravelRuleMetadatav0 {
  off_chain_reference_id: "123abc",
};

lcs_metadata = lcs(MetadataType::TravelRuleMetadataType(
        TravelRuleMetadata::TravelRuleMetadataVersion0(metadata))),

// The receiver side will have signed this as part of the off-chain APIs
// and will have sent it to the sender side
{ // Done by receiver VASP
    metadata_signature = sign(metadata, sender_address, amount, receiver_key);
}

program = deposit<LBR>(
    0x1234 /*recipient*/,
    100 /*amount*/, 
    metadata,
    metadata_signature);

RawTransaction {
    sender_account: 0x7777,
    program: program, 
}
```


