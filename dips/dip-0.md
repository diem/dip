---
dip: 0
title: Diem Improvement Proposals
authors: diem
status: final
type: Informational
created: 2/26/20
updated: 8/24/21
---

# DIP-0 - Diem Improvement Proposals
Diem Improvement Proposals (DIP) describe standards for the Diem Payment Network (DPN) including the core blockchain protocol and the development platform (Move), smart contracts and systems for smart contract verification, standards for the deployment and operation of the DPN, APIs for accessing the DPN and processing information from the DPN, and off-chain mechanisms.

Soon after a Diem full-spec is posted as the root standard DIP to diem.com, any change that could be considered major or a breaking change — one that affects a public API, protocol, virtual machine (VM), underlying code execution, or standard — should be addressed with a DIP. Because DIPs are maintained as text files in a versioned repository, their revision history is the historical record of the proposal.

For Diem implementers, DIPs are a convenient way to track the progress of their implementation.

## Maintainership of Diem Standards

The Diem project operates under the governance of the Diem Association. Technical decisions in the Diem project are driven by the governance defined by the Technical Steering Committee, in consultation with other parts of the Association when relevant and pursuant to relevant regulations.

The Lead Maintainer will update the TSC periodically about the progress of DIPs. While technical decisions are supervised by the TSC, day-to-day technical decisions are made using a framework inspired by standards bodies (such as the W3C and IETF) and open source projects (such as Python, the Linux Foundation, and Apache) to coordinate the work of open source contributors. This process is based on the family of approaches derived from Python’s PEP process. The process is supported by a team of Maintainers who work to build consensus on technical decisions. When specifically asked, the Lead Maintainer will bring a DIP to explicit TSC approval and for changing the status of a DIP from “Last Call” to “Accepted” (and eventually, to “Final”).

The Lead Maintainer is responsible for assigning a Maintainer as DIP Manager for each DIP, assigning a DIP to a Working Group when relevant, and providing the TSC updates on DIPs.  The DIP Managers are given broad latitude to make decisions on DIP status evolution and outcome, and thus are expected to use best efforts to find consensus among the relevant Diem community members about decisions. While broad latitude granted to DIP Managers is the norm, the DIP process ultimately operates under the authority of the TSC and the Association Council. This authority should generally be applied through constructive conversations with the DIP Managers to engage in a disagree-and-commit decision. The TSC should serve as a resource to community members who feel that a DIP Manager is unfair in their leadership of the DIP process and work to ensure constructive conversation.

## DIP types

There are three types of DIP:

* **Standard DIPs** describe any change or addition that affects DPN, such as a change to the Diem Blockchain protocol, a change to transaction processing, proposed application standards/conventions, or any change or addition that affects the interoperability of applications using DPN.

* **Process DIPs** describe the governance procedures and tools of the Diem project, such as the DIP procedure itself, GitHub plug-ins, and other development tools and guidelines.

* **Informational DIPs** describe a Diem project design issue, or provide general guidelines or information to the Diem community, but do not propose a material change or addition to DPN. Informational DIPs do not necessarily represent Diem community consensus or a recommendation, so users and implementers are free to ignore Informational DIPs or follow their advice.

It is highly recommended that a single DIP should contain a single key proposal or new idea. The more focused the DIP, the more successful it tends to be. A DIP must meet certain minimum criteria. It must be a clear and complete description of a single, self-contained  proposed change/addition.

## The DIP Process

The formal DIP process will typically (and advisably) begin after the champion of the proposal has already discussed and socialized it with the Diem community (see below for what goes into a DIP). It is comprised of the following steps:

  * **Idea** – Authors will socialize their idea with the developer community and Maintainers, by writing a GitHub Issue and getting feedback. If possible (and relevant), authors should include in discussions an implementation to support their proposal.

    Once the discussion reaches a mature point, the formal DIP process starts with a pull-request to the diem/dip folder. The status field of the document should be “Draft” at this point. DIP numbers are the same as the issue number from the initial proposal as assigned above. A DIP Manager will review/comment/approve/deny the pull-request.

    * ✅ Draft – If agreeable, the DIP Manager approve the pull request. The DIP Manager will not unreasonably deny a DIP
    * 🛑 Draft – Reasons for denying Draft status include misalignment with Diem mission or Association policy, being too unfocused, too broad, duplication of effort, being technically unjustified, not providing proper motivation, or not addressing backwards compatibility. The Authors can work to refine and resubmit their DIP Idea for review again.

  * **Draft** – After the draft is merged, additional changes may be submitted via pull requests. When a DIP appears to be completed and stable, Authors may ask to change the status to Last Call.

    * ✅  Last Call – If agreeable, the DIP Manager will approve the Last Call status and set a reasonable amount of time (usually 2-4 weeks) for a final review. Additional time can be granted by the DIP Manager if requested.
    * 🛑  Last Call – A request for Last Call will be denied if material changes are still needed for the draft. DIPs should only be promoted to Last Call once.

  * **Last Call** - This DIP will be listed prominently on the Diem public Discourse under the DIP category. The final status change by the DIP Manager will be either Accepted or Rejected.

    * ✅ Accepted – A successful Last Call without any material changes or unaddressed technical complaints will become Accepted. This status signals that material changes are unlikely and Diem Maintainers should support driving this DIP for inclusion.

    * 🛑 Rejected – The Maintainers can decide to mark this DIP as Rejected at their discretion, e.g., a major, but uncorrectable, flaw was found in the DIP.

  * **Accepted** - A DIP in the Accepted state **means the TSC has determined it** is ready for active implementation

    * ✅  Final – DIP is deployed to mainnet. When the implementation is complete and deployed to mainnet the status will be changed to “Final”.
    * 🛑  Draft – If new information becomes available an Accepted DIP can be moved back into Draft status for necessary changes.
    * 🛑  Deprecated – The DIP Manager or Maintainers may mark a DIP Deprecated if it is superseded by a later proposal or otherwise becomes irrelevant.

  * **Final** – The Final state of a DIP means the necessary implementations of the DIP are complete and deployed to the codebase. This DIP represents the current state-of-the-art. A Final DIP should only be updated to correct errata.

A DIP may refer to related/dependent DIPs. Every DIP will be assigned a status tag as it evolves. At every stage there can be multiple revisions/reviews until the next stage.

As an example, [DIP-169](https://github.com/diem/dip/blob/main/dips/dip-169.md) began as an [issue][https://github.com/diem/dip/issues/169] with a [history of changes](https://github.com/diem/dip/commits/main/dips/dip-169.md), before entering **Last Call** and **Accepted**.

## DIP Status

Each DIP shall maintain its current status in a Status: field in a DIP document header (see below discussion of header fields). Statuses include:

`Idea` ->
`Draft` ->
`Last Call` (posted on Diem public Discourse) ->
`Accepted/Rejected` ->
`Final`
`(Deprecated)`

Each status change -- except deprecating -- is requested by the DIP Author by changing the Status line inside the DIP document (see below  the Status: field in a DIP document) and submitting a pull-request. The change will be reviewed by the DIP Manager for comments/approval.

The process of implementing the technical components embodied in a DIP and merging them into the master branch is logically separate from the process of handling the DIP design document. Normally, we expect code explorations to occur in parallel to the DIP proposal.

## DIP Author Changes

A change in the author of a DIP can be made at the discretion of the DIP Manager or Maintainers. Common examples include if an author becomes non-responsive and if there is sufficient demand from the developer community to continue work on the DIP.

## DIP Discussions

Discussions about DIPs in progress are best held over pull-requests and the issue proposing the DIP. They may optionally use media channels such as the Diem Slack channel or a Discourse thread. In this case, an Author may include a reference to the discussion thread (see below the “discussions-to” header field in the DIP document).

## Should this be a PR, DIP, or Issue?

Any non-breaking contributions that enhance, fix, or improve existing functionality is best suited as a Pull Request.

Any change that could be considered major or a breaking change, that affects a public API, protocol, VM, underlying code execution, or standard should be a DIP.

DIPs should not be created by the community for mundane issues such as small bugs, common implementation topics, and minor feature enhancements. (GitHub Issues should be used for these).

## DIP Hosting
DIPs shall be hosted on GitHub in a dedicated repository: *diem/dip*.

## DIP Requirements

  * Each DIP file should include the following information:
Preamble - [RFC 822](https://tools.ietf.org/html/rfc822) style headers containing metadata about the DIP, including the DIP number, a short descriptive title (limited to a maximum of 44 characters), and the author details.
  * Summary - a short (~200 word) description of the DIP.
  * Motivation (\*optional) - The motivation is critical for DIPs that want to change the Diem protocol. It should clearly explain why the existing protocol specification is inadequate to address the problem that the DIP solves. DIP submissions without sufficient motivation may be rejected outright.
  * Specification - The technical specification should describe the syntax and semantics of any new feature. The specification should be detailed enough to allow competing, interoperable implementations of the Diem protocol or any other Diem platforms that may emerge.
  * Rationale - The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work, e.g., how the feature is supported in other languages. The rationale may also provide evidence of consensus within the community, and should discuss important objections or concerns raised during discussion.
  * Backwards Compatibility (\*optional) - All DIPs that introduce backwards incompatibilities must include a section describing these incompatibilities and their severity. The DIP must explain how the author proposes to deal with these incompatibilities. DIP submissions without a sufficient backwards compatibility treatise may be rejected outright.
  * Test Cases(\*optional) - Test cases for an implementation are mandatory for DIPs that involve interoperability such as networking, consensus, off-chain protocols, etc. Other DIPs can choose to include links to test cases if applicable.
  * Implementations - The implementations must be completed before any DIP is given status “Final,” but it need not be completed before the DIP is merged as draft. While there is merit to the approach of reaching consensus on the specification and rationale before writing code, the principle of “rough consensus and running code” is still useful when it comes to resolving many discussions of API details. This should be a link to the implementation and not an implementation defined within the DIP itself.
  * Copyright Waiver - All DIPs must be in the public domain. See the bottom of this DIP for an example copyright waiver.


## DIP Header Preamble

Each DIP must begin with an [RFC 822](https://www.ietf.org/rfc/rfc822.txt) style header preamble, preceded and followed by three hyphens (---). This header is also termed ["front matter" by Jekyll](https://jekyllrb.com/docs/front-matter/). The headers must appear in the following order. Headers marked with "\*" are optional and are described below. All other headers are required.

`DIP:` DIP number is dictated by the GitHub issue.
`title`:
`author:` a list of the author's or authors' name(s) and/or username(s), or name(s) and email(s). Details are below.
`issue:` a hyperlink to the GitHub issue.
`Status:` <Draft | Last Call | Accepted | Final | Rejected>
`* last-call-end-date:`
`type:` <Standards Track (Core, Networking, Interface, Application) | Informational | Meta>
`created:`
`* updated:`
`* requires:` <DIP number(s)>
`* replaces:` <DIP number(s)>
`* superseded-by:` <DIP number(s)>

Headers that permit lists must separate elements with commas.

Headers requiring dates will always do so in the format of ISO 8601 (yyyy-mm-dd).

### `author` header
The `author` header optionally lists the names, email addresses or usernames of the authors/owners of the DIP. Those who prefer anonymity may use a username only, or a first name and a username. The format of the author header value must be:

Random J. User <address@dom.ain>

or

Random J. User (@username)

if the email address or GitHub username is included, and

Random J. User

if the email address is not given.

### `issue' header

The issue will indicate the URL for the GitHub issue where the DIP is being discussed.

### `type` header

The `type` header specifies the type of DIP: Standards Track, Process, or Informational. If the track is Standards please include the subcategory (core, networking, interface, or application).

### `category` header

The `category` header specifies the DIPs category (Standard/Process/Information). This is required for standards-track DIPs only.

### `created` header
The `created` header records the date that the DIP was assigned a number. Both headers should be in yyyy-mm-dd format, e.g. 2019-06-18.

### `updated` header
The `updated` header records the date(s) when the DIP was updated with "substantial" changes. This header is only valid for DIPs of Draft and Active status.

### `requires` header
DIPs may have a `requires` header, indicating the DIP numbers that this DIP depends on.

### `superseded-by` and `replaces` headers
DIPs may also have a `superseded-by` header indicating that a DIP has been rendered obsolete by a later document; the value is the number of the DIP that replaces the current document. The newer DIP must have a `replaces` header containing the number of the DIP that it rendered obsolete.

## Example
dip: 0
title: Introducing Diem Improvement Proposals
author: Diem Dev (@diemdev)
issue: https://github.com/diem/dip/issues/0
discussions-to: https://community.diem.com/t/introducing-diem-improvements-proposals
Status: Draft
type: Informational
created: 2019-06-29

## Copyright Notice

At the bottom of each DIP, include the following:

```
# Copyright Notice

This documentation is made available under the Creative Commons Attribution 4.0 International (CC BY 4.0) license (available at https://creativecommons.org/licenses/by/4.0/).
```

## Auxiliary Files
DIPs may include auxiliary files such as diagrams. Such files must be named DIP-XXXX-Y.ext, where “XXXX” is the DIP number, “Y” is a serial number (starting at 1), and “ext” is replaced by the actual file extension (e.g. “png”).
