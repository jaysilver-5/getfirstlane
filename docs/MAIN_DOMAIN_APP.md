# Main-domain app migration — 24 October 2026

The approved target is `https://getfirstlane.com/app`; the existing apex redirect preserves `/app` and serves it on `https://www.getfirstlane.com/app`. The homepage and policy pages stay in this project. A fresh Paddle dashboard read confirms getfirstlane.com has Checkout and Apple Pay approved. A path needs no DNS record or separate subdomain approval.

The prepared Vercel rewrites proxy only `/app` and `/app/**` to the existing FirstLane app branch. They preserve query strings and the browser's public hostname. The app must be exported with Expo `experiments.baseUrl=/app`; its own hosting config serves prefixed resources and SPA deep links. Marketing's CSP and payment-disabled Permissions-Policy stay scoped to marketing paths rather than blocking Clerk/Paddle on app paths.

**Do not deploy this proxy yet.** The identified upstream is still protected by Vercel team authentication, so it cannot serve the public app through an external rewrite. Replace the branch upstream with the validated production app deployment at cutover. Public content and final account/payment acceptance remain incomplete. `webAppAvailable` and all existing release approvals remain false; the website continues to show its truthful prelaunch state.

The paired app change is in jaysilver-5/lane and documented in `docs/MAIN_DOMAIN_APP.md` there. Before cutover, complete the app's production release requirements, set backend `WEB_APP_ORIGIN`/Clerk authorized parties to `https://www.getfirstlane.com` (no path), and configure Clerk browser links with `/app`. Set Paddle's default payment link to `https://www.getfirstlane.com/app/checkout` only once it is a functioning production Paddle.js checkout page.

Local integration preview after building both repositories:

1. In the app checkout: `$env:PORT='4184'; node scripts/serve-web.mjs`.
2. In this checkout: `node scripts/build.mjs`, then `node scripts/preview-with-app.mjs`.
3. Open `http://127.0.0.1:4183/` and `/app`; policies stay at `/privacy`, `/terms` and `/refunds`. No live settings or approvals change.
