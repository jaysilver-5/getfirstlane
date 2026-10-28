/** Security headers shared by the local Node server and generated Vercel configuration. */
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self' 'sha256-knsTlk/CA+ny8gtHCA+8OjyrZYyjHsq/s594Hk031jE=' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com; style-src 'self'; img-src 'self' data: https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://www.google.ca; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://www.google.ca https://ad.doubleclick.net; frame-src https://challenges.cloudflare.com https://www.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin'
};
