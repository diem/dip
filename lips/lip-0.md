---
lip: 0
title: Libra Improvement Proposals
authors: libra
status: final
type: Informational
created: 2/26/20
---

# LIP0 - Libra Improvement Proposals
Libra Improvement Proposals (LIP) describe standards for the Libra Payment Network (LPN) including the core blockchain protocol and the development platform (Move), smart contracts and systems for smart contract verification, standards for the deployment and operation of the LPN, APIs for accessing the LPN and processing information from the LPN, and off-chain mechanisms.

Soon after a Libra full-spec is posted as the root standard LIP to libra.org, any change that could be considered major or a breaking change — one that affects a public API, protocol, virtual machine (VM), underlying code execution, or standard — should be addressed with a LIP. Because LIPs are maintained as text files in a versioned repository, their revision history is the historical record of the proposal.

For Libra implementers, LIPs are a convenient way to track the progress of their implementation.

## Maintainership of Libra Standards

The Libra project operates under the governance of the Libra Association. Technical decisions in the Libra project are driven by the governance defined by the Technical Steering Committee, in consultation with other parts of the Association when relevant and pursuant to relevant regulations.

The Lead Maintainer will update the TSC periodically about the progress of LIPs. While technical decisions are supervised by the TSC, day-to-day technical decisions are made using a framework inspired by standards bodies (such as the W3C and IETF) and open source projects (such as Python, the Linux Foundation, and Apache) to coordinate the work of open source contributors. This process is based on the family of approaches derived from Python’s PEP process. The process is supported by a team of Maintainers who work to build consensus on technical decisions. When specifically asked, the Lead Maintainer will bring a LIP to explicit TSC approval and for changing the status of a LIP from “Last Call” to “Accepted” (and eventually, to “Final”).

The Lead Maintainer is responsible for assigning a Maintainer as LIP Manager for each LIP, assigning a LIP to a Working Group when relevant, and providing the TSC updates on LIPs.
The LIP Managers are given broad latitude to make decisions on LIP status evolution and outcome, and thus are expected to use best efforts to find consensus among the relevant Libra community members about decisions. While broad latitude granted to LIP Managers is the norm, the LIP process ultimately operates under the authority of the TSC and the Association Council. This authority should generally be applied through constructive conversations with the LIP Managers to engage in a disagree-and-commit decision. The TSC should serve as a resource to community members who feel that a LIP Manager is unfair in their leadership of the LIP process and work to ensure constructive conversation.

## LIP types

There are three types of LIP:

* **Standard LIPs** describe any change or addition that affects LPN, such as a change to the Libra Blockchain protocol, a change to transaction processing, proposed application standards/conventions, or any change or addition that affects the interoperability of applications using LPN.

* **Process LIPs** describe the governance procedures and tools of the Libra project, such as the LIP procedure itself, GitHub plug-ins, and other development tools and guidelines.

* **Informational LIPs** describe a Libra project design issue, or provide general guidelines or information to the Libra community, but do not propose a material change or addition to LPN. Informational LIPs do not necessarily represent Libra community consensus or a recommendation, so users and implementers are free to ignore Informational LIPs or follow their advice.

It is highly recommended that a single LIP should contain a single key proposal or new idea. The more focused the LIP, the more successful it tends to be. A LIP must meet certain minimum criteria. It must be a clear and complete description of a single, self-contained  proposed change/addition.

## The LIP Process

The formal LIP process will typically (and advisably) begin after the champion of the proposal has already discussed and socialized it with the Libra community (see below for what goes into a LIP). It is comprised of the following steps:

  * **Idea** – Authors will socialize their idea with the developer community and Maintainers, possibly by writing a GitHub Issue and getting feedback. If possible (and relevant), authors should include in discussions an implementation to support their proposal.

    Once the discussion reaches a mature point, the formal LIP process starts with a pull-request to the libra/lips folder. The status field of the document should be “Draft” at this point. A LIP Manager will review/comment/approve/deny the pull-request.

    * ✅ Draft – If agreeable, LIP Manager will assign the LIP a number (generally the issue or PR number related to the LIP, and ask to rename or move to a folder/file with that number) and approve the pull request. The LIP Manager will not unreasonably deny a LIP.
    * 🛑 Draft – Reasons for denying Draft status include misalignment with Libra mission or Association policy, being too unfocused, too broad, duplication of effort, being technically unjustified, not providing proper motivation, or not addressing backwards compatibility. The Authors can work to refine and resubmit their LIP Idea for review again.

  * **Draft** – After the draft is merged, additional changes may be submitted via pull requests. When a LIP appears to be completed and stable, Authors may ask to change the status to Last Call.

    * ✅  Last Call – If agreeable, the LIP Manager will approve the Last Call status and set a reasonable amount of time (usually 2-4 weeks) for a final review. Additional time can be granted by the LIP Manager if requested.
    * 🛑  Last Call – A request for Last Call will be denied if material changes are still needed for the draft. LIPs should only be promoted to Last Call once.

  * **Last Call** - This LIP will be listed prominently on the Libra public Discourse under the LIP category. The final status change by the LIP Manager will be either Accepted or Rejected.

    * ✅ Accepted – A successful Last Call without any material changes or unaddressed technical complaints will become Accepted. This status signals that material changes are unlikely and Libra Maintainers should support driving this LIP for inclusion.

    * 🛑 Rejected – The Maintainers can decide to mark this LIP as Rejected at their discretion, e.g., a major, but uncorrectable, flaw was found in the LIP.

  * **Accepted** - A LIP in the Accepted state **means the TSC has determined it** is ready for active implementation

    * ✅  Final – LIP is deployed to mainnet. When the implementation is complete and deployed to mainnet the status will be changed to “Final”.
    * 🛑  Draft – If new information becomes available an Accepted LIP can be moved back into Draft status for necessary changes.
    * 🛑  Deprecated – The LIP Manager or Maintainers may mark a LIP Deprecated if it is superseded by a later proposal or otherwise becomes irrelevant.

  * **Final** – The Final state of a LIP means the necessary implementations of the LIP are complete and deployed to the codebase. This LIP represents the current state-of-the-art. A Final LIP should only be updated to correct errata.

A LIP may refer to related/dependent LIPs. Every LIP will be assigned a status tag as it evolves. At every stage there can be multiple revisions/reviews until the next stage.

## LIP Status

Each LIP shall maintain its current status in a Status: field in a LIP document header (see below discussion of header fields). Statuses include:

`Idea` ->
`Draft` ->
`Last Call` (posted on Libra public Discourse) ->
`Accepted/Rejected` ->
`Final`
`(Deprecated)`

Each status change -- except deprecating -- is requested by the LIP Author by changing the Status line inside the LIP document (see below  the Status: field in a LIP document) and submitting a pull-request. The change will be reviewed by the LIP Manager for comments/approval.

The process of implementing the technical components embodied in a LIP and merging them into the master branch is logically separate from the process of handling the LIP design document. Normally, we expect code explorations to occur in parallel to the LIP proposal.

## LIP Author Changes

A change in the author of a LIP can be made at the discretion of the LIP Manager or Maintainers. Common examples include if an author becomes non-responsive and if there is sufficient demand from the developer community to continue work on the LIP.

## LIP Discussions

Discussions about LIPs in progress are best held over pull-requests and reviews in libra/lips. They may optionally use media channels such as the Libra Slack channel or a Discourse thread. In this case, an Author may include a reference to the discussion thread (see below the “discussions-to” header field in the LIP document).

## Should this be a PR, LIP, or Issue?

Any non-breaking contributions that enhance, fix, or improve existing functionality is best suited as a Pull Request.

Any change that could be considered major or a breaking change, that affects a public API, protocol, VM, underlying code execution, or standard should be a LIP.

LIPs should not be created by the community for mundane issues such as small bugs, common implementation topics, and minor feature enhancements. (GitHub Issues should be used for these).

## LIP Hosting
LIPs shall be hosted on GitHub in a dedicated repository: *libra/lips*.

## LIP Requirements

  * Each LIP file should include the following information:
Preamble - [RFC 822](https://tools.ietf.org/html/rfc822) style headers containing metadata about the LIP, including the LIP number, a short descriptive title (limited to a maximum of 44 characters), and the author details.
  * Simple Summary - Provide a simplified and layman-accessible explanation of the LIP.
  * Abstract - a short (~200 word) description of the technical issue being addressed.
  * Motivation (*optional) - The motivation is critical for LIPs that want to change the Libra protocol. It should clearly explain why the existing protocol specification is inadequate to address the problem that the LIP solves. LIP submissions without sufficient motivation may be rejected outright.
  * Specification - The technical specification should describe the syntax and semantics of any new feature. The specification should be detailed enough to allow competing, interoperable implementations of the Libra protocol or any other Libra platforms that may emerge.
  * Rationale - The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work, e.g., how the feature is supported in other languages. The rationale may also provide evidence of consensus within the community, and should discuss important objections or concerns raised during discussion.
  * Backwards Compatibility - All LIPs that introduce backwards incompatibilities must include a section describing these incompatibilities and their severity. The LIP must explain how the author proposes to deal with these incompatibilities. LIP submissions without a sufficient backwards compatibility treatise may be rejected outright.
  * Test Cases - Test cases for an implementation are mandatory for LIPs that are affecting consensus changes. Other LIPs can choose to include links to test cases if applicable.
  * Implementations - The implementations must be completed before any LIP is given status “Final,” but it need not be completed before the LIP is merged as draft. While there is merit to the approach of reaching consensus on the specification and rationale before writing code, the principle of “rough consensus and running code” is still useful when it comes to resolving many discussions of API details.
  * Copyright Waiver - All LIPs must be in the public domain. See the bottom of this LIP for an example copyright waiver.


## LIP Header Preamble

Each LIP must begin with an [RFC 822](https://www.ietf.org/rfc/rfc822.txt) style header preamble, preceded and followed by three hyphens (---). This header is also termed ["front matter" by Jekyll](https://jekyllrb.com/docs/front-matter/). The headers must appear in the following order. Headers marked with "*" are optional and are described below. All other headers are required.

`lip:` (this is determined by the LIP Manager).
`title`:
`author:` a list of the author's or authors' name(s) and/or username(s), or name(s) and email(s). Details are below.
`* discussions-to:` a url pointing to the official discussion thread
`Status:` <Draft | Last Call | Accepted | Final | Rejected>
`* last-call-end-date:`
`type:` <Standards Track (Core, Networking, Interface, Application) | Informational | Meta>
`created:`
`* updated:`
`* requires:` <LIP number(s)>
`* replaces:` <LIP number(s)>
`* superseded-by:` <LIP number(s)>

Headers that permit lists must separate elements with commas.

Headers requiring dates will always do so in the format of ISO 8601 (yyyy-mm-dd).

### `author` header
The `author` header optionally lists the names, email addresses or usernames of the authors/owners of the LIP. Those who prefer anonymity may use a username only, or a first name and a username. The format of the author header value must be:

Random J. User <address@dom.ain>

or

Random J. User (@username)

if the email address or GitHub username is included, and

Random J. User

if the email address is not given.

### `discussions-to` header

While a LIP is a draft, a `discussions-to` header will indicate the URL where the LIP is being discussed. As mentioned above, the Libra Community Discourse is the preferred location for LIP discussions.

No `discussions-to` header is necessary if the LIP is being discussed privately with the author.

As a single exception, `discussions-to` cannot point to GitHub pull requests.

### `type` header

The `type` header specifies the type of LIP: Standards Track, Process, or Informational. If the track is Standards please include the subcategory (core, networking, interface, or application).

### `category` header

The `category` header specifies the LIPs category (Standard/Process/Information). This is required for standards-track LIPs only.

### `created` header
The `created` header records the date that the LIP was assigned a number. Both headers should be in yyyy-mm-dd format, e.g. 2019-06-18.

### `updated` header
The `updated` header records the date(s) when the LIP was updated with "substantial" changes. This header is only valid for LIPs of Draft and Active status.

`requires` header
LIPs may have a `requires` header, indicating the LIP numbers that this LIP depends on.

### `superseded-by` and `replaces` headers
LIPs may also have a `superseded-by` header indicating that a LIP has been rendered obsolete by a later document; the value is the number of the LIP that replaces the current document. The newer LIP must have a `replaces` header containing the number of the LIP that it rendered obsolete.

## Example
lip: 0
title: Introducing Libra Improvement Proposals
author: @libradev
discussions-to: https://community.libra.org/t/introducing-libra-improvements-proposals
Status: Draft
type: Informational
created: 2019-06-29

## Auxiliary Files
LIPs may include auxiliary files such as diagrams. Such files must be named LIP-XXXX-Y.ext, where “XXXX” is the LIP number, “Y” is a serial number (starting at 1), and “ext” is replaced by the actual file extension (e.g. “png”).
