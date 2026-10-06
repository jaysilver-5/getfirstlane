import { readFileSync } from 'node:fs';
export const config = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8'));
export const priceLabel = 'CA$14.99';
export function publicConfig(c = config) {
  // Explicit allow-list. Backend keys and operational approvals NEVER reach the browser.
  return {
    brand: c.brand, tagline: c.tagline, appStoreUrl: c.appStoreUrl, googlePlayUrl: c.googlePlayUrl,
    supportEmail: c.supportEmail, privacyEmail: c.privacyEmail,
    turnstileSiteKey: c.turnstileSiteKey, priceLabel,
    formsEnabled: !!(c.turnstileSiteKey && c.siteUrl)
  };
}
const https = (s) => { try { const u = new URL(s); return u.protocol === 'https:' && !u.username && !u.password && !/(^|\.)(localhost|example|invalid|test)$|example\.(com|org|net)$|replace|your-real/i.test(u.hostname); } catch { return false; } };
export function releaseIssues(c = config, env = process.env) {
  const errors = [];
  if (c.brand !== 'FirstLane') errors.push('brand must be FirstLane.');
  if (c.tagline !== 'Get road ready.') errors.push('tagline must be “Get road ready.”');
  if (c.price?.amount !== 14.99 || c.price?.currency !== 'CAD' || c.price?.type !== 'one_time') errors.push('The approved offer is CAD 14.99, one-time.');
  if (!https(c.siteUrl) || (https(c.siteUrl) && new URL(c.siteUrl).origin !== c.siteUrl)) errors.push('Set siteUrl to the real HTTPS origin, without a trailing slash.');
  if (c.siteUrl !== 'https://getfirstlane.com') errors.push('siteUrl must be the official FirstLane origin: https://getfirstlane.com.');
  for (const [key, host] of [['appStoreUrl','apps.apple.com'], ['googlePlayUrl','play.google.com']]) {
    if (!https(c[key]) || new URL(c[key]).hostname !== host) errors.push(`Set ${key} to FirstLane’s genuine ${host} listing.`);
  }
  if (https(c.appStoreUrl) && !/\/id\d+/.test(new URL(c.appStoreUrl).pathname)) errors.push('The App Store link needs the actual FirstLane app ID.');
  if (https(c.googlePlayUrl) && (!new URL(c.googlePlayUrl).searchParams.get('id') || new URL(c.googlePlayUrl).pathname !== '/store/apps/details')) errors.push('The Google Play link needs FirstLane’s actual package ID.');
  for (const key of ['operatorLegalName','businessAddress','publisherLegalName','publisherDisclosure','governingLaw']) if (!c[key]?.trim()) errors.push(`Complete ${key}.`);
  for (const key of ['supportEmail','privacyEmail']) if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c[key]) || /example|replace|yourdomain/i.test(c[key])) errors.push(`Set a monitored ${key}.`);
  for (const [key,v] of ['websiteHost','authenticationEmail','supportEmail','processingCountries'].map(k=>[k,c.providers?.[k]])) if (!v?.trim()) errors.push(`Confirm providers.${key}.`);
  for (const [key,v] of ['deletionDays','backupDays','securityLogDays','supportMonths','transactionYears','transactionPurpose','processorDeletionDays'].map(k=>[k,c.retention?.[k]])) {
    if (key === 'transactionPurpose' ? !v?.trim() : !Number.isInteger(v) || v < 0) errors.push(`Set the actual retention.${key}; do not invent a deadline.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.effectiveDate) || !Number.isFinite(Date.parse(c.effectiveDate))) errors.push('Set the reviewed legal effective date.');
  if (!c.turnstileSiteKey || /^1x|^2x|^3x/.test(c.turnstileSiteKey)) errors.push('Set a real Cloudflare Turnstile site key, not a testing key.');
  for (const [key, v] of ['legalPoliciesReviewed','operatorAndPublisherVerified','retentionAndProcessorsVerified','contentAndFeatureClaimsReviewed','nativePriceAndStoreLinksVerified','supportDeliveryTested','deletionEndToEndTested','rateLimitsAndMonitoringEnabled','nativePrivacyDisclosuresMatch'].map(k=>[k,c.approvals?.[k]])) if (v !== true) errors.push(`Record acceptance: approvals.${key}.`);
  for (const key of ['SUPABASE_URL','SUPABASE_PUBLIC_KEY','SITE_ORIGIN','RESEND_API_KEY','SUPPORT_FROM_EMAIL','SUPPORT_TO_EMAIL','TURNSTILE_SECRET_KEY']) if (!env[key]?.trim()) errors.push(`Set server environment ${key}.`);
  if (env.SITE_ORIGIN && env.SITE_ORIGIN !== c.siteUrl) errors.push('SITE_ORIGIN must exactly match siteUrl.');
  if (env.SUPPORT_TO_EMAIL && env.SUPPORT_TO_EMAIL !== c.supportEmail) errors.push('SUPPORT_TO_EMAIL must match the monitored supportEmail in site.config.json.');
  if (env.SUPABASE_URL && !https(env.SUPABASE_URL)) errors.push('SUPABASE_URL must be the real HTTPS project origin.');
  const key = env.SUPABASE_PUBLIC_KEY || '';
  if (key.startsWith('sb_secret_')) errors.push('Use a public Supabase key, never an sb_secret key.');
  if (key.startsWith('eyJ')) { try { if (JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role !== 'anon') errors.push('Only the anon JWT key is allowed; service-role keys are prohibited.'); } catch { errors.push('Malformed Supabase public key.'); } }
  return errors;
}
