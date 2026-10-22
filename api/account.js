import { reply, validateOrigin, safeError } from '../lib/http.mjs';
import { config } from '../lib/config.mjs';

// Retire the former Supabase Auth OTP adapter. Clerk account controls live in
// the app; a stale marketing page must never send a code or delete an identity.
export function createAccountHandler({ env = process.env } = {}) {
  return async function account(req, res) {
    try {
      validateOrigin(req, env);
      return reply(res, 410, {
        message: 'Account controls have moved to the FirstLane web app. Sign in there to manage or delete your account.',
        accountUrl: new URL('/account', config.webAppUrl).href,
      });
    } catch (error) { return safeError(res, error); }
  };
}
export default createAccountHandler();
