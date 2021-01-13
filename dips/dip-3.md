---
dip: 3
title: Diem Upgrade Management
authors: Zekun Li (@zekun000)
dip manager: Avery Ching (aching)
status: Last Call
type: Informational
created: 06/09/2020
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Introduction
Diem Payment Network ("DPN") is a blockchain-backed payment platform and an infrastructure for stablecoins. Diem Networks ("DN") is a whole subsidiary of the Diem Association. DN is in the process of applying for an DPN payment system license from the Swiss Financial Market Supervisory Authority ("FINMA"). Once granted, DN will be responsible for ensuring that DPN operates in compliance with the payment system license from FINMA.

Diem Upgrade Management is a set of protocols to reconfigure the DPN blockchain. With respect to time-sensitive decisions and incident response, these protocols provide the Diem Networks with the technical means to effectively and transparently update DPN in response to critical incidents or to make time-sensitive decisions necessitated by law or for compliance reasons (“Critical Upgrades”).

# Building blocks
Conceptually, the software running on validator nodes comprises two layers. One is a blockchain core whose goal is to replicate a ledger of transactions and their outcome. The second is a framework that stores the ledger-state and a set of software modules -- encoded in the Move programming language -- that define the rules for interacting with the DPN and mutating the ledge-state (see also [Diem Improvement Proposal("DIP")-2](./dip-2.md)). There are two corresponding types of upgrades to the system, (i) [updates to the core software](#software-upgrade) (ii) [updates to the framework state](#on-chain-state-upgrade). Both layers may be used for non-Critical Upgrades and for Critical Upgrades.

## Software upgrade
Specification changes to DPN go through the [DIP process](./dip-0.md). Non-specification changes (e.g. bug fixes and performance improvements) are implemented by DN without going through the DIP process. All software changes (both specification changes and non-specification changes) are submitted through standard Github reviews and proceed through the code review process before being merged to the master.

In order to release a new version of the DPN software, DN will coordinate the release plan and timeline with all the validator operators. Validator operators are responsible for deploying the software release as per the instructions provided by DN.

Some changes may require all validators to transition at the same blockchain height, which is implemented by an [on-chain state update](#on-chain-state-upgrade).

## On-chain state upgrade
The on-chain state can only be updated via transactions that are submitted to DPN and validated. There are three ways to effectuate changes to the DPN by directly mutating the on-chain state, ordered by most likely to occur to least likely to occur: normal multi-sig transactions, multi-sig WriteSet transactions, and genesis transactions.

### Normal multi-sig transactions
Normal transactions go through the DPN Virtual Machine and invoke Diem Framework modules (see [DIP-2](./dip-2.md)) to produce a Writeset that alters the ledger-state. Both the resulting state change and the authenticating set of signatures are transparent and visible on-chain.

### Multi-sig WriteSet transactions
Writeset transactions are a special type of multi-sig transactions that prescribes an arbitrary state change. Unlike normal transactions, which must follow specified Diem Framework rules, WriteSet transactions simply describe a state change rather than go through the Diem Framework modules. This type of transaction is only needed for situations such as updating immutable stdlib libraries due to critical bugs or reversing systematic fraudulent transactions.

The use of WriteSet transactions follows the spirit of transparency — WriteSet transactions allow an arbitrary change to the state of the blockchain without altering the history of past transactions.
Even though WriteSet transactions prescribe an arbitrary state change, they are authenticated with the same multi-sig mechanism as normal transactions which means both the change and multi-sig are transparent and visible on-chain.

### Genesis transactions
Genesis transactions can be either normal or WriteSet transactions without the typical corresponding signatures. As the name suggests, the process of applying such a transaction is similar to how the very first genesis transaction works. The genesis transaction applies on top of a specific snapshot of a Diem blockchain (might be empty). DN is responsible for picking the appropriate snapshot and building the genesis transactions. Users of Diem, including validators, use the genesis transaction to authenticate the blockchain. If a validator fails to acquire the correct genesis transaction, it will vote on an irrelevant blockchain, but not otherwise impact the system. If a user of the system such as a full node or blockchain observer acquires the incorrect genesis transaction, they will see an incorrect state.

Note that, after DPN launches, DN could use genesis transactions as a last resort for extremely unlikely catastrophic scenarios such as losing more than a third of the validators.

The decision flow chart below summarizes the building blocks and how they will be used.

<img alt="Decision flow" src={useBaseUrl('img/DIP-3-decision-flow.png')} />

# Case study

## Network specification upgrade
Example: Changing the wire protocol in a backward compatible way.

Category: Spec change => Software upgrade
## On-chain config update
Example: Adding new validators to the system.

Category: On-chain state change => Multi-sig transaction
## VM upgrade
Example: New bytecode added.

Category: Spec change + require coordination => Software upgrade + Multi-sig transaction
## Consensus protocol upgrade
Example: Switching consensus algorithm from DiemBFTv3 to DiemBFTv4.

Category: Spec change + require coordination => Software upgrade + Multi-sig transaction
## Signature scheme change
Example: Switching consensus signature scheme from EdDSA to BLS.

Category: Spec change + require coordination => Software upgrade + Multi-sig transaction
## Smart contract vulnerability fix/Diem Framework upgrade
Example: DAO hack

Category: On-chain state change + SmartContract incapable => Multi-sig WriteSet transaction
## Large fraud
Example: Hackers mint billions of Diem.

Category: On-chain state change + SmartContract incapable => Multi-sig WriteSet transaction
## Quorum Loss
Example: F+1 validators fail across multiple fault isolation zones and will not be able to recover within any reasonable time period.

Category: State change and consensus is dead. => Genesis transaction
