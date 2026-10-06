import { createHash } from 'node:crypto';
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.end(JSON.stringify(data));
}
export function validateOrigin(req, env) {
  if (req.method !== 'POST') throw new HttpError(405, 'Use a POST request.');
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim();
  if (contentType !== 'application/json') throw new HttpError(415, 'Send a JSON request.');
  const origin = req.headers.origin;
  // No Host-header trust and no wildcard CORS. Cookie-less bearer auth is required for deletion.
  if (!env.SITE_ORIGIN || origin !== env.SITE_ORIGIN) throw new HttpError(403, 'This request must come from the Lane website.');
  if (Number(req.headers['content-length'] || 0) > 16384) throw new HttpError(413, 'This request is too large.');
}
export async function readJson(req) {
  let supplied;
  try { supplied = req.body; } catch { throw new HttpError(400, 'Invalid request.'); }
  if (supplied !== undefined) {
    const raw = typeof supplied === 'string' ? supplied : JSON.stringify(supplied);
    if (Buffer.byteLength(raw) > 16384) throw new HttpError(413, 'This request is too large.');
    try { const body = typeof supplied === 'object' ? supplied : JSON.parse(raw); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body; } catch { throw new HttpError(400, 'Invalid request.'); }
  }
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 16384) throw new HttpError(413, 'This request is too large.'); chunks.push(chunk); }
  try { const body = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body; } catch { throw new HttpError(400, 'Invalid request.'); }
}
export function emailValue(value) {
  if (typeof value !== 'string') throw new HttpError(400, 'Enter a valid email address.');
  const email = value.trim();
  if (email.length > 254 || !/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  return email;
}
export function text(value, max, min=0) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max || value.includes('\0')) throw new HttpError(400, 'Please check the information you entered.');
  return value.trim();
}
export function configRequired(env, names) { for (const name of names) if (!env[name]?.trim()) throw new HttpError(503, 'This service is temporarily unavailable. Please try again later.'); }
export function publicSupabaseKey(env) {
  const key = env.SUPABASE_PUBLIC_KEY || '';
  if (key.startsWith('sb_secret_')) throw new HttpError(503, 'This service is temporarily unavailable.');
  if (key.startsWith('eyJ')) {
    try { if (JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role !== 'anon') throw new Error(); } catch { throw new HttpError(503, 'This service is temporarily unavailable.'); }
  }
  return key;
}
export async function outbound(fetcher, url, options = {}) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 18000);
  try { return await fetcher(url, { ...options, signal: controller.signal, redirect: 'error' }); }
  catch { throw new HttpError(503, 'The service could not be reached. Please try again shortly.'); }
  finally { clearTimeout(timer); }
}
export async function verifyCaptcha(token, action, env, fetcher) {
  if (typeof token !== 'string' || token.length < 1 || token.length > 2048) throw new HttpError(400, 'Complete the security check and try again.');
  configRequired(env, ['TURNSTILE_SECRET_KEY','SITE_ORIGIN']);
  const response = await outbound(fetcher, 'https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }).toString()
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success || result.action !== action || result.hostname !== new URL(env.SITE_ORIGIN).hostname) throw new HttpError(400, 'The security check expired or failed. Complete a new check and try again.');
}
export function bearer(req) {
  const value = String(req.headers.authorization || '');
  if (!/^Bearer [A-Za-z0-9_.-]{20,8192}$/.test(value)) throw new HttpError(401, 'Verify your email before continuing.');
  return value.slice(7);
}
export const safeError = (res, error) => reply(res, error instanceof HttpError ? error.status : 500, { message: error instanceof HttpError ? error.message : 'The request could not be completed. Please try again.' });
export function stableRequestId(parts) { return createHash('sha256').update(parts.join('\n')).digest('hex'); }
