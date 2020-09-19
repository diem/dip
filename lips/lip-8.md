---
lip: 10
title: Off-chain API Version 1 Extensions
authors: Kevin Hurley (@kphfb)
status: Draft
type: Informational
created: 09/18/2020
---

# Summary
---
An extension of the Off-Chain protocol to provide support for more advanced merchant use-cases.

---
# Abstract / Motivation
---

Version 0 of the Off-Chain Protocol is described in [LIP 1](https://lip.libra.org/lip-1/).  Version 1 as described here is an extension of the Off-Chain Protocol and adds features to support more advanced functionality - particularly targeted to support merchant use-cases.  This is inclusive of pull payments, recurring payments, and auth/capture flows.

---
# Specification
---

# Fund Pull Pre-Approval
### *VERSION SUPPORT: Supported only in version 1 of off-chain APIs*

Establishes a relationship between sender and recipient where the recipient can now pull funds from the sender without sender approving each transaction.  This allows recipient to bill the sender without sender approving each payment.  This relationship exists between a subaddress on the biller side and a subaddress on the sender side.  After this request is POSTed, the target VASP can use out-of-band methods to determine if this request should be granted.  If the target VASP chooses to allow the relationship to be established, the biller can create a payment object and POST to the billed party’s VASP to request funds.  The “funds_pull_approval_id” object must then match the ID established by this request.

## Request/Response Payload
All requests between VASPs are structured as [`CommandRequestObject`s](https://lip.libra.org/lip-1/#commandrequestobject) and all responses are structured as [`CommandResponseObject`s](https://lip.libra.org/lip-1/#commandresponseobject).  For a fund pre-approval command, the resulting request takes a form of the following:

```
{
    "_ObjectType": "CommandRequestObject",
    "command_type": "FundPullPreApprovalCommand",
    "cid": "88b282d6181129f682be0421d0ee9887",
    "command": {
        "_ObjectType": "FundPullPreApprovalCommand",
        "_reads": {},
        "_writes": {
            "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_5b8403c986f53fe072301fe950d030cb": "88b282d6181129f682be0421d0ee9887"
        },
        "fund_pull_pre_approval": {
            "address": "lbr1pgfpyysjzgfpyysjzgfpyysjzgf3xycnzvf3xycsm957ne",
            "biller_address": "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pg9skzctpv9skzcg9kmwta",
            "funds_pre_approval_id": "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_7b8404c986f53fe072301fe950d030de"
            "expiration_timestamp": 72322, 
            "max_cumulative_amount": {
                "amount": 1000,
                "currency": "LBR"
            }
            "description": "Kevin's online shop",
            "status": "pending",
        }
    },
}
```

A response would look like the following:

```
{
    "_ObjectType": "CommandResponseObject",
    "status": "success",
}
```

### CommandRequestObject
For a fund pre-approval request, the [command_type](https://lip.libra.org/lip-1/#commandrequestobject) field is set to "FundPullPreApprovalCommand".  The command object is a [`FundPullPreApprovalCommand` object](#fundpullpreapprovalcommand-object).

```
{

    "_ObjectType": "CommandRequestObject",
    "command_type": "FundPullPreApprovalCommand",
    "cid": "88b282d6181129f682be0421d0ee9887",
    "command": FundPullPreApprovalCommand(),
}
```

### FundPullPreApprovalCommand object
| Field 	    | Type 	| Required? 	| Description 	|
|-------	    |------	|-----------	|-------------	|
| _ObjectType   | str  | Y             | The fixed string `FundPullPreApprovalCommand` |
| fund_pull_pre_approval| [`FundPullPreApprovalObject`](#fundpullpreapprovalobject) | Y | contains a `FundPullPreApprovalObject` that either creates a new pre-approval or updates an existing pre-approval. Note that strict validity checks apply when updating pre-approvals, that are listed in the section below describing these Objects. An invalid update or initial pre-approval object results in a Command error
| _reads | JSON Object map |  Y | Must be an Object containing mappings of `reference_id` to latest Version as represented by the `cid` of the latest Command which successfully mutated the Object referenced by the `reference_id`. The value in this field must match a `cid` previously specified by a Command by the `_writes` parameter on a prior Command for this payment Object.  For a fund_pull_pre_approval Command, only zero or one `_reads` values should be specified since fund approvals are only dependent upon at most one prior Version of an Object. A list with any other number of items results in a Command error.  If the list is empty this fund_pull_pre_approval Command defines a new fund_pull_pre_approval. If the list contains one item, then this Command updates the shared [`FundPullPreApprovalObject`](#fundpullpreapprovalobject). |
| _writes | JSON object map | Y | For a fund_pull_pre_approval Command, the `_writes` field may only be a single key-value pair since a fund_pull_pre_approval Command only operates upon one Object.  This field maps the `reference_id` of the Object being written to its new Version. |

```
{
    "_ObjectType": "FundPullPreApprovalCommand",
    "_reads": {},
    "_writes": {
        "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_5b8403c986f53fe072301fe950d030cb": "88b282d6181129f682be0421d0ee9887"
    },
    "fund_pull_pre_approval": {
         FundPullPreApprovalObject(),
    }
}
```

### FundPullPreApprovalObject

The structure in this object can be a full pre-approval or just the fields of an existing pre-approval object that need to be changed. Some fields are immutable after they are defined once (see below). Others can by updated multiple times. Updating immutable fields with a different value results in a command error, but it is acceptable to re-send the same value.

| Field 	    | Type 	| Required? 	| Description 	|
|-------	    |------	|-----------	|-------------	|
| address | str | Required for creation | Address of account from which the pre-approval is being requested. Addresses may be single use or valid for a limited time, and therefore VASPs should not rely on them remaining stable across time or different VASP addresses. The addresses are encoded using bech32. The bech32 address encodes both the address of the VASP as well as the specific user's subaddress. They should be no longer than 80 characters. Mandatory and immutable. For Libra addresses, refer to "account identifier" section in LIP-5 for format. |
| biller_address | str | Required for creation | Address of account from which billing will happen. Addresses may be single use or valid for a limited time, and therefore VASPs should not rely on them remaining stable across time or different VASP addresses. The addresses are encoded using bech32. The bech32 address encodes both the address of the VASP as well as the specific user's subaddress. They should be no longer than 80 characters. Mandatory and immutable. For Libra addresses, refer to "account identifier" section in LIP-5 for format. |
| expiration_timestamp | uint | N | Unix timestamp indicating the time at which this pre-approval will expire - after which no funds pulls can occur.  To expire an existing pre-approval early, this field can be updated with the current unix timestamp. |
| funds_pre_approval_id | str | Y | Unique reference ID of this pre-approval on the pre-approval initiator VASP (the VASP which originally created this pre-approval object). This value should be unique, and formatted as “<creator_vasp_onchain_address_bech32>_<unique_id>”.  For example, ”lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_7b8404c986f53fe072301fe950d030de“. Note that this should be the VASP address and thus have a subaddress portion of 0. This field is mandatory on pre-approval creation and immutable after that.  Updates to an existing pre-approval must also include the previously created pre-approval ID. |
| max_cumulative_amount | [CurrencyObject](#currencyobject) | N | Max cumulative amount that is approved for funds pre-approval.  This is the sum across all transactions that occur while utilizing this funds pre-approval. |
| description | str | N | Description of the funds pre-approval.  May be utilized so show the user a description about the request for funds pre-approval |
| status | str enum | N | Status of this pre-approval. See [Pre-Approval Status Enum](#pre-approval-status-enum) for valid statuses. 

```
{
    "address": "lbr1pgfpyysjzgfpyysjzgfpyysjzgf3xycnzvf3xycsm957ne",
    "biller_address": "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pg9skzctpv9skzcg9kmwta",
    "funds_pre_approval_id": "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_7b8404c986f53fe072301fe950d030de"
    "expiration_timestamp": 72322, 
    "max_cumulative_amount": CurrencyObject(),
    "description": "Kevin's online shop",
    "status": "valid",
}
```

### CurrencyObject

Represents an amount and the currency type.

| Field 	    | Type 	| Required? 	| Description 	|
|-------	    |------	|-----------	|-------------	|
| amount | uint | Y | Base units are the same as for on-chain transactions for this currency.  For example, if LibraUSD is represented on-chain where “1” equals 1e-6 dollars, then “1” equals the same amount here.  For any currency, the on-chain mapping must be used for amounts. |
| currency | str enum | Y | One of the supported on-chain currency types - ex. LBR, etc.|

```
{
    "amount": 100,
    "currency": "LBR",
}
```

### Pre Approval Status Enum
Valid values are:
* `pending` - Pending user/VASP approval.
* `valid` - Approved by the user/VASP and ready for usage.
* `rejected` - User/VASP did not approve the pre-approval request.
* `closed` - Approval has been closed by the user/VASP and can no longer be used.

**Valid Status Transitions**. Either party in the pre-approval agreement can mutate the status. The status always initially begins as `pending` at which time a user must agree to the pre-approval request.  Once the user has reviewed the request, the billee VASP will update the pre-approval status to `valid` (if the user agreed) or `rejected` (if the user rejected the pre-approval).

At any point, the user can withdraw permission at which point the status will be updated to `closed`.


### CommandResponseObject
All responses to a CommandRequestObject are in the form of a [CommandResponseObject](basic_building_blocks.md#commandresponseobject)

## Usage of a pre-approval
Pre-approval usage manifests as an extension of [PaymentCommand](https://lip.libra.org/lip-1/#paymentcommand-object).  The extension happens primarily within the [PaymentObject](https://lip.libra.org/lip-1/#paymentobject) as seen below.

### PaymentObject Extension
Payment object remains the same as [PaymentObject](https://lip.libra.org/lip-1/#paymentobject), but adds the following fields:

| Field 	    | Type 	| Required? 	| Description 	|
|-------	    |------	|-----------	|-------------	|
| funds_pre_approval_id | str | N | ID of the funds pre-approval previously created via a [FundPullPreApprovalCommand](#fundpullpreapprovalcommand-object).  Must match the value of "funds_pre_approval_id" in the already-created funds pre-approval.

In addition, the "_reads" field of the PaymentObject must contain the latest version of the FundPullPreApprovalObject.

---

# Auth/Capture
### *VERSION SUPPORT: Supported only in version 1 of off-chain APIs*

Authorization allows the placing of holds on funds with the assurance that an amount up to the held amount can be captured at a later time.  An example of this is for delayed fulfillment or pre-authorizing an expected amount to ensure that an amount can be charged after services are rendered.

When an authorization happens, the VASP agreeing to the authorization must lock the funds for the specified amount of time - the VASP is agreeing to a guarantee that the funds will be available if later captured.

Auth/capture is an extension of [PaymentCommand](https://lip.libra.org/lip-1/#paymentcommand-object).  The extension happens primarily within the [PaymentActionObject](https://lip.libra.org/lip-1/#paymentactionobject) and the status changes within the [PaymentActor](https://lip.libra.org/lip-1/#paymentactorobject).

### PaymentActionObject Extension

The [PaymentActionObject](https://lip.libra.org/lip-1/#paymentactionobject) now becomes:

| Field 	    | Type 	| Required? 	| Description 	|
|-------	    |------	|-----------	|-------------	|
| amount | uint | Y | Amount of the transfer.  Base units are the same as for on-chain transactions for this currency.  For example, if LibraUSD is represented on-chain where “1” equals 1e-6 dollars, then “1” equals the same amount here.  For any currency, the on-chain mapping must be used for amounts. |
| currency | enum | Y | One of the supported on-chain currency types - ex. LBR, etc. |
| action | enum | Y | Populated in the request.  This value indicates the requested action to perform. For a normal transfer, "charge" is still used.  For auth and capture, "auth" and "capture" are now available.  "capture" can only be performed after a valid "auth" |
| valid_until | uint | N | Unix timestamp indicating the time period for which this authorization is valid.  Once this time has been reached, the authorization is no longer able to be captured and funds should be unlocked. |
| timestamp | uint | Y | Unix timestamp indicating the time that the payment Command was created.

```
{
    "amount": 100,
    "currency": "LBR",
    "action": "auth",
    "valid_until": 74000,
    "timestamp": 72322,
}
```

### StatusEnum

The auth/capture flow now adds the following to the status enum of [PaymentActor](https://lip.libra.org/lip-1/#paymentactorobject):

* `authorized` - Payment amount is authorized but not yet captured.

`abort` may still be used to cancel the authorization early.  Once a capture action occurs, the status of the payment will now be updated to `ready_for_settlement`.

**Valid Status Transitions**. `authorized` is now a valid initial value and may be followed by `ready_for_settlement` (upon a successful capture) or `abort` (if one side wishes to cancel the auth).
