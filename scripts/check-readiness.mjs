import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => {
  const filename = path.join(root, relative);
  return existsSync(filename) ? dotenv.parse(readFileSync(filename)) : {};
};
const backend = {...read('backend/.env'), ...process.env};
const website = read('frontends/website/.env.local');
const apps = read('packages/learning-ui/.env');
const results = [];
const configured = value => typeof value === 'string' && !!value.trim();
const https = value => {try {return new URL(value).protocol === 'https:'} catch {return false}};
const add = (area, passed, detail) => results.push({area, status: passed ? 'configured' : 'needs setup', detail});
add('Persistent MongoDB', /^mongodb(?:\+srv)?:\/\//.test(backend.MONGODB_URI || '') && backend.USE_LOCAL_MOCK_DB !== 'true', 'backend/.env: MONGODB_URI; runtime never uses a temporary fallback');
add('Firebase password authentication', configured(backend.FIREBASE_PROJECT_ID) && configured(backend.FIREBASE_WEB_API_KEY), 'backend/.env: FIREBASE_PROJECT_ID and FIREBASE_WEB_API_KEY');
const credentialPath = backend.GOOGLE_APPLICATION_CREDENTIALS;
const localCredentials = process.env.APPDATA && path.join(process.env.APPDATA, 'gcloud/application_default_credentials.json');
add('Firebase Admin credentials', !!((credentialPath && existsSync(path.resolve(root, 'backend', credentialPath))) || (localCredentials && existsSync(localCredentials))), 'Set GOOGLE_APPLICATION_CREDENTIALS privately, or use workload identity on the deployment host');
let encrypted = false;
try {encrypted = Buffer.from(backend.AUTH_SESSION_ENCRYPTION_KEY || '', 'base64').length === 32} catch {}
add('Session encryption', encrypted, 'backend/.env: a stable 32-byte base64 AUTH_SESSION_ENCRYPTION_KEY');
add('Signup bot protection', [backend.TURNSTILE_SECRET_KEY, backend.TURNSTILE_HOSTNAME, website.VITE_TURNSTILE_SITE_KEY].every(configured), 'Backend secret/hostname and public website site key must match the real Turnstile widget');
add('Public website origin', https(backend.PUBLIC_SITE_URL) && https(website.VITE_SITE_URL) && new URL(backend.PUBLIC_SITE_URL).origin === new URL(website.VITE_SITE_URL).origin, 'Configure the matching final HTTPS website origin; indexing remains off until then');
add('Installed app API', https(apps.VITE_BACKEND_URL), 'packages/learning-ui/.env: VITE_BACKEND_URL must be a reachable HTTPS API for packaged releases');
add('Installed app registration link', https(apps.VITE_SITE_URL), 'packages/learning-ui/.env: VITE_SITE_URL must be the public signup website');
add('Legal operator details', [website.VITE_OPERATOR_NAME, website.VITE_SUPPORT_EMAIL].every(configured), 'Website public operator name and support/privacy email');
add('Optional YouTube walkthrough', configured(website.VITE_INFO_YOUTUBE_URL), 'Website environment only; this public video URL is visible when loaded');
const providerKey={groq:'GROQ_API_KEY',openai:'OPENAI_API_KEY',nvidia:'NVIDIA_API_KEY',anthropic:'ANTHROPIC_API_KEY',gemini:'GEMINI_API_KEY'}[backend.AI_PROVIDER];
add('Optional live AI', !!providerKey && [backend.AI_MODEL, backend[providerKey]].every(configured), 'Choose a provider/model and its server-only key; core learning does not require AI');
const publicKeys=new Set(['VITE_BACKEND_URL','VITE_SITE_URL','VITE_TURNSTILE_SITE_KEY','VITE_OPERATOR_NAME','VITE_SUPPORT_EMAIL','VITE_INFO_YOUTUBE_URL','VITE_WINDOWS_DOWNLOAD_URL','VITE_ANALYTICS_ENABLED']);
add('Public frontend setting allowlist', [website,apps].every(config=>Object.keys(config).filter(key=>key.startsWith('VITE_')).every(key=>publicKeys.has(key))), 'Only the public settings documented in the frontend templates belong in VITE_ variables');
console.log('Synapse local configuration check (no secret values are printed)');
for (const result of results) console.log('[' + result.status + '] ' + result.area + '\n  ' + result.detail);
console.log('\nThis checks local configuration only. It does not certify external connectivity, credentials, or launch readiness.');
if (process.argv.includes('--strict') && results.some(item => item.status !== 'configured' && !item.area.startsWith('Optional'))) process.exitCode = 1;
