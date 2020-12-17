---
dip: 7
title: Technical Working Group Lifecycle
authors: Viktor Bunin of Bison Trails (@viktorbunin)
status: Draft
type: Process
created: 10/30/2020
---


## Abstract
This DIP outlines the process by which technical working groups (TWG’s) are formed and how they should conduct their operations.

## Formation of a Technical Working Group
Technical Working Groups (TWG) are formed to address or explore specific technical topics or issues as they relate to Diem. TWGs collect information and expert input on a particular topic, discuss material changes to the Diem Payment Network (DPN), and create outputs in the form of recommendations, reports, and Diem Improvement Proposals (DIPs).

The proposal to form a technical working group can be made by any Association member. The proposal must include, but is not limited to:
The group’s scope and goal
The limits of its focus
The expected final output, typically as a DIP, report, or recommendation
Expected duration of operation
The initial facilitator (up to two individuals)
A brief description of ideal desired member profiles so other Association members can join

Once the proposal is created, the facilitator will circulate it in public slack channels relevant to the topic. The facilitator is also encouraged to proactively share the proposal with Association members that are likely to be impacted by this TWG or that could contribute to it. The facilitator must circulate the proposal over 1-2 weeks for sufficient interest to gather.

After gathering interest, the facilitator must choose members to be part of the TWG, add them to the proposal, and identify their roles (co-facilitator, contributor, reviewer, etc.). The proposal must have representation from a minimum of 3 Association members to build collaboration and as a tool to determine relevance to the entire association, rather than an individual member.

The facilitator is responsible for promoting and explaining the proposed TWG to Diem members and must lead it through the voting process by the Technical Steering Committee (TSC). They are also responsible for recruiting other members to the TWG as needed on an ongoing basis, and must help find a replacement facilitator if they must cease work on the initiative.

Once the TWG proposal is presented to the TSC, a simple majority vote in favor forms the TWG. The TWG can then proceed in its stated work and make decisions as needed in the areas covered by its focus.

## Decision Making in a TWG
The TWG facilitator owns the agenda, meetings, and organization of the TWG, but is not a final decision maker. They are there to drive and facilitate discussion, and help allocate resources so that recommendations, reports, or draft DIPs can be created. They are also responsible for providing a bi-weekly update to the association on the progress the TWG is making and any associated documentation being produced. Bi-weekly updates should be posted in the Diem portal and distributed via email/slack to all Association members.

If there are material changes to the TWG’s scope, timeline, or expected output, a revised proposal must be submitted to the TSC for re-approval.

Any TWG member can propose any topic or idea within the scope of the TWG up for discussion with the group. These discussions should be documented, and as the group comes to agreement on how to proceed, there should be clear ownership among TWG members for drafting, editing, obtaining feedback, and finalizing the group’s working product. There does not need to be total agreement in the TWG on the final output, but a supermajority (67%+) vote in favor is required before proceeding.

Once the TWGs final output is ready and the group votes to proceed, it must be shared with the TSC for review and edits. After the editing process, the TSC must approve the output before it can be circulated within the Association.

If the output is a DIP, the TWG will submit the draft DIP as a pull-request to the diem/dip folder, entering the official [DIP process](https://dip.diem.com/overview/). At this point the DIP gets a DIP Manager to navigate the process from becoming a Draft DIP to a committed DIP in Github. 

In addition to assisting with the DIP process, a DIP Manager can also dedicate engineering resources to develop an implementation of the DIP if one does not exist already. This may mean: 
Diem Core changes (via github issues and PRs)
Move Framework changes (same implementation as above)
Non-blockchain changes in which case things like off-chain work may be affected

After a DIP has sufficient engineering work or a full implementation ready, it enters the last call period. Before it can become Accepted, the TSC must vote on the DIP. A simple majority moves the DIP to Accepted, at which point it becomes up to the maintainers to implement it.

## Example
The Mainnet Operations TWG is a great example. You can find their charter [here](https://docs.google.com/document/d/1eFjha7VLnlUG43RiPRCSSz9cxuKodwABuPMynViI6rY/edit#) and one of their outputs, the Diem Incident Process Overview, [here](https://docs.google.com/document/d/1FPf5B3ps05NVvVBl0SpsouwiRMyJwfh7DzbfzEoKrUc/edit#).

