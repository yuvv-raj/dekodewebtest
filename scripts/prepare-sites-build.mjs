import { mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(projectRoot, 'dist');
const clientRoot = resolve(distRoot, 'client');
const serverRoot = resolve(distRoot, 'server');

await mkdir(clientRoot, { recursive: true });
await mkdir(serverRoot, { recursive: true });

for (const entry of await readdir(distRoot, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue;
  await rename(resolve(distRoot, entry.name), resolve(clientRoot, entry.name));
}

const worker = `const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

const clean = (value, limit = 4000) =>
  String(value ?? '').replace(/[<>]/g, '').replace(/[\\\\u0000-\\\\u001f]/g, ' ').trim().slice(0, limit);

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === '/api/leads') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      if (Number(request.headers.get('content-length') || 0) > 32000) return json({ ok: false, error: 'Request is too large.' }, 413);
      let payload;
      try { payload = await request.json(); } catch { return json({ ok: false, error: 'Invalid JSON.' }, 400); }
      const email = clean(payload.visitorEmail, 254);
      if (clean(payload.visitorName, 120).length < 2 || !/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/.test(email) || clean(payload.projectSummary).length < 4) {
        return json({ ok: false, error: 'Name, valid email, and project summary are required.' }, 400);
      }
      console.log('[DEKODE Voice] Validated mock lead request', { submittedAt: new Date().toISOString() });
      return json({ ok: true, delivered: false, mode: 'mock', message: 'Validated; no email or booking was sent.' }, 202);
    }
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const url = new URL(request.url);
    url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  },
};
`;

await writeFile(resolve(serverRoot, 'index.js'), worker, 'utf8');
console.log('Prepared Cloudflare-compatible static site output.');
