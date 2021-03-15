---
dip: 8
title: Off-chain API Version 2 Extensions - Funds pull pre approval
authors: Kevin Hurley (@kphfb), Daniel Prinz
status: Draft
type: Standard
created: 09/18/2020
---

# Summary
---
An extension of the Off-Chain protocol to provide support for enabling the notion of periodic resettable limits within a single approval

---
# Abstract / Motivation
---

Versions 1/2 of the Off-Chain Protocol are described in [DIP 1](https://dip.diem.com/dip-1/). 

Version 3 as described here is an extension of the Off-Chain Protocol and adds features to support more advanced functionality - particularly targeted to support merchant use-cases. 

This DIP aimed to support a scenario of setting a Diem wallet as a long term payment method in an app or an eCommerce website. 

The high level flow is:
1. The user asks to add their wallet to the app as a payment method
2. The merchant VASP genereates a Funds Pull Pre Approval (FPPA) request 
3. The user approves the FPA in their wallet (VASP)
4. The user wallet VASP hands a billing agreement id (FPPA id) to the merchant VASP

Whenever the app wants to charge the user: 
1. The merchant VASP sends a payment request to the user wallet VASP mentioning the FPA id
2. If the payment request does not fall out of the FPA scope, the payment is continued normally as the user was approved it (without user interaction)

---
# Disclaimer
---

This DIP does not contain the phase of exchanging identifiers between VASPs that is required to negotiate merchant scenarios.

For the purpose of this document, we will assume that given a payment object with two VASP addresses and some underline indetifier, there is a protocol for exchaning these identities under VASPs (buyer and merchant) without revealing their identities to the public. 

The process described below starts at the phase that both sides have the relevant payment unique identifier (reference) and each VASP knows to corrlate it to its respectful entity under. 

---
# Synonyms
---

For the sake of simplicity, we use the following terms:
* "Buyer VASP" - The VASP who submits payment transactions to the blockchain in order to pay to the other VASP
* "Merchant" - The VASP who recieves the funds (transaction)
* "Buyer user" - The buyer user who wants to pay to the merchant

---
# Specification
---

### *VERSION SUPPORT: Supported only in version 3 of off-chain APIs*

Establishes a relationship between a buyer VASP and a merchant where the merchant can then pull funds from the buyer VASP without the buyer user approving each transaction, like billing the user without an interaction for each payment. This relationship marked by a unique identifier, that is the `**funds_pull_pre_approval_id**`. 

## Funds pull pre approval request fields

The following fields should be used to define a funds pull pre approval request. These fields should be encoded into a series of URL parameters appended to the query string. In case of QR code, the image should include the full link with all parameters. 

| Field                  | Type    | Required?  | Description                                    |
|------------------------|---------|------------|------------------------------------------------|
| vasp_address               | str      | Y          | Address of account from which billing will happen. The address is encoded using bech32 and should uniquly identify the merchant. For Diem addresses format, refer to the "account identifiers" section in [DIP-5](https://dip.diem.com/dip-5/#account-identifiers). |
| funds_pull_pre_approval_id | str      | Y          | A unique identifier of this pre-approval. Should be a UUID according to RFC4122 with "-"'s included. |
| merchant_name              | str      | Y          | The name of the biller |
| description                | str      | N          | Description of the funds pull pre-approval. May be utilized to show the user description about the request for funds pull pre-approval |
| checkout_data_type         | str      | Y          | The fixed string `FUNDS_PULL_PRE_APPROVAL` |
| action                     | str      | Y          | The fixed string `FUNDS_PULL_PRE_APPROVAL` |
| expiration_timestamp       | uint     | N          | Unix timestamp indicating the time at which this pre-approval will expire - after which no funds pull can occur.  To expire an existing pre-approval early, this field can be updated with the current Unix timestamp. |
| currency                   | str enum | N          | One of the supported on-chain currency types - ex. `XDX`, etc. |
| reset_period_unit          | str enum | N          | One of: `day`, `week`, `month`, `year`. This unit should be treated as a sliding time window. E.g., one week would be summary of the past 7 days transactions, no matter what weekday it is. This field is mandatory in case `reset_period_value` and `amount_per_period` are set. |
| reset_period_value         | uint     | N          | Number of "reset_period_unit"(s). This field is mandatory in case `reset_period_unit` and `amount_per_period` are set. |
| amount_per_period          | uint     | N          | Max amount that is approved for a single period of time. This is the sum across all transactions that occur in the period. Base units are the same as for on-chain transactions for this currency. For example, if DiemUSD is represented on-chain where “1” equals 1e-6 dollars, then “1” equals the same amount here.  For any currency, the on-chain mapping must be used for amounts. This field is mandatory in case `reset_period_unit` and `reset_period_value` are set. |
| max_transaction_amount     | uint     | N          | Max transaction amount that is approved for funds pull pre-approval.  This is the maximum amount that may occur in a single transaction while utilizing this funds pull pre-approval. Base units are the same as for on-chain transactions for this currency. For example, if DiemUSD is represented on-chain where “1” equals 1e-6 dollars, then “1” equals the same amount here.  For any currency, the on-chain mapping must be used for amounts. |
| redirect_url               | str      | Y          | The URL to redirect the user after the process is completed (either for success or failure of the process). Note that the user will be redirected to this URL using `GET` HTTP method.  |

E.g., for the following parameters: 

| Field                      | Value                                                                             |
|----------------------------|-----------------------------------------------------------------------------------|
| vasp_address               | dm1pllhdmn9m42vcsamx24zrxgs3qqqpzg3ng32kvacapx5fl                                 | 
| funds_pull_pre_approval_id | 51471b7a-4d2e-46b8-a818-6a6e74cb749b                                              |
| merchant_name              | Kevin's online shop                                                               |
| description                | Adding your wallet as a payment method for easier purchase experience             |
| checkout_data_type         | FUNDS_PULL_PRE_APPROVAL                                                           |
| action                     | FUNDS_PULL_PRE_APPROVAL                                                           |
| expiration_timestamp       | 1615872312                                                                        |
| currency                   | XDX                                                                               |
| reset_period_unit          | week                                                                              |
| reset_period_value         | 2                                                                                 |
| amount_per_period          | 100000000                                                                         |
| max_transaction_amount     | 25000000                                                                          |
| redirect_url               | https://merchant.com/order/93c4963f-7f9e-4f9d-983e-7080ef782534/checkout/complete |

The URL format would be (the domain and path are examples - the real wallet domain/path should be used):

`https://some-diem-wallet.com/pay?vasp_address=dm1pllhdmn9m42vcsamx24zrxgs3qqqpzg3ng32kvacapx5fl&funds_pull_pre_approval_id=51471b7a-4d2e-46b8-a818-6a6e74cb749b&merchant_name=Kevin%27s%20online%20shop&description=Adding%20your%20wallet%20as%20a%20payment%20method%20for%20easier%20purchase%20experience&checkout_data_type=FUNDS_PULL_PRE_APPROVAL&action=FUNDS_PULL_PRE_APPROVAL&expiration_timestamp=1615872312&currency=XDX&reset_period_unit=week&reset_period_value=2&amount_per_period=100000000&max_transaction_amount=25000000&redirectUrl=https%3A%2F%2Fmerchant.com%2Forder%2F93c4963f-7f9e-4f9d-983e-7080ef782534%2Fcheckout%2Fcomplete`


After parsing this request, the buyer VASP can use out-of-band methods to determine if this request should be granted. E.g., asking the user to approve this request while presenting the scope of it. 


After this request is POSTed, the buyer VASP can use out-of-band methods to determine if this request should be granted. E.g., asking the user to approve this agreement while presenting the scope of it. 

If the buyer VASP chooses to allow the relationship to be established, the merchant can create a payment object and POST to the buyer VASP to request funds.  The `funds_pull_pre_approval_id` field must then match the ID established by this request.

## Request/Response Payload
All requests between VASPs are structured as [`CommandRequestObject`s](https://dip.diem.com/dip-1/#commandrequestobject) and all responses are structured as [`CommandResponseObject`s](https://dip.diem.com/dip-1/#commandresponseobject). 

For a funds pull pre-approval command, the resulting request takes a form of the following:

```
{
    "_ObjectType": "CommandRequestObject",
    "command_type": "FundsPullPreApprovalCommand",
    "cid": "88b282d6-1811-29f6-82be-0421d0ee9887",
    "command": {
        "_ObjectType": "FundsPullPreApprovalCommand",
        "funds_pull_pre_approval": {
            "address": "dm1pqqgjyv6y24n80zye42aueh0wlll7ahwvhw4qpxg2y47hr",
            "biller_address": "dm1pllhdmn9m42vcsamx24zrxgs3qqqpzg3ng32kvacapx5fl",
            "funds_pull_pre_approval_id": "51471b7a-4d2e-46b8-a818-6a6e74cb749b",
            "scope": {
                "type": "consent",
                "expiration_timestamp": 1615872312, 
                "currency": "XDX",
                "reset": {
                    "period": {
                        "unit": "week",
                        "value": 2
                    },
                    "amount_per_period": 100000000,
                }
                "max_transaction_amount": 25000000,                
            }
            "merchant_name": "Kevin's online shop",
            "description": "Adding your wallet as a payment method for easier purchase experience",
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
For a funds pull pre-approval request, the [command_type](https://dip.diem.com/dip-1/#commandrequestobject) field is set to "FundsPullPreApprovalCommand".  The command object is a [`FundsPullPreApprovalCommand` object](#fundspullpreapprovalcommand-object).


### FundsPullPreApprovalCommand object
| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| command_type   | str  | Y             | The fixed string `FundsPullPreApprovalCommand` |
| command| [`FundsPullPreApprovalObject`](#fundspullpreapprovalobject) | Y | contains a `FundsPullPreApprovalObject` that creates a new pre-approval|

```
{
    "_ObjectType": "CommandRequestObject",
    "command_type": "FundsPullPreApprovalCommand",
    "cid": "c10db593-ce3d-4ac7-b83d-1e15600e9e63",
    "command": FundsPullPreApprovalObject(),
}
```

### FundsPullPreApprovalObject

The structure in this object must be a full funds pull pre-approval and all fields beside the `status` are immutable after the creation. In order to change the status, one may send only the `funds_pull_pre_approval_id` and `status` fields. Updating immutable fields with different values results in a command error, but it is acceptable to re-send the same value.
It should be noted that initial creation of the FundsPullPreApprovalObject can be done by the VASP on either side (buyer or merchant). 


#### ___The buyer creates the initial request___
A merchant doesn't knows the buyer details upfront, so it use an out-of-band channel to request a consent (e.g. QR code). The buyer wallet (VASP) decode the request and initiate FundsPullPreApproval flow from its side

#### ___The merchant creates the initial request___
A merchant knows the buyer details upfront. The merchant then can send an off-chain request to the buyer to request a consent. The buyer wallet (VASP) can then ask the user to approve the request

| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| address | str | Y | Address of account from which the pre-approval is being requested. The address is encoded using bech32 and should uniquly identify the buyer. For Diem addresses format, refer to the "account identifiers" section in [DIP-5](https://dip.diem.com/dip-5/#account-identifiers). |
| biller_address | str | Y | Address of account from which billing will happen. The address is encoded using bech32 and should uniquly identify the merchant. For Diem addresses format, refer to the "account identifiers" section in [DIP-5](https://dip.diem.com/dip-5/#account-identifiers). |
| funds_pull_pre_approval_id | str | Y | A unique identifier of this pre-approval. Should be a UUID according to RFC4122 with "-"'s included. |
| scope | [ScopeObject](#scopeobject) | Y | The scope of the agreement. This contains the expiration time and the amount limits |
| merchant_name | str | Y | The name of the biller |
| description | str | N | Description of the funds pull pre-approval. May be utilized to show the user description about the request for funds pull pre-approval |
| status | str enum | N | Status of this pre-approval. See [Pre-Approval Status Enum](#pre-approval-status-enum) for valid statuses. 

```
{
    "address": "dm1pqqgjyv6y24n80zye42aueh0wlll7ahwvhw4qpxg2y47hr",
    "biller_address": "dm1pllhdmn9m42vcsamx24zrxgs3qqqpzg3ng32kvacapx5fl",
    "funds_pull_pre_approval_id": "51471b7a-4d2e-46b8-a818-6a6e74cb749b",
    "scope": ScopeObject(),
    "merchant_name": "Kevin's online shop",
    "description": "Adding your wallet as a payment method for easier purchase experience",
    "status": "valid",
}
```

### ScopeObject

In this object the initiator VASP declares its intent for the pre-approval.

For now, only simple type of pre-approval is supported, that is `consent`. It is used for future payments and enables the merchant VASP to charge the buyer in the buyer VASP without any human interaction.  
Also, the scope limits the `FundsPullPreApprovalObject` to certain parameters of time and amount.


| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| type | str enum | Y | For now only `consent` is supported |
| expiration_timestamp | uint | Y | Unix timestamp indicating the time at which this pre-approval will expire - after which no funds pull can occur.  To expire an existing pre-approval early, this field can be updated with the current Unix timestamp. |
| currency | str enum | Y | One of the supported on-chain currency types - ex. XDX, etc.|
| reset | [ScopedResetObject](#scopedresetobject) | N | A defintion of a reset period of this pre-approval. When granting this agreement, one can review the periodic terms of what is the amount that can be withdrawan within a given period of time defined by this object |
| max_transaction_amount | uint | N | Max transaction amount that is approved for funds pull pre-approval.  This is the maximum amount that may occur in a single transaction while utilizing this funds pull pre-approval. Base units are the same as for on-chain transactions for this currency. For example, if DiemUSD is represented on-chain where “1” equals 1e-6 dollars, then “1” equals the same amount here.  For any currency, the on-chain mapping must be used for amounts. |

```
{
    "scope": {
        "type": "consent",
        "expiration_timestamp": 1615872312,
        "currency": "XDX",
        "reset": ScopedResetObject(),        
        "max_transaction_amount": 50000000
    }
}
```

### ScopedResetObject

This object describes the scope period for reset the cummulation of transaction amounts 

| Field         | Type       | Required?    | Description   |
|-------        |--------    |-----------   |-------------  |
| period | [PeriodObject](#periodobject) | Y | A definition of a period of time |
| amount_per_period | uint | Y | Max amount that is approved for a single period of time. This is the sum across all transactions that occur in the period. Base units are the same as for on-chain transactions for this currency. For example, if DiemUSD is represented on-chain where “1” equals 1e-6 dollars, then “1” equals the same amount here.  For any currency, the on-chain mapping must be used for amounts. |

```
{
    "reset": {
        "period": PeriodObject(),
        "amount_per_period": 1300000000,
    }
}
```

### PeriodObject

Represents a period of time. 

| Field 	    | Type 	| Required? 	| Description 	|
|-------	    |------	|-----------	|-------------	|
| unit          | str enum   | Y            | One of: `day`, `week`, `month`, `year`. This unit should be treated as a sliding time window. E.g., one week would be summary of the past 7 days transactions, no matter what weekday it is |
| value         | uint       | Y            | Number of "unit"(s)   |

```
{
    "unit": "week",
    "value": 2
}
```


### Pre Approval Status Enum
Valid values are:
* `pending` - Pending buyer user/VASP approval.
* `valid` - Approved by the user/VASP and ready for usage.
* `rejected` - User/VASP did not approve the pre-approval request.
* `closed` - Approval has been closed by the user/VASP and can no longer be used.

**Valid Status Transitions**. The status always initially begins as `pending` at which time a user must agree to the pre-approval request.  Once the user has reviewed the request, the buyer VASP will update the pre-approval status to `valid` (if the user agreed) or `rejected` (if the user rejected the pre-approval).

When `valid`, at any point, the buyer or the merchant can withdraw permission at which point the status will be updated to `closed`.


### CommandResponseObject
All responses to a CommandRequestObject are in the form of a [CommandResponseObject](basic_building_blocks.md#commandresponseobject)

## Usage of a pre-approval
Pre-approval usage manifests as an extension of [PaymentCommand](https://dip.diem.com/dip-1/#paymentcommand-object).  The extension happens primarily within the [PaymentObject](https://dip.diem.com/dip-1/#paymentobject) as seen below.

### PaymentObject Extension
Payment object remains the same as [PaymentObject](https://dip.diem.com/dip-1/#paymentobject), but adds the following fields:

| Field         | Type  | Required?     | Description   |
|-------        |------ |-----------    |-------------  |
| funds_pull_pre_approval_id | str | N | ID of the funds pull pre-approval previously created via a [FundsPullPreApprovalCommand](#fundspullpreapprovalcommand-object).  Must match the value of "funds_pull_pre_approval_id" in the already-created funds pull pre-approval.

