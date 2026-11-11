import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readPlanBackup } from '../src/lib/plan-backup.ts';

const pack = tasks => JSON.stringify({ format: 'hdcares-plan', version: 1, tasks });
test('older action plans remain readable and updated backups preserve distinct identical actions', () => {
  const old = { title: 'Prepare', done: false };
  assert.equal(readPlanBackup(pack([old]))[0].title, old.title);
  const task = { ...old, priority: 'High', category: 'Reporting', context: 'Bring notes', due: '2027-02-28' };
  const actions = [task, task].map(item => ({ ...item, id: crypto.randomUUID() }));
  assert.deepEqual(readPlanBackup(pack(actions)), actions);
  assert.throws(() => readPlanBackup(pack([{ ...task, priority: 'Unknown' }])), /Invalid priority/);
  assert.throws(() => readPlanBackup(pack([{ ...task, context: 'x'.repeat(501) }])), /Invalid action notes/);
});
test('a full backup containing multi-byte text fits the restore limit', () => {
  const tasks = Array.from({ length: 500 }, () => ({ id: crypto.randomUUID(), title: '界'.repeat(300), context: '界'.repeat(500), done: false }));
  assert.equal(readPlanBackup(pack(tasks)).length, 500);
});
