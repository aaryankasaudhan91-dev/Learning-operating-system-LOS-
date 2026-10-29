import test from 'node:test';
import assert from 'node:assert/strict';
import {developmentUrl} from '../../desktop/dev-url';

test('packaged desktop ignores development URLs; development stays on loopback', () => {
  assert.equal(developmentUrl(true, 'https://example.com'), undefined);
  assert.equal(developmentUrl(false), undefined);
  assert.equal(developmentUrl(false, 'http://127.0.0.1:5173/'), 'http://127.0.0.1:5173/');
  for (const url of ['https://127.0.0.1:5173/', 'http://example.com:5173/', 'http://127.0.0.1:3000/', 'file:///tmp/app.html', 'http://name:password@127.0.0.1:5173/']) {
    assert.throws(() => developmentUrl(false, url));
  }
});
