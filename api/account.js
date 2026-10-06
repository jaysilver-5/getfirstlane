import { HttpError, reply, validateOrigin, readJson, emailValue, configRequired, publicSupabaseKey, outbound, verifyCaptcha, bearer, safeError } from '../lib/http.mjs';
/** Web adapter for Lane's EXISTING authenticated delete-account Edge Function.
 * No table guesses, service-role keys, client-supplied user IDs or fake successful deletes.
 * Supply dependencies in tests; Vercel invokes the default export with real environment/fetch. */
export function createAccountHandler({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  return async function account(req, res) {
    try {
      validateOrigin(req, env);
      configRequired(env, ['SUPABASE_URL','SUPABASE_PUBLIC_KEY']);
      const base = new URL(env.SUPABASE_URL);
      if (base.protocol !== 'https:' || base.username || base.password) throw new HttpError(503, 'This service is temporarily unavailable.');
      const key = publicSupabaseKey(env);
      const headers = { apikey: key, 'Content-Type':'application/json' };
      const request = (path, method, body, token) => outbound(fetcher, new URL(path, base).href, {
        method, headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
      });
      const body = await readJson(req);
      if (body.action === 'send-code') {
        const email = emailValue(body.email);
        if (body.company) throw new HttpError(400, 'This request could not be processed.');
        await verifyCaptcha(body.captchaToken, 'deletion', env, fetcher);
        const response = await request('/auth/v1/otp', 'POST', { email, create_user: false });
        const result = await response.json().catch(() => ({}));
        if (response.status === 429) throw new HttpError(429, 'Too many code requests. Wait a little before trying again.');
        // Generic response for unknown users: never reveal whether the account exists.
        const hiddenAccountError = response.status === 400 && ['otp_disabled','user_not_found','email_not_confirmed','signup_disabled'].includes(result.error_code || result.code);
        if (!response.ok && !hiddenAccountError) throw new HttpError(503, 'The verification service is unavailable. Please try again shortly.');
        return reply(res, 200, { sent: true });
      }
      if (body.action === 'verify-code') {
        const email = emailValue(body.email);
        if (typeof body.code !== 'string' || !/^\d{6,10}$/.test(body.code)) throw new HttpError(400, 'Enter the code from your email.');
        const response = await request('/auth/v1/verify', 'POST', { email, token: body.code, type: 'email' });
        const result = await response.json().catch(() => ({}));
        if (response.status === 429) throw new HttpError(429, 'Too many attempts. Wait before trying again.');
        if (!response.ok || !result.access_token || !result.user?.email || result.user.email.toLowerCase() !== email.toLowerCase()) throw new HttpError(401, 'This code is invalid or expired. Request a fresh code and try again.');
        // Refresh tokens are intentionally discarded. The browser keeps only a short-lived in-memory access token.
        return reply(res, 200, { verified: true, accessToken: result.access_token });
      }
      if (body.action === 'signout') {
        const token = bearer(req);
        const response = await request('/auth/v1/logout?scope=local', 'POST', undefined, token);
        if (!response.ok && response.status !== 401 && response.status !== 403) throw new HttpError(503, 'Sign-out could not be confirmed.');
        return reply(res, 200, { signedOut: true });
      }
      if (body.action === 'delete') {
        const token = bearer(req);
        if (body.confirmation !== 'DELETE') throw new HttpError(400, 'Confirm permanent deletion before continuing.');
        const identityResponse = await request('/auth/v1/user','GET', undefined, token);
        const user = await identityResponse.json().catch(() => ({}));
        if (!identityResponse.ok || !user.id || !user.email_confirmed_at) throw new HttpError(401, 'Your verification expired. Verify your email again.');
        // Use the token's authentication-method timestamp, not user.last_sign_in_at: a different
        // session must not make an old token count as newly verified. Auth validated this token above.
        let claims;
        try { claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')); } catch { throw new HttpError(401, 'Verify your email again.'); }
        const otpAt = Math.max(0, ...(Array.isArray(claims.amr) ? claims.amr.filter(x => x.method === 'otp').map(x => Number(x.timestamp) || 0) : []));
        const age = now() / 1000 - otpAt;
        if (!otpAt || age < -30 || age > 600 || claims.sub !== user.id || typeof claims.exp !== 'number' || claims.exp <= now()/1000) throw new HttpError(401, 'For security, verify your email again before deleting.');
        const response = await request('/functions/v1/delete-account','POST',{ confirmation:'DELETE' },token);
        const result = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) throw new HttpError(401, 'Your verification expired. Verify your email again.');
        if (!response.ok || result.deleted !== true) throw new HttpError(503, 'Account deletion was not confirmed. Please try again or contact support.');
        return reply(res, 200, { deleted: true });
      }
      throw new HttpError(400, 'Unknown account action.');
    } catch (error) { return safeError(res, error); }
  };
}
export default createAccountHandler();
