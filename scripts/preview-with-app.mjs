// Local integration preview: the real marketing server plus the exported app.
// This does not publish the app or change production release approvals.
import http from 'node:http';
import { createServer } from './server.mjs';

const appOrigin = new URL(process.env.FIRSTLANE_PREVIEW_APP_ORIGIN || 'http://127.0.0.1:4184');
if (!['127.0.0.1', 'localhost'].includes(appOrigin.hostname)) throw new Error('Use a local app preview.');
const marketing = createServer();
marketing.listen(0, '127.0.0.1', () => {
  const marketingOrigin = `http://127.0.0.1:${marketing.address().port}`;
  http.createServer(async (req, res) => {
    try {
      const isApp = req.url === '/app' || req.url.startsWith('/app/') || req.url.startsWith('/app?');
      const target = new URL(req.url, isApp ? appOrigin : marketingOrigin);
      const response = await fetch(target, { method: req.method, redirect: 'manual' });
      res.writeHead(response.status, Object.fromEntries([...response.headers].filter(([key]) => !['content-encoding', 'content-length', 'transfer-encoding'].includes(key))));
      res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Start the exported app preview on port 4184.');
    }
  }).listen(Number(process.env.PORT || 4183), '127.0.0.1', () => console.log('Combined FirstLane preview: http://127.0.0.1:' + (process.env.PORT || 4183) + '/app'));
});
