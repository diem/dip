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

The proposal to form a technical working group can be made by anyone and is not limited to current Association members. The proposal must include, but is not limited to:
- The group’s scope and goal
- The limits of its focus
- The expected final output(s), typically as a DIP, report, or recommendation
- Expected duration of operation (typically 3-6 months)
- The initial facilitator (up to two individuals)
- A brief description of ideal desired member profiles so other community or Association members can join
- Whether the TWG is intended to be public or by invitation (public is default)

Once the proposal is created, the facilitator will circulate it in public slack channels and other mediums relevant to the topic. The facilitator is also encouraged to proactively share the proposal with Association members that are likely to be impacted by this TWG or that could contribute to it. The facilitator must circulate the proposal over 1-2 weeks for sufficient interest to gather.

Anyone can join a TWG by asking for the facilitator(s) to add them to the proposal (and at any time afterwards) and identifying their roles (co-facilitator, contributor, reviewer, etc.). It is recommended for the proposal to have representation from a minimum of 3 Association members to build collaboration and as a tool to determine relevance to the entire association, rather than an individual member.

The facilitator is responsible for promoting and explaining the proposed TWG to Diem members and the community, and must lead it through the voting process by the Technical Steering Committee (TSC). They are also responsible for recruiting other members to the TWG as needed on an ongoing basis, and must help find a replacement facilitator if they must cease work on the initiative.

Once the TWG proposal is presented to the TSC, a simple majority vote in favor forms the TWG. The TWG can then proceed in its stated work and make decisions as needed in the areas covered by its focus.

Once a TWG is accepted:
- The TWG shall be added to the list of TWGs at the working group page on the Diem Developer site.
    - The TWG shall include the facilitators
    - The TWG’s type shall denote [public, or by invitation] 
- A slack channel for the specific working group shall be created.
    - Members interested in officially joining the working group may request to join officially by asking the facilitator and unofficially by joining the working group’s Slack channel.
    - For invite only TWGs, the Facilitators and Diem Association TWG Manager shall manage invitations.

In the event that additional resources are needed, the facilitator should request those items from the TSC.

## Decision Making in a TWG
The TWG facilitator owns the agenda, meetings, and organization of the TWG, but is not a final decision maker. They are there to drive and facilitate discussion, and help allocate resources so that recommendations, reports, or draft DIPs can be created. They are also responsible for providing updates to the association and community on the progress the TWG is making and any associated documentation being produced. Bi-weekly updates are suggested and should be posted in the Diem portal, distributed via email/slack to all Association members, and circulated in public forums as necessary.

If there are highly material changes to the TWG’s scope, a revised proposal must be submitted to the TSC for re-approval.

Any TWG member can propose any topic or idea within the scope of the TWG up for discussion with the group. These discussions should be documented, and as the group comes to agreement on how to proceed, there should be clear ownership among TWG members for drafting, editing, obtaining feedback, and finalizing the group’s working product. A TWG can have any number of outputs.There must be rough consensus in the TWG on each final work product before proceeding. 

Once rough consensus is found, a work product must be shared with the TSC for review and edits. After the editing process, the TSC must approve the output via a majority vote. The work product can then be officially shared with the Association as final.

If the output is a DIP, the TWG will submit the draft DIP as a pull-request to the Diem/DIPs folder, entering the official DIP process. At this point the DIP gets a DIP Manager to navigate the process from becoming a Draft DIP to a committed DIP in Github. 

In addition to assisting with the DIP process, a DIP Manager can also dedicate engineering resources to develop an implementation of the DIP if one does not exist already. This may mean: 
- Diem Core changes (via github issues and PRs)
- Diem Framework changes (same implementation as above)
- Non-blockchain changes in which case things like off-chain work may be affected

## On TWG Management
### Extending a TWG

If a TWG reaches the estimated duration, it is recommended for the facilitator to keep the TSC in the loop by sending a note with an updated timeline and a very brief description for the change. No action is required from the TSC.

### Archiving a TWG

A TWG can decide to disband and be marked for archival if it has finished its work or if progress has stalled indefinitely. It will be removed from the list of TWGs on (Diem Developer site), and the Slack channel or other messaging platforms shall be archived.

A TWG may be marked for archival if requested by the TWG’s facilitator.
