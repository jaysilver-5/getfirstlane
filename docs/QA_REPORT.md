# QA report — FirstLane website

Executed on 7 October 2026. This report distinguishes source/build/local-browser checks from real deployed-provider acceptance.

## Passed in this environment

**42 automated Node tests passed; zero failed.** Evidence: `qa/node-tests.txt`. Run `npm run build:local` then `npm test` to reproduce. Coverage includes JSON and input validation, wrong origins/methods, body limits, rejected privileged keys, no account creation during email verification, captcha action/hostname validation, private failure messages, recent OTP requirements, expired/mismatched identities, explicit deletion confirmation, ambiguous deletion responses, support email success/failure, duplicate-message idempotency, FirstLane brand/metadata integrity, release gates, public-bundle isolation, clean URLs, real 404 status and HTTP security headers.

The local Node server was exercised through actual HTTP requests. It serves only `dist/`; source and environment paths returned 404. `/`, every clean legal/support route and `.html` aliases were checked. API method rejection and non-cacheable responses were checked. An isolated production build with clearly synthetic inputs tested the positive canonical/store-link/sitemap generation branch; its temporary output was deleted. This is not evidence that the synthetic identity, URLs or approvals are genuine.

The rebuilt FirstLane site was inspected in a real local Chromium tab. All **7 pages** were checked at **320, 390, 768 and 1440 CSS pixels** with no document-level horizontal overflow, one main heading per page, the FirstLane wordmark present and no standalone legacy brand text. The home page was additionally checked at **360 and 1024 CSS pixels**. No browser warnings or JavaScript errors were reported.

Mobile-menu open/dismissal, feature-tab selection, FAQ disclosure and manual motion pause/resume were exercised successfully. Node tests cover disabled-service states and the support/deletion success, failure and cancellation branches with explicitly synthetic responses: verification alone never submits deletion; acknowledgement and typed `DELETE` are required; failed requests never display success. No real account or message was used.

Desktop and mobile renders were visually inspected. The longer FirstLane wordmark fits the header down to 320 CSS pixels, the new hero tagline retains the original hierarchy, and the rebranded welcome screen and 1200×630 social card were reviewed at their final production dimensions. The old price and developer-facing placeholder strings are not present in the customer HTML.

## Browser-test method and limitations

Browser QA used the actual local Node server at `http://127.0.0.1:4173`, responsive viewport overrides and read-only DOM measurements. Node HTTP tests separately checked routes and headers. The optional `tests/browser_checks.py` harness remains available but its Python Playwright package was not installed in this environment; Playwright is an optional QA tool, not a production dependency.

No physical iOS/Android, native SDK, desktop Safari/Firefox, VoiceOver/TalkBack, full WCAG conformance audit, deployed CSP/captcha session, live email delivery, real Supabase OTP or actual account deletion was tested here. No Lighthouse score is claimed. System-font rendering can vary by device.

## Production gate result

The supplied owner configuration intentionally does **not** pass `npm run release:check` or `npm run build:release`. Evidence: `qa/release-check.txt` and `qa/production-build-check.txt`. This prevents inventing store listings, legally significant details, retention periods, provider credentials or completed reviews.

`npm run build` and `npm run build:local` succeed and emit a noindexed site with truthful unconfigured-service states. The normal build is suitable for an initial hosted pre-launch deployment; it is not proof of a live or store-approved launch.

## Remaining acceptance

Store-listing and mailbox configuration; operator/publisher confirmation; legal and age/audience review; content/feature acceptance; native/store CAD 14.99 billing verification; actual retention implementation; raw commerce-event and downstream processor cleanup; auth-CAPTCHA compatibility; real hosted email-code/deletion and support delivery; distributed abuse limits; physical-device and screen-reader testing; deployed security headers, domain verification, uptime and operational monitoring. The official website origin is configured as `https://getfirstlane.com`.

See `LAUNCH_CHECKLIST.md` and `INTEGRATION.md` for specific actions. The policy configuration changes rendered words; it does not by itself implement background retention jobs or processor deletion.
