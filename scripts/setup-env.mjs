import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareEnvironment} from './environment.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
prepareEnvironment(root);
console.log('Fill in the marked settings, then run npm run check:ready. Restart/rebuild after changing frontend settings.');
