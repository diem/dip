---
lip: 2
title: Libra Roles and Permissions
authors: Sam Blackshear, Tim Zakian, Junkil Park
status: Last Call
type: Informational
created: 06/26/2020
---

# Summary
---
This LIP describes the conceptual model and implementation of access control on the Libra blockchain.

---
# Abstract / Motivation
---

Libra uses a variant of [role-based access control](https://en.wikipedia.org/wiki/Role-based_access_control) (RBAC) to restrict access to sensitive on-chain operations.

A *role* is an entity with some authority in the Libra Payment Network (LPN). Every account in LPN is created with a single, immutable role that is granted at the time the account is created. Creating an account with a particular role is a privileged operation (e.g., only an account with the ParentVASP role can create an account with the ChildVASP role). In some cases, the role is globally unique (e.g., there is only one account with the LibraRoot role). In other cases, there may be many accounts with the given role (e.g., ChildVASP).

A *permission* is the authority to perform a specific action in LPN. Each permission may be assigned to one or more roles (usually only one), and each role may have zero or more permissions. Permissions can be assigned in genesis, upon account creation (most common), or claimed by an existing account with the appropriate role. Like roles, some permissions are globally unique (e.g., the permission to mint a particular currency type) and some are not.

Both roles and permissions can be parameterized by types (e.g., the AddCurrency(**type**) permission) and account address values (e.g., ChildVASP(**addr**)).

---
# Specification
---

Mathematically, we can view Libra role/permissions as a pair of relations over three sets:

* Sets: Role, Permission, Address
* Relations: Permission -> Role (a many-many relation) and Address -> Role (a partial function)

This LIP focuses on defining the Roles and Permissions sets and the Permissions -> Role relation because these are fairly static. The relations only change when we add new roles/permissions or update the existing allocation of permissions. By contrast, the Address -> Role function is highly dynamic--it is updated by any transaction that creates a new account.


## Roles
The current roles in Libra are:

|   |                     |         A          |             B             |      C      |         D         |          E          |       F        |            G             |
|:-:|:-------------------:|:------------------:|:-------------------------:|:-----------:|:-----------------:|:-------------------:|:--------------:|:------------------------:|
|   |      **Role**       |   **Granted by**   |        **Unique?**        | **Address** | **Has balances?** | **Account limits?** | **Freezable?** | **Transaction priority** |
| 1 |      LibraRoot      |      genesis       |         Globally          |  0xA550C18  |         N         |          -          |       N        |            3             |
| 2 | TreasuryCompliance  |      genesis       |         Globally          |  0xB1E55ED  |         N         |          -          |       N        |            2             |
| 3 |      Validator      |     LibraRoot      |  Per Association member   |      -      |         N         |          -          |       Y        |            1             |
| 4 |  ValidatorOperator  |     LibraRoot      | At most one per Validator |      -      |         N         |          -          |       Y        |            1             |
| 5 |  DesignatedDealer   | TreasuryCompliance |             N             |      -      |         Y         |          N          |       Y        |            1             |
| 6 |     ParentVASP      | TreasuryCompliance |         Per VASP          |      -      |         Y         |          Y          |       Y        |            0             |
| 7 | ChildVASP(**addr**) |     ParentVASP     |             N             |      -      |         Y         |          Y          |       Y        |            0             |

* LibraRoot - The root authority of LPN. Controlled jointly by LN and the Association Council.
* TreasuryCompliance - LPN account responsible for day-to-day treasury (e.g. minting, burning), and compliance (e.g., updating on-chain exchange rates, freezing accounts) operations.
* Validator - The on-chain representation of a Libra Association member for validation purposes.
* ValidatorOperator - A third-partity entity authorized by LN to operate validator nodes on behalf of Association members.
* Designated Dealer - An entity with the authority to place  mint and burn orders for Libra Coins with LN and interact with the Libra Reserve.
* ParentVASP - The primary account of a virtual asset service provider (VASP) operating on the Libra blockchain.
* ChildVASP(**addr**) - A child account of a the ParentVASP account at **addr**

### Notes
* The "Granted by" column specifies which role can create accounts with the given role type (e.g., only LibraRoot can create accounts with the Validator role).
* The LibraRoot and TreasuryCompliance roles are globally unique and granted to the addresses `0x0...A550C18` and `0x0...B1E55ED` (respectively).
* The addresses `0x0...0` and `0x...0` are special addresses that can never contain an account. `0x0` is a "reserved address" that cannot store any data and `0x1` is where the Move modules implementing the Libra Framework logic are stored.
* The administrative roles LibraRoot, TreasuryCompliance, Validator, and ValidatorOperator cannot hold balances in any currency and thus cannot receive funds sent from other accounts.
* The DesignatedDealer, ParentVASP, and ChildVASP roles can each hold balances in any currency. ParentVASP and ChildVASP accounts have daily limits on their incoming and outgoing transfers and total balance. DesignatedDealer accounts are not subject to these limits.
* All accounts with roles other than LibraRoot and TreasuryCompliance can be "frozen". A frozen account cannot send any transactions or receive funds from other accounts.
* To ensure that important system transactions are executed promptly, the Libra mempool prioritizes transactions sent by certain roles. LibraRoot transactions have the highest priority, TreasuryCompliance transactions have the second highest, Validator/ValidatorOperator/DesignatedDealer transactions have the third highest, and VASP transactions have the lowest. The mempool compares transactions by role priority first and gas price second.

### Move Implementation
Roles are implemented in the [`Roles`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/Roles.md#module-0x1roles) Move module. Every account contains a [`Roles::RoleId`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/Roles.md#resource-roleid) resource with an integer code to identify the role. The codes are:

```
const LIBRA_ROOT_ROLE_ID: u64 = 0;
const TREASURY_COMPLIANCE_ROLE_ID: u64 = 1;
const DESIGNATED_DEALER_ROLE_ID: u64 = 2;
const VALIDATOR_ROLE_ID: u64 = 3;
const VALIDATOR_OPERATOR_ROLE_ID: u64 = 4;
const PARENT_VASP_ROLE_ID: u64 = 5;
const CHILD_VASP_ROLE_ID: u64 = 6;
```

## Permissions
The current permissions in Libra are:

|    |                                         |              H               |             I             |         J         |
|:--:|:---------------------------------------:|:----------------------------:|:-------------------------:|:-----------------:|
|    |             **Permission**              |        **Granted to**        |        **Unique?**        | **Transferable?** |
| 1  |         MintCurrency(**type**)          |      TreasuryCompliance      |   Per currency **type**   |         N         |
| 2  |    {Enable,Disable}Minting(**type**)    |      TreasuryCompliance      |   Per currency **type**   |         N         |
| 3  |         BurnCurrency(**type**)          |      TreasuryCompliance      |   Per currency **type**   |         N         |
| 4  |        PreburnCurrency(**type**)        |       DesignatedDealer       |             N             |         N         |
| 5  |      UpdateExchangeRate(**type**)       |      TreasuryCompliance      |   Per currency **type**   |         N         |
| 6  |       UpdateDualAttestationLimit        |      TreasuryCompliance      |             Y             |         N         |
| 7  |        {Freeze,Unfreeze}Account         |      TreasuryCompliance      |             Y             |         N         |
| 8  |           RegisterNewCurrency           |          LibraRoot           |             Y             |         N         |
| 9  |       ProcessWriteSetTransaction        |          LibraRoot           |             Y             |         N         |
| 10 |       UpdateLibraProtocolVersion        |          LibraRoot           |             Y             |         N         |
| 11 |             UpdateVMConfig              |          LibraRoot           |             Y             |         N         |
| 12 |              PublishModule              |          LibraRoot           |             Y             |         N         |
| 13 |          {Add,Remove}Validator          |          LibraRoot           |             Y             |         N         |
| 14 |     UpdateValidatorConfig(**addr**)     |      ValidatorOperator       |       Per validator       |         N         |
| 15 | {Set,Remove}ValidatorOperator(**addr**) |          Validator           |       Per validator       |         N         |
| 16 |   RotateDualAttestationInfo(**addr**)   | ParentVASP, DesignatedDealer | Per VASP/DesignatedDealer |         N         |
| 17 |    RotateAuthenticationKey(**addr**)    |     Account at **addr**      |        Per address        |         Y         |
| 18 |     WithdrawalCapability(**addr**)      |     Account at **addr**      |        Per address        |         Y         |


* MintCurrency(**type**): Create currency of the given **type**
* {Enable,Disable}Minting(**type**): Enable and disable minting the currency of the given **type**
* BurnCurrency(**type**): Destroy currency of the given **type**
* PreburnCurrency(**type**): Create a burn request for the currency of the given **type** to be fulfilled or canceled by the holder of BurnCurrency
* UpdateExchangeRate(**type**): Update the exchange rate from each non-LBR currency **type** to LBR
* UpdateDualAttestationLimit: Update the amount above which VASP <-> VASP transactions must use the travel rule protocol
* {Freeze,Unfreeze}Account: Prevent an account from sending transactions or receiving funds
* RegisterNewCurrency: Add a new currency type to the system
* ProcessWriteSetTransaction: Process writeset transactions (i.e., direct writesets and admin scripts) to update the Libra protocol by changing on-chain Move modules and/or global state
* UpdateLibraProtocolVersion: Change the current Libra protocol version. This will atomically update the behavior of node software
* UpdateVMConfig: Update the transaction script allowlist, module publishing options, or gas costs
* PublishModule: Publish a new Move module
* {Add,Remove}Validator: Add and remove validators
* UpdateValidatorConfig(**addr**): Rotate the consensus public key and network address for the validator account at **addr**
* {Set,Remove}ValidatorOperator(**addr**): Set and remove the address of the operator account that has permission to rotate the consensus public key of the validator account at **addr**
* RotateDualAttestationInfo(**addr**): Change the public key and endpoint URL that **addr** uses for the KYC and travel rule protocols
* RotateAuthenticationKey(**addr**): Rotate the authentication key for the account at **addr**
* WithdrawCapability(**addr**): Decrease the balance of the account at **addr**

### Notes
* The "Granted to" column specifies which role(s) can be assigned the given privilege
* All privileges are granted to an account upon creation, and most remain in that account forever. There are three exceptions: UpdateValidatorConfig, RotateAuthenticationKey and Withdraw.
	- UpdateValidatorConfig is granted to a Validator account upon creation, but can be delegated to a ValidatorOperator. The Validator can subsequently revoke the privilege and delegate to a different operator with the permission of LN.
	- Both RotateAuthenticationKey and Withdraw are "transferable" privileges that can be be extracted from their original account and placed in a resource elsewhere (including one published under a different account).

### Move Implementation
Conceptually, each permission encodes the authority to mutate some piece of on-chain state. Each permission check is implemented inside the module that performs this mutation.

* [`Libra`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/Libra.md): MintCurrency, {Enable,Disable}Minting, BurnCurrency, PreburnCurrency, UpdateExchangeRate, RegisterNewCurrency.
* [`DualAttestation`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/DualAttestation.md): UpdateDualAttestationLimit, RotateDualAttestationInfo
* [`AccountFreezing`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/AccountFreezing.md): {Freeze, Unfreeze}Account
* [`WriteSetManager`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/LibraWriteSetManager.md): ProcessWriteSetTransaction
* [`LibraVersion`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/LibraVersion.md): UpdateLibraProtocolVersion
* [`LibraVMConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/LibraVMConfig.md): UpdateVMConfig
* [`LibraSystem`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/LibraSystem.md): {Add,Remove}Validator, UpdateValidatorConfig, {Set,Remove}ValidatorOperator
* [`LibraAccount`](https://github.com/libra/libra/blob/master/language/stdlib/modules/doc/LibraAccount.md): RotateAuthenticationKey, Withdraw
