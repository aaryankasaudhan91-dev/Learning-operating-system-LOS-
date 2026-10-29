import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import dotenv from 'dotenv';
import {prepareEnvironment} from '../../scripts/environment.mjs';

test('environment setup preserves configured values, generates a stable private key, and never logs secrets', t => {
  const directory = mkdtempSync(path.join(tmpdir(), 'synapse-env-test-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  const files: Record<string, string> = {
    'backend/.env.example': 'FIREBASE_WEB_API_KEY=\nAUTH_SESSION_ENCRYPTION_KEY=\nTURNSTILE_SECRET_KEY=\n',
    'backend/.env': 'FIREBASE_WEB_API_KEY=private-test-value\nexport AUTH_SESSION_ENCRYPTION_KEY = \n',
    'frontends/website/.env.example': 'VITE_SITE_URL=\nVITE_TURNSTILE_SITE_KEY=\n',
    'frontends/website/.env.local': 'VITE_SITE_URL=https://example.test\n',
    'packages/learning-ui/.env.example': 'VITE_BACKEND_URL=\nVITE_SITE_URL=\n',
  };
  for (const [file, contents] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(directory, file)), {recursive: true});
    writeFileSync(path.join(directory, file), contents);
  }
  const logs: string[] = [];
  prepareEnvironment(directory, (line: string) => logs.push(line));
  const backendPath = path.join(directory, 'backend/.env');
  const first = readFileSync(backendPath, 'utf8');
  const values = dotenv.parse(first);
  assert.equal(values.FIREBASE_WEB_API_KEY, 'private-test-value');
  assert.equal(Buffer.from(values.AUTH_SESSION_ENCRYPTION_KEY, 'base64').length, 32);
  assert.equal(values.TURNSTILE_SECRET_KEY, '');
  assert.equal(dotenv.parse(readFileSync(path.join(directory, 'frontends/website/.env.local'))).VITE_SITE_URL, 'https://example.test');
  assert.equal(dotenv.parse(readFileSync(path.join(directory, 'packages/learning-ui/.env'))).VITE_BACKEND_URL, '');
  prepareEnvironment(directory, (line: string) => logs.push(line));
  assert.equal(readFileSync(backendPath, 'utf8'), first);
  assert.ok(!logs.join('\n').includes('private-test-value'));
  assert.ok(!logs.join('\n').includes(values.AUTH_SESSION_ENCRYPTION_KEY));
});

test('public templates contain only supported public frontend settings', () => {
  const allowed = new Set(['VITE_BACKEND_URL', 'VITE_SITE_URL', 'VITE_TURNSTILE_SITE_KEY', 'VITE_OPERATOR_NAME', 'VITE_SUPPORT_EMAIL', 'VITE_INFO_YOUTUBE_URL', 'VITE_WINDOWS_DOWNLOAD_URL', 'VITE_ANALYTICS_ENABLED']);
  const root = path.resolve(import.meta.dirname, '../..');
  for (const file of ['frontends/website/.env.example', 'packages/learning-ui/.env.example']) {
    const values = dotenv.parse(readFileSync(path.join(root, file)));
    assert.ok(Object.keys(values).every(key => allowed.has(key)));
    assert.ok(Object.entries(values).every(([key, value]) => key === 'VITE_ANALYTICS_ENABLED' || value === ''));
  }
});
