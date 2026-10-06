# Implementation references

Checked 6 October 2026. These are authoritative technical/policy references, not evidence that Lane has been approved by a store or that a specific legal regime has been satisfied. Re-check at submission.

- Apple, offering account deletion: https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion/
- Google Play, app account deletion and external web resource: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en
- Supabase, email passwordless authentication and `shouldCreateUser: false`: https://supabase.com/docs/guides/auth/auth-email-passwordless
- Supabase, JWT authentication-method and expiry claims: https://supabase.com/docs/guides/auth/jwt-fields
- Supabase Auth implementation, email/code verification: https://github.com/supabase/auth/blob/master/internal/api/verify.go
- Supabase, authentication rate limits: https://supabase.com/docs/guides/auth/rate-limits
- Supabase, Auth CAPTCHA integration: https://supabase.com/docs/guides/auth/auth-captcha
- Cloudflare Turnstile, mandatory server-side validation, action/hostname checks and single-use tokens: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Cloudflare Turnstile, CSP: https://developers.cloudflare.com/turnstile/reference/content-security-policy/
- Resend, send-email API and accepted message IDs: https://resend.com/docs/api-reference/emails/send-email
- Resend, idempotency: https://resend.com/docs/dashboard/emails/idempotency-keys
- Vercel, Node runtime/API functions: https://vercel.com/docs/functions/runtimes/node-js
- Vercel, build output and configuration: https://vercel.com/docs/builds/configure-a-build and https://vercel.com/docs/project-configuration/vercel-json
- Office of the Privacy Commissioner of Canada, meaningful consent: https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/collecting-personal-information-and-consent/consent/gl_omc_201805/
- Office of the Privacy Commissioner of Canada, retention and disposal: https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/gd_rd_201406/

## Product source provenance

Input: `Lane_Landing_Page_Handoff(1).zip`. Relevant prior source: `Lane_Production_Hardening_CA1499.zip`, supplied in the user's file library. The original theme tokens, artwork SVGs, welcome screenshot, account/profile screens, deletion function and associated migrations were examined.

App tokens retained: cream `#F6F5EF`, ink `#1C2922`, forest `#243C2E`, lime `#D9F778`. Some supporting website text uses darker tones for readability. Native press feedback inspired the web press scale; website animations are web implementations, not a claim that native animations were embedded or tested here.

Only the price-free genuine welcome screen is used. Screenshots with the obsolete price were not shipped. No fabricated store ratings, customer testimonials, active-user totals, verified-question claims or success percentages were introduced. No font files are distributed.
