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

const worker = `export default {
  async fetch(request, env) {
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
