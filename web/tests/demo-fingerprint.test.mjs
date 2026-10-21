import test from 'node:test';
import assert from 'node:assert/strict';
import { demoArt, demoFingerprint } from '../src/lib/demo-fingerprint.ts';

test('digest matches the SHA-256 known answer for abc', async () => {
  assert.equal(await demoFingerprint('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('identical artwork matches but different artwork and byte edits do not', async () => {
  const original = await demoFingerprint(demoArt[0].svg);
  assert.equal(original, await demoFingerprint(demoArt[0].svg));
  assert.notEqual(original, await demoFingerprint(demoArt[1].svg));
  assert.notEqual(original, await demoFingerprint(demoArt[0].svg + ' '));
});
