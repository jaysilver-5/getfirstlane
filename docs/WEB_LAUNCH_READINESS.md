# Web-only release checks — 24 October 2026

The owner confirmed that this launch is for the browser product. Paddle is used for browser checkout; mobile-store releases remain separate future work.

The marketing release validator previously required native app listings and publisher/privacy acceptance even when both store URLs were blank. It now applies those requirements only when a native listing is configured. It explicitly requires `webAppEndToEndTested` and `paddleCheckoutVerified` instead; both remain false until actual acceptance. The retired marketing Supabase account adapter no longer requires Supabase server configuration. Optional public Supabase values are still rejected if malformed or privileged.

The build and all 35 marketing tests pass, including a synthetic web-only release without store listings, rejection of missing web/Paddle acceptance, renewed native requirements when a store URL is supplied, and zero outbound calls for retired account actions. Existing generated `dist/` changes in this checkout are excluded from the change.

Public checkout stays unavailable. Production content review/publication, final browser account/payment/deletion acceptance, Paddle app-domain approval, support delivery and recorded operational/legal details remain pending. No actual approval flag, price, checkout availability, secret or native-store setting changed.
