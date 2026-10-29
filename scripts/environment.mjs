import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import dotenv from 'dotenv';

export function prepareEnvironment(root, log = console.log) {
  for (const [source, target] of [
    ['backend/.env.example', 'backend/.env'],
    ['frontends/website/.env.example', 'frontends/website/.env.local'],
    ['packages/learning-ui/.env.example', 'packages/learning-ui/.env'],
  ]) {
    const template = readFileSync(path.join(root, source), 'utf8');
    const filename = path.join(root, target);
    const existing = existsSync(filename) ? readFileSync(filename, 'utf8') : '';
    const configured = dotenv.parse(existing);
    const defaults = dotenv.parse(template);
    let next = existing || template;
    if (existing) {
      const missing = Object.keys(defaults).filter(key => !(key in configured));
      if (missing.length) next += '\n# Additional settings; see the adjacent .env.example for descriptions.\n' + missing.map(key => key + '=' + defaults[key]).join('\n') + '\n';
    }
    if (target === 'backend/.env' && !dotenv.parse(next).AUTH_SESSION_ENCRYPTION_KEY?.trim()) {
      next = next.replace(/^(?:\s*export\s+)?\s*AUTH_SESSION_ENCRYPTION_KEY\s*=.*$/m, 'AUTH_SESSION_ENCRYPTION_KEY=' + randomBytes(32).toString('base64'));
    }
    if (next !== existing) {
      if (existing && !existsSync(filename + '.before-setup')) writeFileSync(filename + '.before-setup', existing, {mode: 0o600});
      mkdirSync(path.dirname(filename), {recursive: true});
      writeFileSync(filename, next, {mode: 0o600});
    }
    log('Prepared ' + target + ' (existing values preserved; no secret values printed)');
  }
}
