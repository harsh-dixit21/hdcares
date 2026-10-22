import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReportUrl, exportReportNotes } from '../src/lib/report-notes.ts';

test('normalizes web URLs and rejects executable URLs or embedded credentials', () => {
  assert.equal(validateReportUrl(' https://example.com '), 'https://example.com/');
  for (const value of ['javascript:alert(1)', 'file:///private', 'data:text/html,test', 'https://user:pass@example.com', 'not a url']) assert.equal(validateReportUrl(value), null);
});
test('exports references and statuses as plain text without multiline field injection', () => {
  const output = exportReportNotes([{ id: '1', url: 'https://example.com/post', platform: 'Site\nInjected heading', date: '', reference: 'REF-123', status: 'Following up' }]);
  assert.ok(output.includes('1. Site Injected heading'));
  assert.ok(output.includes('Report reference: REF-123'));
  assert.ok(output.includes('Status (recorded by you): Following up'));
  assert.ok(output.includes('Date observed: Not recorded'));
  assert.ok(output.includes('not a submitted complaint'));
  assert.ok(!output.includes('\nInjected heading'));
});
