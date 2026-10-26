import test from 'node:test';
import assert from 'node:assert/strict';
import { filterReportNotes, reportStatusCounts } from '../src/lib/report-filters.ts';

const notes = [
  { id: '1', platform: 'Example Social', url: 'https://example.com/post/first', reference: 'REF-123', date: '2026-10-26', status: 'Following up' },
  { id: '2', platform: 'Example Forum', url: 'https://forum.example.com/post/second', reference: 'REF-456', date: '', status: 'Resolved' },
  { id: '3', platform: 'Other Site', url: 'https://other.example.org/item', reference: '', date: '', status: 'Not reported' },
];

test('search ignores case and whitespace and matches multiple terms across fields', () => {
  assert.deepEqual(filterReportNotes(notes, '  SOCIAL  ref-123 ', 'All statuses').map(n => n.id), ['1']);
  assert.deepEqual(filterReportNotes(notes, 'post/second', 'All statuses').map(n => n.id), ['2']);
  assert.deepEqual(filterReportNotes(notes, '2026-10-26', 'All statuses').map(n => n.id), ['1']);
});
test('search and status filters combine without mutating notes', () => {
  const snapshot = JSON.stringify(notes);
  assert.deepEqual(filterReportNotes(notes, 'example', 'Resolved').map(n => n.id), ['2']);
  assert.equal(filterReportNotes(notes, 'missing', 'Following up').length, 0);
  assert.deepEqual(filterReportNotes(notes, '   ', 'All statuses'), notes);
  assert.equal(JSON.stringify(notes), snapshot);
});
test('summary includes every status and updates with edited notes', () => {
  assert.deepEqual(reportStatusCounts(notes), { 'Not reported': 1, Reported: 0, 'Following up': 1, Resolved: 1 });
  assert.equal(reportStatusCounts(notes.map(n => ({ ...n, status: 'Reported' }))).Reported, 3);
  assert.equal(filterReportNotes([], '', 'All statuses').length, 0);
});
