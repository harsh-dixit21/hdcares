import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followUpCalendar } from '../src/lib/follow-up-calendar.ts';
test('calendar export keeps the chosen local day and a generic event title', () => {
  const event = followUpCalendar('2028-02-29', new Date('2026-11-08T15:30:00Z'));
  assert.match(event, /DTSTAMP:20261108T153000Z\r\n/);
  assert.match(event, /DTSTART;VALUE=DATE:20280229\r\nSUMMARY:Follow up\r\n/);
  assert.throws(() => followUpCalendar('2027-02-29'));
});
