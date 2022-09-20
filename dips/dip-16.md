---
dip: 16
title: Transaction Scripts
authors: Sam Blackshear (@sblackshear), Todd Nowacki (@tnowacki), Bob Wilson (@bob-wilson)
status: Draft
type: Informational
created: 3/24/2021
---

Diem Framework transactions contain Move transaction scripts that change on-chain state (e.g., balances) by invoking functions of Move modules published on-chain. This DIP explains both the mechanics of transaction scripts and the process for adding, removing, and changing scripts. This DIP does *not* document the specific scripts that are available to Diem users, but the complete list of scripts can be found in the [Diem developer docs](https://github.com/diem/diem/blob/main/language/diem-framework/transaction_scripts/doc/transaction_script_documentation.md).

### Transaction payloads

A Diem transaction includes a `TransactionPayload` that contains the logic for performing an on-chain update:

```
pub enum TransactionPayload {
    /// A system maintenance transaction.
    WriteSet(WriteSetPayload),
    /// A transaction that executes code.
    Script(Script),
    /// A transaction that publishes code.
    Module(Module),
    /// A transaction that executes an existing script function published on-chain.
    ScriptFunction(ScriptFunction),
}
```

The two `TransactionPayload` variants relevant to this DIP are `ScriptFunction` (which contains a pointer to a function already published in an on-chain Move module) and `Script` (a standalone, single-function bytecode program).

## Script signature requirements

Both script functions and the single function in a transaction script bytecode file have the following requirements. For a function` f<ability_params>(param_types): ret_types`:

* The `ret_types` list is empty (i.e., the function does not return a value)
* The `param_types` list begins with one or more `signer` types
* No `signer` type appears after a non-`signer` type in `param_types`
    * E.g., `f(signer)`, `f(signer, u64)`, and `f(signer, signer, bool)` satisfy this condition
    * E.g., `f(u64, signer)`, `f(signer, u64, signer)`, `f(signer, bool, u64, signer)` do not satisfy this condition
* Each non-`signer` type in `param_types` has the `copy` ability and is not a struct
    * E.g., `f(signer, Diem<XUS>`) does not satisfy this condition because `Diem<XUS>` is a struct
* Each type in `param_types` is *closed* (that is, does not refer to the type variables in `ability_params`
    * E.g., `f<T>(signer, vector<T>)` does not satisfy this condition
    * E.g., `f(signer, vector<u8>`) does satisfy this condition

## Script Functions

In the Move language, a function can be declared with four different visibility levels: `public`, `private`, `public(friend)`, and `public(script)`. *Any* function with `public(script)` visibility can be invoked by a transaction if it satisfies the script signature requirements explained below.

A client can define a `ScriptFunction` transaction payload using the following struct:

```
pub struct ScriptFunction {
    module: ModuleId,
    function: Identifier,
    ty_args: Vec<TypeTag>,
    args: Vec<Vec<u8>>,
}
```

Here, a `module` is an (account address, module name) pair that refers to a module already published on chain. The `function` should be the name of a function declared by `module` with script visibility. The signature of `function` must satisfy the script signature requirements described below.

The type arguments `ty_args` are a list of Move types. Each type must either be a valid Move ground type (e.g., `u64`) or the fully qualified identifier of a type declared on-chain (e.g., `0x1::DiemAccount::DiemAccount`). In addition, the length of `ty_args` and `ability_params` must be the same and each type must satisfy the constraints expressed by `ability_params`.

The value arguments `args` are a list of BCS-encoded values. The length of `args` and `param_types` must be the same. Each value argument must deserialize correctly according to its corresponding type in `param_types`.

## Transaction Scripts

A transaction script is a Move bytecode program that contains a single function `f`. The signature of `f` must satisfy the script signature requirements described below.

A client can define a `Script` transaction payload using the following struct.

```
pub struct Script {
    code: Vec<u8>,
    ty_args: Vec<TypeTag>,
    args: Vec<TransactionArgument>,
}
```

Here, `code` is a Move bytecode program. The `ty_args` are the same as for script functions. The `args` are a list of `TransactionArgument`s instead of a list of BCS-encoded values.

Only a restricted set of programs can be included in `code`. The allowed programs are specified in an on-chain allowlist published at `0x1::DiemTransactionPublishingOption::DiemTransactionPublishingOption.script_allowlist`. The allowlist contains the sha3-256 hash of each program rather than the code itself.

A transaction containing a transaction script not present in the allowlist will be rejected. The only exception to this rule is the DiemRoot account 0xA550C18, which can send arbitrary transaction scripts. A future releases of Diem may lift the allowlist restriction.

## Adding, removing, and changing scripts

The policies for adding/removing, and changing scripts are as follows:

### Adding new scripts

New script functions can be added by:

* publication of a new Diem module with `public(script)` functions
* updates to an existing Diem module that add new `public(script)` functions or change the visibility of existing functions (e.g., `private` → `public(script)`).

The hash-based transaction allowlist is fixed--new transaction scripts will not be added to this list. This means that all new functionality will be exposed via script functions rather than the allowlist. However, in future releases of Diem, we may remove the hash-based allowlist altogether and allow users to write arbitrary transaction scripts.

### Removing scripts

In general, both existing script functions and transaction scripts from the allowlist will continue to exist indefinitely. In rare cases, existing scripts may be removed, but only with significant advanced notice and a migration plan for affected Diem community members.

### Changing script functions

* The name and type signature of an existing script function will never be changed.
* The set of error codes that may be returned by a script function is included in the [developer documentation](https://github.com/diem/diem/blob/main/language/diem-framework/transaction_scripts/doc/transaction_script_documentation.md) for each script. The error codes returned by a script function may grow or shrink, but the meaning of a given error code will remain fixed. E.g.:
    *  If the error code 72 in script fun `f` means “insufficient balance” in one Diem release, 72 will continue to have this meaning in future releases.
    * It is permissible for a future release to change `f` so that it no longer returns code 72.
    * It is permissible for a future release to change `f` so that it now returns code 75 in addition to 72.
* The non-error behavior of a script function may be changed in non-semantic ways. E.g.:
    * It would not be permissible to change the `peer_to_peer` payment script so that it no longer performs a payment.
    * It would be permissible to change the set of functions called or resources read/written by the `peer_to_peer` payment script (e.g., to add an extra compliance check).
* The gas cost of a script may be changed.

## Changelog

### diem-core-v1.2.0
* Added script functions.
* Move bytecode v2 transaction scripts and script function signatures accept `signer` arguments. Move bytecode v1 transaction scripts continue to accept `&signer` arguments.
