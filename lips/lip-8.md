---
lip: 8
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
# Disclaimer
---

This LIP does not contain the initial phase of a sub-account discovery that is required to start negotiating merchant scenarios.
The process describes below starts at the phase that both sides (particularly the biller side) have the relevant subaddresses. 
For the discovery phase, there are currently two leading methods:
  1. The buyer VASP triggers a process with pre-knowledge of the merchant subaddress. e.g., QR/deep links - where the consumers while acting in their wallet provides their VASP the merchant's relevant details (embedded in the QR/link in the checkout page)
  2. The merchant gets the user identifier (like Pay ID) and query the buyer side for a new subaddress for this process
For now, we will assume that one of these methods took place and the merchant have the buyer subaddress at hand.
  
---
# Specification
---

# Fund Pull Pre-Approval
### *VERSION SUPPORT: Supported only in version 1 of off-chain APIs*

Establishes a relationship between the sender and recipient where the recipient can now pull funds from the sender without the sender approving each transaction.  This allows the recipient to bill the sender without the sender approving each payment.  This relationship exists between a subaddress on the biller side and a subaddress on the sender's side.  After this request is POSTed, the target VASP can use out-of-band methods to determine if this request should be granted.  If the target VASP chooses to allow the relationship to be established, the biller can create a payment object and POST to the billed party’s VASP to request funds.  The “funds_pull_approval_id” object must then match the ID established by this request.

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
            "funds_pre_approval_id": "lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_7b8404c986f53fe072301fe950d030de",
            "scope": {
                "expiration_timestamp": 72322, 
                "max_cumulative_amount": {
                    "unit": "week",
                    "value": 1,
                    "max_amount": {
                        "amount": 100,
                        "currency": "LBR",
                    }
                }
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
| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
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

The structure in this object can be a full pre-approval or just the fields of an existing pre-approval object that need to be changed. Some fields are immutable after they are defined once (see below). Others can be updated multiple times. Updating immutable fields with different values results in a command error, but it is acceptable to re-send the same value.

| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| address | str | Required for creation | Address of account from which the pre-approval is being requested. Addresses may be single-use or valid for a limited time, and therefore VASPs should not rely on them remaining stable across time or different VASP addresses. The addresses are encoded using bech32. The bech32 address encodes both the address of the VASP as well as the specific user's subaddress. They should be no longer than 80 characters. Mandatory and immutable. For Libra addresses, refer to the "account identifier" section in LIP-5 for format. |
| biller_address | str | Required for creation | Address of account from which billing will happen. Addresses may be single-use or valid for a limited time, and therefore VASPs should not rely on them remaining stable across time or different VASP addresses. The addresses are encoded using bech32. The bech32 address encodes both the address of the VASP as well as the specific user's subaddress. They should be no longer than 80 characters. Mandatory and immutable. For Libra addresses, refer to the "account identifier" section in LIP-5 for format. |
| funds_pre_approval_id | str | Y | Unique reference ID of this pre-approval on the pre-approval initiator VASP (the VASP which originally created this pre-approval object). This value should be unique, and formatted as “<creator_vasp_onchain_address_bech32>_<unique_id>”.  For example, ”lbr1pg9q5zs2pg9q5zs2pg9q5zs2pgyqqqqqqqqqqqqqqspa3m_7b8404c986f53fe072301fe950d030de“. Note that this should be the VASP address and thus have a subaddress portion of 0. This field is mandatory on pre-approval creation and immutable after that.  Updates to an existing pre-approval must also include the previously created pre-approval ID. |
| scope | [ScopeObject](#scopeobject) | Y | Technical definition. The parameters of the pre-approval, this contains the expiration time and the amount limits |
| description | str | N | Description of the funds pre-approval.  May be utilized to show the user description about the request for funds pre-approval |
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

### ScopeObject

In this object the initiator VASP declares its intent for the pre-approval, this can by one of two options:
  1. Save the consumer sub-account for future transactions (save_sub_account)- this will enable the initiator VASP (merchant) to charge the sub-account in the future but will require the owner to approve the transaction. When using this option, amount limits are not required
  2. Save the consumer sub-account and get a consent for future payments (consent) - this enables the initiator VASP (merchant) to charge the sub-account without any interaction with the owner. 
Also, the scope limits the FundPullPreApprovalObject to certain parameters of time and amount. this object can be changed by the initiator VASP if needed, but any change requires the target VASP to approve the scope change.


| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| Type | str enum | Y | This can be either save_sub_account or consent |
| expiration_timestamp | uint | Y | Unix timestamp indicating the time at which this pre-approval will expire - after which no funds pull can occur.  To expire an existing pre-approval early, this field can be updated with the current Unix timestamp. |
| max_cumulative_amount | [ScopedCumulativeAmountObject](#scopedcumulativeamountobject) | N | Max cumulative amount that is approved for funds pre-approval.  This is the sum across all transactions that occur while utilizing this pre-approval. |
| max_transaction_amount | [CurrencyObject](#currencyobject) | N | Max transaction amount that is approved for funds pre-approval.  This is the maximum transaction that occurs while utilizing this funds pre-approval. |

```
{
    "scope": {
        "type": "consent",
        "expiration_timestamp": 72322,
        "max_transaction_amount": {
            "amount": 100,
            "currency": "LBR",
        }
    }
}
```

### ScopedCumulativeAmountObject

This object describes the scope of an amount

| Field         | Type       | Required?    | Description   |
|-------        |--------    |-----------   |-------------  |
| unit          | str enum   | N            | One of: "week", "month", "year" |
| value         | int        | N            | "Unit" value  |
| max_amount | [CurrencyObject](#currencyobject) | N | Max cumulative amount that is approved for funds pre-approval.  This is the sum across all transactions that occur in the scope of the unit value. |

```
{
    "max_cumulative_amount": {
        "unit": "month",
        "value": 1,
        "max_amount": {
            "amount": 100,
            "currency": "LBR",
        }
    }
}
```



### CurrencyObject

Represents a limited scope for the approval. 

| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
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

**Valid Status Transitions**. Either party in the pre-approval agreement can mutate the status. The status always initially begins as `pending` at which time a user must agree to the pre-approval request.  Once the user has reviewed the request, the biller VASP will update the pre-approval status to `valid` (if the user agreed) or `rejected` (if the user rejected the pre-approval).

At any point, the user can withdraw permission at which point the status will be updated to `closed`.


### CommandResponseObject
All responses to a CommandRequestObject are in the form of a [CommandResponseObject](basic_building_blocks.md#commandresponseobject)

## Usage of a pre-approval
Pre-approval usage manifests as an extension of [PaymentCommand](https://lip.libra.org/lip-1/#paymentcommand-object).  The extension happens primarily within the [PaymentObject](https://lip.libra.org/lip-1/#paymentobject) as seen below.

### PaymentObject Extension
Payment object remains the same as [PaymentObject](https://lip.libra.org/lip-1/#paymentobject), but adds the following fields:

| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| funds_pre_approval_id | str | N | ID of the funds pre-approval previously created via a [FundPullPreApprovalCommand](#fundpullpreapprovalcommand-object).  Must match the value of "funds_pre_approval_id" in the already-created funds pre-approval.

In addition, the "_reads" field of the PaymentObject must contain the latest version of the FundPullPreApprovalObject.

---

# Auth/Capture
### *VERSION SUPPORT: Supported only in version 1 of off-chain APIs*

Authorization allows the placing of holds on funds with the assurance that an amount up to the held amount can be captured at a later time.  An example of this is for delayed fulfillment or pre-authorizing an expected amount to ensure that an amount can be charged after services are rendered.

When an authorization happens, the sender VASP (buyer) agrees to the authorization request must lock the funds for the specified period. That is - the buyer VASP guarantees that the funds will be available if later captured.

Auth/capture is an extension of [PaymentCommand](https://lip.libra.org/lip-1/#paymentcommand-object).  The extension happens primarily within the [PaymentActionObject](https://lip.libra.org/lip-1/#paymentactionobject) and the status changes within the [PaymentActor](https://lip.libra.org/lip-1/#paymentactorobject).

Authorization is granted by the consumer/buyer VASP and can only be revoked by the merchant. Authorizations are expected to have a shorter expiration time than Fund Pull Pre-Approvals as they serve for a single payment.

### PaymentActionObject Extension

The [PaymentActionObject](https://lip.libra.org/lip-1/#paymentactionobject) now becomes:

| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
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

* `authorized` - The payment amount is authorized but not yet captured.

`abort` may still be used to cancel the authorization early.  Once a capture action occurs, the status of the payment will now be updated to `ready_for_settlement`.

**Valid Status Transitions**. `authorized` is now a valid initial value and may be followed by `ready_for_settlement` (upon a successful capture) or `abort` (if a valid cancel request was sent).

## Cancellation

This LIP describes two independent phases of a payment - pre-approval and auth/capture.

The first one (pre-approval) may be canceled by each side (buyer or seller). a reasonable scenario is when a consumer wishes to cancel a subscription (buyer cancel) or asks a merchant app to remove the user wallet from the list of payment methods (seller cancel). 

The second (authorization) could be canceled only by the biller (merchant) as it holds a guarantee to get funds if requested. This has no reason to be canceled by the buyer. a request for such cancellation from the buyer should be rejected. 
