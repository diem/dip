---
lip: 6
title: Libra Validator Configuration Management
author: Valeria Nikolaenko, David Wolinsky, Sam Blackshear, David Dill
status: Draft
type: Informational
created: 07/30/2020
---
# Summary
This LIP describes the conceptual model and implementation of validator configuration management on the Libra blockchain.

# Abstract / Motivation
The Libra Payment Network (“LPN”) is a blockchain-backed payment platform and an infrastructure for stablecoins that supports a regulated global digital payment network. Both the blockchain and the stablecoin financial instruments are controlled by Libra Networks, Ltd. (“Libra Networks” or “LN”) a subsidiary of the Libra Association  (the “Association” or “LA”).  LPN operates under a payment system license from FINMA (the “FINMA License”), and LN is responsible for ensuring that LPN operates in compliance with the FINMA License.

The Libra Association is an independent membership organization that is responsible for the governance of the LPN and the development of the Libra project. The Association is governed by the Council, which is comprised of one representative per Association member. The Association Council manages the technology roadmap of the platform and oversees and maintains the Libra Improvement Proposal and Libra Upgrade Process, often through subcommittees of the Council such as the Technical Steering Committee (the “TSC”) and the Association Board. 

Each member that participates in maintaining the blockchain by operating a Validator Node or designating a party to operate a Validator Node is referred to as a Validator Owner. The Validator Set defines the current set of Validator Nodes that run consensus protocol. Validator Nodes that are currently part of the Validator Set process transactions and interact with each other to reach consensus on the state of the blockchain. The Validator Set may change from time to time and not all members may have Validator Nodes in the Validator Set at any given time. Reasons for changing the Validator Set include joining or departure of members from the Association and actions needed for compliance reasons or to comply with LN’s obligations under its payment system license from FINMA to guarantee the secure and performant operation of the platform.

# Terminology
* *Validator Node* ("node") is a replica that runs the Libra Protocol to maintain a database of programmable resources. Validator Node processes transactions and interacts with other Validator Nodes to reach consensus on the ordering of transactions and the resulting state of the database after transactions' executions. 
* *Validator Owner* is a entity that manages an on-chain Libra account of the member of the Libra Association. The account stores the *Validator Config* resource that contains information about the Validator Node of this Validator Owner. This information includes *consensus public key* (EdDSA public key that is used by others to authenticate consensus messages of this node) and *networking information* (network addresses and static Noise keys for establishing secure connections with this node from other nodes or from clients).
* *Validator Set* is a copy of Validator Configs of the approved subset of the Validator Owners, it consists of configs currently running the Libra Protocol. The Libra Association collectively decides which Validator Owners' configs are in the set. There is a one-to-one correspondence between the Validator Owners in the Validator Set and the Validator Nodes. The protocol remains safe when at most a third minus one of the Validator Nodes are byzantine.
* *Validator Operator* ("operator") is an entity that manages its on-chain Libra account and runs a Validator Node on behalf of the Validator Owner who designated this operator to be running the node. There can be one Validator Operator account on-chain that runs two Validator Nodes for two Validator Owners, one node per one owner. It is not allowed to run a single Validator Node per multiple Validator Owners even when the nodes are run by the same Validator Operator. The Validator Operator has the permission to rotate the Validator Configs for its Validator Owners.

# Specification
## Overview
Each Validator Owner holds a Libra account with a *Validator Owner role* (see [lip-2: Libra Roles and Permissions](https://github.com/libra/lip/blob/master/lips/lip-2.md)). A Validator Owner designates a Validator Operator to run a Validator Node
A Validator Owner designates a single Validator Operator account to run a Validator Node. Validator Operator is a Libra account with a *Validator Operator role*. Each Validator Operator may run nodes for multiple Validator Owners, therefore there is a one-to-many relationship between operator accounts and owner accounts. If an operator OP_1 is designated to run Validator Nodes for two Validator Owners V_1 and V_2, the operator must run two distinct instances of Validator Nodes.

Each Validator Owner account stores a consensus configuration that consists of the consensus public key, the networking information (for the Validator Node to connect to other Validator Nodes) and the Full Node networking information (for the public Full Nodes and clients and, under certain circumstances, for other Validator Nodes themselves to connect to this Validator Node). The Validator Operator designated by the Validator Owner is responsible for running a node with this consensus config and is responsible for updating/rotating this config as needed.

The Validator Set is a map of Validator Owner addresses to a copy of their consensus configs. Each Validator Owner address appears in the Validator Set at most once. This set is stored under the LibraRoot address and reflects the configuration that currently runs consensus protocol. Any change to this set defines a new epoch by triggering a new epoch event. If a transaction causes an epoch change, that transaction is the last transaction committed in the current epoch — any subsequent transactions in that block or future blocks from that epoch will be ignored. Once the transaction has been committed, the new Validator Set can start the next epoch of the consensus protocol.

Only LibraRoot may add/remove Validators Owner accounts to/from the Validator Set. Each Validator Operator may update its validator's config in this set which will also trigger the a new epoch event.

Each Validator Owner is obliged to notify LN about the decision to change the Validator Operator, LN may disallow the switch if the new operator is deemed not trustworthy or the distribution of consensus power becomes skewed towards this operator or operators with similar architectures. LN makes sure there is enough diversity between the Validator Nodes operating the Libra Blockchain.

## Move Modules

Four move modules are involved in the validator configuration management

* [`ValidatorConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/ValidatorConfig.move): stores local consensus configuration for a validator.
* [`ValidatorOperatorConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/ValidatorOperatorConfig.move): stores the configuration of the validator operator (it only contains a human name).
* [`LibraSystem`](): publishes the Validator Set as a global on-chain config and determines the rules for modifying it.
* [`LibraConfig`](): a generic module that manages all of the global on-chain configurations.

## Transaction Scripts
The following transaction scripts can be run by the LibraRoot:
* [`create_validator_account`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/create_validator_account.move) - to create a Validator Owner account
* [`create_validator_operator_account`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/create_validator_operator_account.move) - to create a Validator Operator account
* [`add_validator_and_reconfigure`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/add_validator_and_reconfigure.move) - to add Validator Owner to the Validator Set with its current config and trigger reconfiguration
* [`remove_validator_and_reconfigure`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/remove_validator_and_reconfigure.move) - to remove Validator Owner from the Validator Set and trigger reconfiguration

The following transaction scripts can be run by the Validator Owner:
* [`set_validator_operator`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/set_validator_operator.move) - to designate the Validator Operator
* [`rotate_authentication_key`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/rotate_authentication_key.move) - to rotate the authentication key of the Validator Owner Account

The following transaction scripts can be run by the Validator Operator:
* [`register_validator_config`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/register_validator_config.move) - to register the Validator Config resource
* [`set_validator_config_and_reconfigure`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/set_validator_config_and_reconfigure.move) - to change values of the Validator Config resource and update the config in the Validator Set (aborts if the Validator Owner is not in the Validator Set)
* [`rotate_authentication_key`](https://github.com/libra/libra/blob/master/language/stdlib/transaction_scripts/rotate_authentication_key.move) - to rotate the authentication key of the Validator Operator Account

# Formal verification guarantees on the Move Implementation
* Disciplined aborts
* Only LibraRoot or a Validator Operator of a Validator Owner which is currently in the Validator Set can trigger reconfiguration
* Every change to a Validator Set triggers a reconfiguration when LibraConfig::NewEpochEvent is emitted
* Only a Validator Owner (role) can set its Validator Operator; for each Validator Owner account this permission is given only to the Validator Owner (itself)
* Only a Validator Operator of a Validator Owner who is present in the Validator Set can update a Validator Config in the Validator Set
* The size of the Validator Set can only change by at most one in a block
* Multiple calls to add_validator or remove_validator in the same block are prohibited except in genesis
* Both functions register_validator_config or set_validator_config_and_reconfigure check the validity of the consensus key and abort if an invalid key is given
* A Validator Owner account can only appear once in a Validator Set
* (currently) If the Validator's Operator is not in the Validator Set, the Validator Owner itself acts as its own Validator Operator
* If the Validator Owner changes the Validator Operator, its old Validator Config does not change in the Validator Set until a new Validator Operator sets a new Validator Config and explicit calls an update (LibraSystem::update_config_and_reconfigure) or the Association calls add/remove (LibraSystem::add_validator/LibraSystem::remove_validator).

## Notes
In first version of Libra Protocol, Validator Owners will not maintain ownership of their Libra accounts, the LibraRoot account will run Validator Owners' operations on their behalf. Validator Operators on the other hand will maintain full ownership of their Libra accounts. Gradually, the Validator Owners will start managing their accounts themselves. A Validator Owner will send their new account key to the Association, the Association will rotate their account key to this new key and right after this rotation transaction gets executed, the Validator Owner starts to maintain its Libra account.

Both the Validator Owner account and the Validator Operator account store a human_name which refers to the name of the company behind the account written in snake case (lowercase, where spaces are replaced with underscores), it is initialized at account creation and never changes. Most validator-related transaction scripts get the address and the name of the account and check that the human_name under the account matches the name passed into the transaction script. This prevents accounts from accidentally mixing up the addresses which are hex strings, and adds a second level of protection against human errors in mapping entities to Libra addresses.
