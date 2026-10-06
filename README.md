# Lane — a clearer road ahead

A complete, responsive website for Lane: animated product landing, **CA$14.99 one-time Ontario G1 Complete**, privacy, terms, support, secure account-deletion interface, cookie preferences and 404 page.

## Open the design

**Open `dist/index.html` in a browser after extracting the ZIP.** All product and legal pages, artwork, styles and interactions are included. No package download is needed for local viewing. The support/deletion services require the configured server; opening a file cannot send email or delete an account.

For local HTTP development, use Node.js 22:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. `npm run dev` rebuilds once, then serves the site; restart it after source changes. Alternatively, run `npm run build:local` and `npm start`. There is no auto-reload dependency.

## Included

- Genuine Lane welcome screen and original road artwork; cream, forest and lime palette.
- Gentle road, car, phone and reveal motion; press feedback; user pause and device reduced-motion support.
- Small-screen navigation, keyboard-accessible tabs, native FAQ disclosures, focus states and print-friendly policies.
- Free / Complete comparison, clear one-time price and no web checkout.
- `/privacy`, `/terms`, `/support`, `/delete-account`, `/cookies`; `.html` links also work.
- Same-origin server endpoints for support delivery and verified account deletion.
- Build-time public-config allowlist, security headers, hashed assets, social card, favicon and sitemap generation.
- Automated tests, local-render evidence and a specific deployment/acceptance checklist.

## Important release status

The **website implementation is delivered**, not a live, legally approved service. No genuine domain, store listing URLs, exact legal operator/publisher details, monitored mailboxes, retention schedule or production provider credentials were supplied. These remain blank rather than invented.

Consequently the supplied `dist/` has no search indexing, unavailable forms fail safely, and missing store listings say **Coming soon**. It contains no “Preview”, “TODO” or developer-only banners. Once real store links are configured, the same components become working download links automatically.

The policy text is a substantive implementation draft matched to the supplied app source. It still needs operator-specific legal review and actual provider/retention verification. The original account-deletion service does not establish that every processor record has been removed; see the explicit backend finding in `docs/INTEGRATION.md`.

## Configure and release

1. Complete `site.config.json` with actual business, contact, store and policy details.
2. No environment variables are required for the first pre-launch deployment. When an integration is ready, copy `.env.example` to `.env.local` for local work and set the relevant values on your host. Never commit real secrets.
3. Follow `docs/INTEGRATION.md`: Supabase email-code setup, Lane’s existing Edge Function, Turnstile, Resend, abuse limits and end-to-end tests.
4. Complete `docs/LAUNCH_CHECKLIST.md`. Only mark an approval true after its real acceptance evidence exists.
5. During setup, run:

```sh
npm ci
npm run build:local
npm test
```

The host's normal `npm run build` command also creates this safe pre-launch build. It is deliberately no-index and forms stay unavailable until their public configuration and server credentials are supplied, so missing credentials never produce a fake successful submission.

For the final public launch, run:

```sh
npm run release:check
npm run build:release
```

`release:check` and `build:release` are the strict **public-launch gate** and intentionally fail in the supplied configuration. A successful configuration check is not a legal certification or a live provider test.

### Vercel

Import the project root. Framework preset: **Other**. Build command: **npm run build**. Output directory: **dist**. Node.js: **22.x**. The included `vercel.json` supplies routing, headers and `/api/*.js` functions. This can be deployed immediately without environment variables as a safe, no-index pre-launch site. Add each integration's variables as it becomes available; use **npm run build:release** only for the final public launch. Do not configure the output as `public`.

For a hosted staging test, use a separate protected staging project/config with its own exact `SITE_ORIGIN`, approved staging test accounts and Turnstile hostname. Its build may use `npm run build:local`; keep it password-protected and noindexed. Do not expose staging credentials or represent staging listings as the real app.

### Other hosts

Serve **only `dist/`** as the public root. The Node server in `scripts/server.mjs` also supports the API endpoints. A purely static upload does not deploy these endpoints. `_headers` is a helper for hosts supporting that format, not proof the host applied it. HTTPS, platform routing, functions, mailboxes, WAF limits and uptime monitoring remain host setup responsibilities.

## Edit map

| Change | File |
|---|---|
| Business, store URLs, contacts, retention | `site.config.json` |
| Landing-page copy and sections | `src/home.mjs` |
| Legal/support/deletion copy | `src/pages.mjs` |
| Header, footer, metadata, common FAQs | `src/shared.mjs` |
| Layout, colour and motion | `public/assets/styles.css` |
| Interactive behaviour and forms | `public/assets/app.js` |
| Account / support service adapters | `api/account.js`, `api/support.js` |
| Deployment validation | `lib/config.mjs` |

No frontend framework, payment library, analytics SDK or runtime npm dependency is required. Browser tests use optional Playwright tooling; see the QA report. Do not edit generated `dist/` as your source of truth.

**Changing this website does not change Apple/Google product prices, RevenueCat entitlements, backend offer tables or native app purchase screens. Those must also display/charge CAD 14.99 for the Canadian offering.**
