---
lip: 6
title: Libra Validator Configuration Management
author: Valeria Nikolaenko, David Wolinsky, Sam Blackshear, David Dill
status: Draft
type: Informational
created: 07/30/2020
---

# Summary
---
This LIP describes the conceptual model and implementation of validator configuration management on the Libra blockchain.

---
# Abstract / Motivation
---

The Libra Association is an independent membership organization that is responsible for the governance of the Libra network and the development of the Libra project. Members make key decisions for the Libra network, such as adding a new member, removing an existing member, advancing the version of the Libra protocol, etc. Each member designates a party to run a validator node that operates the blockchain. There is one-to-one relationship between the members and the validator nodes. The validator set defines the current set of validator nodes that run consensus protocol. Validator nodes that are currently part of the set process transactions and interact with each other to reach consensus on the state of the blockchain. Not all of the validator nodes might be in the set at any given time. Members of the Libra Association collectively decide to add or remove validator nodes to or from the validator set.

---
# Specification
---

# Overview
Each member of the Libra Association holds a Libra account with a *validator-owner* role (see [lip-2: Libra Roles and Permissions](https://github.com/libra/lip/blob/master/lips/lip-2.md)). A validator-owner designates a single *validator-operator* to run a validator node. Validator-operator is a Libra account with a validator-operator role. Each validator-operator may run nodes for multiple validator-owners, therefore there is a one-to-many relationship between operator accounts and owner accounts. If an operator OP_1 is designated to run validator nodes for two validator owners V_1 and V_2, the operator must run two distinct instances of validator nodes.

Each validator-owner accounts stores a *consensus configuration* that consists of the consensus public key (to sign consensus messages), the networking information (for the consensus node to connect to other consensus nodes) and the full-node networking information (for the public full-nodes and under certain circumstances for other consensus nodes themselves to connect to this consensus node). The validator-operator designated by the validator-owner is responsible for running an actual consensus node with this consensus config and is responsible for updating/rotating this config as needed.

The *validator set* is a set of validator owner addresses and a copy of their consensus configs. This set is stored under the LibraRoot address and reflects the configuration that currently runs consensus protocol. Any change to this set defines a new epoch by triggering an event: LibraConfig::NewEpochEvent.
If a transaction causes an epoch change, that transaction is the last transaction committed
in the current epoch — any subsequent transactions in that block or future blocks from that epoch
will be ignored. Once the transaction has been committed, the new validator set can start the next epoch of the consensus protocol.

Only the LibraRoot may add/remove validators owner accounts to/from the validator set. Each validator operator may update its validator's config in this set which will also trigger the LibraConfig::NewEpochEvent.

Each validator owner is obliged to notify the Association about the decision to change the validator operator, the Association may disallow the switch if the new operator is deemed not trustworthy or the distribution of consensus power becomes skewed towards this operator or operators with similar architectures. The Association makes sure there is enough diversity between the consensus nodes of the Libra Blockchain.

# Transaction Scripts
The following transaction scripts can be run by the LibraRoot:
* `create_validator_account`
* `create_validator_operator_account`
* `add_validator_and_reconfigure`
* `remove_validator_and_reconfigure`

The following transaction scripts can be run by the validator owner:
* `set_validator_operator`
* `remove_validator_operator`
* `rotate_authentication_key`

The following transaction scripts can be run by the validator operator:
* `register_validator_config`
* `set_validator_config_and_reconfigure`
* `rotate_authentication_key`

# Notes
Note that in first version of Libra Protocol, the validator owners will not maintain the ownership of their Libra accounts, the LibraRoot account will run validator owners' operations on their behalf. On the other hand validator operators will maintain full ownership of their Libra accounts.
Gradually, the validator owners will start managing their accounts themselves. They will send their new account key to the Association and the Association will rotate their account key to this new key. Right after this rotation transaction gets executed, the validator owner stars to maintain its Libra account.

Both the validator owner account and the validator operator account store a human_name which refers to the name of the company behind the account written in snake case (lowercase, where spaces are replaced with underscores), it is initialized at account creation and never changes. Most validator-related transaction scripts get the address and the names of the account and check that the human_name under the account matches the name passed into the transaction script. This prevents accounts from accidentally mix up the addresses, which are hex strings, and adds a second level of protection against human errors.

### Formal verification guarantees on the Move Implementation

* Disciplined aborts
* Only LibraRoot or a Validator Operator can trigger reconfiguration
* Every change to an validator set triggers a reconfiguration
* Only a validator can set its operator
* Only an operator can update an on-chain config
* The size of the validator set can only change by at most one when LibraConfig::NewEpochEvent is emitted
* Multiple calls to add_validator or remove_validator are prohibited except in genesis
* Both functions register_validator_config or set_validator_config_and_reconfigure check the validity of the consensus key and abort if an invalid key is given
* An account can only appear once in a validator set
* (currently) If the validator's operator is not set, the validator owner itself acts as its validator operator
* If the validator owner changes the operator, its old config continues to persist in the validator set


### Move Implementation

Four move modules govern the validator configuration

* [`ValidatorConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/ValidatorConfig.move): stores local consensus configuration for a validator.
* [`ValidatorOperatorConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/ValidatorOperatorConfig.move): stores the configuration of the validator operator (it only contains a human name)
* [`LibraSystem`](): publishes the validator set and determines the rules for modifying it
* [`LibraConfig`](): module that manages all of the global on-chain configurations
