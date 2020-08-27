---
lip: 6
title: Libra Validator Configuration Management
authors: Valeria Nikolaenko, David Wolinsky, Sam Blackshear, David Dill
status: Draft
type: Informational
created: 07/30/2020
---
# Summary
This LIP describes the conceptual model and implementation of the on-chain configuration management on the Libra blockchain, this includes the validator set, registered currencies, VM config and Libra version.

# Abstract / Overview
The Libra Payment Network (“LPN”) is a blockchain-backed payment platform and an infrastructure for stablecoins. Both the blockchain and the stablecoin financial instruments are controlled by Libra Networks (“Libra Networks” or “LN”) a subsidiary of the Libra Association  (the “Association” or “LA”). Libra Networks is in the process of applying for a payment system license from the Swiss Financial Market Supervisory Authority (“FINMA”).  Once granted, LPN will operates under a payment system license from FINMA (the “FINMA License”), and LN will be responsible for ensuring that LPN operates in compliance with the FINMA License.

The Libra Association is an independent membership organization that is responsible for the governance of the LPN and the development of the Libra project. The Association is governed by the Council, which is comprised of one representative per Association member. The Association Council manages the technology roadmap of the platform and oversees and maintains the Libra Improvement Proposal and Libra Upgrade Process, often through subcommittees of the Council such as the Technical Steering Committee (the “TSC”) and the Association Board.

Each member of the Libra Association is expected to run a Validator Node, which processes transactions to update the blockchain state. Validator Nodes are replicas of each other that participate in the Libra Protocol to coordinate and reach consensus on the state of the blockchain. At any moment in time, a subset of the Validator Nodes, called the Validator Set, participate in the protocol, ensuring correct updates even if some validators (fewer than a third) fail in arbitrary ways. The Association determines the composition of the Validator Set by adding and removing Validator Nodes over time.  Reasons for changing the Validator Set include new members joining the Association or existing members leaving it and actions needed to comply with LN’s obligations under its FINMA License designed to guarantee the secure and performant operation of the platform. The Validator Set is stored as part of the blockchain state, in an on-chain configuration.

TODO (someone): Supply a link to an explanation of configurations and reconfiguration, and maybe briefly explain here.

TODO (@tzakian): explain the registered currencies on-chain config.

TODO (@runtian-zhou): explain the libra version on-chain config.

TODO (@runtian-zhou): explain the libra VM config.

# Terminology
* *Validator Node* ("node") is a replica that runs the Libra Protocol to maintain the blockchain state. A Validator Node processes transactions and interacts with other Validator Nodes to reach consensus on the ordering of transactions and the resulting state of the database after transactions' executions.
* *Validator Config* is an on-chain resource that stores information about a Validator Node. It includes a *consensus public key*,
which is an EdDSA public key used to authenticate consensus messages from that node to other Validator Nodes. It also includes *networking information*, including network addresses and static public keys for establishing secure connections with this node from other nodes or from clients.
* *Validator Owner* is a entity that manages an on-chain Libra account of the member of the Libra Association. The account stores the *Validator Config* resource. There is a one-to-one correspondence between Validator Owners and Validator Nodes.
* *Validator Set* is a set of Validator Configs of a subset of the Validator Owners currently participating in the Libra Protocol. The Libra Association collectively decides which Validator Owners' configs are in the set. There is a one-to-one correspondence between the Validator Owners in the Validator Set and the Validator Nodes. [TODO (dd): Is this last statement correct? We've implied that there can be Validator Nodes outside the Validator Set, but then who owns them, if every Validator Owner is represented in the Validator Set at all times? Perhaps the validator set represents a subset of the validator owners?]
* *Validator Operator* ("operator") is an entity that manages an on-chain Libra account and operates a Validator Node on behalf of a Validator Owner. There can be one Validator Operator that runs multiple Validator Nodes for multiple Validator Owners (but a Validator Owner may only have one Validator Node). The Validator Operator for a Validator Owner has permission to rotate the Validator Configs for the owner.


# Specification of global on-chain configs
## Validator Set

The following properties are being enforced "on-chain" via move contracts or "off-chain" via legal or contractual obligations:
* [on-chain] Each Validator Owner holds a Libra account with a *Validator Owner role* (see [lip-2: Libra Roles and Permissions](https://github.com/libra/lip/blob/master/lips/lip-2.md)). [TODO (dd): Validator Owner role actually called "Validator Role" in the code]
* [on-chain] A Validator Owner designates a single Validator Operator account to run a Validator Node.
* [on-chain] A Validator Operator is a Libra account with a *Validator Operator role*.
* [on-chain] Each Validator Operator may run nodes for multiple Validator Owners, therefore there is a one-to-many relationship between operator accounts and owner accounts.
* [off-chain] If an operator OP_1 is designated to run Validator Nodes for two Validator Owners V_1 and V_2, the operator must run two distinct instances of Validator Nodes.
* [off-chain] Each Validator Node interacts with other Validator Nodes through a consensus protocol. Each Validator Node also runs a Full Node, which keeps track of sequenced transactions and the evolving state of the database. Full Nodes interact with public clients by answering quieries.
* [on-chain] Each Validator Owner account stores a validator configuration that consists of the consensus public key, the networking information (for the Validator Node to connect to other Validator Nodes) and the Full Node networking information (for the public Full Nodes and clients and, under certain circumstances, for other Validator Nodes themselves to connect to this Validator Node).
* [off-chain] The Validator Operator designated by the Validator Owner is responsible for running a node with this consensus config and is responsible for updating/rotating this config as needed.
* [on-chain] The Validator Set is a collection of Validator Owner configurations for the Validator Nodes _currently_ running the consensus protocol. Each Validator Owner address appears in the Validator Set at most once. [TODO (dd): also suggests that the validator set represents a subset of validator owners.]
* [on-chain] Only LibraRoot may change the composition of the Validator Set. When a Validator Operator has been designated by a Validator Owner to manage the owner's Validator Node, that operator is allowed to modify the contents of the Validator Owner's configuration in the Validator Set.
* [off-chain] Each Validator Owner is obliged to notify LN about the decision to change the Validator Operator. LN may disallow the switch when the implementing it would violate LNs obligations, such as when a new operator is deemed untrustworthy, or the change unacceptably concentrates consensus power among too few operators or node architectures.

### Move Modules

Four move modules are involved in the validator configuration management

* [`ValidatorConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/ValidatorConfig.move): defines local consensus configuration for a Validator Node of a Validator Owner.
* [`ValidatorOperatorConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/ValidatorOperatorConfig.move): defines the configuration of the validator operator (it only contains a human name).
* [`LibraSystem`](https://github.com/libra/libra/blob/master/language/stdlib/modules/LibraSystem.move): publishes the Validator Set as a global on-chain config and enforces the rules for modifying it.
* [`LibraConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/LibraConfig.move): a generic module that manages all of the global on-chain configurations, including the Validator Set configurations.

### Transaction Scripts
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

### Formal verification guarantees on the Move Implementation
TODO: These may change as verification work proceeds.

* The Move framework represents Validator Nodes and Validator Operators as addresses.  Each such address has a published account.
* Every account has a unique role (see roles and permissions)
* Each Validator account has a Validator role.
* Each ValidatorOperator account has a ValidatorOperator role.
* Only LibraRoot or a Validator Operator of a Validator Owner which is currently in the Validator Set can trigger reconfiguration
* Every change to a Validator Set triggers a reconfiguration when LibraConfig::NewEpochEvent is emitted
* Only a Validator Owner (role) can set its Validator Operator; for each Validator Owner account this permission is given only to the Validator Owner (itself).
* Only a Validator Operator of a Validator Owner who is present in the Validator Set can update a Validator Config in the Validator Set
* The size of the Validator Set can only change by at most one in a block
* Multiple calls to add_validator or remove_validator in the same block are prohibited except in genesis
* Both functions register_validator_config or set_validator_config_and_reconfigure check the validity of the consensus key and abort if an invalid key is given
* A Validator Owner account can only appear once in a Validator Set
* (currently) If the Validator's Operator is not in the Validator Set, the Validator Owner itself acts as its own Validator Operator
* If the Validator Owner changes the Validator Operator, its old Validator Config does not change in the Validator Set until a new Validator Operator sets a new Validator Config and explicit calls an update (LibraSystem::update_config_and_reconfigure) or the Association calls add/remove (LibraSystem::add_validator/LibraSystem::remove_validator).
* Disciplined aborts

### Notes
In first version of Libra Protocol, Validator Owners will not maintain ownership of their Libra accounts, the LibraRoot account will run Validator Owners' operations on their behalf. Validator Operators on the other hand will maintain full ownership of their Libra accounts. Gradually, the Validator Owners will start managing their accounts themselves. A Validator Owner will send their new account key to the Association, the Association will rotate their account key to this new key and right after this rotation transaction gets executed, the Validator Owner starts to maintain its Libra account.

Both the Validator Owner account and the Validator Operator account store a human_name which refers to the name of the company behind the account written in snake case (lowercase, where spaces are replaced with underscores), it is initialized at account creation and never changes. Most validator-related transaction scripts get the address and the name of the account and check that the human_name under the account matches the name passed into the transaction script. This prevents accounts from accidentally mixing up the addresses which are hex strings, and adds a second level of protection against human errors in mapping entities to Libra addresses.

## Registered Currencies
TODO (@tzakian)

## Libra Version
TODO (@runtian-zhou)

## Libra Virtual Machine Configuration
TODO (@runtian-zhou)

# Reconfiguration

Above we described four different global resources that define the configuration of a Libra Protocol on-chain.
These resources are governed by the [`LibraConfig`](https://github.com/libra/libra/blob/master/language/stdlib/modules/LibraConfig.move) module and are stored under the `0xA550C18` address.
Any changes to those configs define a new epoch by triggering a new epoch event (`LibraConfig::NewEpochEvent`). If a transaction causes an epoch change, that transaction is the last transaction committed in the current epoch — any subsequent transactions in that block or future blocks from that epoch will be ignored. Once the transaction has been committed, the new configuration starts being valid immediately. E.g. the new Validator Set will start running the consensus protocol in this new epoch.
