import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePastedLinks } from '../src/lib/pasted-links.ts';
import { mergeReportNotes } from '../src/lib/report-backup.ts';
test('batch imports deduplicate normalized links and reject a batch with an invalid entry', () => {
  const batch = parsePastedLinks('https://EXAMPLE.com\r\n\nhttps://example.com/');
  assert.equal(mergeReportNotes([], batch).length, 1);
  assert.throws(() => parsePastedLinks('https://example.com\nfile:///example'), /link 2/);
});
