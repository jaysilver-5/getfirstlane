# Lane website launch acceptance

Date of handoff: 6 October 2026. Owner fields below are deliberately unfilled. Record the actual reviewer, date, environment and evidence in your release ticket; the booleans in `site.config.json` only record that acceptance happened.

## 1. Owner-supplied facts

| Configuration | Required decision / evidence |
|---|---|
| `siteUrl` | Final HTTPS origin, e.g. your actual owned domain, without a trailing slash. Never use the synthetic test fixture domain. |
| `operatorLegalName` | Exact registered entity operating Lane; confirm spelling against company records. `operatorDisplayName` is only the public brand credit. |
| `businessAddress` | Real business/privacy correspondence address appropriate for publication. |
| `publisherLegalName` | Actual entity appearing on store listings and receipts. |
| `publisherDisclosure` | Reviewed, plain-language explanation of operator/publisher responsibilities. Use the same entity when it genuinely fills both roles. |
| `supportEmail`, `privacyEmail` | Real, monitored mailboxes. Test delivery and responses. |
| `appStoreUrl`, `googlePlayUrl` | Real Lane product listings. Not generic store homepages or guessed IDs. |
| `providers.*` | Actual hosting, auth-email and support providers; actual processing locations. Resend is the implemented support adapter, not evidence that an account has been configured. |
| `retention.*` | Verified operational retention limits and the legal/operational purpose of transaction retention. Do not choose convenient numbers without implementing them. |
| `governingLaw` | Professionally reviewed wording preserving mandatory consumer rights. Do not assume a governing jurisdiction from the target market alone. |
| `minimumAge`, `effectiveDate` | Review the proposed minimum age of 16, minor/guardian consent, target audience and policy effective date. |

The operator may be Tervlon Labs, but the exact registered operator and publisher arrangement was not established by this handoff. The implementation does not assert a made-up legal name or postal address.

## 2. Commercial and content checks

Confirm **Ontario G1 Complete = CAD 14.99, one-time** in both stores, native purchase screens, RevenueCat mapping and the relevant backend offer. Check Canadian storefront price, tax presentation and other storefront currencies. Website prices are not billing configuration.

Confirm the shipped app actually provides the marketed free 10-guest / 40-account question limits, fixed sample set, topic practice, mock sessions, mistake review, bookmarks, download/offline behaviour and manual progress sync. Verify periodic access-check wording against the app.

The source question bank was not independently production-approved. The site deliberately makes no “verified”, “official”, “MTO approved”, exact exam-question or pass-guarantee claim. A real content review is still required before publishing the app and its feature claims. The genuine welcome screenshot was retained; older price-bearing images were not published.

## 3. Legal and privacy checks

A qualified reviewer should approve the rendered Privacy, Terms, Cookies and Delete pages after actual identity, audience, data flows and retention are supplied. This package is not a legal opinion or certification.

Reconcile the website with the app's privacy text, App Store privacy labels, Google Play Data safety/account-deletion fields, publisher identity and every SDK. Add disclosures and consent changes before adding analytics, ad pixels, a CRM, crash telemetry, session replay or marketing email. No optional marketing tracking is implemented in this website.

Confirm deletion of each relevant processor-held record or a genuinely applicable, limited retention exception. The existing `commerce_events.payload` and RevenueCat data need particular attention. Do not label the deletion complete solely because Supabase Auth returned success.

## 4. Integration acceptance

Use a non-production test account with representative study data, synced progress, reports and a sandbox purchase. Complete the website email-code flow on a real HTTPS staging domain. A valid code must reach the confirmation step without deleting anything. Wrong/expired codes must fail. Only a deliberate, checked, typed `DELETE` confirmation may submit deletion.

After deletion, verify the actual Supabase account and relevant rows are gone; old access is unusable; local/offline behaviour is understood; processor tasks and retention exceptions are handled; retained records are minimised and access-restricted. Test support delivery to the actual mailbox, the reply-to address, bounce/outage handling and the monitored privacy address.

Check fraud protection with a real Turnstile widget and server validation, including expiry and invalid hostname/action. Configure and exercise platform WAF/rate limits and Supabase auth throttling. The code does not pretend an in-memory map provides distributed rate limiting.

Suggested starting limits for testing (not provider defaults or universal safe thresholds): support submissions 5 per IP per 10 minutes, account requests 30 per IP per 5 minutes, and stricter per-address OTP delivery/verification limits in the auth service. Tune shared-network false positives and monitor failures. Do not log codes, bearer tokens, raw support messages or full email addresses in general logs.

## 5. Host and accessibility acceptance

- Confirm HTTPS, domain ownership, certificates, applied security headers, deep-link refreshes, true 404 status and no public source/environment files.
- Inspect every page on physical iPhone/Safari and Android/Chrome, desktop Firefox and desktop Safari. Check 200% zoom, large text, keyboard navigation, VoiceOver/TalkBack, reduced motion and error announcements.
- Test actual Turnstile under the delivered CSP. Do not weaken the entire policy to permit a widget without investigating the specific blocked resource.
- Publish real canonical URLs, verify robots/sitemap and social images, and submit the correct stable privacy/support/deletion URLs in both store consoles.
- Set alerting for function failures, provider limits, mailbox bounces and deletion failures. Establish a privacy-request process, retention cleanup, backup expiry and incident owner.

## 6. Required acceptance flags

`legalPoliciesReviewed`, `operatorAndPublisherVerified`, `retentionAndProcessorsVerified`, `contentAndFeatureClaimsReviewed`, `nativePriceAndStoreLinksVerified`, `supportDeliveryTested`, `deletionEndToEndTested`, `rateLimitsAndMonitoringEnabled`, `nativePrivacyDisclosuresMatch`.

All are false in the delivered configuration. Changing them to true without the corresponding evidence does not make a launch ready.
