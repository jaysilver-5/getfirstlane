import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import account from '../api/account.js';
import support from '../api/support.js';
import { securityHeaders } from '../lib/security.mjs';
const root = path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
export function createServer(){return http.createServer(async (req,res)=>{
 try {
  for(const [k,v] of Object.entries(securityHeaders)) res.setHeader(k,v);
  res.setHeader('Cache-Control','no-cache');
  const url = new URL(req.url,'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  if (pathname==='/api/account') return await account(req,res);
  if (pathname==='/api/support') return await support(req,res);
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'}); return res.end('Method not allowed.');}
  // Public files only. Never expose source, config, environment files, QA or support messages.
  const relative = pathname==='/'?'index.html':pathname.slice(1);
  if(relative.includes('\\')||relative.split('/').some(p=>p.startsWith('.'))||relative.includes('\0')) {res.writeHead(404);return res.end('Not found.');}
  let filename = path.resolve(root,relative);
  if(!filename.startsWith(root+path.sep)&&filename!==root){res.writeHead(404);return res.end('Not found.');}
  let status=200;
  try { let info=await stat(filename);if(info.isDirectory())throw new Error(); }
  catch {
   if (!path.extname(filename)) {try {await stat(filename+'.html');filename+='.html';}catch{filename=path.join(root,'404.html');status=404;}}
   else {filename=path.join(root,'404.html');status=404;}
  }
  const bytes = await readFile(filename);
  res.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');
  res.setHeader('Content-Length',bytes.length);
  if(/\.[a-f0-9]{12}\.(css|js)$/.test(filename))res.setHeader('Cache-Control','public, max-age=31536000, immutable');
  if(pathname==='/delete-account'||pathname==='/delete-account.html') {res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');}
  res.writeHead(status);res.end(req.method==='HEAD'?undefined:bytes);
 } catch { if(!res.headersSent)res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('The request could not be completed.'); }
});}
if (process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const port=Number(process.env.PORT||4173), host=process.env.HOST||'127.0.0.1';
 const server=createServer();server.listen(port,host,()=>console.log(`FirstLane running at http://${host}:${port}. Public root: dist/`));
 server.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
