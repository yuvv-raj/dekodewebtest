import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposal } from '../api/_proposal/generatedContent.js';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(projectRoot, 'dist');
const clientRoot = resolve(distRoot, 'client');
const serverRoot = resolve(distRoot, 'server');
const proposalAsset = await readFile(resolve(projectRoot, 'api/_proposal/source/image.png'));
const proposalAssetBase64 = proposalAsset.toString('base64');
const architectureAsset = await readFile(resolve(projectRoot, 'api/_proposal/source/arch.png'));
const architectureAssetBase64 = architectureAsset.toString('base64');

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
  String(value ?? '').replace(/[<>]/g, '').replace(/[\\u0000-\\u001f]/g, ' ').trim().slice(0, limit);

const proposal = ${JSON.stringify(proposal)};
const proposalAssetBase64 = '${proposalAssetBase64}';
const architectureAssetBase64 = '${architectureAssetBase64}';
const PASSWORD_HASH = 'e2b2a70c40a9c3f48bcf4b844ebe9a509c34b44ea765aa49aa5b18dd3bd67c9e';
const PASSWORD_SALT = new TextEncoder().encode('dekode-cfs-access-v1');
const SESSION_TTL = 7200;
const attempts = new Map();

const privateHeaders = {
  'cache-control': 'private, no-store, max-age=0',
  pragma: 'no-cache',
  'x-robots-tag': 'noindex, nofollow, noarchive',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};
const privateJson = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...privateHeaders, ...extra },
});
const bytesToHex = (bytes) => [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');
const base64url = (value) => btoa(String.fromCharCode(...new TextEncoder().encode(value))).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '');
const decodeBase64url = (value) => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (character) => character.charCodeAt(0)));
const sha256 = async (value) => bytesToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
const passwordHash = async (password) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return bytesToHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: PASSWORD_SALT, iterations: 100000 }, key, 256));
};
const sign = async (value, secret) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '');
};
const readCookie = (request, name) => (request.headers.get('cookie') || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(name + '='))?.slice(name.length + 1);
const readSession = async (request, env) => {
  if (!env.PROPOSAL_SESSION_SECRET) return null;
  const token = readCookie(request, 'dekode_proposal_session');
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  if (token.slice(separator + 1) !== await sign(payload, env.PROPOSAL_SESSION_SECRET)) return null;
  try {
    const session = JSON.parse(decodeBase64url(payload));
    return session.proposalId === proposal.id && session.version === proposal.proposalVersion && session.expiresAt > Math.floor(Date.now() / 1000) ? session : null;
  } catch { return null; }
};
const createSession = async (env) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({ proposalId: proposal.id, version: proposal.proposalVersion, issuedAt: now, expiresAt: now + SESSION_TTL, nonce: crypto.randomUUID() }));
  return payload + '.' + await sign(payload, env.PROPOSAL_SESSION_SECRET);
};
const stripHtml = (html) => html.replace(/<script[\\s\\S]*?<\\/script>/gi, ' ').replace(/<style[\\s\\S]*?<\\/style>/gi, ' ').replace(/<[^>]+>/g, '\\n').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\\n{2,}/g, '\\n').trim();
const documents = proposal.sections.map((section) => ({ ...section, passages: stripHtml(section.html).split('\\n').map((value) => value.trim()).filter((value) => value.length > 18) }));
const stopWords = new Set(['about','after','also','and','are','can','could','does','for','from','have','how','into','our','that','the','their','this','what','when','where','which','with','would','your']);
const tokens = (value) => [...new Set(String(value).toLowerCase().match(/[a-z0-9%+-]{3,}/g) || [])].filter((token) => !stopWords.has(token));
const classify = (value) => {
  const question = value.toLowerCase();
  if (/\\b(price|pricing|cost|budget|fee)\\b/.test(question)) return 'proposal_pricing';
  if (/\\b(time|timeline|date|deadline|week|month|schedule)\\b/.test(question)) return 'proposal_timeline';
  if (/\\b(architecture|technical|technology|system)\\b/.test(question)) return 'proposal_architecture';
  if (/\\b(flow|process|workflow|allocation|tier|fifo|deficit)\\b/.test(question)) return 'proposal_flow';
  if (/\\b(scope|include|cover)\\b/.test(question)) return 'proposal_scope';
  if (/\\b(deliver|outcome|prototype)\\b/.test(question)) return 'proposal_deliverables';
  if (/\\b(assumption|depend|constraint|limit)\\b/.test(question)) return 'proposal_assumptions';
  if (/\\b(dekode|company|team|services|capability)\\b/.test(question)) return 'general_company_question';
  return 'proposal_question_not_covered';
};
const queryProposal = (question) => {
  const category = classify(question);
  if (category === 'general_company_question') return { category, answer: 'Would you like the general DEKODE capability overview, or should I answer only from your proposal?', source: null };
  const queryTokens = tokens(question);
  const matches = documents.flatMap((section) => section.passages.map((passage) => ({
    passage,
    sectionId: section.id,
    label: section.navigationLabel,
    score: queryTokens.reduce((total, token) => total + (passage.toLowerCase().includes(token) ? 1 : 0), 0),
  }))).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.passage.length - b.passage.length);
  if (!matches.length) return { category: 'proposal_question_not_covered', answer: 'That detail is not included in the current proposal. The DEKODE team can clarify it with you directly.', source: null, canRequestClarification: true };
  const best = matches[0];
  const supporting = matches.find((entry) => entry.sectionId === best.sectionId && entry.passage !== best.passage && entry.score >= Math.max(1, best.score - 1));
  return { category, answer: supporting ? best.passage + '\\n\\n' + supporting.passage : best.passage, source: { sectionId: best.sectionId, label: best.label } };
};

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
    if (requestUrl.pathname === '/api/proposals/access') {
      if (request.method !== 'POST') return privateJson({ ok: false, error: 'Method not allowed.' }, 405);
      if (!env.PROPOSAL_SESSION_SECRET) return privateJson({ ok: false, error: 'Proposal access is temporarily unavailable.' }, 503);
      const ipKey = await sha256(request.headers.get('cf-connecting-ip') || 'unknown');
      const now = Date.now();
      const current = attempts.get(ipKey);
      const attempt = !current || now > current.resetAt ? { count: 1, resetAt: now + 900000 } : { ...current, count: current.count + 1 };
      attempts.set(ipKey, attempt);
      if (attempt.count > 8) return privateJson({ ok: false, error: 'We could not verify these access details. Please check them or contact the DEKODE team.' }, 429);
      let payload;
      try { payload = await request.json(); } catch { return privateJson({ ok: false, error: 'We could not verify these access details. Please check them or contact the DEKODE team.' }, 401); }
      const validPassword = await passwordHash(String(payload.password || '')) === PASSWORD_HASH;
      if (!validPassword) return privateJson({ ok: false, error: 'We could not verify these access details. Please check them or contact the DEKODE team.' }, 401);
      const session = await createSession(env);
      console.log('[Proposal audit] Access granted', { proposalId: proposal.id, version: proposal.proposalVersion, at: new Date().toISOString() });
      return privateJson({ ok: true, route: '/proposals/client', proposal: { title: proposal.title, subtitle: proposal.subtitle, sectionCount: proposal.sections.length, version: proposal.proposalVersion } }, 200, { 'set-cookie': 'dekode_proposal_session=' + session + '; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=' + SESSION_TTL });
    }
    if (requestUrl.pathname === '/api/proposals/content') {
      if (request.method !== 'GET') return privateJson({ ok: false, error: 'Method not allowed.' }, 405);
      if (!await readSession(request, env)) return privateJson({ ok: false, error: 'Proposal access is required.' }, 401);
      return privateJson({ ok: true, proposal });
    }
    if (requestUrl.pathname === '/api/proposals/query') {
      if (request.method !== 'POST') return privateJson({ ok: false, error: 'Method not allowed.' }, 405);
      if (!await readSession(request, env)) return privateJson({ ok: false, error: 'Proposal access is required.' }, 401);
      let payload;
      try { payload = await request.json(); } catch { return privateJson({ ok: false, error: 'A question is required.' }, 400); }
      const question = String(payload.question || '').trim().slice(0, 1200);
      if (!question) return privateJson({ ok: false, error: 'A question is required.' }, 400);
      return privateJson({ ok: true, ...queryProposal(question) });
    }
    if (requestUrl.pathname === '/api/proposals/asset') {
      if (request.method !== 'GET') return new Response(null, { status: 405, headers: privateHeaders });
      if (!await readSession(request, env)) return new Response(null, { status: 401, headers: privateHeaders });
      const assetBase64 = requestUrl.searchParams.get('asset') === 'architecture'
        ? architectureAssetBase64
        : proposalAssetBase64;
      const bytes = Uint8Array.from(atob(assetBase64), (character) => character.charCodeAt(0));
      return new Response(bytes, { headers: { ...privateHeaders, 'content-type': 'image/png' } });
    }
    if (requestUrl.pathname === '/api/proposals/logout') {
      return privateJson({ ok: true }, 200, { 'set-cookie': 'dekode_proposal_session=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0' });
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
