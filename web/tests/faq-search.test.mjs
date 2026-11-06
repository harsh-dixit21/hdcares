import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesFaq } from '../src/lib/faq-search.ts';
test('FAQ search matches all words across question and answer', () => {
  assert.equal(matchesFaq('Private images?', 'No uploads.', ' PRIVATE uploads '), true);
  assert.equal(matchesFaq('Private images?', 'No uploads.', 'complaints'), false);
  assert.equal(matchesFaq('Private images?', 'No uploads.', ''), true);
});
