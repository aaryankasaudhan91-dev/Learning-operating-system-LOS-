import test from 'node:test';
import assert from 'node:assert/strict';
import {connectDatabase} from '../src/database';

test('runtime database setup never falls back or seeds example records', async () => {
  let attempts = 0;
  const failing = async () => {attempts++; throw new Error('Connection refused')};
  for (const env of [{}, {MONGODB_URI: 'memory'}, {MONGODB_URI: 'mock'}, {MONGODB_URI: 'mongodb://127.0.0.1/test', USE_LOCAL_MOCK_DB: 'true'}]) {
    await assert.rejects(connectDatabase(env, failing));
  }
  assert.equal(attempts, 0);
  await assert.rejects(connectDatabase({MONGODB_URI: 'mongodb://127.0.0.1/test'}, failing));
  assert.equal(attempts, 1);
  let selected = '';
  await connectDatabase({MONGODB_URI: 'mongodb://127.0.0.1/persistent'}, async uri => {selected = uri});
  assert.equal(selected, 'mongodb://127.0.0.1/persistent');
});
