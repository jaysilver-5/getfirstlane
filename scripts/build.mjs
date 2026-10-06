import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config, publicConfig, releaseIssues } from '../lib/config.mjs';
import { layout, escape } from '../src/shared.mjs';
import { home } from '../src/home.mjs';
import * as pages from '../src/pages.mjs';
import { securityHeaders } from '../lib/security.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root,'dist');
const production = process.argv.includes('--production');
if (production) {
  const issues = releaseIssues();
  if (issues.length) { console.error('Production build blocked.\n'+issues.map(x=>'• '+x).join('\n')+'\nRun npm run build:local for local design review.'); process.exit(1); }
}
if (config.price?.amount !== 14.99 || config.price?.currency !== 'CAD' || config.price?.type !== 'one_time') throw new Error('FirstLane’s approved price must be CAD 14.99, one-time.');
rmSync(out,{recursive:true,force:true}); mkdirSync(out,{recursive:true});
cpSync(path.join(root,'public'),out,{recursive:true});
const write = (name,contents) => writeFileSync(path.join(out,name),contents);
const hashed = (name,extension,body) => {
 const hash = createHash('sha256').update(body).digest('hex').slice(0,12);
 const filename = `assets/${name}.${hash}.${extension}`; write(filename,body); return filename;
};
const assets = {
 css: hashed('styles','css',readFileSync(path.join(root,'public/assets/styles.css'),'utf8')),
 js: hashed('app','js',readFileSync(path.join(root,'public/assets/app.js'),'utf8')),
 config: hashed('site','js','window.FIRSTLANE = Object.freeze('+JSON.stringify(publicConfig()).replace(/</g,'\\u003c')+');\n')
};
// Do not publish duplicate unversioned executable assets.
rmSync(path.join(out,'assets/styles.css')); rmSync(path.join(out,'assets/app.js'));
const definitions = [
 ['', 'FirstLane — Get road ready.', 'A calmer way to prepare for your Ontario G1. Start with 40 free questions in FirstLane and unlock Ontario G1 Complete for CA$14.99, once.', home],
 ['privacy','Privacy policy — FirstLane','How FirstLane handles account details, study progress, purchases, support messages and privacy requests.',pages.privacy],
 ['terms','Terms of service — FirstLane','Terms for FirstLane’s independent Ontario G1 preparation app and CA$14.99 one-time Ontario purchase.',pages.terms],
 ['support','Support — FirstLane','Get help with your FirstLane account, purchase restoration, practice questions, privacy or deletion.',pages.support],
 ['delete-account','Delete your FirstLane account','Verify ownership and request permanent deletion of your FirstLane account without reinstalling the app.',pages.deletion],
 ['cookies','Cookies & preferences — FirstLane','Manage website motion preferences and understand the limited storage used on the FirstLane website.',pages.cookies],
 ['404','Page not found — FirstLane','This page is not here. Return to FirstLane and get road ready.',pages.notFound]
];
for (const [slug,title,description,render] of definitions) {
 let html = layout({title,description,body:render(),slug,active:slug,assets,noindex:!production||slug==='404'});
 // A 404 can be served at an arbitrarily deep URL. Its assets and navigation must still resolve.
 if (slug==='404') html=html.replace(/(href|src)="(assets\/|index\.html|privacy\.html|terms\.html|support\.html|delete-account\.html|cookies\.html)/g,'$1="/$2');
 write((slug||'index')+'.html',html);
}
write('robots.txt',production ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${config.siteUrl}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
const sitemap = production ? definitions.filter(x=>x[0]!=='404').map(([s])=>`<url><loc>${escape(config.siteUrl+(s?'/'+s:'/'))}</loc><lastmod>${config.effectiveDate}</lastmod></url>`).join('') : '';
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`);
// A static host can apply these headers, but its API functions must be deployed separately.
write('_headers','/*\n'+Object.entries(securityHeaders).map(([k,v])=>'  '+k+': '+v).join('\n')+'\n  Cache-Control: no-cache\n/api/*\n  Cache-Control: no-store\n  Referrer-Policy: no-referrer\n');
const emitted = readdirSync(path.join(out,'assets'));
console.log(`Built ${definitions.length} HTML pages and ${emitted.length} assets into dist/.\nMode: ${production?'PUBLIC RELEASE':'SAFE PRE-LAUNCH — no search indexing; missing live services fail safely'}.\nOffer: CA$14.99 one-time.`);
