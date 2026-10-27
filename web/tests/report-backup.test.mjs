import test from 'node:test';
import assert from 'node:assert/strict';
import { createReportBackup, parseReportBackup, mergeReportNotes } from '../src/lib/report-backup.ts';

const note = { id: 'original', url: 'https://example.com/', platform: 'Example', date: '2026-10-24', reference: 'REF-123', status: 'Following up' };
const backup = notes => JSON.stringify({ format: 'hdcares-report-notes', version: 1, notes });

test('backup round-trip preserves fields and replaces imported identities', () => {
  const [restored] = parseReportBackup(createReportBackup([note]));
  assert.notEqual(restored.id, note.id);
  assert.deepEqual({ ...restored, id: note.id }, note);
});
test('invalid files and unsupported versions are rejected atomically', () => {
  for (const text of ['{', 'null', '[]', JSON.stringify({ format: 'hdcares-report-notes', version: 2, notes: [] }), backup([note, { ...note, url: 'javascript:alert(1)' }])]) assert.throws(() => parseReportBackup(text));
});
test('rejects wrong field types, oversized fields, invalid dates and unknown statuses', () => {
  for (const patch of [{ reference: 17 }, { platform: 'x'.repeat(101) }, { url: 'https://user:pass@example.com/' }, { date: '2026-02-30' }, { date: '2026-13-01' }, { status: 'automatically removed' }]) assert.throws(() => parseReportBackup(backup([{ ...note, ...patch }])));
  assert.throws(() => parseReportBackup(' '.repeat(4_000_001)));
  assert.throws(() => parseReportBackup(backup(Array(501).fill(note))));
});
test('merge keeps existing references, deduplicates normalized URLs and never mutates current notes', () => {
  const imported = parseReportBackup(backup([{ ...note, url: 'https://example.com', reference: 'other' }, { ...note, url: 'https://other.example/' }, { ...note, url: 'https://other.example/' }]));
  const current = [note];
  const merged = mergeReportNotes(current, imported);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].reference, 'REF-123');
  assert.equal(current.length, 1);
  assert.equal(mergeReportNotes(merged, imported).length, 2);
});
test('capacity failures leave current notes intact', () => {
  const current = Array.from({ length: 500 }, (_, i) => ({ ...note, url: `https://example.com/${i}` }));
  assert.throws(() => mergeReportNotes(current, [note]));
  assert.equal(current.length, 500);
});

test('recovering deleted notes retains new entries and newer references for re-added URLs', () => {
  const deleted = [{ ...note }, { ...note, id: 'deleted-2', url: 'https://second.example/' }];
  const current = [{ ...note, id: 'readded', reference: 'UPDATED' }, { ...note, id: 'new', url: 'https://new.example/' }];
  const recovered = mergeReportNotes(current, deleted);
  assert.equal(recovered.length, 3);
  assert.equal(recovered.find(row => row.url === note.url).reference, 'UPDATED');
  assert.equal(recovered.find(row => row.url === 'https://second.example/').status, note.status);
  assert.equal(current.length, 2);
  assert.equal(deleted.length, 2);
  assert.deepEqual(mergeReportNotes([], deleted), deleted);
});
