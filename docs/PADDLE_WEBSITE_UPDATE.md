# FirstLane website disclosures — 23 October 2026

Owner explicitly requested updating and publishing pricing, terms and privacy for Paddle verification. Owner confirmed Tervlon Labs is registered in Nigeria and FirstLane serves Canada. The existing confirmed legal name is Tervlon Labs Limited. No street address, incorporation number, governing-law clause or fixed retention period was supplied or invented.

## Published scope

- `/pricing` and homepage `#pricing` share the same planned CA$14.99 once plus applicable tax offer, 10 guest / 40 total free / 500 planned Complete boundaries, optional fixed counts, Complete-only Keep going, content-approval dependency and internet requirement.
- Clear prelaunch availability: the real app domain still returns NXDOMAIN. Public purchases and accounts are not presented as open. The existing five-question sample is the working CTA; there are no broken signup/checkout links.
- `/terms` identifies the operator/country, Ontario study scope, Paddle merchant-of-record checkout/buyer terms, refund link and one-time purchase model. Native store and offline promises are removed from the web offer.
- `/privacy` distinguishes the current public website from the planned web app: Clerk account authentication, Supabase app data, Paddle purchases, Vercel website hosting and conditional Resend/Turnstile support-form use. It discloses possible processing outside Canada without claiming a production storage region or fabricated retention deadline.
- The old Supabase OTP marketing deletion adapter is retired with HTTP 410 and no upstream requests; marketing deletion guidance now matches the planned authenticated web app. The inactive support form offers direct contact email instead of collecting an unavailable submission. This carries forward previously prepared web-auth alignment from the original checkout.
- Footer/navigation, metadata, support and cookie wording are aligned. The exact structured-data CSP hash is updated in Vercel and local headers without allowing inline scripts generally.

The update preserves the approved refund page and its separate 22 October effective date. Other policies use 23 October. Existing public source was isolated from the original checkout's unfinished app/UI changes in `.release-worktrees/web-policies`.

## Validation

Build and 34 tests pass, including provider/identity/offer disclosures, no unavailable app links, same homepage/pricing offer, retired-account zero-call assertions, support safeguards and exact CSP coverage. Chrome acceptance at a 360px viewport verifies pricing and policy content without horizontal overflow; temporary viewport reset afterward. Paid checkout, content publication, social auth and advertiser activation were not performed. Release-approval flags remain false; publishing prelaunch information is not evidence that final provider/legal/retention acceptance has occurred.

## Sources checked

- https://www.paddle.com/help/start/account-verification/what-is-domain-verification
- https://www.paddle.com/legal/buyer-terms
- https://www.paddle.com/legal/refund-policy

Paddle still makes its own account/domain approval decision. The future Tervlon product and its separate site are not reviewed or changed here.
