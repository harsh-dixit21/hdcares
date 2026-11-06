import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localToday, validObservationDate } from '../src/lib/report-date.ts';

test('observation dates accept empty and leap dates but reject future and impossible days', () => {
  assert.equal(validObservationDate('', '2026-11-06'), true);
  assert.equal(validObservationDate('2024-02-29', '2026-11-06'), true);
  assert.equal(validObservationDate('2025-02-29', '2026-11-06'), false);
  assert.equal(validObservationDate('2026-11-07', '2026-11-06'), false);
  assert.equal(localToday(new Date(2026, 0, 2)), '2026-01-02');
});
