# HD Cares — Product Requirements Document

Version 0.1 | 19 October 2026 | Planning draft

## 1. Product in one sentence

HD Cares helps people prevent and respond to non-consensual intimate image sharing through private digital fingerprinting, guided takedown requests, clear case tracking, and access to human support.

**Judge-facing promise:** “Your private image stays on your device. We help you seek protection, report abuse, and track the response.”

This promise applies to HD Cares' processing. External reporting services may have their own evidence requirements, which must be explained before a user leaves the app.

## 2. Problem and intended users

Someone facing a threat or leak may not know which service to use, how to report multiple links, whether any action has happened, or where to find support. Repeating distressing details across disconnected reporting systems increases the burden.

Primary users:

- Adults facing threats to share intimate images or videos.
- Adults whose intimate content has already been shared without consent.
- People facing sexual blackmail, harassment, or fabricated intimate imagery who need a reporting route.

Secondary users: authorised NGO caseworkers and support professionals, with explicit, revocable access. Parents, guardians, and other helpers receive guidance; access to someone else's case is never automatic.

The service should support all genders. Images taken when the person was under 18 need a separate safeguarding route, even if they are an adult today.

## 3. What changes in the original idea

| Original assumption | Product requirement |
|---|---|
| Upload the private image to our server | Select it locally; process it on the device; send only a fingerprint after consent. |
| Store the picture's IP address | IP addresses identify network connections, not pictures. Store an algorithm-labelled fingerprint and an unrelated random case ID. |
| A code uniquely recognises every similar image | Exact hashes recognise identical bytes. Perceptual hashes can recognise some visual variants; they can miss changes and produce false matches. |
| Delete or block it everywhere | Only an integrated platform can act within its own service. Other sites require reporting and cooperation. |
| Automatically file complaints until deletion | Prepare one user-reviewed complaint package; submit through an authorised route when available, then track its reference and follow-ups. Avoid duplicate complaints. |
| Government action is guaranteed | Authorities determine whether and how to investigate. A draft, submitted complaint, acknowledgement, and investigation are different states. |
| We store no data | We store minimal case data and fingerprints, but no original intimate media. Explain retention and processors clearly. |

## 4. Existing services and differentiation

StopNCII already offers on-device hashing for eligible adult content and works with participating platforms. Its scope is not the entire internet. HD Cares must not claim to invent this approach or inherit its platform access. [StopNCII workflow](https://stopncii.org/how-it-works/)

NCMEC's Take It Down provides a separate route for content taken when a person was under 18. It instructs users not to download or share content to make a submission; use only files already on the device. The MVP will provide a direct referral without collecting such media. [Take It Down](https://takeitdown.ncmec.org/)

**Proposed differentiation to validate:** an India-focused, multilingual support and case-management layer that combines prevention guidance, per-link reporting, complaint preparation, and verified human-support referrals. This is a product hypothesis, not a proven market gap.

Start by helping users reach existing services. Any future automated hash exchange requires documented eligibility, agreements, and supported interfaces; no public integration is assumed.

## 5. Common entry workflow

1. Show three clear choices: **I am worried it may be shared**, **It has already been shared**, and **I need help**.
2. Explain privacy and limits in plain language before any file selection.
3. Ask whether the person was under 18 when the image was created. Route under-18 or uncertain cases to specialist guidance. Do not estimate age from the image.
4. Ask for country/region only when needed for local support and reporting; India is the initial default, not a restriction on referral information.
5. Allow guidance without an account. Offer a random case reference and strong recovery secret for a saved case, with optional safe contact details.
6. Ask separately for consent to save case data, share fingerprints with a named partner, and receive notifications. Default to no notifications.

Use supportive copy: “Sharing something privately does not mean agreeing to public sharing.” Never blame someone for sending an image.

## 6. Case 1 — threatened sharing or prevention

1. The user selects an image already on their device. File selection is local, not a server upload.
2. In the prototype, a browser worker computes a fingerprint from a harmless test image. It discards working image buffers after processing as far as the runtime permits.
3. The user reviews exactly what will be saved or shared, then gives consent.
4. The service records a fingerprint, algorithm version, consent record, and case reference. It stores no original file, thumbnail, file path, or EXIF metadata.
5. For the first real-world pilot, guide the user to an established protection service and explain that its enrolment happens separately. A future contracted integration may transmit compatible fingerprints directly.
6. Only show “partner accepted” after an authenticated acknowledgement. “Saved in HD Cares” does not mean protected on any outside platform.
7. On an integrated platform, that platform compares uploads with eligible fingerprints and applies its moderation policy. It may restrict, review, or remove content; the app cannot dictate its decision.
8. Display available partner outcomes with timestamps and coverage. Lack of a reported match does not mean the image is absent from the internet.

If the user does not have the original file, allow guidance and case tracking without it. Do not require them to obtain another copy.

## 7. Case 2 — content already published

1. The user adds known page/post URLs, platform names, approximate dates, and an optional description of threats. Do not automatically download the media at those URLs.
2. Create one report item per location and group duplicate links. Explain that removing one copy does not remove others.
3. Provide the correct platform reporting route and a concise editable request. The user reviews the facts before submitting.
4. Offer a separate search-result removal route where applicable. Search delisting reduces discoverability; it does not remove the hosting website's copy. [Google removal guidance](https://support.google.com/websearch/answer/6302812)
5. If requested, prepare a cybercrime complaint summary with the user's facts, URLs, timeline, and existing report references. Users provide sensitive evidence directly through the appropriate official process.
6. For the India-first MVP, link to the National Cybercrime Reporting Portal. Do not claim a government submission API or universal anonymous reporting. Available routes and requested details depend on the complaint type. [Official portal FAQ](https://cybercrime.gov.in/Webform/FAQ.aspx)
7. Save an official acknowledgement only when the user supplies it or an authorised integration confirms it. Prepare follow-ups on the same complaint instead of repeatedly filing new ones.
8. Track removal per URL and prevention separately. Offer the prevention workflow when eligible.

The app's evidence checklist initially covers URLs, times, usernames, and text descriptions. It does not store copies of intimate content. Qualified support can explain appropriate evidence handling for the user's situation.

## 8. Core and additional features

| Priority | Feature | Benefit and boundary |
|---|---|---|
| MVP | Two guided journeys | Reduces uncertainty for both threats and existing leaks. |
| MVP | Age-at-creation routing | Sends under-18 cases to specialist services before media selection. |
| MVP | Device-side fingerprint demo | Demonstrates privacy architecture with harmless assets; no external protection claim. |
| MVP | Established-service referrals | Provides a useful route before platform partnerships exist. |
| MVP | Per-link case timeline | Shows exactly what was drafted, reported, acknowledged, or resolved. |
| MVP | Report and complaint draft builder | Saves time without inventing facts or filing without user review. |
| MVP | Verified support directory | Filters women-focused services, counsellors, NGOs, and legal aid by region and language. |
| MVP | Safe interaction design | Optional discreet notifications, hidden previews, quick exit, and no session replay. |
| MVP | Consent and withdrawal controls | Makes saved information and authorised sharing visible to the user. |
| Next | Hindi plus additional regional languages | Improves accessibility; sensitive translations receive human review. |
| Next | Delegated caseworker access | Shares only selected case information for a limited period, with revocation and an audit trail. |
| Next | Reminder and escalation suggestions | Prompts appropriate follow-ups; never sends repeated reports automatically. |
| Next | Partner acknowledgement integration | Replaces manually entered progress with authenticated platform events. |
| Later | Video fingerprinting | Requires separate browser performance and matching evaluation. |
| Later | Support for edited and fabricated content | Combines report workflows and validated matching; similarity cannot prove authenticity or consent. |

A quick-exit button changes the visible page; it cannot erase browser history, device monitoring, or notifications already delivered. Explain that limitation in its help text.

Support-directory entries must include service owner, official source, region, hours, languages, last verification date, and next review date. Do not advertise a staffed or 24/7 service without a confirmed provider. Counselling referrals are optional and separate from reporting consent.

## 9. Proposed system design

```text
User device
  consent + local file selection + fingerprint worker
                    |
       fingerprint + minimal case metadata
                    v
Case API --> encrypted case database --> status dashboard
   |
   +--> reporting guides and user-reviewed draft exports
   +--> support directory
   +--> future authorised partner adapter --> partner acknowledgement/events

Partner platform: candidate content --> matching --> policy review/action
```

Suggested implementation, subject to a technical spike: TypeScript web interface, browser worker for hashing, a small authenticated API, PostgreSQL, and a queue for authorised integrations. Select framework versions when implementation begins.

For images, evaluate a maintained perceptual hashing implementation such as PDQ. Record the algorithm, version, and relevant preprocessing. Use compatible implementations on both ends. Do not invent an accuracy claim or a production match threshold before evaluation. [PDQ reference](https://github.com/facebook/ThreatExchange/blob/main/pdq/README.md)

An exact-file hash can demonstrate exact matching, but it is insufficient for resized or recompressed images. Perceptual matching is a candidate signal, not proof that content is unlawful or that a reporter is its subject. Video requires a separate approach; frame-based options exist but need assessment. [Video reference](https://github.com/facebook/ThreatExchange/blob/main/vpdq/README.md)

Suggested records:

- Case: random ID, locale, creation date, recovery-secret verifier, optional contact reference.
- Fingerprint: restricted case link, algorithm/version, fingerprint, consent and withdrawal state.
- Report item: encrypted URL, platform, draft/reference, status, verification source and time.
- Consent: purpose, named recipient, policy version, grant/revocation time.
- Event: actor, action, timestamp, source; no intimate media or secrets in logs.
- Support entry: provider, official contact source, coverage, verification date.

Keep account identity, content fingerprints, and report metadata logically separated and accessible only where needed. Do not expose a public endpoint for testing whether a person's image is registered.

## 10. Privacy, abuse prevention, and reliability

- No original intimate media reaches the backend, logs, analytics, error reporting, backups, or third-party scripts. Disable session replay and unnecessary analytics on sensitive screens.
- Treat fingerprints as sensitive data. They are not encryption and can enable correlation with known files. Restrict and encrypt access.
- Do not use IP addresses as image identifiers. Infrastructure may process network metadata; document and minimise that logging rather than claiming it never happens.
- Use scoped access, rate limits, strong case secrets, revocable sessions, and an audited staff-access process. Never use predictable case IDs as authentication.
- Require a declaration that the report concerns the user or an authorised representation. This is not identity proof. Platform review and an appeal route protect against malicious suppression of other people's content.
- Do not permanently remove content solely because of a similarity score. The platform applies policy and provides review/appeal handling.
- Agree retention periods before a real pilot. Proposed baseline: delete inactive unsubmitted drafts after 30 days with clear notice; retain active cases only for their stated purpose. Final periods depend on partner and local obligations.
- On withdrawal, stop new sharing, remove eligible local records, and request partner revocation where supported. Show pending requests and explain backup expiry and any justified retention. Do not promise instant deletion from every partner.
- Avoid fetching user-supplied URLs in the MVP. Any later URL checks require protections against requests to internal networks, hostile redirects, and unsafe media downloads.
- Display integration outages and stale statuses honestly. Retrying a failed request must not create duplicate reports.

## 11. Status model

Prevention: **Draft → Fingerprint saved locally/in app → Referral offered or partner submission pending → Partner accepted → Partner-reported event**. “Referral offered” is not “enrolled.”

Per-URL reporting: **Draft → User reports submitted → Acknowledged → Under review → Removed / Rejected / More information needed / Unknown**.

Police complaint: **Draft prepared → User reports submitted → Official reference recorded → Update received**. Do not infer investigation or resolution from submission alone.

Each status needs a source, timestamp, and next action. Mark user-entered outcomes as user-reported. A broken or private URL alone is not proof of deletion. Overall case progress must preserve unresolved report items.

## 12. Advantages and limitations

| Advantage | Corresponding limitation |
|---|---|
| Local processing limits exposure of originals | A compromised device or malicious web code remains a risk. |
| One dashboard reduces repeated administrative work | External services control response time and available status details. |
| Fingerprints can support repeat-upload detection | Alterations, false matches, and unsupported platforms limit coverage. |
| Guided reporting can improve completeness | Authorities and platforms make their own decisions. |
| Support referrals address practical and emotional needs | Provider availability varies by language, region, and hours. |
| Minimal-data access can reduce barriers | Some official processes require identifying information. |

Non-goals: universal internet scanning, guaranteed deletion, access to private/encrypted channels, identifying offenders from an image hash, guaranteeing police action, or storing an archive of intimate images.

## 13. Success measures and release gates

Measure prototype completion time, journey abandonment, comprehension of coverage limits, and report-draft completeness. Set a proposed usability target of completing a basic draft in five minutes; validate it with user testing.

For matching, report exact and transformed-image recall, false-positive rate on unrelated images, device performance, and failure cases separately. Use harmless, permitted assets and publish the evaluation conditions. Do not claim 100% detection.

For pilots, measure time to acknowledgement and outcome by partner, confirmed removals per acknowledged report, unresolved items, and support-referral usefulness. Report denominators and distinguish user-reported from partner-confirmed outcomes.

Go-live gates: privacy/network verification, security review, an agreed retention policy, specialist safeguarding review, verified referral details, and documented authority for every live integration. No real intimate media during prototype testing.

## 14. Sustainability and future scope

Keep core survivor assistance free. Explore grants, CSR support, and paid case-management tools for institutions under appropriate privacy controls. Avoid ads, selling sensitive data, and charging for promised removal outcomes.

Expand through NGO partnerships, evaluated video support, regional-language accessibility, documented platform integrations, and authorised caseworker tools. Validate demand before adding broad monitoring or AI features.

Open decisions: final name, intended pitch duration, launch region, team skills, target devices, support partners, recovery design, and realistic funding. None should prevent preparing the initial presentation.
