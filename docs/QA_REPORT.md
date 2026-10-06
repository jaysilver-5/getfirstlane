# QA report — Lane website

Executed on 6 October 2026. This report distinguishes source/build/isolated-browser checks from real deployed-provider acceptance.

## Passed in this environment

**41 automated Node tests passed; zero failed.** Evidence: `qa/node-tests.txt`. Run `npm run build:local` then `npm test` to reproduce. Coverage includes JSON and input validation, wrong origins/methods, body limits, rejected privileged keys, no account creation during email verification, captcha action/hostname validation, private failure messages, recent OTP requirements, expired/mismatched identities, explicit deletion confirmation, ambiguous deletion responses, support email success/failure, duplicate-message idempotency, release gates, public-bundle isolation, clean URLs, real 404 status and HTTP security headers.

The local Node server was exercised through actual HTTP requests. It serves only `dist/`; source and environment paths returned 404. `/`, every clean legal/support route and `.html` aliases were checked. API method rejection and non-cacheable responses were checked. An isolated production build with clearly synthetic inputs tested the positive canonical/store-link/sitemap generation branch; its temporary output was deleted. This is not evidence that the synthetic identity, URLs or approvals are genuine.

**24 isolated-browser/static validation groups passed.** Evidence: `qa/browser-checks.json`. All **7 pages** were rendered at **320, 360, 390, 768, 1024 and 1440 CSS pixels** with no document-level horizontal overflow. All built internal pages, images, asset links, anchor targets and element IDs were checked. No JavaScript page exceptions occurred during those renders.

Keyboard mobile-menu dismissal/focus return, arrow-key/End feature tabs, FAQ disclosure, reduced motion, manual pause/resume, no-JavaScript readability and missing-service disabled states were exercised. Browser support/deletion success, failure and cancellation used explicitly synthetic responses: verification alone never submitted deletion; the acknowledgement and typed `DELETE` were required; failed requests never displayed success. No real account or message was used.

Desktop and mobile screenshots were visually inspected. The first mobile legal-table rendering squeezed its headings too narrowly; the column sizing was corrected and checks rerun. The header, hero, real welcome screen, pricing, footer and deletion page were inspected. The old price and developer-facing placeholder strings are not present in the customer HTML.

## Browser-test method and limitations

The environment's managed Chromium blocks URL navigation, including localhost and file URLs. That restriction was not removed. Browser rendering used `page.set_content` with the **actual generated HTML, inline copies of its CSS/JS, and embedded copies of its local images**, without external network access. Node HTTP tests separately checked routes/headers. Therefore the screenshot/DOM checks do not establish browser acceptance of deployed HTTP headers or a live Cloudflare widget.

The optional reproducible script is `tests/browser_checks.py`. It needs Python packages `playwright` and `beautifulsoup4` plus installed Chromium; set `CHROMIUM_PATH` when necessary. These are optional QA tools, not production dependencies. The script's mock services are isolated in the test document and never included in `dist/`.

No physical iOS/Android, native SDK, desktop Safari/Firefox, VoiceOver/TalkBack, full WCAG conformance audit, deployed CSP/captcha session, live email delivery, real Supabase OTP or actual account deletion was tested here. No Lighthouse score is claimed. System-font rendering can vary by device.

## Production gate result

The supplied owner configuration intentionally does **not** pass `npm run release:check` or `npm run build:release`. Evidence: `qa/release-check.txt` and `qa/production-build-check.txt`. This prevents inventing store listings, legally significant details, retention periods, provider credentials or completed reviews.

`npm run build` and `npm run build:local` succeed and emit a noindexed site with truthful unconfigured-service states. The normal build is suitable for an initial hosted pre-launch deployment; it is not proof of a live or store-approved launch.

## Remaining acceptance

Real domain/listing/mailbox configuration; operator/publisher confirmation; legal and age/audience review; content/feature acceptance; native/store CAD 14.99 billing verification; actual retention implementation; raw commerce-event and downstream processor cleanup; auth-CAPTCHA compatibility; real hosted email-code/deletion and support delivery; distributed abuse limits; physical-device and screen-reader testing; deployed security headers, uptime and operational monitoring.

See `LAUNCH_CHECKLIST.md` and `INTEGRATION.md` for specific actions. The policy configuration changes rendered words; it does not by itself implement background retention jobs or processor deletion.
