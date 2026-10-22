# FirstLane web refund page — 22 October 2026

Adds `/refunds` and `/refunds.html`, a footer link on every page, and purchase-help links in Terms and Support. The policy identifies Tervlon Labs Limited and applies to FirstLane Paddle web purchases; it does not prescribe terms for the future Tervlon product.

Official references checked on 22 October 2026:

- https://www.paddle.com/legal/refund-policy (31 March 2026 version)
- https://www.paddle.com/legal/buyer-terms
- https://www.paddle.com/help/manage/your-customers/buyers-refunds

The page follows Paddle's regional eligibility and discretionary rules and preserves mandatory consumer rights. No additional voluntary money-back guarantee, account-wide payment setting or launch approval was created. Its update date is specific to this page.

The release branch contains only this page, navigation/help links, the page build entry and focused checks. Broader unfinished Clerk/Paddle web-launch changes in the original checkout are preserved separately. This page does not establish that the remaining public pricing, terms, privacy, app deployment or content gates are complete.

Validation: build and 45 tests pass on the bounded release branch; browser acceptance confirms the real `/refunds` route and rendered policy. The original web-launch checkout also builds with all 32 of its current tests passing. Builds retain the existing safe prelaunch/noindex behavior.
