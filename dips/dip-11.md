---
dip: 11
title: Diem Accounts
authors: Sam Blackshear (@sblackshear), Bob Wilson (@bob-wilson), Tim Zakian (@tzakian)
status: Draft
type: Informational
created: 2/11/2021
---

# DIP11: Diem Accounts

## Overview

The Diem Blockchain is organized as a map from 16 byte account addresses to Move resources. Every nonempty address must contain a `DiemAccount` resource, and it may also contain other resources. We refer to a nonempty address as a *Diem account*. This DIP describes the structure of Diem accounts, their relationship to transactions, and events that are triggered when accounts send and receive funds.

### Account Creation

An account is created by publishing a `DiemAccount` resource under an empty address. At creation time, the account is assigned an immutable **role**. [DIP2](https://github.com/diem/dip/blob/master/dips/dip-2.md) specifies the account roles and the policies for account creation (e.g., which account roles have the permission to create new accounts).

The creator of an account must specify the initial **authentication key** (see below) for the account. The account address will be the last 16 bytes of the authentication key.

### Account Deletion

A `DiemAccount` resource cannot be deleted. Once published under an address, it will remain indefinitely.

### Account Structure

The `DiemAccount` Move resource is defined as follows.

```
resource struct DiemAccount {
  authentication_key: vector<u8>,
  withdraw_capability: Option<WithdrawCapability>,
  key_rotation_capability: Option<KeyRotationCapability>,
  received_events: EventHandle<ReceivedPaymentEvent>,
  sent_events: EventHandle<SentPaymentEvent>,
  sequence_number: u64,
}
```

We will now explain the structure and purpose of each field, as well as some related concepts such as balances.

### Authentication Key

An authentication key is a 32-byte value used to authenticate the sender of a transaction. An authentication key is a hash of an authentication policy. Currently, Diem supports two kinds of account authentication policies: single-signature and multi-signature.

To generate a single-signature authentication key, generate a fresh key-pair (`pubkey`, `privkey`). Diem uses the PureEdDSA scheme over the Ed25519 curve, as defined in RFC 8032. Then, derive a 32-byte authentication key `authentication_key = sha3-256(pubkey | 0x00)`, where `|` denotes concatenation. `0x00` is a 1-byte signature scheme identifier. Transactions sent from an account with this authentication key should include `pubkey` and be signed with `privkey`.

Diem also supports K-of-N multi-signature authentication. In K-of-N multi-signature, there are a total of N (public key, private key) pairs, and >=K of those N signatures must be used to authenticate a transaction. To create a K-of-N multi-signature authentication key, generate N Ed25519 keypairs `(pubkey_1, privkey_1), …, (pubkey_N, privkey_N)` then compute `authentication``_key = sha3-256(pubkey_1 | … | pubkey_N | K | 0x01)`.  `0x01` is a 1-byte signature scheme identifier. Transactions sent from an account with this authentication key should include all of `pubkey_1, ... pubkey_N` and be signed with at least `K` of `privkey_1 ... privkey_N`.

Diem supports rotation of account authentication keys via mutation of the `DiemAccount.authentication_key` field. When the authentication key for account `A` is rotated, subsequent transactions sent from `A` should use the public/private keypair(s) that were used to derive the new authentication key.

### Sequence Number

A sequence number is an 8-byte value that is used to prevent replays of transactions sent from a particular account. A freshly created account has `sequence_number` 0. Each transaction sent from account `A` that is included in the Diem blockchain increases the `sequence_number` of account `A` by 1.

### Balances

Diem is a multi-currency blockchain. An account can store a balance in a particular `CurrencyType` via the `Balance` Move resource defined as follows

```
resource struct Balance<CurrencyType> { coin: Diem<CurrencyType> }
```

A `Diem<CurrencyType>` represents a coin of type `CurrencyType`. [DIP20](https://github.com/diem/dip/blob/master/dips/dip-20.md) defines both the `Diem` standard and the set of valid `CurrencyType`’s.

In order to send and receive `Diem<CurrencyType>`, an account must have a `Balance<CurrencyType>` resource. A transaction that sends `Diem<CurrencyType>` to an account that does not exist or an account without a corresponding balance resource will abort.

`Balance` resources can be added either at account creation time or subsequently. Only the account owner can add new `Balance` resources after account creation. Once a `Balance` resource has been added to an account, it cannot be removed--that is, the account will always be able to send and receive `CurrencyType`.

### Withdraw Capability

The `WithdrawCapability` Move resource is defined as follows:

```
resource struct WithdrawCapability { account_address: address }

```

A `WithdrawCapability { addr }` represents the authority to debit the `Balance` resource(s) published under `addr`. There is exactly one `WithdrawCapability { addr }` resource in the Diem system for each non-empty address `addr`.

### Key Rotation Capability

The `KeyRotationCapability` Move resource is defined as follows:

```
resource struct KeyRotationCapability { account_address: address }
```

A `KeyRotationCapability { addr }` represents the authority to rotate the authentication key of `addr`. There is exactly one `KeyRotationCapability { addr }` resource in the Diem system for each non-empty address `addr`.

### Event Handles

An `EventHandle` is a 24-byte value that uniquely identifies an event stream. The last 16 bytes of an `EventHandle` are always the account address that the events are intended for. The first 8 bytes are derived from an address-specific counter that is incremented each time a new `EventHandle` is created for that address.

* The `received_events` field of an account at address `A` holds an `EventHandle` that records an event each time `A` receives funds from another account. The counter value (first 8 bytes) of this handle is 0.
* Similarly `sent_events` field of an account at address `A` holds an `EventHandle` that records an event each time `A` sends funds to another account. The counter value (first 8 bytes) of this handle is 1.

### Freezing

As [DIP2](https://github.com/diem/dip/blob/master/dips/dip-2.md) explains, some Diem accounts can be *frozen* by the DiemRoot account. A frozen account cannot send transactions or receive funds sent by other accounts.

## Relationship of accounts and transactions

There is a close relationship between accounts and transactions. The validity and behavior of a Diem transaction are largely determined by the account from which it is sent. A valid transaction must be consistent with the various resources in the sending account, and the account’s resources are modified when the transaction executes.

### Transaction Validation Overview

When entering the system, each transaction is validated and either discarded if it is malformed or added to a ranked pool of pending transactions otherwise. A *discarded* transaction is removed from the system without being recorded on the blockchain. A *validated* transaction can proceed but may still be discarded later when it executes.

The details of the validation process are defined in terms of the specific data structures used to represent transactions and the validation results, so this section first gives an overview of the Rust code for those data structures.

If a transaction is malformed, the validation result (`VMValidatorResult`) indicates that the transaction must be discarded. If the transaction is successfully validated, the result also includes information to rank the transaction priority.

```
/// The result of running the transaction through the VM validator.
pub struct VMValidatorResult {
  /// Result of the validation: `None` if the transaction was successfully validated
  /// or `Some(DiscardedVMStatus)` if the transaction should be discarded.
  status: Option<DiscardedVMStatus>,

  /// Score for ranking the transaction priority (e.g., based on the gas price).
  /// Only used when the status is `None`. Higher values indicate a higher priority.
  score: u64,

  /// The account role for the transaction sender, so that certain
  /// governance transactions can be prioritized above normal transactions.
  /// Only used when the status is `None`.
  governance_role: GovernanceRole,
}
```

Validation examines the content of a transaction to determine if it is well formed. The transaction content is organized into three layers: `SignedTransaction`, `RawTransaction`, and the transaction payload (`TransactionPayload` and `WriteSetPayload`):

```
/// A transaction that has been signed.
pub struct SignedTransaction {
  /// The raw transaction
  raw_txn: RawTransaction,

  /// Public key and signature to authenticate
  authenticator: TransactionAuthenticator,
}

/// RawTransaction is the portion of a transaction that a client signs.
pub struct RawTransaction {
  /// Sender's address.
  sender: AccountAddress,

  /// Sequence number of this transaction. This must match the sequence number
  /// stored in the sender's account at the time the transaction executes.
  sequence_number: u64,

  /// The transaction payload, e.g., a script to execute.
  payload: TransactionPayload,

  /// Maximal total gas to spend for this transaction.
  max_gas_amount: u64,

  /// Price to be paid per gas unit.
  gas_unit_price: u64,

  /// The currency code, e.g., "XDX", used to pay for gas. The `max_gas_amount`
  /// and `gas_unit_price` values refer to units of this currency.
  gas_currency_code: String,

  /// Expiration timestamp for this transaction, represented
  /// as seconds from the Unix Epoch. If the current blockchain timestamp
  /// is greater than or equal to this time, then the transaction is
  /// expired and will be discarded. This can be set to a large value far
  /// in the future to indicate that a transaction does not expire.
  expiration_timestamp_secs: u64,

  /// Chain ID of the Diem network this transaction is intended for.
  chain_id: ChainId,
}

/// Different kinds of transactions.
pub enum TransactionPayload {
  /// A system maintenance transaction.
  WriteSet(WriteSetPayload),
  /// A transaction that executes code.
  Script(Script),
  /// A transaction that publishes code.
  Module(Module),
}
```

There are several different kinds of transactions that can be stored in the transaction payload: executing a script, publishing a module, and applying a WriteSet for system maintenance or updates. The payload is stored inside a `RawTransaction` structure that includes the various fields that are common to all of these transactions, and the `RawTransaction` is signed and wrapped inside a `SignedTransaction` structure that includes the signature and public key.

The validation process performs a sequence of checks on a transaction. Some of these checks are implemented directly in the Diem software and others are specified in Move code and evaluated via the Move VM. Some of the checks apply to all transactions and others are specific to the type of payload. To ensure consistent error handling, the checks should be performed in the order specified here.

### General Validation Checks

The following checks are performed for any transaction, regardless of the payload:

* Check if the signature in the `SignedTransaction` is consistent with the public key and the `RawTransaction` content. If not, this check fails with an `INVALID_SIGNATURE` status code. Note that comparing the transaction's public key against the sender account's authorization key is done separately in Move code.

* Check that the `gas_currency_code` in the `RawTransaction` is a name composed of uppercase ASCII alphanumeric characters where the first character is a letter. If not, validation will fail with an `INVALID_GAS_SPECIFIER` status code. Note that this check does not ensure that the name corresponds to a currency recognized by the Diem Framework.

* Normalize the `gas_unit_price` from the `RawTransaction` to the Diem (XDX) currency. If the validation is successful, the normalized gas price is returned as the `score` field of the `VMValidatorResult` for use in prioritizing the transaction. The normalization is calculated using the `to_xdx_exchange_rate` field of the on-chain `CurrencyInfo` for the specified gas currency. This can fail with a status code of `CURRENCY_INFO_DOES_NOT_EXIST` if the exchange rate cannot be retrieved.

* Load the `RoleId` resource from the sender's account. If the validation is successful, this value is returned as the `governance_role` field of the `VMValidatorResult` so that governance transactions can be prioritized.

### Gas and Size Checks

Next, there are a series of checks related to the transaction size and gas parameters. These checks are performed for `Script` and `Module` payloads, but not for `WriteSet` transactions. The constraints for these checks are defined by the `GasConstants` structure in the `DiemVMConfig` module.

* Check if the transaction size exceeds the limit specified by the `max_transaction_size_in_bytes` field of `GasConstants`. If the transaction is too big, validation fails with an `EXCEEDED_MAX_TRANSACTION_SIZE` status code.

* If the `max_gas_amount` field in the `RawTransaction` is larger than the `maximum_number_of_gas_units` field of `GasConstants`, then validation fails with a status code of `MAX_GAS_UNITS_EXCEEDS_MAX_GAS_UNITS_BOUND`.

* There is also a minimum gas amount based on the transaction size. The minimum charge is calculated in terms of internal gas units that are scaled up by the `gas_unit_scaling_factor` field of `GasConstants` to allow more fine grained accounting. First, the `GasConstants` structure specifies a `min_transaction_gas_units` value that is charged for all transactions regardless of their size. Next, if the transaction size in bytes is larger than the `large_transaction_cutoff` value, then the minimum gas amount is increased by `intrinsic_gas_per_byte` for every byte in excess of `large_transaction_cutoff`. The resulting value is divided by the `gas_unit_scaling_factor` to obtain the minimum gas amount. If the `max_gas_amount` for the transaction is less than this minimum requirement, validation fails with a status code of `MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS`.

* The `gas_unit_price` from the `RawTransaction` must be within the range specified by the `GasConstants`. If the price is less than `min_price_per_gas_unit`, validation fails with a status code of `GAS_UNIT_PRICE_BELOW_MIN_BOUND`. If the price is more than `max_price_per_gas_unit`, validation fails with a status code of `GAS_UNIT_PRICE_ABOVE_MAX_BOUND`.

### Prologue Function Checks

The rest of the validation is performed in Move code, which is run using the Move VM with gas metering disabled. Each kind of transaction payload has a corresponding prologue function that is used for validation. These prologue functions are defined in the `DiemAccount` module:

* `Script`: The prologue function is `script_prologue`. In addition to the common checks listed below, it also calls the `is_script_allowed` function in the `DiemTransactionPublishingOption` module with the hash of the script bytecode to check if it is on the list of allowed scripts. If not, validation fails with an `UNKNOWN_SCRIPT` status code.

* `Module`: The prologue function is `module_prologue`. In addition to the common checks listed below, it also calls the `is_module_allowed` function in the `DiemTransactionPublishingOption` module to see if publishing is allowed for the transaction sender. If not, validation fails with a `INVALID_MODULE_PUBLISHER` status code.

* `WriteSet`: The prologue function is `writeset_prologue`. In addition to the common checks listed below, it also checks that the sender is the Diem root address and that `Roles::has_diem_root_role(sender)` is true. If those checks fail, the status code is set to `REJECTED_WRITE_SET`.

The following checks are performed by all the prologue functions:

* If the transaction's `chain_id` value does not match the expected value for the blockchain, validation fails with a `BAD_CHAIN_ID` status code.

* Check if the transaction sender has an account, and if not, fail with a `SENDING_ACCOUNT_DOES_NOT_EXIST` status code.

* Call the `AccountFreezing::account_is_frozen` function to check if the transaction sender's account is frozen. If so, the status code is set to `SENDING_ACCOUNT_FROZEN`.

* Check that the hash of the transaction's public key (from the `authenticator` in the `SignedTransaction`) matches the authentication key in the sender's account. If not, validation fails with an `INVALID_AUTH_KEY` status code.

* The transaction sender must be able to pay the maximum transaction fee. The maximum fee is the product of the transaction's `max_gas_amount` and `gas_unit_price` fields. If the maximum fee is non-zero, the coin specified by the transaction's `gas_currency_code` must have been registered as a valid gas currency (via the `TransactionFee` module), or else validation will fail with a `BAD_TRANSACTION_FEE_CURRENCY` status. If the sender's account balance for the gas currency is less than the maximum fee, validation fails with an `INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE` status code. For `WriteSet` transactions, the maximum fee is treated as zero, regardless of the gas parameters specified in the transaction.

* Check if the transaction is expired. If the transaction's `expiration_timestamp_secs` field is greater than or equal to the current blockchain timestamp, fail with a `TRANSACTION_EXPIRED` status code.

* Check if the transaction's `sequence_number` is already the maximum value, such that it would overflow if the transaction was processed. If so, validation fails with a `SEQUENCE_NUMBER_TOO_BIG` status code.

* The transaction's `sequence_number` must match the current sequence number in the sender's account. If the transaction sequence number is too low, validation fails with a `SEQUENCE_NUMBER_TOO_OLD` status code. If the number is too high, the behavior depends on whether it is the initial validation or the re-validation done as part of the execution phase. Multiple transactions with consecutive sequence numbers from the same account can be in flight at the same time, but they must be executed strictly in order. For that reason, a transaction sequence number higher than expected for the sender's account is accepted during the initial validation, but rejected with a `SEQUENCE_NUMBER_TOO_NEW` status code during the execution phase. Note that this check for "too new" sequence numbers must be the last check in the prologue function so that a transaction cannot get through the initial validation when it has some other fatal error.

If the prologue function fails for any other reason, which would indicate some kind of unexpected problem, validation fails with a status code of `UNEXPECTED_ERROR_FROM_KNOWN_MOVE_FUNCTION`.

### Epilogue Functions

After a transaction is successfully validated, it is entered into a pool of pending transactions. When the transaction is chosen to execute, it is first re-validated because the account resources may have changed. If the transaction is still valid, and if the execution also succeeds, the final step is to run a Move epilogue function defined in the `DiemAccount` module.
The epilogue increments the sender's `sequence_number` and deducts the transaction fee based on the gas price and the amount of gas consumed. The epilogue function is run with gas metering disabled.

If an error occurs when processing a transaction, all the side effects from the transaction will be discarded, but the sending account still needs to be charged the transaction fee for gas consumption. This is handled by running the epilogue function starting from the original blockchain state. Note that the epilogue function may be run twice. For example, the transaction may make a payment that drops the account balance so that the first attempt to run the epilogue fails because of insufficient funds to pay the transaction fee. After dropping the side effects of the payment, however, the second attempt to run the epilogue should always succeed, because the validation process ensures that the account balance can cover the maximum transaction fee. If the second "failure" epilogue execution somehow fails (due to an internal inconsistency in the system), execution fails with an `UNEXPECTED_ERROR_FROM_KNOWN_MOVE_FUNCTION` status, and the transaction is discarded.

`WriteSet` transactions use a special `writeset_epilogue` function from the `DiemAccount` module. The `writeset_epilogue` calls the standard epilogue to increment the `sequence_number`, emits an `AdminTransactionEvent`, and if the `WriteSetPayload` is a `Direct` value, it also emits a `NewEpochEvent` to trigger reconfiguration. For a `Script` value in the `WriteSetPayload`, it is the responsibility of the code in the script to determine whether a reconfiguration is necessary, and if so, to emit the appropriate `NewEpochEvent`. If the epilogue does not execute successfully, the status code is set to `UNEXPECTED_ERROR_FROM_KNOWN_MOVE_FUNCTION`.

## Account events

Whenever the value of one of the account’s balances is changed, specific events are emitted that describe the state change that occurred.

Whenever an account’s balance resource receives funds a `ReceivedPaymentEvent` event with the following structure is recorded on the `received_events` event handle in the account’s `DiemAccount` resource.

```
struct ReceivedPaymentEvent {
    amount: u64,
    currency_code: vector<u8>,
    payer: address,
    metadata: vector<u8>,
}
```

The `amount` field of the recorded event specifies the  amount by which the account’s balance was increased, and the `currency_code` specifies the balance of the currency in which the funds were added. The `payer` field specifies the address from which the deposited funds were withdrawn, and the `metadata` field contains any metadata attached to funds by the `payer`.

When an account’s balance resource has funds withdrawn from it a `SentPaymentEvent` event with the following structure is recorded on the `sent_events` event handle in the debited account’s `DiemAccount` resource.

```
struct SentPaymentEvent {
    amount: u64,
    currency_code: vector<u8>,
    payee: address,
    metadata: vector<u8>,
}
```

The `amount` and `currency_code` fields of the recorded event specify the amount and the currency of the withdrawal from the account’s balance. The `payee` field specifies where the withdrawn funds are re-deposited, and the `metadata` fields contains any metadata that the `payee` wishes to attach to the payment.

### Account Event Invariants

The `SentPaymentEvent` and  `ReceivedPaymentEvent`, along with gas payments for a particular account, can be used to derive the account’s balance. To see this, let H be the event handle that received one of the above `SentPaymentEvent` or `ReceivedPaymentEvent` events, and let A be the account address under which this event handle is published. The following invariants hold for these events:

* The `currency_code` balance under A increases by `amount` if and only if a `ReceivedPaymentEvent` `{amount, currency_code, payer}` is recorded on handle H.
* If a `SentPaymentEvent` `{amount, currency_code, payee}` is recorded on handle H, A’s `currency_code` balance decreases by the specified `amount`.
* When A sends a transaction for execution with `gas_used` `= X`, `gas_unit_price = Y`, and `gas_currency_code = C,` this will decrease A's balance in currency `C` by `X * Y`. This will not record an event.
* Every decrease in the balance of an account has either a corresponding `SentPaymentEvent` or a corresponding gas charge.
* In almost all cases, a `SentPaymentEvent {amount, currency code, payee}` recorded on a handle H1 is coupled with a `ReceivedPaymentEvent {amount, currency_code, payer}` recorded on a handle H2, such that H1’s address is equal to `payer` and H2’s address is equal to `payee`. This means that H1 is sending funds, while H2 is receiving those funds. The only exceptions are:
    * Minting: When new coins are minted to an address A, the payer address of the `ReceivedPaymentEvent` will appear as the reserved address `0x0`. There is no corresponding `SentPaymentEvent`.
    * Preburning: A preburn transaction sent from address A will emit a `SentPaymentEvent` where both the payer and payee address are A. There is no corresponding `ReceivedPaymentEvent`.
    * Cancelling a preburn sent from address A. In this case, a `ReceivedPaymentEvent` will be emitted to A’s event stream where both the payer and payee address are A. There is no corresponding `SentPaymentEvent`.


Similarly, [`MintEvent`s and `BurnEvent`s](https://github.com/diem/dip/blob/master/dips/dip-20.md#currency-related-events) can be used to derive the total supply of a particular currency in the system. The following invariants hold for these events:

*  A `MintEvent {amount, currency_code}` is emitted if and only if the value of all `currency_code` coins in the system increases by `amount`.
*  A `BurnEvent {amount, currency_code}` is emitted if and only if the quantity of `currency_code` in the system decreases by `amount`.

No events other than `SentPaymentEvent`, `ReceivedPaymentEvent`, `MintEvent,`  `BurnEvent`, and transaction fees are relevant for account balance reconciliation.
