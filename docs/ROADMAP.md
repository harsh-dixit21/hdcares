# HD Cares — build roadmap

Planning estimates for a small student team; adjust after confirming team size and skills. No production code has been initialised.

## Phase 1: validate and prepare the pitch — approximately 1 week

- Confirm the problem through optional, privacy-respecting conversations with NGOs and prospective users. Do not request intimate files or identifiable incident stories.
- Validate whether a unified case workflow is useful alongside existing services.
- Confirm pitch duration and convert the outline into slides.
- Produce wireframes for entry, privacy/eligibility, referrals, local fingerprinting, report drafting, case tracking, and support.

Exit: agreed scope, accurate pitch claims, and a prioritised workflow.

## Phase 2: build a demonstrator — approximately 2–3 weeks

- Build the two journeys with local test fixtures.
- Implement local fingerprinting for harmless images and a visibly labelled mock platform.
- Add report drafts, per-link progress, and a support-directory structure.
- Implement separate consent decisions and a case recovery flow.
- Keep all partner and government submission actions simulated or link-based.

Exit: a repeatable demo that never claims external protection or actual complaint submission.

## Phase 3: evaluate privacy and usefulness — approximately 1–2 weeks

- Inspect outgoing requests, telemetry, browser storage, server logs, and failure paths for media leakage.
- Evaluate matching on exact copies, recompression, resizing, crops, rotation, overlays, and unrelated images.
- Test mobile performance, accessibility, interrupted sessions, and recovery.
- Ask users to explain what “fingerprint saved,” “partner accepted,” and “removed” mean; revise unclear copy.

Exit: documented results, known limits, and resolved critical privacy/access failures.

## Phase 4: controlled pilot — timing depends on partners

- Establish an NGO/support relationship, incident handling, and ownership of directory verification.
- Agree retention, consent, safeguarding, and access policies before collecting real case data.
- Start with referral and reporting assistance. Add direct platform integration only with documented authorisation.
- Measure user usefulness and case outcomes without collecting originals.

Exit: evidence of usefulness and safe operations; scale only after reviewing results.

## Acceptance checks

| Area | Pass condition |
|---|---|
| Media privacy | No selected file bytes, encoded image, thumbnail, filename, or EXIF data leave the browser during registration, including error paths. |
| Third parties | No analytics/session replay can observe sensitive screens or file data. |
| Consent | Cancelling before submission saves no fingerprint on the server; sharing and notifications require separate consent. |
| Coverage | Unconnected platforms never display “protected”; simulated events are visibly labelled. |
| Matching | Versioned test results include false positives and missed transformations; no universal accuracy claim. |
| Abuse controls | Unauthorised users cannot query other cases or test fingerprint membership. |
| Age routing | Under-18-at-creation and uncertain users reach specialist guidance before file selection. |
| Reporting | A draft is not marked submitted; one complaint's retries do not create duplicate submissions. |
| Outcomes | Every removal status records its scope, source, and timestamp; unknown remains unknown. |
| Withdrawal | New sharing stops; partner revocation requests and local deletion follow the disclosed policy. |
| Recovery | A case reference alone cannot unlock sensitive information; the consequences of losing a recovery secret are explained. |
| Notifications | Off by default; optional messages omit incident details and media previews. |
| Directory | Every published entry has an official source and current verification date. |
| Accessibility | Core flows work with keyboard navigation, labelled controls, readable contrast, and mobile layouts. |

## Decisions to resolve before production

1. Which organisation will own safeguarding and support operations?
2. Which services permit integration, and with what data formats and terms?
3. Which hashing implementation runs reliably on target devices?
4. What retention/deletion periods and recovery model are appropriate?
5. Which region and languages can be supported accurately at launch?
6. What evidence is sufficient to justify expanding beyond a referral-focused pilot?
