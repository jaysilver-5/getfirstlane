# Google Ads measurement

The marketing layout installs Google tag `AW-16855601358` on every marketing page. `public/assets/google-tag.js` runs synchronously before Google's asynchronous script; the build fingerprints this initialization asset. The separate study app under `/app` is not changed by this installation.

Consent Mode v2 starts with advertising storage and ad user data denied unless this browser previously allowed measurement. The banner and `/cookies#advertising` controls save the choice in `firstlane.ads-consent` and update Google on the current page. Personalized advertising and Analytics storage remain denied. Google may receive limited cookieless measurements while advertising cookies are denied. Withdrawing permission removes first-party `_gcl_*` cookies and updates consent; it does not delete previously processed Google data.

The privacy and cookie disclosures describe this behavior. Google endpoints are allowed in both the local-server CSP and Vercel CSP without allowing arbitrary inline JavaScript. The implementation follows [Google's consent setup](https://developers.google.com/tag-platform/security/guides/consent) and [CSP guidance](https://developers.google.com/tag-platform/security/guides/csp).

The supplied snippet installs the base tag. No purchase, signup or other conversion event label was provided, so this change does not send custom conversion events or enhanced-conversion account data.

Validation: 41 Node tests pass, including default consent ordering, accept/withdrawal, saved consent, unavailable storage, first-party cookie deletion and tag placement on all nine pages. Isolated Chromium checks passed accept/reload, withdrawal/reload, cookie removal, 320px layout and nested 404 script paths with Google requests stubbed.
