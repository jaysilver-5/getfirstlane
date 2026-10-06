# Service integration and security boundaries

## Architecture

The frontend is static HTML/CSS/JavaScript. Only the two same-origin Node endpoints need a server:

```text
Browser → POST /api/support → Turnstile verification → Resend → monitored support mailbox
Browser → POST /api/account → Turnstile / Supabase Auth → existing Lane delete-account Edge Function
```

There is no website checkout, general user dashboard, account-signup flow, server database or analytics SDK. No Supabase service-role key belongs in this website. The original privileged account-delete operation remains in the existing authenticated Edge Function.

## Server variables

| Variable | Meaning |
|---|---|
| `SITE_ORIGIN` | Exact HTTPS origin; must match `site.config.json.siteUrl`. Used for strict Origin validation and captcha hostname checks. |
| `SUPABASE_URL` | Lane's existing production or isolated staging project HTTPS URL. |
| `SUPABASE_PUBLIC_KEY` | Publishable key or legacy `anon` JWT only. Secret/service-role keys are rejected. |
| `TURNSTILE_SECRET_KEY` | Server-only secret matching the frontend site key. |
| `RESEND_API_KEY` | Server-only send-email credential for the verified sender domain. |
| `SUPPORT_FROM_EMAIL` | Verified sender address, e.g. an address you actually control on the sender domain. No display-name syntax. |
| `SUPPORT_TO_EMAIL` | Actual monitored inbox, exactly matching `supportEmail` in site config. |

`turnstileSiteKey` is public and goes in `site.config.json`. All service secrets remain in the host's server environment. The build uses an explicit public allowlist; it does not serialize arbitrary environment variables.

Use separate staging and production origins/keys. Website server variables are not `EXPO_PUBLIC_*`; no native app environment is changed by this delivery.

## Supabase: email-code setup

Use the same project that holds the actual Lane accounts. Confirm an email/password account can authenticate through the email OTP method before launch.

In Supabase authentication configuration, enable the email provider and configure a production-capable SMTP/email sender. In **Email Templates → Magic Link**, the message must contain `{{ .Token }}` so the user receives a code they can type. A minimal content example follows; brand and deliver it through your actual approved email setup:

```html
<h2>Your Lane verification code</h2>
<p>Enter this code on the Lane page you opened:</p>
<p><strong>{{ .Token }}</strong></p>
<p>Verifying your email does not delete your account. You must confirm deletion on the website separately.</p>
<p>Never share this code with support. Ignore this message if you did not request it.</p>
```

Review the template's shared effect on other app authentication flows. Do not unintentionally replace a required native deep-link recovery/confirmation flow. This site uses the Magic Link/OTP template; recovery and signup templates are separate and should be tested in the app too.

The adapter sends `POST /auth/v1/otp` with `{ email, create_user: false }`. It must not create a new account just to delete it. Selected account-not-found errors return the same generic response as success. The public Supabase auth service may have its own enumeration characteristics; this wrapper is not a promise of constant-time account-existence protection.

It verifies `POST /auth/v1/verify` with `{ email, token, type: "email" }`. The browser receives only the resulting access token, held in memory. The refresh token is not sent to or persisted by the browser. Configure auth email delivery, expiry, resend and verification-attempt limits; test a real response, including JWT `amr` method `otp` and timestamp.

### Supabase CAPTCHA setting — important

This wrapper validates its Turnstile token at the website server. **The already-consumed Turnstile token cannot be validated again by Supabase.** If Supabase's global Auth CAPTCHA protection is enabled, its OTP endpoint may require its own unconsumed provider challenge token. The existing adapter does not pass a second Auth CAPTCHA token.

Before release, choose and test a compatible configuration: either the email OTP endpoint uses the verified web challenge plus correctly configured Supabase/WAF abuse controls, or extend this flow to obtain a separate Auth-compatible challenge and pass it using the provider's supported request contract. Do not silently disable an existing app-wide protection to make a website test pass. `deletionEndToEndTested` must remain false until the real configuration works.

## Account deletion: exact contract

The browser performs these separate actions on `/api/account`:

| Action | Required input | Result |
|---|---|---|
| `send-code` | Account email, fresh `deletion` captcha token | Generic `{ sent: true }`, only after the upstream outcome is handled. |
| `verify-code` | Email and 6–10 digit code | `{ verified: true, accessToken }` on successful provider verification. |
| `delete` | Bearer access token + `confirmation: "DELETE"` | `{ deleted: true }` only after authenticated Edge Function success. |
| `signout` | Bearer access token | Best-effort `scope=local` sign-out when cancelling/restarting. |

Deletion first validates the bearer with `GET /auth/v1/user`. Only then does the server inspect the signed token's subject, expiry and `amr` OTP timestamp. OTP verification must be no more than 10 minutes old. A recent login in another session does not refresh an older token. Client-supplied user IDs are ignored. No deletion is triggered by GET, typing an email, verifying a code, closing a page or clicking a pricing link.

After the check, the adapter calls the existing **`/functions/v1/delete-account`** using that user's bearer. Its exact positive contract is `{ deleted: true }`. A generic HTTP 200, false flag, network failure or unrecognised payload is never converted into successful deletion.

`docs/EXISTING_DELETE_FUNCTION.ts.txt` is a reference copy from the supplied app source, not a new deployed function. Deploy/maintain it from the app/backend repository with its existing privileged environment and security review.

### What the source actually does — launch blocker

The existing Edge Function verifies the user then calls Supabase Admin `deleteUser`. Its linked database schema cascades profile, synced progress, reports, access-grant and transaction rows. **The source also contains raw commerce-event JSON and refund records that do not all disappear through that cascade. It does not demonstrate RevenueCat customer deletion or a complete processor-cleanup workflow.**

Before marking deletion accepted, audit `lane_private.commerce_events.payload`, refund/tombstone records, RevenueCat account identifiers, email-provider logs, backup expiry and any new telemetry/CRM. Implement deletion/anonymisation or a genuinely necessary, minimised, time-limited retention process. A generic “legal obligations” sentence does not justify keeping all raw personal data indefinitely.

The website explains limited retained records, but those limits must be specified, implemented and reviewed. The `retention` configuration supplies the policy text; it does **not** create scheduled database/provider cleanup jobs. No production deletion, provider cleanup or retention job was run during this handoff.

The website adapter adds recent verification to its own endpoint; the existing native/backend delete path must have its own separately reviewed controls. If Sign in with Apple or other linked providers are added, add their required token/account revocation steps. An offline local device cannot be remotely wiped merely by deleting its cloud account; the page explains that limitation.

## Turnstile

Create a widget for your exact website hostname, keep optional pre-clearance off for the supplied cookie disclosure, and set the matching site/secret keys. The widget loads only after a form interaction. Server verification checks `success`, exact `hostname` and expected `action` (`support` or `deletion`). Tokens expire and are single-use; a fresh challenge is needed after submission.

Set platform-level distributed WAF/rate limits and upstream auth limits. Origin checking is a browser cross-origin defence, not proof a request came from an honest human: a non-browser attacker can forge an Origin header. The captcha, auth verification and abuse limits remain essential.

## Support email

Verify your actual sender domain in Resend, set `SUPPORT_FROM_EMAIL`, and point `SUPPORT_TO_EMAIL` to a monitored mailbox. The adapter sends plain text only. The user's address becomes `reply_to`, never an arbitrary destination chosen by the user. Subject values come from a fixed allowlist, lengths are bounded, and a hidden honeypot rejects simple bots.

A deterministic idempotency key suppresses identical email/topic/message submissions within the same five-minute time bucket. It is not a substitute for spam/rate controls or a durable helpdesk. The UI only says **accepted for delivery** after Resend returns a successful message ID. Provider acceptance is not proof the inbox received it; test and monitor bounces and actual receipt.

A privacy request can be handled through the support process or monitored privacy mailbox. Verify identity proportionately for privacy requests; do not ask for passwords or email verification codes in support messages.

## Deployment notes

For Vercel use the included `vercel.json`, Node 22, Other framework, `dist` output and the two `/api/*.js` functions. The accompanying Node server is a separate local/self-hosted option. A static-only host needs a compatible API deployment; a function source file in a public folder is not an API.

Applied CSP allows only this site's scripts/styles/images plus Cloudflare challenge resources; it does not enable generic inline scripts. The built scripts are external and hash-named. API responses and deletion pages are non-cacheable. Verify these headers on the actual deployment, not just in a config file.

Keep source, tests, legal review notes and all environment variables outside the public web root. Reject logs containing bearer tokens, passwords, codes and full support-message bodies. Set uptime/failure monitoring without automatically introducing session replay or tracking.
