import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lockBackup, unlockBackup } from '../src/lib/locked-backup.ts';

test('encrypted backups round-trip unicode and reject a wrong passphrase and altered ciphertext', async () => {
  const password = 'my sample passphrase';
  const text = '{"private":"observed café"}';
  const locked = await lockBackup(text, password);
  assert.ok(!locked.includes('observed'));
  assert.equal(await unlockBackup(locked, password), text);
  await assert.rejects(unlockBackup(locked, 'wrong sample passphrase'));
  const altered = JSON.parse(locked);
  altered.ciphertext = (altered.ciphertext[0] === 'A' ? 'B' : 'A') + altered.ciphertext.slice(1);
  await assert.rejects(unlockBackup(JSON.stringify(altered), password));
});
