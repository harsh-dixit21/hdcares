import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previewReportBackup } from '../src/lib/report-backup.ts';

test('preview counts existing and repeated incoming URLs without changing notes', () => {
  assert.deepEqual(previewReportBackup([{ url: 'a' }], [{ url: 'a' }, { url: 'b' }, { url: 'b' }]), { added: 1, duplicates: 2, exceedsLimit: false });
  assert.equal(previewReportBackup(Array.from({ length: 500 }, (_, i) => ({ url: String(i) })), [{ url: 'new' }]).exceedsLimit, true);
});
