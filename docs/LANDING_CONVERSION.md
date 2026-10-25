# Landing-page conversion fixes — 25 October 2026

The public `/app/auth/sign-up` route already renders the real email/password account form, but the marketing site still advertised the app as coming soon. Its primary actions returned visitors to the on-page sample, and the Complete pricing card's only button opened the refund policy.

The header, hero, free pricing card, sample follow-up, final section and footer now link directly to `/app/auth/sign-up`. Returning visitors have a separate `/app/auth/sign-in` link. The sample remains a secondary option and has an account-creation action after the questions. Both the homepage and dedicated pricing page use the same pricing template; Complete opens `/app/plans` and refund information remains a text link.

`webAppAvailable` records the verified availability of the free account app. This does not change any operational approval, purchase configuration, backend grant or paid-release gate. The existing paid-purchase availability notice remains explicit. Legal/support links and the `/app` proxy are preserved. Account-deletion information now exposes the existing authenticated app controls; following its link does not delete anything.

Validation: local build and all 37 Node tests pass, including the exact structured-data CSP hash, the app proxy's namespace, purchase disclosures and inactive support services. Browser checks at actual 320- and 390-CSS-pixel widths show no horizontal overflow on the homepage or pricing page. Mobile navigation exposes signup and sign-in. All five sample answers, the completion message, signup follow-up and reset work. Production signup and plan pages render; no account was created and no payment was submitted by this work.

Generated `dist/` files are rebuilt by Vercel from these sources. No advertising or analytics trackers were introduced. Conversion uplift has not been measured.

## Responsive button follow-up - 25 October 2026

Replaced em dashes in landing-site prose, page titles and social metadata with normal sentence punctuation or hyphens. All nine rendered HTML pages were scanned and contain no em dashes. The global button size is now 48 pixels on larger screens and main mobile actions are 44 pixels tall with intrinsic widths. The sample action is an underlined secondary link with a 44-pixel tap area. Pricing, sample follow-up, final-section and reset actions no longer stretch across their containers unnecessarily. Direct signup and plan destinations are preserved.

Local build and all 37 tests pass. Browser checks on the homepage and pricing page at actual 320, 390 and 768 CSS pixels show no horizontal page overflow or clipped button text. At 320 pixels the primary hero action measures 197 by 44 pixels, compared with the previously stretched 52-pixel-high button.
