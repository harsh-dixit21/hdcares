import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortReportNotes } from '../src/lib/report-filters.ts';

test('date sorting puts undated notes last and preserves source order', () => {
  const notes = [{ date: '', platform: 'Z' }, { date: '2026-01-02', platform: 'B' }, { date: '2026-01-01', platform: 'A' }];
  assert.deepEqual(sortReportNotes(notes, 'Newest observed').map(n => n.platform), ['B', 'A', 'Z']);
  assert.deepEqual(sortReportNotes(notes, 'Oldest observed').map(n => n.platform), ['A', 'B', 'Z']);
  assert.deepEqual(sortReportNotes(notes, 'Platform').map(n => n.platform), ['A', 'B', 'Z']);
  assert.deepEqual(notes.map(n => n.platform), ['Z', 'B', 'A']);
});
